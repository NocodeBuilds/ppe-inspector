
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { StandardCard } from '@/components/ui/standard-card';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { FileText, FileSpreadsheet, AlertTriangle } from 'lucide-react';
import { InspectionDetails as InspectionDetailsType } from '@/types/ppe';
import { generateInspectionDetailPDF } from '@/utils/reportGenerator/pdfGenerator';
import { generateInspectionExcelReport } from '@/utils/reportGenerator/excelGenerator';
import { safeGet } from '@/utils/typeUtils';

// Interface for the inspection details page
interface InspectionDetailPageProps {}

const InspectionDetails: React.FC<InspectionDetailPageProps> = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inspection, setInspection] = useState<InspectionDetailsType | null>(null);

  useEffect(() => {
    const fetchInspectionDetails = async () => {
      if (!id) {
        setError('No inspection ID provided');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);

        // Fetch the inspection with related data
        const { data, error: fetchError } = await supabase
          .from('inspections')
          .select(`
            *,
            profiles:inspector_id(*),
            ppe_items:ppe_id(*)
          `)
          .eq('id', id)
          .single();

        if (fetchError) throw fetchError;
        if (!data) throw new Error('Inspection not found');

        // Now fetch the checkpoint results
        const { data: checkpointsData, error: checkpointsError } = await supabase
          .from('inspection_results')
          .select(`
            *,
            inspection_checkpoints:checkpoint_id(*)
          `)
          .eq('inspection_id', id);

        if (checkpointsError) throw checkpointsError;

        // Map the checkpoints to the format expected by the InspectionDetails type
        const mappedCheckpoints = checkpointsData.map(result => {
          const checkpoint = safeGet(result.inspection_checkpoints, {});
          return {
            id: result.id,
            description: safeGet(checkpoint, {}).description || '',
            passed: result.passed || false,
            notes: result.notes || '',
            photo_url: result.photo_url || null
          };
        });

        // Create the inspection details object, handling potentially missing data
        const inspector = safeGet(data.profiles, {});
        const ppeItem = safeGet(data.ppe_items, {});

        const inspectionDetails: InspectionDetailsType = {
          id: data.id,
          date: data.date,
          type: data.type,
          overall_result: data.overall_result,
          notes: data.notes || '',
          signature_url: data.signature_url || null,
          inspector_id: safeGet(data, {}).inspector_id || '',
          inspector_name: safeGet(inspector, {}).full_name || 'Unknown',
          site_name: safeGet(inspector, {}).site_name || 'Unknown',
          ppe_type: safeGet(ppeItem, {}).type || 'Unknown',
          ppe_serial: safeGet(ppeItem, {}).serial_number || 'Unknown',
          ppe_brand: safeGet(ppeItem, {}).brand || 'Unknown',
          ppe_model: safeGet(ppeItem, {}).model_number || 'Unknown',
          manufacturing_date: safeGet(ppeItem, {}).manufacturing_date || null,
          expiry_date: safeGet(ppeItem, {}).expiry_date || null,
          batch_number: safeGet(ppeItem, {}).batch_number || '',
          checkpoints: mappedCheckpoints,
          photoUrl: data.images && data.images.length > 0 ? data.images[0] : null
        };

        setInspection(inspectionDetails);
      } catch (err: any) {
        console.error('Error fetching inspection details:', err);
        setError(err.message || 'Failed to load inspection details');
        toast({
          title: 'Error',
          description: 'Failed to load inspection details',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchInspectionDetails();
  }, [id, toast]);

  const handleDownloadPDF = async () => {
    if (!inspection) return;

    setIsExporting(true);
    try {
      await generateInspectionDetailPDF(inspection);
      toast({
        title: 'PDF Generated',
        description: 'Inspection report has been downloaded as PDF',
      });
    } catch (error: any) {
      console.error('Error generating PDF report:', error);
      toast({
        title: 'PDF Generation Failed',
        description: error.message || 'Could not generate PDF report',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownloadExcel = async () => {
    if (!inspection) return;

    setIsExporting(true);
    try {
      await generateInspectionExcelReport(inspection);
      toast({
        title: 'Excel Generated',
        description: 'Inspection report has been downloaded as Excel',
      });
    } catch (error: any) {
      console.error('Error generating Excel report:', error);
      toast({
        title: 'Excel Generation Failed',
        description: error.message || 'Could not generate Excel report',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-gray-300 rounded w-1/2"></div>
          <div className="h-24 bg-gray-300 rounded"></div>
          <div className="h-64 bg-gray-300 rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !inspection) {
    return (
      <div className="container mx-auto p-4">
        <StandardCard title="Error">
          <p className="text-red-500">{error || 'Failed to load inspection details'}</p>
          <Button onClick={() => navigate(-1)} className="mt-4">Go Back</Button>
        </StandardCard>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <StandardCard
        title={`Inspection Details - ${inspection.ppe_type}`}
        description={`Inspection on ${format(new Date(inspection.date), 'PPP')}`}
      >
        <div className="flex flex-col md:flex-row md:justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold">Equipment Information</h3>
            <p><span className="font-medium">Serial Number:</span> {inspection.ppe_serial}</p>
            <p><span className="font-medium">Type:</span> {inspection.ppe_type}</p>
            <p><span className="font-medium">Brand:</span> {inspection.ppe_brand}</p>
            <p><span className="font-medium">Model:</span> {inspection.ppe_model}</p>
          </div>
          
          <div className="mt-4 md:mt-0">
            <h3 className="text-lg font-semibold">Inspection Information</h3>
            <p><span className="font-medium">Date:</span> {format(new Date(inspection.date), 'PPP')}</p>
            <p><span className="font-medium">Inspector:</span> {inspection.inspector_name}</p>
            <p><span className="font-medium">Type:</span> {inspection.type}</p>
            <p>
              <span className="font-medium">Result:</span>{' '}
              <span className={inspection.overall_result.toLowerCase() === 'pass' ? 'text-green-600' : 'text-red-600'}>
                {inspection.overall_result.toUpperCase()}
              </span>
            </p>
          </div>
          
          <div className="mt-4 md:mt-0 flex flex-col space-y-2">
            <Button
              onClick={handleDownloadPDF}
              disabled={isExporting}
              className="flex items-center justify-center"
            >
              <FileText className="mr-2 h-4 w-4" />
              Download PDF
            </Button>
            
            <Button
              onClick={handleDownloadExcel}
              disabled={isExporting}
              variant="outline"
              className="flex items-center justify-center"
            >
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              Download Excel
            </Button>
          </div>
        </div>
        
        {inspection.notes && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold">Notes</h3>
            <p className="bg-muted p-3 rounded-md">{inspection.notes}</p>
          </div>
        )}
        
        <div>
          <h3 className="text-lg font-semibold mb-3">Inspection Checkpoints</h3>
          <div className="border rounded-md overflow-hidden">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-muted">
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Description</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 w-24">Result</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {inspection.checkpoints.map((checkpoint) => (
                  <tr key={checkpoint.id}>
                    <td className="px-4 py-3 text-sm">{checkpoint.description}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        checkpoint.passed === null
                          ? 'bg-gray-200 text-gray-800'
                          : checkpoint.passed
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {checkpoint.passed === null ? 'N/A' : checkpoint.passed ? 'PASS' : 'FAIL'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">{checkpoint.notes || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        {inspection.signature_url && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2">Inspector Signature</h3>
            <div className="border rounded-md p-4 max-w-xs">
              <img
                src={inspection.signature_url}
                alt="Inspector Signature"
                className="max-h-24 object-contain"
              />
            </div>
          </div>
        )}
        
        <div className="mt-6 flex justify-end">
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
          >
            Go Back
          </Button>
        </div>
      </StandardCard>
    </div>
  );
};

export default InspectionDetails;
