
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { InspectionDetails } from '@/types/ppe';

/**
 * Utility function to fetch complete inspection data for reporting
 */
export async function fetchCompleteInspectionData(supabaseClient, inspectionId: string): Promise<InspectionDetails | null> {
  try {
    // Fetch inspection with related data
    const { data, error } = await supabaseClient
      .from('inspections')
      .select(`
        id, date, type, overall_result, notes, signature_url,
        profiles:inspector_id(*),
        ppe_items:ppe_id(*)
      `)
      .eq('id', inspectionId)
      .single();
      
    if (error) throw error;
    if (!data) throw new Error('Inspection not found');
    
    // Fetch checkpoint results
    const { data: checkpointsData, error: checkpointsError } = await supabaseClient
      .from('inspection_results')
      .select(`
        id, passed, notes, photo_url,
        inspection_checkpoints:checkpoint_id(description)
      `)
      .eq('inspection_id', inspectionId);
      
    if (checkpointsError) throw checkpointsError;
    
    // Create inspection details object
    const inspector = data.profiles || {};
    const ppeItem = data.ppe_items || {};
    
    return {
      id: data.id,
      date: data.date,
      type: data.type,
      overall_result: data.overall_result,
      notes: data.notes || '',
      signature_url: data.signature_url || null,
      inspector_id: data.inspector_id,
      inspector_name: inspector.full_name || 'Unknown',
      site_name: inspector.site_name || 'Unknown',
      ppe_type: ppeItem.type || 'Unknown',
      ppe_serial: ppeItem.serial_number || 'Unknown',
      ppe_brand: ppeItem.brand || 'Unknown',
      ppe_model: ppeItem.model_number || 'Unknown',
      manufacturing_date: ppeItem.manufacturing_date || null,
      expiry_date: ppeItem.expiry_date || null,
      batch_number: ppeItem.batch_number || '',
      photoUrl: '',
      checkpoints: checkpointsData.map(cp => ({
        id: cp.id,
        description: cp.inspection_checkpoints?.description || '',
        passed: cp.passed,
        notes: cp.notes || '',
        photo_url: cp.photo_url || null
      }))
    };
  } catch (error) {
    console.error('Error fetching complete inspection data:', error);
    return null;
  }
}

/**
 * Generate date-based report for inspections
 */
export function generateInspectionsDateReport(inspections: any[], dateRange: string) {
  try {
    // Organize inspections by date
    const organizedData = inspections.reduce((acc, inspection) => {
      const date = format(new Date(inspection.date), 'yyyy-MM-dd');
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(inspection);
      return acc;
    }, {});

    // Calculate statistics
    const totalInspections = inspections.length;
    const passedInspections = inspections.filter(i => i.overall_result?.toLowerCase() === 'pass').length;
    const failedInspections = inspections.filter(i => i.overall_result?.toLowerCase() === 'fail').length;
    const passRate = totalInspections > 0 ? (passedInspections / totalInspections) * 100 : 0;

    // Format for reporting
    return {
      dateRange,
      totalInspections,
      passedInspections,
      failedInspections,
      passRate: passRate.toFixed(1) + '%',
      inspectionsByDate: organizedData
    };
  } catch (error) {
    console.error('Error generating date report:', error);
    throw error;
  }
}
