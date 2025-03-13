
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { PPEItem } from '@/types';
import { formatInspectionDate } from '@/utils/inspectionUtils';

// Helper to process PPE items in batches to avoid UI freezing
const processBatch = (
  items: PPEItem[],
  batchSize: number, 
  processFunction: (batch: PPEItem[]) => void, 
  onComplete: () => void
) => {
  let index = 0;
  
  function processNextBatch() {
    const batch = items.slice(index, index + batchSize);
    index += batchSize;
    
    if (batch.length > 0) {
      processFunction(batch);
      
      if (index < items.length) {
        // Schedule next batch with requestAnimationFrame to avoid UI blocking
        window.requestAnimationFrame(processNextBatch);
      } else {
        onComplete();
      }
    } else {
      onComplete();
    }
  }
  
  processNextBatch();
};

/**
 * Generate a PDF report for PPE items with improved performance
 */
export const generatePPEReport = async (ppeItems: PPEItem[]) => {
  return new Promise<void>((resolve, reject) => {
    try {
      // Create document with better quality settings
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true
      });
      
      // Add title and header
      doc.setFontSize(18);
      doc.text('PPE Inventory Report', 14, 22);
      
      // Add generation date
      doc.setFontSize(10);
      const currentDate = new Date().toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      doc.text(`Generated on: ${currentDate}`, 14, 30);
      
      // Prepare table data in batches to avoid UI freezing
      let tableData: any[] = [];
      
      // Calculate summary data
      let totalPPE = ppeItems.length;
      let activePPE = 0;
      let expiringPPE = 0;
      let overdueInspections = 0;
      
      const now = new Date();
      
      const processItemBatch = (batch: PPEItem[]) => {
        // Generate table data
        const batchData = batch.map(item => {
          // Count items by status for summary
          if (item.status === 'active') {
            activePPE++;
          }
          
          // Count expiring items
          if (item.expiryDate) {
            const expiryDate = new Date(item.expiryDate);
            const diffTime = expiryDate.getTime() - now.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            if (diffDays <= 30 && diffDays > 0) {
              expiringPPE++;
            }
          }
          
          // Count overdue inspections
          if (item.nextInspection) {
            const inspDate = new Date(item.nextInspection);
            if (inspDate < now) {
              overdueInspections++;
            }
          }
          
          // Return formatted table row
          return [
            item.serialNumber,
            item.type,
            item.brand,
            item.modelNumber,
            formatInspectionDate(item.manufacturingDate),
            formatInspectionDate(item.expiryDate),
            item.status,
            item.nextInspection ? formatInspectionDate(item.nextInspection) : 'Not scheduled'
          ];
        });
        
        tableData = [...tableData, ...batchData];
      };
      
      const finishReport = () => {
        // Add table with optimized settings
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
          },
          tableWidth: 'auto',
          didDrawPage: (data) => {
            // Add page numbers
            const pageCount = doc.getNumberOfPages();
            for (let i = 1; i <= pageCount; i++) {
              doc.setPage(i);
              doc.setFontSize(8);
              doc.text(
                `Page ${i} of ${pageCount}`, 
                doc.internal.pageSize.width - 20, 
                doc.internal.pageSize.height - 10
              );
            }
          }
        });
        
        // Get the position after the table
        const finalY = (doc as any).lastAutoTable.finalY || 150;
        
        // Add summary section with better formatting
        doc.setFontSize(12);
        doc.text('Summary:', 14, finalY + 10);
        doc.setFontSize(10);
        doc.text(`Total PPE Items: ${totalPPE}`, 14, finalY + 20);
        doc.text(`Active PPE Items: ${activePPE}`, 14, finalY + 30);
        doc.text(`Expiring within 30 days: ${expiringPPE}`, 14, finalY + 40);
        doc.text(`Overdue Inspections: ${overdueInspections}`, 14, finalY + 50);
        
        // Add report footer with company info
        const pageCount = doc.getNumberOfPages();
        doc.setPage(pageCount);
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.text('Safety Inspection System - Confidential', 
                doc.internal.pageSize.width / 2, 
                doc.internal.pageSize.height - 5, 
                { align: 'center' });
        
        // Download the PDF with improved filename
        const dateStr = new Date().toISOString().split('T')[0];
        doc.save(`ppe-inventory-report-${dateStr}.pdf`);
        resolve();
      };
      
      // Process items in batches of 50 to prevent UI freezing
      processBatch(ppeItems, 50, processItemBatch, finishReport);
      
    } catch (error) {
      console.error('Error generating PDF report:', error);
      reject(error);
    }
  });
};
