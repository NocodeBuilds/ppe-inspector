
import { SupabaseClient } from '@supabase/supabase-js';
import { safeGet } from '@/utils/safeGet';
import { format, parseISO } from 'date-fns';

/**
 * Standard format for inspection data used across reports
 */
export interface StandardInspectionData {
  id: string;
  date: string;
  type: string;
  overall_result: string;
  inspector_id: string;
  inspector_name: string;
  inspector_employee_id?: string;
  inspector_role?: string;
  inspector_department?: string;
  site_name: string;
  ppe_type: string;
  ppe_serial: string;
  ppe_brand: string;
  ppe_model: string;
  manufacturing_date: string;
  expiry_date: string;
  batch_number: string;
  notes: string | null;
  signature_url: string | null;
  checkpoints: {
    id: string;
    description: string;
    passed: boolean | null;
    notes?: string | null;
    photo_url?: string | null;
  }[];
}

/**
 * Format a date string to a standard format or return NA if the date is invalid
 */
export function formatDate(dateString?: string | null): string {
  if (!dateString) return 'N/A';
  try {
    return format(parseISO(dateString), 'dd/MM/yyyy');
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'N/A';
  }
}

/**
 * Format a date string or fallback to NA
 */
export function formatDateOrNA(dateString?: string | null): string {
  return formatDate(dateString);
}

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
    
    const profiles = inspectionData.profiles || {};
    const ppeItems = inspectionData.ppe_items || {};
    
    // Create standardized inspection data
    const standardData: StandardInspectionData = {
      id: inspectionData.id,
      date: inspectionData.date,
      type: inspectionData.type,
      overall_result: inspectionData.overall_result,
      inspector_id: inspectionData.inspector_id || '',
      inspector_name: safeGet(profiles, 'full_name', 'Unknown'),
      site_name: safeGet(profiles, 'site_name', 'Unknown'),
      ppe_type: safeGet(ppeItems, 'type', 'Unknown'),
      ppe_serial: safeGet(ppeItems, 'serial_number', 'Unknown'),
      ppe_brand: safeGet(ppeItems, 'brand', 'Unknown'),
      ppe_model: safeGet(ppeItems, 'model_number', 'Unknown'),
      manufacturing_date: safeGet(ppeItems, 'manufacturing_date', 'Unknown'),
      expiry_date: safeGet(ppeItems, 'expiry_date', 'Unknown'),
      batch_number: safeGet(ppeItems, 'batch_number', 'Unknown'),
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
    inspector_employee_id: inspectionData.inspector_employee_id || '',
    inspector_role: inspectionData.inspector_role || '',
    inspector_department: inspectionData.inspector_department || '',
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
