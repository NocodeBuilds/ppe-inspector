import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Download, Printer, ChevronLeft, FileSpreadsheet } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { InspectionDetails as InspectionDetailType } from '@/types/ppe';
import { generateInspectionDetailPDF } from '@/utils/reportGenerator/pdfGenerator';
import { generateInspectionExcelReport } from '@/utils/reportGenerator/excelGenerator';
import { format } from 'date-fns';

const InspectionDetails = () => {
  const { id: inspectionId } = useParams<{ id: string }>();
  const [inspection, setInspection] = useState<InspectionDetailType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (!inspectionId) {
      navigate('/');
      return;
    }
    fetchInspectionDetails(inspectionId);
  }, [inspectionId, navigate]);

  const fetchInspectionDetails = async (inspectionId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { data: inspectionData, error: inspectionError } = await supabase
        .from('inspections')
        .select(`
          id,
          date,
          type,
          overall_result,
          notes,
          signature_url,
          inspector_id,
          profiles:inspector_id(full_name, site_name),
          ppe_items:ppe_id(type, serial_number, brand, model_number, manufacturing_date, expiry_date, batch_number)
        `)
        .eq('id', inspectionId)
        .single();
      
      if (inspectionError) throw inspectionError;
      
      if (!inspectionData) {
        throw new Error('Inspection not found');
      }
      
      const { data: checkpointResults, error: checkpointError } = await supabase
        .from('inspection_results')
        .select(`
          id,
          passed,
          notes,
          photo_url,
          inspection_checkpoints:checkpoint_id(id, description)
        `)
        .eq('inspection_id', inspectionId);
      
      if (checkpointError) throw checkpointError;
      
      // Process the checkpoint results
      const checkpoints = checkpointResults?.map(result => {
        const inspection_checkpoint = result.inspection_checkpoints || { id: '', description: 'Unknown checkpoint' };
        
        return {
          id: inspection_checkpoint.id,
          description: inspection_checkpoint.description,
          passed: result.passed,
          notes: result.notes || '',
          photoUrl: result.photo_url,
          photo_url: result.photo_url // Add both versions for compatibility
        };
      }) || [];
      
      // Extract data safely using nullish coalescing
      const inspectorName = inspectionData.profiles?.full_name || 'Unknown Inspector';
      const siteName = inspectionData.profiles?.site_name || 'Unknown Site';
      const ppeType = inspectionData.ppe_items?.type || 'Unknown Type';
      const serialNumber = inspectionData.ppe_items?.serial_number || 'Unknown';
      const brand = inspectionData.ppe_items?.brand || 'Unknown';
      const modelNumber = inspectionData.ppe_items?.model_number || 'Unknown';
      const manufacturingDate = inspectionData.ppe_items?.manufacturing_date || null;
      const expiryDate = inspectionData.ppe_items?.expiry_date || null;
      const batchNumber = inspectionData.ppe_items?.batch_number || 'N/A';
      
      // Create the detailed inspection object
      const detailedInspection = {
        id: inspectionData.id,
        date: inspectionData.date,
        type: inspectionData.type,
        overall_result: inspectionData.overall_result,
        notes: inspectionData.notes,
        signature_url: inspectionData.signature_url,
        inspector_id: inspectionData.inspector_id || '',
        inspector_name: inspectorName,
        ppe_type: ppeType,
        ppe_serial: serialNumber,
        ppe_brand: brand,
        ppe_model: modelNumber,
        site_name: siteName,
        manufacturing_date: manufacturingDate,
        expiry_date: expiryDate,
        batch_number: batchNumber,
        checkpoints: checkpoints,
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
      // Convert to StandardInspectionData format
      const inspectionData = {
        ...inspection,
        photo_url: inspection.photoUrl,
        checkpoints: inspection.checkpoints.map(cp => ({
          ...cp,
          photo_url: cp.photoUrl || cp.photo_url || null,
        }))
      };
      
      await generateInspectionDetailPDF(inspectionData as any);
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
      // Convert to StandardInspectionData format
      const inspectionData = {
        ...inspection,
        photo_url: inspection.photoUrl,
        checkpoints: inspection.checkpoints.map(cp => ({
          ...cp,
          photo_url: cp.photoUrl || cp.photo_url || null,
        }))
      };
      
      await generateInspectionExcelReport(inspectionData as any);
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

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Rest of the component render code */}
    </div>
  );
};

export default InspectionDetails;
