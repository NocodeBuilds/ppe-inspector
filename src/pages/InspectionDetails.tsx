import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { 
  ArrowLeft, 
  Calendar, 
  User, 
  AlertTriangle, 
  CheckCircle, 
  FileText, 
  Loader2, 
  Share2,
  Camera,
  Download,
  MessageSquare,
  Mail
} from 'lucide-react';
import { format } from 'date-fns';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { generateInspectionDetailPDF } from '@/utils/reportGenerator/inspectionDetailPDF';
import { generateInspectionExcelReport } from '@/utils/reportGenerator/inspectionExcelReport';

interface InspectionCheckpoint {
  id: string;
  description: string;
  passed: boolean | null;
  notes: string | null;
  photo_url: string | null;
}

interface InspectionDetails {
  id: string;
  date: string;
  type: string;
  overall_result: string;
  notes: string | null;
  signature_url: string | null;
  inspector_name: string;
  ppe_type: string;
  ppe_serial: string;
  ppe_brand: string;
  ppe_model: string;
  checkpoints: InspectionCheckpoint[];
}

const InspectionDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [inspection, setInspection] = useState<InspectionDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  
  useEffect(() => {
    if (id) {
      fetchInspectionDetails(id);
    }
  }, [id]);
  
  const fetchInspectionDetails = async (inspectionId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Fetch inspection details
      const { data: inspectionData, error: inspectionError } = await supabase
        .from('inspections')
        .select(`
          id,
          date,
          type,
          overall_result,
          notes,
          signature_url,
          profiles(full_name),
          ppe_items(type, serial_number, brand, model_number)
        `)
        .eq('id', inspectionId)
        .single();
      
      if (inspectionError) throw inspectionError;
      
      if (!inspectionData) {
        throw new Error('Inspection not found');
      }
      
      // Fetch inspection results/checkpoints
      const { data: checkpointsData, error: checkpointsError } = await supabase
        .from('inspection_results')
        .select(`
          id,
          passed,
          notes,
          photo_url,
          inspection_checkpoints(id, description)
        `)
        .eq('inspection_id', inspectionId);
      
      if (checkpointsError) throw checkpointsError;
      
      // Format the data
      const formattedCheckpoints: InspectionCheckpoint[] = checkpointsData?.map(result => ({
        id: result.id,
        description: result.inspection_checkpoints?.description || 'Unknown checkpoint',
        passed: result.passed,
        notes: result.notes,
        photo_url: result.photo_url,
      })) || [];
      
      // Combine all data
      const detailedInspection: InspectionDetails = {
        id: inspectionData.id,
        date: inspectionData.date,
        type: inspectionData.type,
        overall_result: inspectionData.overall_result,
        notes: inspectionData.notes,
        signature_url: inspectionData.signature_url,
        inspector_name: inspectionData.profiles?.full_name || 'Unknown',
        ppe_type: inspectionData.ppe_items?.type || 'Unknown',
        ppe_serial: inspectionData.ppe_items?.serial_number || 'Unknown',
        ppe_brand: inspectionData.ppe_items?.brand || 'Unknown',
        ppe_model: inspectionData.ppe_items?.model_number || 'Unknown',
        checkpoints: formattedCheckpoints,
      };
      
      setInspection(detailedInspection);
    } catch (error: any) {
      console.error('Error fetching inspection details:', error);
      setError(error.message || 'Failed to load inspection details');
      toast({
        title: 'Error',
        description: error.message || 'Failed to load inspection details',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportPDF = async () => {
    if (!inspection) return;
    
    try {
      setIsExporting(true);
      await generateInspectionDetailPDF(inspection);
      toast({
        title: 'PDF Generated',
        description: 'Inspection report has been downloaded as PDF',
      });
    } catch (error) {
      console.error('PDF generation error:', error);
      toast({
        title: 'PDF Generation Failed',
        description: 'Could not generate PDF report',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };
  
  const handleExportExcel = async () => {
    if (!inspection) return;
    
    try {
      setIsExporting(true);
      await generateInspectionExcelReport(inspection);
      toast({
        title: 'Excel Generated',
        description: 'Inspection report has been downloaded as Excel',
      });
    } catch (error) {
      console.error('Excel generation error:', error);
      toast({
        title: 'Excel Generation Failed',
        description: 'Could not generate Excel report',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };
  
  const handleShareWhatsApp = () => {
    if (!inspection) return;
    
    try {
      const message = 
        `Inspection Report\n` +
        `PPE: ${inspection.ppe_type} (${inspection.ppe_serial})\n` +
        `Date: ${format(new Date(inspection.date), 'MMM d, yyyy')}\n` +
        `Result: ${inspection.overall_result.toUpperCase() || 'UNKNOWN'}\n` +
        `Inspector: ${inspection.inspector_name}\n`;
      
      const encodedMessage = encodeURIComponent(message);
      
      // Open WhatsApp
      window.open(`https://wa.me/?text=${encodedMessage}`, '_blank');
      
      toast({
        title: 'Share via WhatsApp',
        description: 'WhatsApp opened with inspection details',
      });
    } catch (error) {
      console.error('WhatsApp share error:', error);
      toast({
        title: 'Share Failed',
        description: 'Could not share via WhatsApp',
        variant: 'destructive',
      });
    }
  };
  
  const handleShareEmail = () => {
    if (!inspection) return;
    
    try {
      const subject = `Inspection Report - ${inspection.ppe_type} (${inspection.ppe_serial})`;
      
      const body = 
        `Inspection Report\n\n` +
        `PPE: ${inspection.ppe_type} (${inspection.ppe_serial})\n` +
        `Date: ${format(new Date(inspection.date), 'MMM d, yyyy')}\n` +
        `Result: ${inspection.overall_result.toUpperCase() || 'UNKNOWN'}\n` +
        `Inspector: ${inspection.inspector_name}\n`;
      
      const mailtoLink = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      
      window.location.href = mailtoLink;
      
      toast({
        title: 'Share via Email',
        description: 'Email client opened with inspection details',
      });
    } catch (error) {
      console.error('Email share error:', error);
      toast({
        title: 'Share Failed',
        description: 'Could not share via email',
        variant: 'destructive',
      });
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center my-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (error || !inspection) {
    return (
      <div className="text-center my-12">
        <AlertTriangle className="mx-auto h-12 w-12 text-destructive mb-4" />
        <h2 className="text-xl font-bold mb-2">Error Loading Inspection</h2>
        <p className="text-muted-foreground mb-6">{error || 'Inspection not found'}</p>
        <Button onClick={() => navigate('/flagged')}>
          Back to Flagged Issues
        </Button>
      </div>
    );
  }
  
  return (
    <div className="fade-in pb-20">
      <div className="flex items-center justify-between mb-6">
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
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" disabled={isExporting}>
              {isExporting ? (
                <>
                  <Loader2 size={16} className="mr-2 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Share2 size={16} className="mr-2" />
                  Share
                </>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleExportPDF}>
              <FileText size={16} className="mr-2" />
              Export as PDF
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleExportExcel}>
              <Download size={16} className="mr-2" />
              Export as Excel
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleShareWhatsApp}>
              <MessageSquare size={16} className="mr-2" />
              Share via WhatsApp
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleShareEmail}>
              <Mail size={16} className="mr-2" />
              Share via Email
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      {/* Header with status */}
      <div className="mb-6 flex flex-col sm:flex-row justify-between sm:items-center">
        <div>
          <div className="flex items-center mb-1">
            <h2 className="text-xl font-semibold mr-3">{inspection.ppe_type}</h2>
            <Badge 
              variant={inspection.overall_result === 'pass' ? 'default' : 'destructive'}
              className="uppercase"
            >
              {inspection.overall_result}
            </Badge>
          </div>
          <p className="text-muted-foreground">Serial: {inspection.ppe_serial}</p>
        </div>
        
        <div className="flex items-center mt-3 sm:mt-0">
          <div className="text-sm text-right">
            <div className="flex items-center justify-end">
              <Calendar size={14} className="mr-1 text-muted-foreground" />
              <span>{format(new Date(inspection.date), 'MMM d, yyyy')}</span>
            </div>
            <div className="flex items-center justify-end mt-1">
              <User size={14} className="mr-1 text-muted-foreground" />
              <span className="text-muted-foreground">Inspector: {inspection.inspector_name}</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Equipment details */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <h3 className="font-medium mb-3">Equipment Details</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Type</p>
              <p className="font-medium">{inspection.ppe_type}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Serial Number</p>
              <p className="font-medium">{inspection.ppe_serial}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Brand</p>
              <p className="font-medium">{inspection.ppe_brand}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Model</p>
              <p className="font-medium">{inspection.ppe_model}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Failed Checkpoints */}
      <div className="mb-6">
        <h3 className="font-medium mb-3">Inspection Results</h3>
        <div className="space-y-3">
          {inspection.checkpoints.map((checkpoint) => (
            <Card 
              key={checkpoint.id} 
              className={`border-l-4 ${checkpoint.passed ? 'border-l-green-500' : 'border-l-destructive'}`}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start">
                    {checkpoint.passed ? (
                      <CheckCircle size={18} className="text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                    ) : (
                      <AlertTriangle size={18} className="text-destructive mt-0.5 mr-2 flex-shrink-0" />
                    )}
                    <div>
                      <p className="font-medium">{checkpoint.description}</p>
                      {checkpoint.notes && (
                        <p className="text-sm text-muted-foreground mt-1">
                          Notes: {checkpoint.notes}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {checkpoint.photo_url && (
                    <div className="flex-shrink-0 ml-3">
                      <div className="relative h-12 w-12 rounded overflow-hidden border bg-muted flex items-center justify-center">
                        <img 
                          src={checkpoint.photo_url} 
                          alt="Checkpoint evidence" 
                          className="object-cover h-full w-full"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = ''; // Clear the broken image
                            target.className = 'hidden';
                            // Show camera icon if image fails to load
                            const parent = target.parentElement;
                            if (parent) {
                              const icon = document.createElement('div');
                              icon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"></path><circle cx="12" cy="13" r="3"></circle></svg>';
                              parent.appendChild(icon);
                            }
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      
      {/* Notes & Signature */}
      <div className="mb-6">
        <h3 className="font-medium mb-3">Additional Information</h3>
        <Card>
          <CardContent className="p-4">
            <div className="mb-4">
              <p className="text-sm text-muted-foreground mb-1">Notes</p>
              <p>{inspection.notes || 'No additional notes provided.'}</p>
            </div>
            
            <Separator className="my-4" />
            
            <div>
              <p className="text-sm text-muted-foreground mb-2">Inspector Signature</p>
              {inspection.signature_url ? (
                <div className="border rounded-md p-2 bg-background">
                  <img 
                    src={inspection.signature_url} 
                    alt="Inspector signature"
                    className="max-h-20 w-auto"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const parent = target.parentElement;
                      if (parent) {
                        parent.innerHTML = 'Signature not available';
                      }
                    }}
                  />
                </div>
              ) : (
                <p>No signature provided</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button 
          onClick={() => navigate(`/inspect/${inspection.ppe_serial}`)}
          className="flex-1"
        >
          Re-inspect Equipment
        </Button>
        <Button 
          variant="outline" 
          onClick={() => navigate(-1)}
          className="flex-1"
        >
          Back to List
        </Button>
      </div>
    </div>
  );
};

export default InspectionDetails;
