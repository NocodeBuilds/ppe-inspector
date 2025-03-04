
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { supabase } from '@/integrations/supabase/client';

/**
 * Extension of jsPDF to include the lastAutoTable property added by jspdf-autotable
 */
interface ExtendedJsPDF extends jsPDF {
  lastAutoTable?: {
    finalY: number;
  };
}

/**
 * Generates and downloads a PDF report for a specific PPE item
 * @param ppeId - The ID of the PPE item to generate a report for
 */
export const generatePPEReport = async (ppeId: string): Promise<void> => {
  try {
    // Fetch PPE data
    const { data: ppeData, error: ppeError } = await supabase
      .from('ppe_items')
      .select('*')
      .eq('id', ppeId)
      .single();
    
    if (ppeError) throw ppeError;
    if (!ppeData) throw new Error('PPE item not found');
    
    // Fetch latest inspection data
    const { data: inspectionData, error: inspectionError } = await supabase
      .from('inspections')
      .select(`
        *,
        inspection_results (*)
      `)
      .eq('ppe_id', ppeId)
      .order('date', { ascending: false })
      .limit(1);
    
    if (inspectionError) throw inspectionError;
    
    // Initialize PDF document
    const doc = new jsPDF() as ExtendedJsPDF;
    
    // Add title
    doc.setFontSize(20);
    doc.text('PPE Inspection Report', 105, 15, { align: 'center' });
    
    // Add PPE details
    doc.setFontSize(14);
    doc.text('PPE Details', 14, 30);
    
    const ppeInfo = [
      ['Serial Number', ppeData.serial_number],
      ['Type', ppeData.type],
      ['Brand', ppeData.brand],
      ['Model Number', ppeData.model_number],
      ['Manufacturing Date', new Date(ppeData.manufacturing_date).toLocaleDateString()],
      ['Expiry Date', new Date(ppeData.expiry_date).toLocaleDateString()],
      ['Status', ppeData.status.toUpperCase()],
    ];
    
    autoTable(doc, {
      startY: 35,
      head: [['Property', 'Value']],
      body: ppeInfo,
      theme: 'grid',
    });
    
    // Add inspection details if available
    if (inspectionData && inspectionData.length > 0) {
      const inspection = inspectionData[0];
      
      doc.setFontSize(14);
      const finalY = doc.lastAutoTable?.finalY || 35;
      doc.text('Latest Inspection Details', 14, finalY + 15);
      
      const inspectionInfo = [
        ['Inspection Date', new Date(inspection.date).toLocaleDateString()],
        ['Inspector', inspection.inspector_id],
        ['Result', inspection.overall_result === 'pass' ? 'PASS' : 'FAIL'],
        ['Next Inspection Due', inspection.next_inspection ? new Date(inspection.next_inspection).toLocaleDateString() : 'N/A'],
      ];
      
      autoTable(doc, {
        startY: (doc.lastAutoTable?.finalY || 35) + 20,
        head: [['Property', 'Value']],
        body: inspectionInfo,
        theme: 'grid',
      });
      
      // Add inspection results if available
      if (inspection.inspection_results && inspection.inspection_results.length > 0) {
        doc.setFontSize(14);
        doc.text('Inspection Checkpoints', 14, (doc.lastAutoTable?.finalY || 35) + 15);
        
        const checkpointData = inspection.inspection_results.map((result: any) => [
          result.checkpoint_description || result.checkpoint_id,
          result.passed ? 'PASS' : 'FAIL',
          result.notes || 'N/A'
        ]);
        
        autoTable(doc, {
          startY: (doc.lastAutoTable?.finalY || 35) + 20,
          head: [['Checkpoint', 'Result', 'Notes']],
          body: checkpointData,
          theme: 'grid',
        });
      }
      
      // Add signature if available
      if (inspection.signature_url) {
        doc.setFontSize(14);
        doc.text('Inspector Signature', 14, (doc.lastAutoTable?.finalY || 35) + 15);
        
        // Add signature image
        try {
          const img = new Image();
          img.src = inspection.signature_url;
          doc.addImage(img, 'PNG', 14, (doc.lastAutoTable?.finalY || 35) + 20, 80, 30);
        } catch (e) {
          console.error('Error adding signature to PDF:', e);
          doc.text('Signature available but could not be displayed', 14, (doc.lastAutoTable?.finalY || 35) + 25);
        }
      }
    } else {
      doc.setFontSize(12);
      doc.text('No inspection records found for this PPE item.', 14, (doc.lastAutoTable?.finalY || 35) + 15);
    }
    
    // Add footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.text(
        `Generated on ${new Date().toLocaleString()} - Page ${i} of ${pageCount}`,
        105,
        doc.internal.pageSize.height - 10,
        { align: 'center' }
      );
    }
    
    // Generate filename
    const filename = `PPE_Report_${ppeData.serial_number}_${new Date().toISOString().split('T')[0]}.pdf`;
    
    // Save the PDF
    doc.save(filename);
    
  } catch (error) {
    console.error('Error generating PPE report:', error);
    throw error;
  }
};

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
    const doc = new jsPDF() as ExtendedJsPDF;
    
    // Add title
    doc.setFontSize(20);
    doc.text('Inspections Report', 105, 15, { align: 'center' });
    
    // Add date range
    doc.setFontSize(12);
    doc.text(
      `Date Range: ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}`,
      105, 25, { align: 'center' }
    );
    
    // Add summary
    doc.setFontSize(14);
    doc.text('Summary', 14, 35);
    
    const totalInspections = inspectionsData.length;
    const passedInspections = inspectionsData.filter(i => i.overall_result === 'pass').length;
    const failedInspections = totalInspections - passedInspections;
    
    const summaryData = [
      ['Total Inspections', totalInspections.toString()],
      ['Passed Inspections', passedInspections.toString()],
      ['Failed Inspections', failedInspections.toString()],
      ['Pass Rate', `${Math.round((passedInspections / totalInspections) * 100)}%`],
    ];
    
    autoTable(doc, {
      startY: 40,
      head: [['Metric', 'Value']],
      body: summaryData,
      theme: 'grid',
    });
    
    // Add inspection details
    doc.setFontSize(14);
    doc.text('Inspection Details', 14, (doc.lastAutoTable?.finalY || 40) + 15);
    
    const inspectionRows = inspectionsData.map(inspection => [
      new Date(inspection.date).toLocaleDateString(),
      inspection.ppe_items.serial_number,
      inspection.ppe_items.type,
      inspection.inspector_id,
      inspection.overall_result === 'pass' ? 'PASS' : 'FAIL',
    ]);
    
    autoTable(doc, {
      startY: (doc.lastAutoTable?.finalY || 40) + 20,
      head: [['Date', 'PPE Serial', 'PPE Type', 'Inspector', 'Result']],
      body: inspectionRows,
      theme: 'grid',
    });
    
    // Add footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.text(
        `Generated on ${new Date().toLocaleString()} - Page ${i} of ${pageCount}`,
        105,
        doc.internal.pageSize.height - 10,
        { align: 'center' }
      );
    }
    
    // Generate filename
    const filename = `Inspections_Report_${startDate.toISOString().split('T')[0]}_to_${endDate.toISOString().split('T')[0]}.pdf`;
    
    // Save the PDF
    doc.save(filename);
    
  } catch (error) {
    console.error('Error generating inspections report:', error);
    throw error;
  }
};

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
    const doc = new jsPDF() as ExtendedJsPDF;
    
    // Add title
    doc.setFontSize(20);
    doc.text('PPE Analytics Report', 105, 15, { align: 'center' });
    
    // Add generation date
    doc.setFontSize(12);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 105, 25, { align: 'center' });
    
    // PPE by Type
    doc.setFontSize(14);
    doc.text('PPE Items by Type', 14, 35);
    
    const ppeByTypeRows = Object.entries(ppeByType).map(([type, count]) => [type, count.toString()]);
    
    autoTable(doc, {
      startY: 40,
      head: [['PPE Type', 'Count']],
      body: ppeByTypeRows,
      theme: 'grid',
    });
    
    // Inspections by Month
    doc.setFontSize(14);
    doc.text('Inspections by Month (Last 6 Months)', 14, (doc.lastAutoTable?.finalY || 40) + 15);
    
    const inspectionsByMonthRows = Object.entries(inspectionsByMonth)
      .sort((a, b) => {
        const monthA = new Date(a[0]);
        const monthB = new Date(b[0]);
        return monthA.getTime() - monthB.getTime();
      })
      .map(([month, count]) => [month, count.toString()]);
    
    autoTable(doc, {
      startY: (doc.lastAutoTable?.finalY || 40) + 20,
      head: [['Month', 'Inspections']],
      body: inspectionsByMonthRows,
      theme: 'grid',
    });
    
    // Flagged Items
    doc.setFontSize(14);
    doc.text('Flagged Items', 14, (doc.lastAutoTable?.finalY || 40) + 15);
    
    const flaggedItemsRows = flaggedItemsData.map(item => [
      item.serial_number,
      item.type,
      item.brand,
      new Date(item.expiry_date).toLocaleDateString(),
    ]);
    
    autoTable(doc, {
      startY: (doc.lastAutoTable?.finalY || 40) + 20,
      head: [['Serial Number', 'Type', 'Brand', 'Expiry Date']],
      body: flaggedItemsRows,
      theme: 'grid',
    });
    
    // Add footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.text(
        `PPE Analytics Report - Page ${i} of ${pageCount}`,
        105,
        doc.internal.pageSize.height - 10,
        { align: 'center' }
      );
    }
    
    // Generate filename
    const filename = `PPE_Analytics_Report_${new Date().toISOString().split('T')[0]}.pdf`;
    
    // Save the PDF
    doc.save(filename);
    
  } catch (error) {
    console.error('Error generating analytics report:', error);
    throw error;
  }
};
