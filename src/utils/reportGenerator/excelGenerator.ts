
import { saveAs } from 'file-saver';
import { format } from 'date-fns';
import { InspectionDetails } from '@/types/ppe';

/**
 * Generate an Excel report for a single inspection
 * Exports data in CSV format for maximum compatibility
 */
export const generateInspectionExcelReport = async (inspection: InspectionDetails): Promise<void> => {
  try {
    // Generate CSV content
    let csvContent = "data:text/csv;charset=utf-8,";
    
    // Add header row
    csvContent += "INSPECTION REPORT\n\n";
    csvContent += `Report Date,${format(new Date(), 'yyyy-MM-dd')}\n`;
    csvContent += `Inspection ID,${inspection.id}\n\n`;
    
    // Add equipment details section
    csvContent += "EQUIPMENT DETAILS\n";
    csvContent += `Serial Number,${inspection.ppe_serial}\n`;
    csvContent += `PPE Type,${inspection.ppe_type}\n`;
    csvContent += `Brand,${inspection.ppe_brand}\n`;
    csvContent += `Model,${inspection.ppe_model}\n`;
    csvContent += `Manufacturing Date,${inspection.manufacturing_date || 'N/A'}\n`;
    csvContent += `Expiry Date,${inspection.expiry_date || 'N/A'}\n`;
    csvContent += `Batch Number,${inspection.batch_number || 'N/A'}\n\n`;
    
    // Add inspection details section
    csvContent += "INSPECTION DETAILS\n";
    csvContent += `Date,${format(new Date(inspection.date), 'yyyy-MM-dd')}\n`;
    csvContent += `Type,${inspection.type}\n`;
    csvContent += `Inspector,${inspection.inspector_name}\n`;
    csvContent += `Result,${inspection.overall_result.toUpperCase()}\n`;
    csvContent += `Notes,"${(inspection.notes || '').replace(/"/g, '""')}"\n\n`;
    
    // Add checkpoints section
    csvContent += "CHECKPOINTS\n";
    csvContent += "No.,Description,Result,Notes\n";
    
    inspection.checkpoints.forEach((checkpoint, index) => {
      const result = checkpoint.passed === null ? 'N/A' : checkpoint.passed ? 'PASS' : 'FAIL';
      const notes = (checkpoint.notes || '').replace(/"/g, '""');
      csvContent += `${index + 1},"${checkpoint.description}",${result},"${notes}"\n`;
    });
    
    // Generate filename
    const filename = `inspection_${inspection.id}_${format(new Date(), 'yyyyMMdd')}.csv`;
    
    // Create download link
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    
    // Trigger download
    link.click();
    
    // Clean up
    document.body.removeChild(link);
    
    return;
  } catch (error) {
    console.error('Error generating Excel report:', error);
    throw error;
  }
};
