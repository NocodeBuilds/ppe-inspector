
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { PPEItem } from '@/types';
import { formatInspectionDate } from '@/utils/inspectionUtils';

/**
 * Generate a PDF report for PPE items
 */
export const generatePPEReport = (ppeItems: PPEItem[]) => {
  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(18);
  doc.text('PPE Inventory Report', 14, 22);
  
  // Add generation date
  doc.setFontSize(10);
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
  
  // Generate table data
  const tableData = ppeItems.map(item => [
    item.serialNumber,
    item.type,
    item.brand,
    item.modelNumber,
    formatInspectionDate(item.manufacturingDate),
    formatInspectionDate(item.expiryDate),
    item.status,
    item.nextInspection ? formatInspectionDate(item.nextInspection) : 'Not scheduled'
  ]);
  
  // Add table
  autoTable(doc, {
    head: [['Serial #', 'Type', 'Brand', 'Model', 'Mfg Date', 'Exp Date', 'Status', 'Next Insp']],
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
      2: { cellWidth: 20 },
      3: { cellWidth: 20 },
      4: { cellWidth: 20 },
      5: { cellWidth: 20 },
      6: { cellWidth: 15 },
      7: { cellWidth: 20 }
    },
    alternateRowStyles: {
      fillColor: [240, 240, 240]
    }
  });
  
  // Add totals and summary
  const totalPPE = ppeItems.length;
  const activePPE = ppeItems.filter(item => item.status === 'active').length;
  const expiringPPE = ppeItems.filter(item => {
    if (!item.expiryDate) return false;
    const expiryDate = new Date(item.expiryDate);
    const today = new Date();
    const diffTime = expiryDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 30 && diffDays > 0;
  }).length;
  
  const finalY = (doc as any).lastAutoTable.finalY || 150;
  
  doc.setFontSize(12);
  doc.text('Summary:', 14, finalY + 10);
  doc.setFontSize(10);
  doc.text(`Total PPE Items: ${totalPPE}`, 14, finalY + 20);
  doc.text(`Active PPE Items: ${activePPE}`, 14, finalY + 30);
  doc.text(`Expiring within 30 days: ${expiringPPE}`, 14, finalY + 40);
  
  // Download the PDF
  doc.save('ppe-inventory-report.pdf');
};
