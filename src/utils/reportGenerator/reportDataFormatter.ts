import { format } from 'date-fns';

// Standardized interface for inspection data across all report generators
export interface StandardInspectionData {
  id: string;
  date: string;
  type: string;
  overall_result: string;
  notes: string | null;
  signature_url: string | null;
  inspector_name: string;
  inspector_id: string;
  inspector_employee_id?: string;
  inspector_role?: string;
  inspector_department?: string;
  ppe_type: string;
  ppe_serial: string;
  ppe_brand: string;
  ppe_model: string;
  site_name: string;
  manufacturing_date: string;
  expiry_date: string;
  batch_number?: string;
  checkpoints: {
    id: string;
    description: string;
    passed: boolean | null;
    notes: string | null;
    photo_url: string | null;
  }[];
}

// Convert form submission data to standard format
export const formatFromFormSubmission = (formData: any, userProfile: any): StandardInspectionData => {
  return {
    id: formData.id || '',
    date: formData.date || new Date().toISOString(),
    type: formData.type || '',
    overall_result: formData.overall_result || '',
    notes: formData.notes || null,
    signature_url: formData.signature_url || null,
    inspector_name: userProfile?.full_name || 'Unknown Inspector',
    inspector_id: userProfile?.id || '',
    inspector_employee_id: userProfile?.employee_id || '',
    inspector_role: userProfile?.Employee_Role || userProfile?.role || '',
    inspector_department: userProfile?.department || '',
    ppe_type: formData.ppe_type || '',
    ppe_serial: formData.ppe_serial || '',
    ppe_brand: formData.ppe_brand || '',
    ppe_model: formData.ppe_model || '',
    site_name: userProfile?.site_name || 'Unknown Site',
    manufacturing_date: formData.manufacturing_date || 'N/A',
    expiry_date: formData.expiry_date || 'N/A',
    batch_number: formData.batch_number || '',
    checkpoints: Array.isArray(formData.checkpoints) ? formData.checkpoints : [],
  };
};

// Convert database fetched data to standard format
export const formatFromDatabaseFetch = (dbData: any): StandardInspectionData => {
  // Handle potential missing relationships
  const profiles = dbData.profiles || {};
  const ppeItems = dbData.ppe_items || {};

  return {
    id: dbData.id || '',
    date: dbData.date || new Date().toISOString(),
    type: dbData.type || '',
    overall_result: dbData.overall_result || '',
    notes: dbData.notes || null,
    signature_url: dbData.signature_url || null,
    inspector_name: profiles.full_name || 'Unknown Inspector',
    inspector_id: dbData.inspector_id || '',
    inspector_employee_id: profiles.employee_id || '',
    inspector_role: profiles.Employee_Role || profiles.role || '',
    inspector_department: profiles.department || '',
    ppe_type: ppeItems.type || '',
    ppe_serial: ppeItems.serial_number || '',
    ppe_brand: ppeItems.brand || '',
    ppe_model: ppeItems.model_number || '',
    site_name: profiles.site_name || 'Unknown Site',
    manufacturing_date: ppeItems.manufacturing_date || 'N/A',
    expiry_date: ppeItems.expiry_date || 'N/A',
    batch_number: ppeItems.batch_number || '',
    checkpoints: Array.isArray(dbData.checkpoints) ? dbData.checkpoints : [],
  };
};

// Fetch complete inspection data with relationships
export const fetchCompleteInspectionData = async (supabase: any, inspectionId: string): Promise<StandardInspectionData | null> => {
  try {
    // First get the inspection with basic joins
    const { data: inspection, error } = await supabase
      .from('inspections')
      .select(`
        id, date, type, overall_result, notes, signature_url, inspector_id,
        profiles:inspector_id(*),
        ppe_items:ppe_id(*)
      `)
      .eq('id', inspectionId)
      .single();
    
    if (error) throw error;
    if (!inspection) return null;
    
    // Then get the checkpoint results
    const { data: checkpointResults, error: resultsError } = await supabase
      .from('inspection_results')
      .select(`
        id, passed, notes, photo_url,
        checkpoints:checkpoint_id(id, description)
      `)
      .eq('inspection_id', inspectionId);
    
    if (resultsError) throw resultsError;
    
    // Format the checkpoints
    const formattedCheckpoints = checkpointResults.map((result: any) => ({
      id: result.checkpoints?.id || result.id,
      description: result.checkpoints?.description || 'Unknown checkpoint',
      passed: result.passed,
      notes: result.notes || null,
      photo_url: result.photo_url || null,
    }));
    
    // Add checkpoints to the inspection data
    inspection.checkpoints = formattedCheckpoints;
    
    // Return standardized data
    return formatFromDatabaseFetch(inspection);
  } catch (error) {
    console.error('Error fetching complete inspection data:', error);
    return null;
  }
};

// Helper to ensure dates are properly formatted
export const formatDate = (dateValue: string | Date | null | undefined): string => {
  if (!dateValue) return 'N/A';
  try {
    return format(new Date(dateValue), 'dd.MM.yyyy');
  } catch (e) {
    return 'Invalid date';
  }
};
