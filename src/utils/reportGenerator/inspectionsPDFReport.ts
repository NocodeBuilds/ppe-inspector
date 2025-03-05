
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatInspectionDate } from '@/utils/inspectionUtils';
import { InspectionData } from '@/types';

/**
 * Generate a PDF report for inspections
 */
export const generateInspectionsReport = (inspections: InspectionData[]) => {
  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(18);
  doc.text('Inspections Report', 14, 22);
  
  // Add generation date
  doc.setFontSize(10);
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
  
  // Generate table data
  const tableData = inspections.map(inspection => [
    formatInspectionDate(inspection.date),
    inspection.type,
    inspection.serial_number || 'Unknown',
    inspection.ppe_type || 'Unknown',
    inspection.result,
    formatInspectionDate(inspection.date) // Using date as placeholder for next inspection
  ]);
  
  // Add table
  autoTable(doc, {
    head: [['Date', 'Type', 'PPE Serial #', 'PPE Type', 'Result', 'Next Inspection']],
    body: tableData,
    startY: 35,
    styles: { 
      fontSize: 8,
      cellPadding: 2
    },
    headStyles: {
      fillColor: [41, 128, 185],
      textColor: 255
    },
    columnStyles: {
      0: { cellWidth: 25 },
      1: { cellWidth: 20 },
      2: { cellWidth: 30 },
      3: { cellWidth: 35 },
      4: { cellWidth: 20 },
      5: { cellWidth: 30 }
    },
    alternateRowStyles: {
      fillColor: [240, 240, 240]
    }
  });
  
  // Add totals and summary
  const totalInspections = inspections.length;
  const passedInspections = inspections.filter(insp => insp.result.toLowerCase() === 'pass').length;
  const failedInspections = inspections.filter(insp => insp.result.toLowerCase() === 'fail').length;
  
  // Count by type
  const byType = {
    'pre-use': inspections.filter(insp => insp.type === 'pre-use').length,
    'monthly': inspections.filter(insp => insp.type === 'monthly').length,
    'quarterly': inspections.filter(insp => insp.type === 'quarterly').length
  };
  
  const finalY = (doc as any).lastAutoTable.finalY || 150;
  
  doc.setFontSize(12);
  doc.text('Summary:', 14, finalY + 10);
  doc.setFontSize(10);
  doc.text(`Total Inspections: ${totalInspections}`, 14, finalY + 20);
  doc.text(`Passed Inspections: ${passedInspections}`, 14, finalY + 30);
  doc.text(`Failed Inspections: ${failedInspections}`, 14, finalY + 40);
  doc.text(`Pre-use Inspections: ${byType['pre-use']}`, 14, finalY + 50);
  doc.text(`Monthly Inspections: ${byType['monthly']}`, 14, finalY + 60);
  doc.text(`Quarterly Inspections: ${byType['quarterly']}`, 14, finalY + 70);
  
  // Download the PDF
  doc.save('inspections-report.pdf');
};
