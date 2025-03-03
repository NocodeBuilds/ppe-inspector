
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';
import { 
  ArrowLeft, Check, X, Download, Mail, Share, Printer, 
  Calendar, FileText, Loader2, MessageSquare, User, Phone
} from 'lucide-react';
import { format } from 'date-fns';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

interface InspectionDetail {
  id: string;
  date: string;
  type: string;
  overall_result: string;
  notes: string | null;
  signature_url: string | null;
  ppe_type: string;
  ppe_serial: string;
  ppe_brand: string;
  ppe_model: string;
  inspector_name: string | null;
  checkpoints: Array<{
    id: string;
    description: string;
    passed: boolean;
    notes: string | null;
    photo_url: string | null;
  }>;
}

const InspectionDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [inspection, setInspection] = useState<InspectionDetail | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  
  useEffect(() => {
    if (id) {
      fetchInspectionDetails(id);
    }
  }, [id]);
  
  const fetchInspectionDetails = async (inspectionId: string) => {
    try {
      setIsLoading(true);
      
      // Get inspection details
      const { data: inspectionData, error: inspectionError } = await supabase
        .from('inspections')
        .select(`
          id,
          date,
          type,
          overall_result,
          notes,
          signature_url,
          ppe_items(type, serial_number, brand, model_number),
          profiles(full_name)
        `)
        .eq('id', inspectionId)
        .single();
        
      if (inspectionError) throw inspectionError;
      
      // Get checkpoint results
      const { data: checkpointData, error: checkpointError } = await supabase
        .from('inspection_results')
        .select(`
          id,
          passed,
          notes,
          photo_url,
          checkpoint_id,
          inspection_checkpoints(description)
        `)
        .eq('inspection_id', inspectionId);
        
      if (checkpointError) throw checkpointError;
      
      if (inspectionData) {
        const formattedCheckpoints = checkpointData.map(cp => ({
          id: cp.id,
          description: cp.inspection_checkpoints?.description || 'Unknown checkpoint',
          passed: cp.passed,
          notes: cp.notes,
          photo_url: cp.photo_url,
        }));
        
        setInspection({
          id: inspectionData.id,
          date: inspectionData.date,
          type: inspectionData.type,
          overall_result: inspectionData.overall_result,
          notes: inspectionData.notes,
          signature_url: inspectionData.signature_url,
          ppe_type: inspectionData.ppe_items?.type || 'Unknown',
          ppe_serial: inspectionData.ppe_items?.serial_number || 'Unknown',
          ppe_brand: inspectionData.ppe_items?.brand || 'Unknown',
          ppe_model: inspectionData.ppe_items?.model_number || 'Unknown',
          inspector_name: inspectionData.profiles?.full_name || 'Unknown',
          checkpoints: formattedCheckpoints,
        });
      }
    } catch (error: any) {
      console.error('Error fetching inspection details:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to load inspection details',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const generatePDF = async () => {
    if (!inspection) return;
    
    try {
      setIsExporting(true);
      const doc = new jsPDF();
      
      // Title
      doc.setFontSize(20);
      doc.text('Inspection Report', 105, 15, { align: 'center' });
      
      // PPE Details
      doc.setFontSize(12);
      doc.text('PPE Details', 14, 30);
      
      doc.setFontSize(10);
      doc.text(`Type: ${inspection.ppe_type}`, 14, 40);
      doc.text(`Serial Number: ${inspection.ppe_serial}`, 14, 45);
      doc.text(`Brand: ${inspection.ppe_brand}`, 14, 50);
      doc.text(`Model: ${inspection.ppe_model}`, 14, 55);
      
      // Inspection Details
      doc.setFontSize(12);
      doc.text('Inspection Details', 14, 70);
      
      doc.setFontSize(10);
      doc.text(`Date: ${format(new Date(inspection.date), 'PPP')}`, 14, 80);
      doc.text(`Type: ${inspection.type.toUpperCase()}`, 14, 85);
      doc.text(`Inspector: ${inspection.inspector_name}`, 14, 90);
      doc.text(`Result: ${inspection.overall_result.toUpperCase()}`, 14, 95);
      
      // Checkpoints Table
      doc.setFontSize(12);
      doc.text('Inspection Checkpoints', 14, 110);
      
      // @ts-ignore
      doc.autoTable({
        startY: 115,
        head: [['Checkpoint', 'Result', 'Notes']],
        body: inspection.checkpoints.map(cp => [
          cp.description,
          cp.passed ? 'PASS' : 'FAIL',
          cp.notes || '-'
        ]),
        theme: 'striped',
        headStyles: { fillColor: [41, 128, 185] },
        alternateRowStyles: { fillColor: [240, 240, 240] },
      });
      
      // Notes
      if (inspection.notes) {
        const finalY = (doc as any).lastAutoTable.finalY + 10;
        doc.setFontSize(12);
        doc.text('Additional Notes', 14, finalY);
        
        doc.setFontSize(10);
        doc.text(inspection.notes, 14, finalY + 10);
      }
      
      // Save
      doc.save(`inspection_${inspection.ppe_serial}_${format(new Date(inspection.date), 'yyyy-MM-dd')}.pdf`);
      
      toast({
        title: 'PDF Downloaded',
        description: 'Inspection report has been downloaded',
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: 'Export Failed',
        description: 'Failed to generate PDF. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };
  
  const shareViaEmail = () => {
    if (!inspection) return;
    
    const subject = `Inspection Report: ${inspection.ppe_type} (${inspection.ppe_serial})`;
    const body = `
Inspection Report Details:
- PPE Type: ${inspection.ppe_type}
- Serial Number: ${inspection.ppe_serial}
- Inspection Date: ${format(new Date(inspection.date), 'PPP')}
- Result: ${inspection.overall_result.toUpperCase()}
- Inspector: ${inspection.inspector_name}

Please check the attached PDF for full details.
    `;
    
    const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoUrl);
    
    toast({
      title: 'Email Client Opened',
      description: 'Please attach the PDF report manually',
    });
  };
  
  const shareViaWhatsApp = () => {
    if (!inspection) return;
    
    const text = `
Inspection Report:
PPE: ${inspection.ppe_type} (${inspection.ppe_serial})
Result: ${inspection.overall_result.toUpperCase()}
Date: ${format(new Date(inspection.date), 'MMM d, yyyy')}
    `;
    
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl);
  };
  
  const printReport = () => {
    window.print();
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center my-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!inspection) {
    return (
      <div className="text-center my-12">
        <p className="text-destructive mb-4">Inspection not found</p>
        <Button onClick={() => navigate(-1)}>Go Back</Button>
      </div>
    );
  }
  
  return (
    <div className="fade-in pb-20 print:p-0" id="inspection-report">
      <div className="flex items-center justify-between mb-6 print:hidden">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="sm"
            className="mr-2"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft size={18} />
          </Button>
          <h1 className="text-2xl font-bold">Inspection Details</h1>
        </div>
        
        <div className="flex space-x-1">
          <Button 
            variant="outline" 
            size="icon"
            onClick={generatePDF}
            disabled={isExporting}
          >
            {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download size={16} />}
          </Button>
          <Button variant="outline" size="icon" onClick={printReport}>
            <Printer size={16} />
          </Button>
          <Button variant="outline" size="icon" onClick={shareViaEmail}>
            <Mail size={16} />
          </Button>
          <Button variant="outline" size="icon" onClick={shareViaWhatsApp}>
            <Share size={16} />
          </Button>
        </div>
      </div>
      
      <div className="print:mt-8">
        {/* Header - only visible when printing */}
        <div className="hidden print:block mb-8">
          <h1 className="text-2xl font-bold text-center">Inspection Report</h1>
          <p className="text-center text-muted-foreground">
            {format(new Date(inspection.date), 'PPPP')}
          </p>
        </div>
        
        {/* PPE and Inspection Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Card className="p-5">
            <h2 className="font-bold flex items-center mb-3">
              <FileText size={16} className="mr-2" />
              PPE Details
            </h2>
            <div className="space-y-2">
              <div>
                <p className="text-sm text-muted-foreground">Type</p>
                <p className="font-medium">{inspection.ppe_type}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Serial Number</p>
                <p>{inspection.ppe_serial}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Brand</p>
                <p>{inspection.ppe_brand}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Model</p>
                <p>{inspection.ppe_model}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-5">
            <h2 className="font-bold flex items-center mb-3">
              <Calendar size={16} className="mr-2" />
              Inspection Information
            </h2>
            <div className="space-y-2">
              <div>
                <p className="text-sm text-muted-foreground">Date</p>
                <p className="font-medium">{format(new Date(inspection.date), 'PPP')}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Type</p>
                <p className="capitalize">{inspection.type} Inspection</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Inspector</p>
                <p className="flex items-center">
                  <User size={14} className="mr-1" />
                  {inspection.inspector_name}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Result</p>
                <div className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                  inspection.overall_result === 'pass' 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                    : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                }`}>
                  {inspection.overall_result === 'pass' ? (
                    <Check size={12} className="mr-1" />
                  ) : (
                    <X size={12} className="mr-1" />
                  )}
                  {inspection.overall_result.toUpperCase()}
                </div>
              </div>
            </div>
          </Card>
        </div>
        
        {/* Checkpoints */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-4">Inspection Checkpoints</h2>
          
          <div className="space-y-4">
            {inspection.checkpoints.map((checkpoint) => (
              <Card key={checkpoint.id} className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-start">
                      <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center mr-3 ${
                        checkpoint.passed 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                          : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                      }`}>
                        {checkpoint.passed ? <Check size={14} /> : <X size={14} />}
                      </div>
                      <div>
                        <p className="font-medium">{checkpoint.description}</p>
                        
                        {checkpoint.notes && (
                          <div className="mt-2">
                            <p className="text-sm text-muted-foreground flex items-start">
                              <MessageSquare size={14} className="mr-1.5 mt-0.5" />
                              {checkpoint.notes}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {checkpoint.photo_url && (
                    <div className="ml-4 hidden print:block">
                      <p className="text-xs text-muted-foreground mb-1">Photo available in digital report</p>
                    </div>
                  )}
                  
                  {checkpoint.photo_url && (
                    <div className="ml-4 print:hidden">
                      <img 
                        src={checkpoint.photo_url} 
                        alt="Checkpoint" 
                        className="w-20 h-20 object-cover rounded-md" 
                      />
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
        
        {/* Notes */}
        {inspection.notes && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">Additional Notes</h2>
            <Card className="p-4">
              <p className="text-sm whitespace-pre-line">{inspection.notes}</p>
            </Card>
          </div>
        )}
        
        {/* Signature */}
        {inspection.signature_url && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">Inspector Signature</h2>
            <Card className="p-4 flex justify-center">
              <img 
                src={inspection.signature_url} 
                alt="Inspector Signature" 
                className="max-h-24 object-contain" 
              />
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default InspectionDetails;
