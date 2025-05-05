
import { SupabaseClient } from '@supabase/supabase-js';
import { StandardInspectionData } from '@/utils/reportGeneratorService';
import { safeGet } from '@/utils/safeGet';

// Export the StandardInspectionData interface for use in other files
export type { StandardInspectionData };

/**
 * Fetches and formats complete inspection data from Supabase
 */
export async function fetchCompleteInspectionData(supabase: SupabaseClient, inspectionId: string): Promise<StandardInspectionData | null> {
  try {
    // Fetch inspection with related data
    const { data: inspectionData, error: inspectionError } = await supabase
      .from('inspections')
      .select(`
        id, date, type, overall_result, notes, signature_url, inspector_id,
        profiles:inspector_id(full_name, site_name),
        ppe_items:ppe_id(type, serial_number, brand, model_number, manufacturing_date, expiry_date, batch_number)
      `)
      .eq('id', inspectionId)
      .single();
    
    if (inspectionError || !inspectionData) {
      console.error('Error fetching inspection:', inspectionError);
      return null;
    }
    
    // Fetch checkpoint results
    const { data: checkpointResults, error: resultsError } = await supabase
      .from('inspection_results')
      .select(`
        id, passed, notes, photo_url,
        inspection_checkpoints:checkpoint_id(id, description)
      `)
      .eq('inspection_id', inspectionId);
    
    if (resultsError) {
      console.error('Error fetching checkpoint results:', resultsError);
      return null;
    }
    
    // Format checkpoint data
    const checkpoints = checkpointResults.map(result => ({
      id: result.id,
      description: safeGet(result.inspection_checkpoints, 'description', 'Unknown checkpoint'),
      passed: result.passed,
      notes: result.notes,
      photo_url: result.photo_url
    }));
    
    // Create standardized inspection data
    const standardData: StandardInspectionData = {
      id: inspectionData.id,
      date: inspectionData.date,
      type: inspectionData.type,
      overall_result: inspectionData.overall_result,
      inspector_id: inspectionData.inspector_id || '',
      inspector_name: safeGet(inspectionData.profiles, 'full_name', 'Unknown'),
      site_name: safeGet(inspectionData.profiles, 'site_name', 'Unknown'),
      ppe_type: safeGet(inspectionData.ppe_items, 'type', 'Unknown'),
      ppe_serial: safeGet(inspectionData.ppe_items, 'serial_number', 'Unknown'),
      ppe_brand: safeGet(inspectionData.ppe_items, 'brand', 'Unknown'),
      ppe_model: safeGet(inspectionData.ppe_items, 'model_number', 'Unknown'),
      manufacturing_date: safeGet(inspectionData.ppe_items, 'manufacturing_date', 'Unknown'),
      expiry_date: safeGet(inspectionData.ppe_items, 'expiry_date', 'Unknown'),
      batch_number: safeGet(inspectionData.ppe_items, 'batch_number', 'Unknown'),
      notes: inspectionData.notes,
      signature_url: inspectionData.signature_url,
      checkpoints
    };
    
    return standardData;
  } catch (error) {
    console.error('Error in fetchCompleteInspectionData:', error);
    return null;
  }
}

/**
 * Adapts inspection data with any structure to the standard format
 */
export function adaptToStandardFormat(inspectionData: any): StandardInspectionData {
  // Create checkpoints array with consistent format
  const checkpoints = (inspectionData.checkpoints || []).map((cp: any) => ({
    id: cp.id || '',
    description: cp.description || '',
    passed: cp.passed !== undefined ? cp.passed : null,
    notes: cp.notes || null,
    photo_url: cp.photo_url || null
  }));
  
  return {
    id: inspectionData.id || '',
    date: inspectionData.date || new Date().toISOString(),
    type: inspectionData.type || '',
    overall_result: inspectionData.overall_result || '',
    inspector_id: inspectionData.inspector_id || '',
    inspector_name: inspectionData.inspector_name || 'Unknown',
    site_name: inspectionData.site_name || 'Unknown',
    ppe_type: inspectionData.ppe_type || 'Unknown',
    ppe_serial: inspectionData.ppe_serial || 'Unknown',
    ppe_brand: inspectionData.ppe_brand || 'Unknown',
    ppe_model: inspectionData.ppe_model || 'Unknown',
    manufacturing_date: inspectionData.manufacturing_date || 'Unknown',
    expiry_date: inspectionData.expiry_date || 'Unknown',
    batch_number: inspectionData.batch_number || 'Unknown',
    notes: inspectionData.notes || null,
    signature_url: inspectionData.signature_url || null,
    checkpoints: checkpoints
  };
}
