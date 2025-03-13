
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { PPEItem, InspectionData } from '@/types';
import { format } from 'date-fn';

/**
 * Helper function to create a formatted and structured PDF with common elements
 */
const createBasePDF = (title: string) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Add company header
  doc.setFontSize(20);
  doc.setTextColor(0, 0, 0);
  doc.text("Safety Inspection System", pageWidth / 2, 15, { align: "center" });
  
  // Add report title
  doc.setFontSize(16);
  doc.text(title, pageWidth / 2, 25, { align: "center" });
  
  // Add date
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Generated: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, pageWidth / 2, 32, { align: "center" });
  
  // Add divider
  doc.setDrawColor(200, 200, 200);
  doc.line(14, 35, pageWidth - 14, 35);
  
  return doc;
};

/**
 * Generate a comprehensive PPE report for a single item
 */
export const generateSinglePPEReport = async (ppeItem: PPEItem, inspectionData?: InspectionData) => {
  try {
    const doc = createBasePDF(`PPE Details Report: ${ppeItem.serialNumber}`);
    const pageWidth = doc.internal.pageSize.getWidth();
    let yPos = 45;
    
    // Add PPE information section
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text("Equipment Information", 14, yPos);
    yPos += 8;
    
    // PPE details table
    doc.autoTable({
      startY: yPos,
      head: [['Property', 'Value']],
      body: [
        ['Serial Number', ppeItem.serialNumber],
        ['Type', ppeItem.type],
        ['Brand', ppeItem.brand],
        ['Model', ppeItem.modelNumber],
        ['Manufacturing Date', format(new Date(ppeItem.manufacturingDate), 'dd/MM/yyyy')],
        ['Expiry Date', format(new Date(ppeItem.expiryDate), 'dd/MM/yyyy')],
        ['Status', ppeItem.status],
        ['Next Inspection Due', ppeItem.nextInspection ? format(new Date(ppeItem.nextInspection), 'dd/MM/yyyy') : 'Not scheduled']
      ],
      theme: 'grid',
      headStyles: { fillColor: [51, 51, 153], textColor: [255, 255, 255] },
      styles: { fontSize: 10 }
    });
    
    yPos = (doc as any).lastAutoTable.finalY + 15;
    
    // If we have inspection data, add it
    if (inspectionData) {
      // Add inspection information section
      doc.setFontSize(14);
      doc.text("Latest Inspection Details", 14, yPos);
      yPos += 8;
      
      // Inspection details table
      doc.autoTable({
        startY: yPos,
        head: [['Property', 'Value']],
        body: [
          ['Inspection Date', format(new Date(inspectionData.date), 'dd/MM/yyyy')],
          ['Inspection Type', inspectionData.type],
          ['Inspector', inspectionData.inspectorName || 'Unknown'],
          ['Result', inspectionData.result],
          ['Notes', inspectionData.notes || 'No notes']
        ],
        theme: 'grid',
        headStyles: { fillColor: [0, 102, 102], textColor: [255, 255, 255] },
        styles: { fontSize: 10 }
      });
      
      yPos = (doc as any).lastAutoTable.finalY + 15;
      
      // Add checkpoint results if available
      if (inspectionData.checkpoints && inspectionData.checkpoints.length > 0) {
        doc.setFontSize(14);
        doc.text("Inspection Checkpoints", 14, yPos);
        yPos += 8;
        
        const checkpointData = inspectionData.checkpoints.map(checkpoint => [
          checkpoint.description,
          checkpoint.passed === true ? 'Pass' : checkpoint.passed === false ? 'Fail' : 'N/A',
          checkpoint.notes || ''
        ]);
        
        doc.autoTable({
          startY: yPos,
          head: [['Checkpoint', 'Result', 'Notes']],
          body: checkpointData,
          theme: 'grid',
          headStyles: { fillColor: [0, 128, 0], textColor: [255, 255, 255] },
          styles: { fontSize: 10 },
          bodyStyles: { minCellHeight: 10 }
        });
        
        yPos = (doc as any).lastAutoTable.finalY + 15;
      }
      
      // Add signature if available
      if (inspectionData.signatureUrl) {
        doc.setFontSize(12);
        doc.text("Inspector Signature:", 14, yPos);
        yPos += 5;
        
        try {
          doc.addImage(inspectionData.signatureUrl, 'PNG', 14, yPos, 60, 30);
          yPos += 35;
        } catch (error) {
          console.error('Error adding signature to PDF:', error);
          doc.text("Signature image could not be loaded", 14, yPos);
          yPos += 10;
        }
      }
    }
    
    // Add footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(
        `Page ${i} of ${pageCount} - Safety Inspection System - CONFIDENTIAL`, 
        pageWidth / 2, 
        doc.internal.pageSize.getHeight() - 10, 
        { align: "center" }
      );
    }
    
    // Save the PDF
    doc.save(`PPE_Report_${ppeItem.serialNumber}_${format(new Date(), 'yyyyMMdd')}.pdf`);
  } catch (error) {
    console.error('Error generating enhanced PDF report:', error);
    throw error;
  }
};

/**
 * Generate a batch report for multiple PPE items
 */
export const generateBatchPPEReport = async (ppeItems: PPEItem[]) => {
  try {
    const doc = createBasePDF(`Batch PPE Report: ${ppeItems.length} Items`);
    let yPos = 45;
    
    // Add summary information
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text("Equipment Summary", 14, yPos);
    yPos += 8;
    
    // Group items by type for summary
    const typeCount: Record<string, number> = {};
    const statusCount: Record<string, number> = {
      active: 0,
      expired: 0,
      maintenance: 0,
      flagged: 0
    };
    
    ppeItems.forEach(item => {
      // Count by type
      typeCount[item.type] = (typeCount[item.type] || 0) + 1;
      
      // Count by status
      if (item.status) {
        statusCount[item.status] = (statusCount[item.status] || 0) + 1;
      }
    });
    
    // Create summary tables
    const typeData = Object.entries(typeCount).map(([type, count]) => [type, count.toString()]);
    const statusData = Object.entries(statusCount)
      .filter(([_, count]) => count > 0)
      .map(([status, count]) => [status.charAt(0).toUpperCase() + status.slice(1), count.toString()]);
    
    // Type summary table
    doc.autoTable({
      startY: yPos,
      head: [['Equipment Type', 'Count']],
      body: typeData,
      theme: 'grid',
      headStyles: { fillColor: [51, 51, 153] },
      styles: { fontSize: 10 }
    });
    
    yPos = (doc as any).lastAutoTable.finalY + 10;
    
    // Status summary table
    doc.autoTable({
      startY: yPos,
      head: [['Status', 'Count']],
      body: statusData,
      theme: 'grid',
      headStyles: { fillColor: [51, 51, 153] },
      styles: { fontSize: 10 }
    });
    
    yPos = (doc as any).lastAutoTable.finalY + 15;
    
    // Detailed equipment list
    doc.setFontSize(14);
    doc.text("Equipment Details", 14, yPos);
    yPos += 8;
    
    const detailsData = ppeItems.map(item => [
      item.serialNumber,
      item.type,
      item.brand,
      format(new Date(item.manufacturingDate), 'dd/MM/yyyy'),
      format(new Date(item.expiryDate), 'dd/MM/yyyy'),
      item.status,
      item.nextInspection ? format(new Date(item.nextInspection), 'dd/MM/yyyy') : 'Not scheduled'
    ]);
    
    doc.autoTable({
      startY: yPos,
      head: [['Serial #', 'Type', 'Brand', 'Mfg Date', 'Exp Date', 'Status', 'Next Inspection']],
      body: detailsData,
      theme: 'grid',
      headStyles: { fillColor: [0, 102, 102] },
      styles: { fontSize: 8 },
      columnStyles: {
        0: { cellWidth: 30 },
        3: { cellWidth: 20 },
        4: { cellWidth: 20 },
        6: { cellWidth: 25 }
      }
    });
    
    // Add footer
    const pageCount = doc.internal.getNumberOfPages();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(
        `Page ${i} of ${pageCount} - Safety Inspection System - CONFIDENTIAL`, 
        pageWidth / 2, 
        doc.internal.pageSize.getHeight() - 10, 
        { align: "center" }
      );
    }
    
    // Save the PDF
    doc.save(`Batch_PPE_Report_${format(new Date(), 'yyyyMMdd')}.pdf`);
  } catch (error) {
    console.error('Error generating batch PDF report:', error);
    throw error;
  }
};
