
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';

// Type definition for the standard inspection data format
export interface StandardInspectionData {
  id: string;
  date: string;
  type: string;
  overall_result: string;
  inspector_name: string;
  ppe_type: string;
  ppe_serial: string;
  ppe_brand: string;
  ppe_model: string;
  inspector_id: string;
  site_name: string;
  manufacturing_date: string;
  expiry_date: string;
  batch_number: string;
  notes: string | null;
  signature_url: string | null;
  checkpoints: {
    id: string;
    description: string;
    passed: boolean | null;
    notes: string | null;
    photo_url: string | null;
  }[];
}

/**
 * Generate an Excel report for inspections based on date range
 */
export const generateInspectionsDateReport = async (
  inspectionData: any[],
  dateRange: { start: Date, end: Date } | null = null,
  filename: string = 'Inspection_Report'
) => {
  try {
    console.log('Generating report for inspections:', inspectionData.length);
    
    // Filter inspections by date range if provided
    let filteredInspections = [...inspectionData];
    if (dateRange) {
      filteredInspections = filteredInspections.filter(inspection => {
        const inspectionDate = new Date(inspection.date);
        return inspectionDate >= dateRange.start && inspectionDate <= dateRange.end;
      });
    }
    
    if (filteredInspections.length === 0) {
      console.error('No inspections found for the selected date range');
      return false;
    }
    
    // Prepare Excel data
    const workbook = XLSX.utils.book_new();
    
    // Create main inspections sheet
    const mainSheetData = filteredInspections.map(inspection => ({
      'Date': formatDate(inspection.date),
      'Equipment Type': inspection.ppe_type,
      'Serial Number': inspection.ppe_serial,
      'Brand': inspection.ppe_brand || 'N/A',
      'Result': inspection.overall_result?.toUpperCase() || 'N/A',
      'Inspector': inspection.inspector_name || 'N/A',
      'Type': inspection.type || 'N/A'
    }));
    
    const mainSheet = XLSX.utils.json_to_sheet(mainSheetData);
    XLSX.utils.book_append_sheet(workbook, mainSheet, 'Inspections');
    
    // Add worksheet for each inspection with details
    filteredInspections.forEach((inspection, index) => {
      if (index < 10) { // Limit to avoid too many worksheets
        const checkpointData = (inspection.checkpoints || []).map((cp: any) => ({
          'Description': cp.description || 'N/A',
          'Result': cp.passed === null ? 'N/A' : cp.passed ? 'PASS' : 'FAIL',
          'Notes': cp.notes || 'N/A'
        }));
        
        if (checkpointData.length > 0) {
          const detailSheet = XLSX.utils.json_to_sheet(checkpointData);
          const safeSheetName = `Insp_${index + 1}`.substring(0, 31); // Excel limits sheet names to 31 chars
          XLSX.utils.book_append_sheet(workbook, detailSheet, safeSheetName);
        }
      }
    });
    
    // Generate Excel file
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const dataBlob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    
    // Save file
    const dateStr = formatDateForFilename(new Date());
    saveAs(dataBlob, `${filename}_${dateStr}.xlsx`);
    
    return true;
  } catch (error) {
    console.error('Error generating Excel report:', error);
    return false;
  }
};

// Helper function to format dates
function formatDate(dateStr: string | Date): string {
  const date = dateStr instanceof Date ? dateStr : new Date(dateStr);
  if (isNaN(date.getTime())) return 'Invalid Date';
  return date.toLocaleDateString();
}

// Format date for filenames
function formatDateForFilename(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
