
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
 * Generates and downloads a PDF report for all inspections in a date range
 * @param startDate - Start date for the report
 * @param endDate - End date for the report
 */
export const generateInspectionsReport = async (startDate: Date, endDate: Date): Promise<void> => {
  try {
    // Fetch inspection data within date range
    const { data: inspectionsData, error: inspectionsError } = await supabase
      .from('inspections')
      .select(`
        *,
        ppe_items (*)
      `)
      .gte('date', startDate.toISOString())
      .lte('date', endDate.toISOString())
      .order('date', { ascending: false });
    
    if (inspectionsError) throw inspectionsError;
    if (!inspectionsData || inspectionsData.length === 0) {
      throw new Error('No inspection data found for the selected date range');
    }
    
    // Initialize PDF document
    const doc = createPDFDocument();
    
    // Add title
    addPDFHeader(doc, 'Inspections Report');
    
    // Add date range
    doc.setFontSize(12);
    doc.text(
      `Date Range: ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}`,
      105, 25, { align: 'center' }
    );
    
    // Add summary
    addSectionTitle(doc, 'Summary', 35);
    
    const totalInspections = inspectionsData.length;
    const passedInspections = inspectionsData.filter(i => i.overall_result === 'pass').length;
    const failedInspections = totalInspections - passedInspections;
    
    const summaryData = [
      ['Total Inspections', totalInspections.toString()],
      ['Passed Inspections', passedInspections.toString()],
      ['Failed Inspections', failedInspections.toString()],
      ['Pass Rate', `${Math.round((passedInspections / totalInspections) * 100)}%`],
    ];
    
    addDataTable(doc, [['Metric', 'Value']], summaryData, 40);
    
    // Add inspection details
    addSectionTitle(doc, 'Inspection Details', (doc.lastAutoTable?.finalY || 40) + 15);
    
    const inspectionRows = inspectionsData.map(inspection => [
      new Date(inspection.date).toLocaleDateString(),
      inspection.ppe_items.serial_number,
      inspection.ppe_items.type,
      inspection.inspector_id,
      inspection.overall_result === 'pass' ? 'PASS' : 'FAIL',
    ]);
    
    addDataTable(
      doc, 
      [['Date', 'PPE Serial', 'PPE Type', 'Inspector', 'Result']], 
      inspectionRows, 
      (doc.lastAutoTable?.finalY || 40) + 20
    );
    
    // Add footer
    addPDFFooter(doc, `Generated on ${new Date().toLocaleString()}`);
    
    // Generate filename
    const filename = `Inspections_Report_${startDate.toISOString().split('T')[0]}_to_${endDate.toISOString().split('T')[0]}.pdf`;
    
    // Save the PDF
    savePDF(doc, filename);
    
  } catch (error) {
    console.error('Error generating inspections report:', error);
    throw error;
  }
};
