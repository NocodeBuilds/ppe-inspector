
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { supabase } from '@/integrations/supabase/client';
import { PPEItem, Inspection } from '@/types';
import { createPPEPDFReport } from './reportGenerator/ppePDFReport';
import { createInspectionsPDFReport } from './reportGenerator/inspectionsPDFReport';
import { createAnalyticsPDFReport } from './reportGenerator/analyticsPDFReport';

interface InspectionData {
  id: string;
  date: string;
  type: string;
  inspector_name: string;
  result: string;
  ppe_type: string;
  serial_number: string;
}

/**
 * Generate a PDF report for a specific PPE item
 * @param ppeId The ID of the PPE item
 */
export const generatePPEReport = async (ppeId: string): Promise<void> => {
  try {
    const { data: ppeData, error: ppeError } = await supabase
      .from('ppe_items')
      .select('*')
      .eq('id', ppeId)
      .single();
    
    if (ppeError) throw ppeError;
    
    // Map database item to PPEItem type
    const ppeItem: PPEItem = {
      id: ppeData.id,
      serialNumber: ppeData.serial_number,
      type: ppeData.type,
      brand: ppeData.brand,
      modelNumber: ppeData.model_number,
      manufacturingDate: ppeData.manufacturing_date,
      expiryDate: ppeData.expiry_date,
      status: ppeData.status,
      imageUrl: ppeData.image_url,
      nextInspection: ppeData.next_inspection,
      createdAt: ppeData.created_at,
      updatedAt: ppeData.updated_at
    };
    
    // Generate the PDF report using the PPE item data
    await createPPEPDFReport(ppeItem);
    
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
export const generateInspectionsReport = async (startDate: Date, endDate: Date): Promise<void> => {
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
    const inspectionItems: InspectionData[] = inspectionsData.map((item: any) => ({
      id: item.id,
      date: item.date,
      type: item.type,
      inspector_name: item.profiles?.full_name || 'Unknown',
      result: item.overall_result,
      ppe_type: item.ppe_items?.type || 'Unknown',
      serial_number: item.ppe_items?.serial_number || 'Unknown'
    }));
    
    // Generate the PDF report using the inspection data
    await createInspectionsPDFReport(inspectionItems);
    
  } catch (error) {
    console.error('Error generating inspections report:', error);
    throw error;
  }
};

/**
 * Generate an analytics PDF report
 */
export const generateAnalyticsReport = async (): Promise<void> => {
  try {
    // Get PPE counts by type
    const { data: ppeTypeData, error: ppeTypeError } = await supabase
      .from('ppe_items')
      .select('type, count')
      .select('type')
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
      .select('overall_result');
    
    if (inspectionError) throw inspectionError;
    
    const passCount = inspectionData.filter((item: any) => 
      item.overall_result.toLowerCase() === 'pass').length;
    
    const failCount = inspectionData.filter((item: any) => 
      item.overall_result.toLowerCase() === 'fail').length;
    
    // Generate analytics PDF report
    await createAnalyticsPDFReport({
      typeCounts,
      inspectionStats: {
        total: inspectionData.length,
        pass: passCount,
        fail: failCount,
        passRate: inspectionData.length ? (passCount / inspectionData.length) * 100 : 0
      }
    });
    
  } catch (error) {
    console.error('Error generating analytics report:', error);
    throw error;
  }
};
