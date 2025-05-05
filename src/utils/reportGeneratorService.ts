
import { fetchCompleteInspectionData, StandardInspectionData } from '@/utils/reportGenerator/reportDataFormatter';
import { generateInspectionDetailPDF } from '@/utils/reportGenerator/inspectionDetailPDF';
import { supabase } from '@/integrations/supabase/client';

/**
 * Generate a report for a specific PPE item
 * @param ppeId ID of the PPE item
 * @returns Promise that resolves when the report is generated and downloaded
 */
export async function generatePPEItemReport(ppeId: string): Promise<void> {
  try {
    // Get the most recent inspection for this PPE
    const { data: inspections, error: inspectionsError } = await supabase
      .from('inspections')
      .select('id')
      .eq('ppe_id', ppeId)
      .order('date', { ascending: false })
      .limit(1);
    
    if (inspectionsError) {
      throw new Error(`Error fetching inspections: ${inspectionsError.message}`);
    }
    
    if (!inspections || inspections.length === 0) {
      throw new Error('No inspection records found for this PPE item');
    }
    
    // Get inspection details
    const inspectionData = await fetchCompleteInspectionData(supabase, inspections[0].id);
    
    if (!inspectionData) {
      throw new Error('Failed to fetch inspection details');
    }
    
    // Generate PDF using inspection data
    await generateInspectionDetailPDF(inspectionData);
    
    return;
  } catch (error: any) {
    console.error('Error generating PPE report:', error);
    throw error;
  }
}

// Re-export StandardInspectionData for use in other components
export type { StandardInspectionData };
