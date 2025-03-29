import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { format } from 'date-fns';
import { StandardInspectionData, formatDate } from './reportDataFormatter';

/**
 * Generate and save an Excel report for a single inspection
 * Includes an offline fallback using Blob and saveAs
 */
export const generateInspectionExcelReport = async (inspection: StandardInspectionData): Promise<void> => {
  try {
    // Create a new workbook
    const wb = XLSX.utils.book_new();
    
    // Set column widths for better formatting
    const wscols = [
      { wch: 20 },  // A
      { wch: 30 },  // B
      { wch: 20 },  // C
      { wch: 30 },  // D
    ];
    
    // Create header rows with merged cells
    const headerRows = [
      ['', inspection.ppe_type.toUpperCase() + ' INSPECTION CHECKLIST', '', ''],
      ['', '', 'Doc. No:', 'ABCD'],
      ['', '', 'Approval Date:', format(new Date(), 'dd.MM.yyyy')],
      ['', '', '', ''],
    ];
    
    // Get site name from inspector's data
    const siteName = inspection.site_name || "Example Site";
    
    // Create equipment details section
    const equipmentRows = [
      ['EQUIPMENT DETAILS', '', '', ''],
      ['SITE NAME:', siteName, 'INSPECTION DATE:', formatDate(inspection.date)],
      ['PPE TYPE:', inspection.ppe_type.toUpperCase(), 'SERIAL NUMBER:', inspection.ppe_serial],
      ['MAKE (BRAND):', inspection.ppe_brand, 'MODEL NUMBER:', inspection.ppe_model],
      ['MANUFACTURING DATE:', inspection.manufacturing_date || 'N/A', 'EXPIRY DATE:', inspection.expiry_date || 'N/A'],
      ['', '', '', ''],
    ];
    
    // Create checkpoints section header
    const checkpointHeader = [
      ['INSPECTION CHECKPOINTS', '', '', ''],
      ['S.No.', 'Checkpoint Description', 'Result', 'Remarks'],
    ];
    
    // Create checkpoint rows
    const checkpointRows = inspection.checkpoints.map((checkpoint, index) => {
      const result = checkpoint.passed === null ? 'NA' : checkpoint.passed ? 'PASS' : 'FAIL';
      const notes = checkpoint.notes || '';
      return [index + 1, checkpoint.description, result, notes];
    });
    
    // Create inspector details section
    const inspectorRows = [
      ['', '', '', ''],
      ['INSPECTOR DETAILS', '', '', ''],
      ['EMPLOYEE NAME:', inspection.inspector_name || 'Unknown', 'EMPLOYEE ID:', inspection.inspector_employee_id || ''],
      ['ROLE:', inspection.inspector_role || 'Inspector', 'DEPARTMENT:', inspection.inspector_department || 'N/A'],
      ['', '', '', ''],
    ];
    
    // Create final result section
    const resultRows = [
      ['FINAL INSPECTION RESULT', '', '', ''],
      ['OVERALL RESULT:', inspection.overall_result.toUpperCase(), 'DATE:', formatDate(inspection.date)],
      ['', '', '', ''],
      ['Inspector Signature', '', '', ''],
      ['', '', '', ''],
      ['', '', '', ''],
    ];
    
    // Combine all sections
    const allRows = [
      ...headerRows,
      ...equipmentRows,
      ...checkpointHeader,
      ...checkpointRows,
      ...inspectorRows,
      ...resultRows,
    ];
    
    // Create worksheet from data
    const ws = XLSX.utils.aoa_to_sheet(allRows);
    
    // Set column widths
    ws['!cols'] = wscols;
    
    // Set merged cells for better formatting
    ws['!merges'] = [
      // Header merges
      { s: { r: 0, c: 1 }, e: { r: 0, c: 2 } },  // Title
      
      // Equipment details header
      { s: { r: 4, c: 0 }, e: { r: 4, c: 3 } },
      
      // Checkpoints header
      { s: { r: 10, c: 0 }, e: { r: 10, c: 3 } },
      
      // Inspector details header
      { s: { r: 11 + inspection.checkpoints.length + 1, c: 0 }, 
        e: { r: 11 + inspection.checkpoints.length + 1, c: 3 } },
      
      // Final result header
      { s: { r: 11 + inspection.checkpoints.length + 6, c: 0 }, 
        e: { r: 11 + inspection.checkpoints.length + 6, c: 3 } },
      
      // Signature field
      { s: { r: 11 + inspection.checkpoints.length + 9, c: 0 }, 
        e: { r: 11 + inspection.checkpoints.length + 9, c: 3 } },
    ];
    
    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Inspection Report');
    
    // Apply cell styling
    // Note: Basic Excel doesn't support full styling like PDF, but we can add basic formatting
    
    // Generate filename
    const filename = `inspection_${inspection.ppe_serial}_${format(new Date(inspection.date), 'yyyyMMdd')}.xlsx`;
    
    // Get network status to determine download method
    const isOnline = navigator.onLine;
    console.log(`Generating Excel report with network status: ${isOnline ? 'online' : 'offline'}`);
    
    try {
      // First try using the standard XLSX.writeFile (works in online mode)
      XLSX.writeFile(wb, filename);
      console.log('Excel report generated successfully using standard method');
    } catch (writeError) {
      console.log('Falling back to Blob download for offline mode:', writeError);
      
      // Fallback for offline mode - convert to blob and use saveAs
      const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([wbout], { type: 'application/octet-stream' });
      saveAs(blob, filename);
      console.log('Excel report generated successfully using Blob fallback');
    }
    
    return;
    
  } catch (error) {
    console.error('Error generating Excel report:', error);
    throw error;
  }
};

/**
 * Generate an Excel report for multiple inspections
 * (e.g., for reporting purposes)
 */
export const generateInspectionsListExcelReport = async (inspections: any[]): Promise<void> => {
  try {
    // Create a new workbook
    const wb = XLSX.utils.book_new();
    
    // Set column widths for better formatting
    const wscols = [
      { wch: 15 },  // Date
      { wch: 15 },  // Type
      { wch: 20 },  // PPE Serial #
      { wch: 20 },  // PPE Type
      { wch: 15 },  // Result
      { wch: 25 },  // Inspector
    ];
    
    // Create header rows
    const headerRows = [
      ['INSPECTIONS REPORT', '', '', '', '', ''],
      ['Doc. No: ABCD', '', '', 'Report Date:', format(new Date(), 'dd.MM.yyyy'), ''],
      ['', '', '', '', '', ''],
    ];
    
    // Create table headers
    const tableHeader = [
      ['Date', 'Type', 'PPE Serial #', 'PPE Type', 'Result', 'Inspector'],
    ];
    
    // Create data rows - ensure all PPE types are in uppercase
    const dataRows = inspections.map(inspection => [
      formatDate(inspection.date),
      inspection.type.toUpperCase(),
      inspection.ppe_serial,
      inspection.ppe_type.toUpperCase(),
      inspection.overall_result.toUpperCase(),
      inspection.inspector_name
    ]);
    
    // Create summary section
    const summaryRows = [
      ['', '', '', '', '', ''],
      ['SUMMARY', '', '', '', '', ''],
      ['Total Inspections:', inspections.length, '', '', '', ''],
      ['Pass:', inspections.filter(i => i.overall_result.toLowerCase() === 'pass').length, '', '', '', ''],
      ['Fail:', inspections.filter(i => i.overall_result.toLowerCase() === 'fail').length, '', '', '', ''],
      ['', '', '', '', '', ''],
    ];
    
    // Combine all sections
    const allRows = [
      ...headerRows,
      ...tableHeader,
      ...dataRows,
      ...summaryRows,
    ];
    
    // Create worksheet from data
    const ws = XLSX.utils.aoa_to_sheet(allRows);
    
    // Set column widths
    ws['!cols'] = wscols;
    
    // Set merged cells for header
    ws['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 5 } },  // Title
      { s: { r: dataRows.length + tableHeader.length + headerRows.length + 1, c: 0 }, 
        e: { r: dataRows.length + tableHeader.length + headerRows.length + 1, c: 5 } }, // Summary header
    ];
    
    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Inspections Report');
    
    // Generate filename with current date
    const today = format(new Date(), 'yyyyMMdd');
    const filename = `inspections_report_${today}.xlsx`;
    
    try {
      // Try using the standard XLSX.writeFile (works in online mode)
      XLSX.writeFile(wb, filename);
    } catch (writeError) {
      console.log('Falling back to Blob download for offline mode');
      
      // Fallback for offline mode - convert to blob and use saveAs
      const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([wbout], { type: 'application/octet-stream' });
      saveAs(blob, filename);
    }
    
    return;
    
  } catch (error) {
    console.error('Error generating Excel report:', error);
    throw error;
  }
};
