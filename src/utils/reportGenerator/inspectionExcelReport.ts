
import * as XLSX from 'xlsx';

interface InspectionDetail {
  id: string;
  date: string;
  type: string;
  overall_result: string;
  notes: string | null;
  signature_url: string | null;
  inspector_name: string;
  ppe_type: string;
  ppe_serial: string;
  ppe_brand: string;
  ppe_model: string;
  checkpoints: {
    id: string;
    description: string;
    passed: boolean | null;
    notes: string | null;
    photo_url: string | null;
  }[];
}

export const generateInspectionExcelReport = async (inspection: InspectionDetail): Promise<void> => {
  try {
    // Create a new workbook
    const wb = XLSX.utils.book_new();
    
    // Create headers for main inspection info
    const mainInfoData = [
      ['Inspection Report'],
      [`Date:`, new Date(inspection.date).toLocaleDateString()],
      [`Type:`, inspection.type],
      [`Result:`, inspection.overall_result.toUpperCase()],
      [`Inspector:`, inspection.inspector_name],
      ['']
    ];
    
    // Create equipment details
    const equipmentData = [
      ['Equipment Details'],
      ['Type', 'Serial Number', 'Brand', 'Model'],
      [inspection.ppe_type, inspection.ppe_serial, inspection.ppe_brand, inspection.ppe_model],
      ['']
    ];
    
    // Create checkpoint data
    const checkpointHeaders = ['Checkpoint', 'Result', 'Notes'];
    const checkpointRows = inspection.checkpoints.map(checkpoint => {
      const result = checkpoint.passed === null ? 'N/A' : checkpoint.passed ? 'PASS' : 'FAIL';
      const notes = checkpoint.notes || '';
      return [checkpoint.description, result, notes];
    });
    
    const checkpointData = [
      ['Inspection Checkpoints'],
      checkpointHeaders,
      ...checkpointRows,
      [''],
      ['Additional Notes'],
      [inspection.notes || 'No additional notes provided.']
    ];
    
    // Combine all data
    const allData = [...mainInfoData, ...equipmentData, ...checkpointData];
    
    // Create worksheet from data
    const ws = XLSX.utils.aoa_to_sheet(allData);
    
    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Inspection Report');
    
    // Generate filename
    const filename = `inspection_${inspection.ppe_serial}_${new Date(inspection.date).toISOString().split('T')[0]}.xlsx`;
    
    // Write and download the file
    XLSX.writeFile(wb, filename);
    
  } catch (error) {
    console.error('Error generating Excel report:', error);
    throw error;
  }
};
