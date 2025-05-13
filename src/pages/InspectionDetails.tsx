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
  Mail,
  FileSpreadsheet
} from 'lucide-react';
import { format } from 'date-fns';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from '@/components/ui/dropdown-menu';
import { generateInspectionDetailPDF } from '@/utils/reportGenerator/inspectionDetailPDF';
import { generateInspectionExcelReport } from '@/utils/reportGenerator/inspectionExcelReport';
import { useNetwork } from '@/hooks/useNetwork';
import PageHeader from '@/components/common/PageHeader';

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
  signature_data?: string | null;
  inspector_id: string;
  inspector_name: string;
  ppe_type: string;
  ppe_serial: string;
  ppe_brand: string;
  ppe_model: string;
  site_name: string;
  manufacturing_date: string;
  expiry_date: string;
  batch_number: string;
  checkpoints: InspectionCheckpoint[];
}

// Define the StandardInspectionData type to match the expected type in report generator
interface StandardInspectionData {
  id: string;
  date: string;
  type: string;
  overall_result: string;
  notes: string | null;
  signature_data: string | null;
  signature_url: string | null; // Added for compatibility with the report generator
  inspector_id: string;
  inspector_name: string;
  ppe_type: string;
  ppe_serial: string;
  ppe_brand: string;
  ppe_model: string;
  site_name: string;
  manufacturing_date: string;
  expiry_date: string;
  batch_number: string;
  checkpoints: InspectionCheckpoint[];
}

const InspectionDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [inspection, setInspection] = useState<InspectionDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [shareFormat, setShareFormat] = useState<'pdf' | 'excel'>('pdf');
  const { isOnline } = useNetwork();
  
  useEffect(() => {
    if (id) {
      fetchInspectionDetails(id);
    }
  }, [id]);
  
  const fetchInspectionDetails = async (inspectionId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Modify the select statement to use signature_data instead of signature_url
      const { data: inspectionData, error: inspectionError } = await supabase
        .from('inspections')
        .select(`
          id,
          date,
          type,
          overall_result,
          notes,
          signature_data, 
          inspector_id,
          profiles(full_name, site_name),
          ppe_items(type, serial_number, brand, model_number, manufacturing_date, expiry_date, batch_number)
        `)
        .eq('id', inspectionId)
        .single();
      
      if (inspectionError) {
        // Handle error scenario
        console.error('Database error:', inspectionError);
        setError('Failed to retrieve inspection details: ' + inspectionError.message);
        setIsLoading(false);
        return;
      }
      
      if (!inspectionData) {
        setError('Inspection not found');
        setIsLoading(false);
        return;
      }
      
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
      
      if (checkpointsError) {
        console.error('Checkpoints error:', checkpointsError);
        // Continue with the data we have
      }
      
      const formattedCheckpoints: InspectionCheckpoint[] = checkpointsData?.map(result => ({
        id: result.id,
        description: result.inspection_checkpoints?.description || 'Unknown checkpoint',
        passed: result.passed,
        notes: result.notes,
        photo_url: result.photo_url,
      })) || [];
      
      // Handle potential errors from Supabase relationships by using type checking
      const profiles = typeof inspectionData.profiles === 'object' && inspectionData.profiles !== null && !('code' in inspectionData.profiles) 
        ? inspectionData.profiles 
        : { full_name: 'Unknown', site_name: 'Unknown' };
        
      const ppeItems = typeof inspectionData.ppe_items === 'object' && inspectionData.ppe_items !== null && !('code' in inspectionData.ppe_items)
        ? inspectionData.ppe_items
        : { type: 'Unknown', serial_number: 'Unknown', brand: 'Unknown', model_number: 'Unknown', manufacturing_date: null, expiry_date: null, batch_number: null };
      
      // Create the detailed inspection with safe property access
      const detailedInspection: InspectionDetails = {
        id: inspectionData.id,
        date: inspectionData.date,
        type: inspectionData.type,
        overall_result: inspectionData.overall_result || 'Unknown',
        notes: inspectionData.notes,
        signature_data: inspectionData.signature_data,
        inspector_id: inspectionData.inspector_id || '',
        inspector_name: profiles.full_name || 'Unknown',
        ppe_type: ppeItems.type || 'Unknown',
        ppe_serial: ppeItems.serial_number || 'Unknown',
        ppe_brand: ppeItems.brand || 'Unknown',
        ppe_model: ppeItems.model_number || 'Unknown',
        site_name: profiles.site_name || 'Unknown Site',
        manufacturing_date: ppeItems.manufacturing_date || 'N/A',
        expiry_date: ppeItems.expiry_date || 'N/A',
        batch_number: ppeItems.batch_number ? String(ppeItems.batch_number) : 'N/A',
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
      // Convert InspectionDetails to StandardInspectionData
      const standardData: StandardInspectionData = {
        ...inspection,
        signature_data: inspection.signature_data || null,
        signature_url: inspection.signature_data || null // Map signature_data to signature_url for compatibility
      };
      await generateInspectionDetailPDF(standardData);
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
      // Convert InspectionDetails to StandardInspectionData
      const standardData: StandardInspectionData = {
        ...inspection,
        signature_data: inspection.signature_data || null,
        signature_url: inspection.signature_data || null // Map signature_data to signature_url for compatibility
      };
      await generateInspectionExcelReport(standardData);
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
  
  const handleShareWhatsApp = async () => {
    if (!inspection || !isOnline) return;
    
    try {
      setIsExporting(true);
      
      if (shareFormat === 'pdf') {
        await handleExportPDF();
      } else {
        await handleExportExcel();
      }
      
      const message = 
        `Inspection Report (${shareFormat.toUpperCase()})\n` +
        `PPE: ${inspection.ppe_type} (${inspection.ppe_serial})\n` +
        `Date: ${format(new Date(inspection.date), 'MMM d, yyyy')}\n` +
        `Result: ${inspection.overall_result.toUpperCase() || 'UNKNOWN'}\n` +
        `Inspector: ${inspection.inspector_name}\n` +
        `\nPlease check the attached ${shareFormat.toUpperCase()} file for details.`;
      
      const encodedMessage = encodeURIComponent(message);
      
      window.open(`https://wa.me/?text=${encodedMessage}`, '_blank');
      
      toast({
        title: 'Share via WhatsApp',
        description: `WhatsApp opened with ${shareFormat.toUpperCase()} report details`,
      });
    } catch (error) {
      console.error('WhatsApp share error:', error);
      toast({
        title: 'Share Failed',
        description: 'Could not share via WhatsApp',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };
  
  const handleShareEmail = async () => {
    if (!inspection || !isOnline) return;
    
    try {
      setIsExporting(true);
      
      if (shareFormat === 'pdf') {
        await handleExportPDF();
      } else {
        await handleExportExcel();
      }
      
      const subject = `Inspection Report - ${inspection.ppe_type} (${inspection.ppe_serial})`;
      
      const body = 
        `Inspection Report (${shareFormat.toUpperCase()})\n\n` +
        `PPE: ${inspection.ppe_type} (${inspection.ppe_serial})\n` +
        `Date: ${format(new Date(inspection.date), 'MMM d, yyyy')}\n` +
        `Result: ${inspection.overall_result.toUpperCase() || 'UNKNOWN'}\n` +
        `Inspector: ${inspection.inspector_name}\n\n` +
        `Please check the attached ${shareFormat.toUpperCase()} file for details.`;
      
      const mailtoLink = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      
      window.open(mailtoLink, '_blank');
      
      toast({
        title: 'Share via Email',
        description: `Email client opened with ${shareFormat.toUpperCase()} report details`,
      });
    } catch (error) {
      console.error('Email share error:', error);
      toast({
        title: 'Share Failed',
        description: 'Could not share via email',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };
  
  const getResultBadge = (result: string) => {
    const resultLower = result?.toLowerCase() || '';
    
    if (resultLower === 'pass') {
      return (
        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
          <CheckCircle className="h-3.5 w-3.5 mr-1" />
          PASS
        </Badge>
      );
    }
    
    if (resultLower === 'fail') {
      return (
        <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
          <AlertTriangle className="h-3.5 w-3.5 mr-1" />
          FAIL
        </Badge>
      );
    }
    
    return (
      <Badge variant="outline">
        UNKNOWN
      </Badge>
    );
  };
  
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin mb-2" />
        <p className="text-muted-foreground">Loading inspection details...</p>
      </div>
    );
  }
  
  if (error || !inspection) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <AlertTriangle className="h-10 w-10 text-destructive mb-2" />
        <h3 className="text-lg font-semibold mb-1">Inspection Not Found</h3>
        <p className="text-muted-foreground mb-4">{error || 'Could not load inspection details'}</p>
        <Button variant="outline" onClick={() => navigate('/reports')}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Reports
        </Button>
      </div>
    );
  }
  
  return (
    <div className="space-y-6 px-4 md:px-0">
      <PageHeader 
        title="Inspection Details" 
        showBackButton={true}
        rightElement={
          <div className="flex flex-wrap gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-9">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    Format
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    <DropdownMenuRadioGroup value={shareFormat} onValueChange={(v) => setShareFormat(v as 'pdf' | 'excel')}>
                      <DropdownMenuRadioItem value="pdf">PDF</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="excel">Excel</DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
                <DropdownMenuItem onClick={handleShareWhatsApp}>
                  Share via WhatsApp
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleShareEmail}>
                  Share via Email
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Button variant="outline" size="sm" className="h-9" onClick={handleExportExcel}>
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Excel
            </Button>
            
            <Button size="sm" className="h-9" onClick={handleExportPDF}>
              <FileText className="h-4 w-4 mr-2" />
              PDF
            </Button>
          </div>
        }
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">{inspection.ppe_type}</h3>
                  <p className="text-sm text-muted-foreground">Serial: {inspection.ppe_serial}</p>
                </div>
                <div>{getResultBadge(inspection.overall_result)}</div>
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-muted-foreground">Date</p>
                  <p className="font-medium">{format(new Date(inspection.date), 'PPP')}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Type</p>
                  <p className="font-medium capitalize">{inspection.type}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Brand</p>
                  <p className="font-medium">{inspection.ppe_brand}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Model</p>
                  <p className="font-medium">{inspection.ppe_model}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Batch Number</p>
                  <p className="font-medium">{inspection.batch_number}</p>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <div className="flex items-center text-sm">
                  <User className="h-4 w-4 mr-1" />
                  <p className="text-muted-foreground mr-1">Inspector:</p>
                  <p className="font-medium">{inspection.inspector_name}</p>
                </div>
                <div className="flex items-center text-sm mt-1">
                  <Calendar className="h-4 w-4 mr-1" />
                  <p className="text-muted-foreground mr-1">Site:</p>
                  <p className="font-medium">{inspection.site_name}</p>
                </div>
              </div>
              
              {inspection.notes && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm text-muted-foreground flex items-center">
                      <MessageSquare className="h-4 w-4 mr-1" />
                      Notes
                    </p>
                    <p className="text-sm mt-1">{inspection.notes}</p>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <h3 className="text-lg font-semibold mb-3">Checkpoints</h3>
            
            {inspection.checkpoints.length === 0 ? (
              <p className="text-muted-foreground text-sm">No checkpoint data available</p>
            ) : (
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                {inspection.checkpoints.map((checkpoint, index) => (
                  <div key={checkpoint.id} className="border rounded-md p-3">
                    <div className="flex justify-between items-start">
                      <p className="font-medium text-sm">{index + 1}. {checkpoint.description}</p>
                      <Badge className={
                        checkpoint.passed === null ? "bg-gray-100 text-gray-800" : 
                        checkpoint.passed ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      }>
                        {checkpoint.passed === null ? "N/A" : checkpoint.passed ? "PASS" : "FAIL"}
                      </Badge>
                    </div>
                    
                    {checkpoint.notes && (
                      <p className="text-xs text-muted-foreground mt-1">{checkpoint.notes}</p>
                    )}
                    
                    {checkpoint.photo_url && (
                      <div className="mt-2 relative">
                        <div className="w-full h-24 bg-muted rounded-md overflow-hidden">
                          <img 
                            src={checkpoint.photo_url} 
                            alt={`Checkpoint ${index + 1} photo`} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <Badge className="absolute bottom-1 right-1 flex items-center bg-black/70">
                          <Camera className="h-3 w-3 mr-1" />
                          Photo
                        </Badge>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {inspection.signature_data && (
        <Card>
          <CardContent className="p-4">
            <h3 className="text-sm font-semibold mb-2">Inspector Signature</h3>
            <div className="border rounded-md p-4 bg-muted/30">
              <img 
                src={inspection.signature_data} 
                alt="Inspector signature" 
                className="max-h-20 mx-auto"
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default InspectionDetails;
