
import { PPEItem, InspectionData } from '@/types';
import { generatePPEReport } from './reportGenerator/ppePDFReport';
import { generateInspectionsReport } from './reportGenerator/inspectionsPDFReport';
import { generateAnalyticsReport } from './reportGenerator/analyticsPDFReport';
import { supabase } from '@/integrations/supabase/client';

/**
 * Generate a PDF report for a specific PPE item or all items
 * @param ppeId The ID of the PPE item or 'all' for all items
 */
export const generatePPEItemReport = async (ppeId: string): Promise<void> => {
  try {
    let query = supabase.from('ppe_items').select('*');
    
    // If not requesting all items, filter by the specific ID
    if (ppeId !== 'all') {
      query = query.eq('id', ppeId);
    }
    
    const { data: ppeData, error: ppeError } = await query;
    
    if (ppeError) throw ppeError;
    
    // Map database items to PPEItem type from Supabase schema to our app schema
    const ppeItems: PPEItem[] = ppeData.map((item: any) => ({
      id: item.id,
      serialNumber: item.serial_number,
      type: item.type,
      brand: item.brand,
      modelNumber: item.model_number,
      manufacturingDate: item.manufacturing_date,
      expiryDate: item.expiry_date,
      status: item.status,
      imageUrl: item.image_url,
      nextInspection: item.next_inspection,
      createdAt: item.created_at,
      updatedAt: item.updated_at
    }));
    
    // Generate the PDF report using the PPE item data
    await generatePPEReport(ppeItems);
    
  } catch (error) {
    console.error('Error generating PPE report:', error);
    throw error;
  }
};

/**
 * Generate a PDF report for inspections within a date range
 * @param startDate The start date for the report
 * @param endDate The end date for the report
 */
export const generateInspectionsDateReport = async (startDate: Date, endDate: Date): Promise<void> => {
  try {
    // Format dates for Supabase query
    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];
    
    // Fetch inspections within the date range
    const { data: inspectionsData, error: inspectionsError } = await supabase
      .from('inspections')
      .select(`
        id, date, type, overall_result,
        profiles:inspector_id (full_name),
        ppe_items:ppe_id (type, serial_number)
      `)
      .gte('date', startDateStr)
      .lte('date', endDateStr)
      .order('date', { ascending: false });
    
    if (inspectionsError) throw inspectionsError;
    
    // Map the data for the PDF report
    const formattedInspections = inspectionsData.map((item: any) => ({
      id: item.id,
      date: item.date,
      type: item.type,
      inspector_name: item.profiles?.full_name || 'Unknown',
      result: item.overall_result,
      ppe_type: item.ppe_items?.type || 'Unknown',
      serial_number: item.ppe_items?.serial_number || 'Unknown'
    }));
    
    // Generate the PDF report using the inspection data
    await generateInspectionsReport(formattedInspections);
    
  } catch (error) {
    console.error('Error generating inspections report:', error);
    throw error;
  }
};

/**
 * Generate an analytics PDF report
 */
export const generateAnalyticsDataReport = async (): Promise<void> => {
  try {
    // Get PPE counts by type
    const { data: ppeTypeData, error: ppeTypeError } = await supabase
      .from('ppe_items')
      .select('type, status')
      .order('type');
    
    if (ppeTypeError) throw ppeTypeError;
    
    // Calculate counts for each type
    const typeCounts = ppeTypeData.reduce((acc: Record<string, number>, item: any) => {
      acc[item.type] = (acc[item.type] || 0) + 1;
      return acc;
    }, {});
    
    // Get inspection pass/fail counts
    const { data: inspectionData, error: inspectionError } = await supabase
      .from('inspections')
      .select('overall_result, type');
    
    if (inspectionError) throw inspectionError;
    
    const passCount = inspectionData.filter((item: any) => 
      item.overall_result.toLowerCase() === 'pass').length;
    
    const failCount = inspectionData.filter((item: any) => 
      item.overall_result.toLowerCase() === 'fail').length;
    
    const inspectionTypeCounts = inspectionData.reduce((acc: any, item: any) => {
      acc[item.type] = (acc[item.type] || 0) + 1;
      return acc;
    }, { 'pre-use': 0, 'monthly': 0, 'quarterly': 0 });
    
    // Generate analytics PDF report
    await generateAnalyticsReport({
      ppeTypeDistribution: typeCounts,
      ppeStatusCounts: {
        active: ppeTypeData.filter((item: any) => item.status === 'active').length || 0,
        expired: ppeTypeData.filter((item: any) => item.status === 'expired').length || 0,
        maintenance: ppeTypeData.filter((item: any) => item.status === 'maintenance').length || 0,
        flagged: ppeTypeData.filter((item: any) => item.status === 'flagged').length || 0
      },
      inspectionTypeCounts: {
        'pre-use': inspectionTypeCounts['pre-use'] || 0,
        'monthly': inspectionTypeCounts['monthly'] || 0,
        'quarterly': inspectionTypeCounts['quarterly'] || 0
      },
      inspectionResultCounts: {
        pass: passCount,
        fail: failCount
      },
      upcomingInspections: [],
      expiringItems: []
    });
    
  } catch (error) {
    console.error('Error generating analytics report:', error);
    throw error;
  }
};
