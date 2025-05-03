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
      
      // Process the checkpoint results safely
      const checkpoints = checkpointResults?.map(result => {
        const checkpoint = result.inspection_checkpoints || { id: '', description: 'Unknown checkpoint' };
        
        return {
          id: checkpoint.id,
          description: checkpoint.description,
          passed: result.passed,
          notes: result.notes || '',
          photoUrl: result.photo_url,
          photo_url: result.photo_url // Add both versions for compatibility
        };
      }) || [];
      
      // Use nullish coalescing for safety
      const profiles = inspectionData.profiles || {};
      const ppe_items = inspectionData.ppe_items || {};
      
      // Extract data safely
      const inspectorName = profiles.full_name || 'Unknown Inspector';
      const siteName = profiles.site_name || 'Unknown Site';
      const ppeType = ppe_items.type || 'Unknown Type';
      const serialNumber = ppe_items.serial_number || 'Unknown';
      const brand = ppe_items.brand || 'Unknown';
      const modelNumber = ppe_items.model_number || 'Unknown';
      const manufacturingDate = ppe_items.manufacturing_date || null;
      const expiryDate = ppe_items.expiry_date || null;
      const batchNumber = ppe_items.batch_number || 'N/A';
      
      // Create the detailed inspection object
      const detailedInspection: InspectionDetailType = {
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
        photoUrl: null // Add this property to match the interface
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

  return (
    <div className="container mx-auto px-4 py-6">
      <Button onClick={() => navigate(-1)} variant="ghost" className="mb-4">
        <ChevronLeft className="mr-2 h-4 w-4" />
        Back
      </Button>
      
      {isLoading && <p>Loading inspection details...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}
      
      {inspection && (
        <Card>
          <CardHeader>
            <CardTitle>Inspection Details</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <strong>Inspection ID:</strong>
                <p>{inspection.id}</p>
              </div>
              <div>
                <strong>Date:</strong>
                <p>{format(new Date(inspection.date), 'MMM d, yyyy')}</p>
              </div>
              <div>
                <strong>Type:</strong>
                <p>{inspection.type}</p>
              </div>
              <div>
                <strong>Overall Result:</strong>
                <p>{inspection.overall_result}</p>
              </div>
              <div>
                <strong>Inspector:</strong>
                <p>{inspection.inspector_name}</p>
              </div>
              <div>
                <strong>Site:</strong>
                <p>{inspection.site_name}</p>
              </div>
            </div>
            
            <div className="border-t py-4">
              <h4 className="text-lg font-semibold mb-2">PPE Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <strong>Type:</strong>
                  <p>{inspection.ppe_type}</p>
                </div>
                <div>
                  <strong>Serial Number:</strong>
                  <p>{inspection.ppe_serial}</p>
                </div>
                <div>
                  <strong>Brand:</strong>
                  <p>{inspection.ppe_brand}</p>
                </div>
                <div>
                  <strong>Model:</strong>
                  <p>{inspection.ppe_model}</p>
                </div>
                <div>
                  <strong>Manufacturing Date:</strong>
                  <p>{inspection.manufacturing_date ? format(new Date(inspection.manufacturing_date), 'MMM d, yyyy') : 'N/A'}</p>
                </div>
                <div>
                  <strong>Expiry Date:</strong>
                  <p>{inspection.expiry_date ? format(new Date(inspection.expiry_date), 'MMM d, yyyy') : 'N/A'}</p>
                </div>
                <div>
                  <strong>Batch Number:</strong>
                  <p>{inspection.batch_number}</p>
                </div>
              </div>
            </div>
            
            <div className="border-t py-4">
              <h4 className="text-lg font-semibold mb-2">Checkpoints</h4>
              {inspection.checkpoints.length > 0 ? (
                <ul className="list-disc pl-5">
                  {inspection.checkpoints.map((checkpoint) => (
                    <li key={checkpoint.id} className="mb-2">
                      <strong>{checkpoint.description}</strong>
                      <p>Result: {checkpoint.passed === null ? 'N/A' : checkpoint.passed ? 'Pass' : 'Fail'}</p>
                      {checkpoint.notes && <p>Notes: {checkpoint.notes}</p>}
                      {checkpoint.photoUrl && (
                        <img
                          src={checkpoint.photoUrl}
                          alt="Checkpoint"
                          className="mt-2 rounded-md max-h-40 object-contain"
                        />
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No checkpoints available for this inspection.</p>
              )}
            </div>
            
            {inspection.notes && (
              <div className="border-t py-4">
                <h4 className="text-lg font-semibold mb-2">Notes</h4>
                <p>{inspection.notes}</p>
              </div>
            )}
            
            {inspection.signature_url && (
              <div className="border-t py-4">
                <h4 className="text-lg font-semibold mb-2">Signature</h4>
                <img
                  src={inspection.signature_url}
                  alt="Signature"
                  className="max-h-20 object-contain"
                />
              </div>
            )}
          </CardContent>
        </Card>
      )}
      
      {inspection && (
        <div className="flex justify-end mt-4 gap-2">
          <Button
            onClick={handleExportPDF}
            disabled={isExporting}
          >
            {isExporting ? (
              <>
                Generating PDF...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Export to PDF
              </>
            )}
          </Button>
          
          <Button
            onClick={handleExportExcel}
            disabled={isExporting}
          >
            {isExporting ? (
              <>
                Generating Excel...
              </>
            ) : (
              <>
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                Export to Excel
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

export default InspectionDetails;
