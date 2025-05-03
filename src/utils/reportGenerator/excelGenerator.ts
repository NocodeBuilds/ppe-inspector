
import { format } from 'date-fns';
import { InspectionDetails } from '@/types/ppe';

/**
 * Generates an Excel file for inspection details
 * @param inspection - The inspection data to generate the Excel from
 */
export const generateInspectionExcelReport = async (inspection: InspectionDetails) => {
  try {
    // This is a simplified version - in a real app we would use a library like xlsx or exceljs
    // For now we'll generate a CSV which can be opened in Excel
    
    // Create header for the CSV
    let csvContent = "data:text/csv;charset=utf-8,";
    
    // Equipment Information
    csvContent += "EQUIPMENT INFORMATION\r\n";
    csvContent += "Serial Number,Type,Brand,Model\r\n";
    csvContent += `${inspection.ppe_serial || ''},${inspection.ppe_type || ''},${inspection.ppe_brand || ''},${inspection.ppe_model || ''}\r\n\r\n`;
    
    csvContent += "Manufacturing Date,Expiry Date,Batch Number\r\n";
    csvContent += `${inspection.manufacturing_date || ''},${inspection.expiry_date || ''},${inspection.batch_number || ''}\r\n\r\n`;
    
    // Inspection Information
    csvContent += "INSPECTION INFORMATION\r\n";
    csvContent += "Inspection Date,Inspector,Type,Result,Site\r\n";
    csvContent += `${format(new Date(inspection.date), 'yyyy-MM-dd')},${inspection.inspector_name || ''},${inspection.type || ''},${inspection.overall_result || ''},${inspection.site_name || ''}\r\n\r\n`;
    
    // Notes
    if (inspection.notes) {
      csvContent += "NOTES\r\n";
      csvContent += `${inspection.notes.replace(/,/g, ' ')}\r\n\r\n`;
    }
    
    // Checkpoints
    csvContent += "INSPECTION CHECKPOINTS\r\n";
    csvContent += "Description,Result,Notes\r\n";
    
    inspection.checkpoints.forEach(checkpoint => {
      let result = checkpoint.passed === null ? 'N/A' : checkpoint.passed ? 'PASS' : 'FAIL';
      let notes = checkpoint.notes ? checkpoint.notes.replace(/,/g, ' ') : '';
      csvContent += `${checkpoint.description},${result},${notes}\r\n`;
    });
    
    // Create a download link and trigger it
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `inspection_${inspection.id}_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    return true;
  } catch (error) {
    console.error('Error generating Excel report:', error);
    throw error;
  }
};
