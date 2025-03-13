
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { PPEItem, InspectionData } from '@/types';

/**
 * Generate a comprehensive PDF report for a single PPE item
 */
export const generateSinglePPEReport = async (ppeItem: PPEItem, inspectionData?: any) => {
  // Create PDF document
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true
  });
  
  // Add header with logo and title
  doc.setFontSize(20);
  doc.setTextColor(41, 128, 185);
  doc.text('SAFETY INSPECTION REPORT', doc.internal.pageSize.width / 2, 20, { align: 'center' });
  
  // Add report details
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.text(`Report Date: ${format(new Date(), 'dd MMM yyyy')}`, 14, 30);
  doc.text(`Report ID: PPE-${ppeItem.id?.substring(0, 8)}`, 14, 35);

  // Draw divider
  doc.setDrawColor(200, 200, 200);
  doc.line(14, 38, doc.internal.pageSize.width - 14, 38);
  
  // Add PPE information section
  doc.setFontSize(14);
  doc.setTextColor(41, 128, 185);
  doc.text('PPE Information', 14, 45);
  
  // PPE details table
  const ppeDetails = [
    ['Serial Number', ppeItem.serialNumber || 'N/A'],
    ['Type', ppeItem.type || 'N/A'],
    ['Brand', ppeItem.brand || 'N/A'],
    ['Model Number', ppeItem.modelNumber || 'N/A'],
    ['Manufacturing Date', ppeItem.manufacturingDate ? format(new Date(ppeItem.manufacturingDate), 'dd MMM yyyy') : 'N/A'],
    ['Expiry Date', ppeItem.expiryDate ? format(new Date(ppeItem.expiryDate), 'dd MMM yyyy') : 'N/A'],
    ['Status', ppeItem.status || 'N/A'],
    ['Next Inspection', ppeItem.nextInspection ? format(new Date(ppeItem.nextInspection), 'dd MMM yyyy') : 'N/A']
  ];
  
  (doc as any).autoTable({
    startY: 50,
    head: [['Property', 'Value']],
    body: ppeDetails,
    theme: 'striped',
    headStyles: { fillColor: [41, 128, 185], textColor: [255, 255, 255] },
    columnStyles: {
      0: { cellWidth: 50 },
      1: { cellWidth: 100 }
    },
    margin: { left: 14, right: 14 }
  });
  
  let finalY = (doc as any).lastAutoTable.finalY;
  
  // Add inspection data if provided
  if (inspectionData) {
    // Add inspection details section
    doc.setFontSize(14);
    doc.setTextColor(41, 128, 185);
    doc.text('Latest Inspection Details', 14, finalY + 10);
    
    // Inspection summary table
    const inspectionSummary = [
      ['Date', inspectionData.date ? format(new Date(inspectionData.date), 'dd MMM yyyy') : 'N/A'],
      ['Inspector', inspectionData.inspector_name || 'N/A'],
      ['Inspection Type', inspectionData.type || 'N/A'],
      ['Overall Result', inspectionData.result || 'N/A'],
      ['Notes', inspectionData.notes || 'N/A']
    ];
    
    (doc as any).autoTable({
      startY: finalY + 15,
      body: inspectionSummary,
      theme: 'striped',
      headStyles: { fillColor: [41, 128, 185], textColor: [255, 255, 255] },
      columnStyles: {
        0: { cellWidth: 40, fontStyle: 'bold' },
        1: { cellWidth: 110 }
      },
      margin: { left: 14, right: 14 }
    });
    
    finalY = (doc as any).lastAutoTable.finalY;
    
    // Add checkpoints section if available
    if (inspectionData.checkpoints && inspectionData.checkpoints.length > 0) {
      doc.setFontSize(14);
      doc.setTextColor(41, 128, 185);
      doc.text('Inspection Checkpoints', 14, finalY + 10);
      
      // Format checkpoint data for table
      const checkpointData = inspectionData.checkpoints.map((cp: any) => [
        cp.description,
        cp.passed ? 'PASS' : 'FAIL',
        cp.notes || 'No notes'
      ]);
      
      (doc as any).autoTable({
        startY: finalY + 15,
        head: [['Checkpoint', 'Result', 'Notes']],
        body: checkpointData,
        theme: 'striped',
        headStyles: { fillColor: [41, 128, 185], textColor: [255, 255, 255] },
        columnStyles: {
          0: { cellWidth: 80 },
          1: { cellWidth: 20 },
          2: { cellWidth: 50 }
        },
        margin: { left: 14, right: 14 },
        bodyStyles: { 
          textColor: (data: any) => {
            return data.cell.section === 'body' && data.column.index === 1 
              ? (data.cell.raw === 'PASS' ? [46, 125, 50] : [217, 83, 79]) 
              : [0, 0, 0];
          }
        }
      });
      
      finalY = (doc as any).lastAutoTable.finalY;
    }
    
    // Add signature if available
    if (inspectionData.signatureUrl) {
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text('Inspector Signature:', 14, finalY + 10);
      
      try {
        // Add placeholder for signature image
        doc.rect(14, finalY + 15, 80, 30);
        doc.setFontSize(8);
        doc.text('Signature available in digital format', 54, finalY + 30, { align: 'center' });
      } catch (error) {
        console.error('Error adding signature to PDF:', error);
      }
      
      finalY += 50;
    }
  }
  
  // Add footer with page numbers
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Page ${i} of ${pageCount}`, 
      doc.internal.pageSize.width / 2, 
      doc.internal.pageSize.height - 10, 
      { align: 'center' }
    );
    doc.text(
      'CONFIDENTIAL - FOR INTERNAL USE ONLY', 
      doc.internal.pageSize.width / 2, 
      doc.internal.pageSize.height - 5, 
      { align: 'center' }
    );
  }
  
  // Save the PDF
  const filename = `PPE_Report_${ppeItem.serialNumber || ppeItem.id}.pdf`;
  doc.save(filename);
};

/**
 * Generate a PDF report for multiple PPE items
 */
export const generateBatchPPEReport = async (ppeItems: PPEItem[]) => {
  // Create PDF document
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
    compress: true
  });
  
  // Add header with title
  doc.setFontSize(20);
  doc.setTextColor(41, 128, 185);
  doc.text('PPE INVENTORY REPORT', doc.internal.pageSize.width / 2, 20, { align: 'center' });
  
  // Add report details
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.text(`Report Date: ${format(new Date(), 'dd MMM yyyy')}`, 14, 30);
  doc.text(`Total Items: ${ppeItems.length}`, 14, 35);
  
  // Draw divider
  doc.setDrawColor(200, 200, 200);
  doc.line(14, 38, doc.internal.pageSize.width - 14, 38);
  
  // Calculate status counts
  const statusCounts = {
    active: ppeItems.filter(item => item.status === 'active').length,
    expired: ppeItems.filter(item => item.status === 'expired').length,
    maintenance: ppeItems.filter(item => item.status === 'maintenance').length,
    flagged: ppeItems.filter(item => item.status === 'flagged').length
  };
  
  // Add summary table
  const summaryData = [
    ['Active', statusCounts.active.toString()],
    ['Expired', statusCounts.expired.toString()],
    ['Maintenance', statusCounts.maintenance.toString()],
    ['Flagged', statusCounts.flagged.toString()],
    ['Total', ppeItems.length.toString()]
  ];
  
  (doc as any).autoTable({
    startY: 45,
    head: [['Status', 'Count']],
    body: summaryData,
    theme: 'striped',
    headStyles: { fillColor: [41, 128, 185], textColor: [255, 255, 255] },
    margin: { left: 14, right: 14 },
    tableWidth: 80
  });
  
  // Format PPE data for main table
  const now = new Date();
  const ppeData = ppeItems.map(item => {
    let nextInspStatus = 'N/A';
    let expiryStatus = 'N/A';
    
    if (item.nextInspection) {
      const nextInsp = new Date(item.nextInspection);
      const diffDays = Math.ceil((nextInsp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays < 0) {
        nextInspStatus = 'Overdue';
      } else if (diffDays <= 7) {
        nextInspStatus = 'Critical';
      } else if (diffDays <= 30) {
        nextInspStatus = 'Soon';
      } else {
        nextInspStatus = 'OK';
      }
    }
    
    if (item.expiryDate) {
      const expiryDate = new Date(item.expiryDate);
      const diffDays = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays < 0) {
        expiryStatus = 'Expired';
      } else if (diffDays <= 30) {
        expiryStatus = 'Critical';
      } else if (diffDays <= 90) {
        expiryStatus = 'Soon';
      } else {
        expiryStatus = 'OK';
      }
    }
    
    return [
      item.serialNumber || 'N/A',
      item.type || 'N/A',
      item.brand || 'N/A',
      item.status || 'N/A',
      item.manufacturingDate ? format(new Date(item.manufacturingDate), 'dd/MM/yyyy') : 'N/A',
      item.expiryDate ? format(new Date(item.expiryDate), 'dd/MM/yyyy') : 'N/A',
      expiryStatus,
      item.nextInspection ? format(new Date(item.nextInspection), 'dd/MM/yyyy') : 'N/A',
      nextInspStatus
    ];
  });
  
  // Add main PPE table
  (doc as any).autoTable({
    startY: 80,
    head: [['Serial #', 'Type', 'Brand', 'Status', 'Mfg Date', 'Exp Date', 'Exp Status', 'Next Insp', 'Insp Status']],
    body: ppeData,
    theme: 'striped',
    headStyles: { fillColor: [41, 128, 185], textColor: [255, 255, 255] },
    margin: { left: 14, right: 14 },
    columnStyles: {
      0: { cellWidth: 35 },
      1: { cellWidth: 30 },
      2: { cellWidth: 30 },
      3: { cellWidth: 20 },
      4: { cellWidth: 20 },
      5: { cellWidth: 20 },
      6: { cellWidth: 20 },
      7: { cellWidth: 20 },
      8: { cellWidth: 20 }
    },
    bodyStyles: {
      textColor: (data: any) => {
        if (data.cell.section !== 'body') return [0, 0, 0];
        
        if (data.column.index === 6) { // Expiry Status column
          if (data.cell.raw === 'Expired') return [217, 83, 79];
          if (data.cell.raw === 'Critical') return [240, 173, 78];
          if (data.cell.raw === 'Soon') return [91, 192, 222];
          return [46, 125, 50]; // 'OK'
        }
        
        if (data.column.index === 8) { // Inspection Status column
          if (data.cell.raw === 'Overdue') return [217, 83, 79];
          if (data.cell.raw === 'Critical') return [240, 173, 78];
          if (data.cell.raw === 'Soon') return [91, 192, 222];
          return [46, 125, 50]; // 'OK'
        }
        
        return [0, 0, 0];
      }
    }
  });
  
  // Add footer with page numbers
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Page ${i} of ${pageCount}`, 
      doc.internal.pageSize.width / 2, 
      doc.internal.pageSize.height - 10, 
      { align: 'center' }
    );
    doc.text(
      'CONFIDENTIAL - FOR INTERNAL USE ONLY', 
      doc.internal.pageSize.width / 2, 
      doc.internal.pageSize.height - 5, 
      { align: 'center' }
    );
  }
  
  // Save the PDF
  const timestamp = format(new Date(), 'yyyyMMdd_HHmmss');
  const filename = `PPE_Inventory_Report_${timestamp}.pdf`;
  doc.save(filename);
};
