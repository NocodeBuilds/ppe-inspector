
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { InspectionDetails } from '@/types/ppe';
import { safeGet } from './typeUtils';

export interface StandardInspectionData {
  id: string;
  date: string;
  type: string;
  result: string;
  notes?: string;
  inspectorName: string;
  inspectorId?: string;
  ppeType: string;
  serialNumber: string;
  brand: string;
  model: string;
  checkpoints: {
    id: string;
    description: string;
    result: string;
    notes?: string;
  }[];
}

export interface InspectionReportOptions {
  includePhotos?: boolean;
  includeSignature?: boolean;
  format?: 'pdf' | 'excel';
}

export async function fetchCompleteInspectionData(inspectionId: string): Promise<InspectionDetails> {
  // Fetch the inspection with related data
  const { data, error } = await supabase
    .from('inspections')
    .select(`
      *,
      profiles:inspector_id(*),
      ppe_items:ppe_id(*)
    `)
    .eq('id', inspectionId)
    .single();

  if (error) throw error;
  if (!data) throw new Error('Inspection not found');

  // Now fetch the checkpoint results
  const { data: checkpointsData, error: checkpointsError } = await supabase
    .from('inspection_results')
    .select(`
      *,
      inspection_checkpoints:checkpoint_id(*)
    `)
    .eq('inspection_id', inspectionId);

  if (checkpointsError) throw checkpointsError;

  // Map the checkpoints to the format expected by the InspectionDetails type
  const mappedCheckpoints = checkpointsData.map(result => ({
    id: result.id,
    description: result.inspection_checkpoints?.description || '',
    passed: result.passed || false,
    notes: result.notes || '',
    photo_url: result.photo_url || null
  }));

  // Create the inspection details object, handling potentially missing data
  const inspector = safeGet(data.profiles, {});
  const ppeItem = safeGet(data.ppe_items, {});

  const inspectionDetails: InspectionDetails = {
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
  };

  return inspectionDetails;
}

// Function to format inspection data for reports
export function formatInspectionForReport(inspection: InspectionDetails): StandardInspectionData {
  return {
    id: inspection.id,
    date: format(new Date(inspection.date), 'PPP'),
    type: inspection.type,
    result: inspection.overall_result,
    notes: inspection.notes,
    inspectorName: inspection.inspector_name,
    inspectorId: inspection.inspector_id,
    ppeType: inspection.ppe_type,
    serialNumber: inspection.ppe_serial,
    brand: inspection.ppe_brand,
    model: inspection.ppe_model,
    checkpoints: inspection.checkpoints.map(cp => ({
      id: cp.id,
      description: cp.description,
      result: cp.passed === true ? 'PASS' : cp.passed === false ? 'FAIL' : 'N/A',
      notes: cp.notes || ''
    }))
  };
}

// Generate a report for a PPE item
export async function generatePPEItemReport(ppeId: string, options?: InspectionReportOptions) {
  // Fetch PPE data and its most recent inspection
  const { data: ppeData, error: ppeError } = await supabase
    .from('ppe_items')
    .select('*')
    .eq('id', ppeId)
    .single();

  if (ppeError) throw ppeError;

  // Fetch the most recent inspection
  const { data: inspectionData, error: inspectionError } = await supabase
    .from('inspections')
    .select(`
      *,
      profiles:inspector_id(*),
      ppe_items:ppe_id(*)
    `)
    .eq('ppe_id', ppeId)
    .order('date', { ascending: false })
    .limit(1)
    .single();

  if (inspectionError && inspectionError.code !== 'PGRST116') {
    throw inspectionError;
  }

  // Create the report data structure
  const reportData = {
    ppeItem: ppeData,
    inspection: inspectionData || null,
    generatedAt: new Date().toISOString(),
  };

  return reportData;
}

// Add this function to satisfy the import in InspectionHistory.tsx
export function generateInspectionsDateReport() {
  // This is a placeholder that needs proper implementation
  console.warn('generateInspectionsDateReport not fully implemented');
  return Promise.resolve({});
}
