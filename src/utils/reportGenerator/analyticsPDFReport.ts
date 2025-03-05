
import { supabase } from '@/integrations/supabase/client';
import { 
  createPDFDocument, 
  addPDFHeader, 
  addSectionTitle, 
  addDataTable, 
  addPDFFooter,
  savePDF,
  ExtendedJsPDF 
} from '@/utils/pdfUtils';

/**
 * Generates and downloads a PDF analytics report
 */
export const generateAnalyticsReport = async (): Promise<void> => {
  try {
    // Fetch summary statistics from Supabase
    // Total PPE items by type
    const { data: ppeByTypeData, error: ppeByTypeError } = await supabase
      .from('ppe_items')
      .select('type, count')
      .select('type')
      .order('type');
    
    if (ppeByTypeError) throw ppeByTypeError;
    
    const ppeByType = ppeByTypeData.reduce((acc: Record<string, number>, item: any) => {
      acc[item.type] = (acc[item.type] || 0) + 1;
      return acc;
    }, {});
    
    // Total inspections by month (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const { data: inspectionsByMonthData, error: inspectionsByMonthError } = await supabase
      .from('inspections')
      .select('date')
      .gte('date', sixMonthsAgo.toISOString());
    
    if (inspectionsByMonthError) throw inspectionsByMonthError;
    
    const inspectionsByMonth: Record<string, number> = {};
    
    inspectionsByMonthData.forEach((item: any) => {
      const date = new Date(item.date);
      const monthYear = `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;
      inspectionsByMonth[monthYear] = (inspectionsByMonth[monthYear] || 0) + 1;
    });
    
    // Flagged items by reason
    const { data: flaggedItemsData, error: flaggedItemsError } = await supabase
      .from('ppe_items')
      .select('*')
      .eq('status', 'flagged');
    
    if (flaggedItemsError) throw flaggedItemsError;
    
    // Initialize PDF document
    const doc = createPDFDocument();
    
    // Add title
    addPDFHeader(doc, 'PPE Analytics Report', `Generated on: ${new Date().toLocaleDateString()}`);
    
    // PPE by Type
    addSectionTitle(doc, 'PPE Items by Type', 35);
    
    const ppeByTypeRows = Object.entries(ppeByType).map(([type, count]) => [type, count.toString()]);
    
    addDataTable(doc, [['PPE Type', 'Count']], ppeByTypeRows, 40);
    
    // Inspections by Month
    addSectionTitle(doc, 'Inspections by Month (Last 6 Months)', (doc.lastAutoTable?.finalY || 40) + 15);
    
    const inspectionsByMonthRows = Object.entries(inspectionsByMonth)
      .sort((a, b) => {
        const monthA = new Date(a[0]);
        const monthB = new Date(b[0]);
        return monthA.getTime() - monthB.getTime();
      })
      .map(([month, count]) => [month, count.toString()]);
    
    addDataTable(
      doc, 
      [['Month', 'Inspections']], 
      inspectionsByMonthRows, 
      (doc.lastAutoTable?.finalY || 40) + 20
    );
    
    // Flagged Items
    addSectionTitle(doc, 'Flagged Items', (doc.lastAutoTable?.finalY || 40) + 15);
    
    const flaggedItemsRows = flaggedItemsData.map(item => [
      item.serial_number,
      item.type,
      item.brand,
      new Date(item.expiry_date).toLocaleDateString(),
    ]);
    
    addDataTable(
      doc, 
      [['Serial Number', 'Type', 'Brand', 'Expiry Date']], 
      flaggedItemsRows, 
      (doc.lastAutoTable?.finalY || 40) + 20
    );
    
    // Add footer
    addPDFFooter(doc, 'PPE Analytics Report');
    
    // Generate filename
    const filename = `PPE_Analytics_Report_${new Date().toISOString().split('T')[0]}.pdf`;
    
    // Save the PDF
    savePDF(doc, filename);
    
  } catch (error) {
    console.error('Error generating analytics report:', error);
    throw error;
  }
};
