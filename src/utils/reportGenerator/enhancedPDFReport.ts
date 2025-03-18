
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { PPEItem, InspectionData } from '@/types';

/**
 * Generate a comprehensive PDF report for a single PPE item
 */
export const generateSinglePPEReport = async (ppeItem: PPEItem, inspectionData?: any) => {
  // Create PDF document - A4 size
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true
  });
  
  // Add header with logo, title and document info
  // Logo on left
  try {
    doc.addImage("/lovable-uploads/logo.png", "PNG", 14, 10, 30, 20);
  } catch (error) {
    console.error("Error adding logo to PDF:", error);
  }
  
  // PPE Type in center
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text(`${ppeItem.type || 'PPE'} INSPECTION CHECKLIST`, doc.internal.pageSize.width / 2, 20, { align: 'center' });
  
  // Document number and approval date on right
  doc.setFontSize(8);
  doc.text("Doc. No: ABCD", 170, 15);
  doc.text(`Approval Date: ${format(new Date(), 'dd.MM.yyyy')}`, 170, 20);
  
  // Draw divider
  doc.setDrawColor(0, 0, 0);
  doc.line(14, 33, doc.internal.pageSize.width - 14, 33);
  
  // Equipment details table in 2-column layout
  doc.setFontSize(12);
  doc.text("EQUIPMENT DETAILS", 14, 40);
  
  // Create 2-column equipment details table
  const equipmentData = [
    ["SITE:", "Example Site", "PPE TYPE:", ppeItem.type || 'N/A'],
    ["SERIAL NUMBER:", ppeItem.serialNumber || 'N/A', "MAKE:", ppeItem.brand || 'N/A'],
    ["MODEL NUMBER:", ppeItem.modelNumber || 'N/A', "MFG DATE:", ppeItem.manufacturingDate ? format(new Date(ppeItem.manufacturingDate), 'dd.MM.yyyy') : 'N/A'],
    ["EXPIRY DATE:", ppeItem.expiryDate ? format(new Date(ppeItem.expiryDate), 'dd.MM.yyyy') : 'N/A', "STATUS:", ppeItem.status || 'N/A']
  ];
  
  (doc as any).autoTable({
    startY: 45,
    body: equipmentData,
    theme: 'grid',
    headStyles: { fillColor: [220, 220, 220], textColor: [0, 0, 0], fontStyle: 'bold' },
    styles: { 
      cellPadding: 3,
      fontSize: 9,
      lineColor: [0, 0, 0],
      lineWidth: 0.1
    },
    columnStyles: {
      0: { cellWidth: 35, fontStyle: 'bold' },
      1: { cellWidth: 45 },
      2: { cellWidth: 30, fontStyle: 'bold' },
      3: { cellWidth: 45 }
    },
    margin: { left: 14, right: 14 }
  });
  
  let finalY = (doc as any).lastAutoTable.finalY + 5;
  
  // Add inspection checkpoints if available
  if (inspectionData && inspectionData.checkpoints && inspectionData.checkpoints.length > 0) {
    doc.setFontSize(12);
    doc.text("INSPECTION CHECKPOINTS", 14, finalY + 5);
    
    // Format checkpoint data for table - with photos if available
    const checkpointHeaders = [
      [{ content: 'S.No.', styles: { fontStyle: 'bold', halign: 'center' } },
       { content: 'Checkpoint Description', styles: { fontStyle: 'bold', halign: 'left' } },
       { content: 'Result', styles: { fontStyle: 'bold', halign: 'center' } },
       { content: 'Photo Evidence', styles: { fontStyle: 'bold', halign: 'center' } },
       { content: 'Remarks', styles: { fontStyle: 'bold', halign: 'left' } }]
    ];
    
    let checkpointRows = [];
    
    // Process each checkpoint and prepare table rows
    for (let i = 0; i < inspectionData.checkpoints.length; i++) {
      const cp = inspectionData.checkpoints[i];
      
      let hasPhoto = !!cp.photoUrl;
      let photoCell = {};
      
      if (hasPhoto) {
        // Leave cell empty for now, we'll add images after table creation
        photoCell = { content: '', styles: { minCellHeight: 30 } };
      } else {
        photoCell = { content: 'No photo', styles: { halign: 'center', fontStyle: 'italic', textColor: [150, 150, 150] } };
      }
      
      let resultText = cp.passed === null ? 'NA' : cp.passed ? 'PASS' : 'FAIL';
      let resultColor = cp.passed === null ? [100, 100, 100] : cp.passed ? [0, 128, 0] : [255, 0, 0];
      
      checkpointRows.push([
        { content: (i + 1).toString(), styles: { halign: 'center' } },
        { content: cp.description },
        { content: resultText, styles: { fontStyle: 'bold', halign: 'center', textColor: resultColor } },
        photoCell,
        { content: cp.notes || '' }
      ]);
    }
    
    // Generate checkpoint table
    (doc as any).autoTable({
      startY: finalY + 10,
      head: checkpointHeaders,
      body: checkpointRows,
      theme: 'grid',
      headStyles: { fillColor: [220, 220, 220], textColor: [0, 0, 0] },
      styles: { 
        cellPadding: 3, 
        fontSize: 8,
        lineColor: [0, 0, 0],
        lineWidth: 0.1
      },
      columnStyles: {
        0: { cellWidth: 15 },
        1: { cellWidth: 55 },
        2: { cellWidth: 25 },
        3: { cellWidth: 40 },
        4: { cellWidth: 45 }
      },
      margin: { left: 14, right: 14 }
    });
    
    finalY = (doc as any).lastAutoTable.finalY + 5;
    
    // Add photos to the cells where applicable
    // This is a second pass since jsPDF-autotable doesn't directly support images in cells
    try {
      for (let i = 0; i < inspectionData.checkpoints.length; i++) {
        const cp = inspectionData.checkpoints[i];
        if (cp.photoUrl) {
          // Position calculation is approximate based on table layout
          // You may need to adjust these values based on actual table rendering
          const rowHeight = 30; // approximate height per row
          const tableStart = finalY - (inspectionData.checkpoints.length * rowHeight);
          const imgY = tableStart + (i * rowHeight) - 15;
          
          // Add image to the photo evidence cell
          doc.addImage(cp.photoUrl, 'JPEG', 110, imgY, 30, 20);
        }
      }
    } catch (error) {
      console.error("Error adding checkpoint photos:", error);
    }
  }
  
  // Add inspector details table
  doc.setFontSize(12);
  doc.text("INSPECTOR DETAILS", 14, finalY + 5);
  
  // Inspector data in 2-column layout
  const inspectorData = [
    ["EMPLOYEE NAME:", inspectionData?.inspector_name || 'N/A', "EMPLOYEE ID:", "___________"],
    ["ROLE:", "Inspector", "DEPARTMENT:", "Safety"]
  ];
  
  (doc as any).autoTable({
    startY: finalY + 10,
    body: inspectorData,
    theme: 'grid',
    styles: { 
      cellPadding: 3,
      fontSize: 9,
      lineColor: [0, 0, 0],
      lineWidth: 0.1
    },
    columnStyles: {
      0: { cellWidth: 35, fontStyle: 'bold' },
      1: { cellWidth: 45 },
      2: { cellWidth: 30, fontStyle: 'bold' },
      3: { cellWidth: 45 }
    },
    margin: { left: 14, right: 14 }
  });
  
  finalY = (doc as any).lastAutoTable.finalY + 5;
  
  // Add overall result and signature
  doc.setFontSize(12);
  doc.text("FINAL INSPECTION RESULT", 14, finalY + 5);
  
  // Create a table for final result and signature
  const resultText = inspectionData?.result || 'N/A';
  const resultColor = !inspectionData?.result ? [100, 100, 100] : 
                       inspectionData.result.toLowerCase() === 'pass' ? [0, 128, 0] : [255, 0, 0];
  
  const finalResultData = [
    [
      { content: "OVERALL RESULT:", styles: { fontStyle: 'bold' } },
      { content: resultText.toUpperCase(), styles: { fontStyle: 'bold', textColor: resultColor, halign: 'center' } },
      { content: "INSPECTOR SIGNATURE:", styles: { fontStyle: 'bold' } },
      { content: ' ', styles: { minCellHeight: 30 } }
    ]
  ];
  
  (doc as any).autoTable({
    startY: finalY + 10,
    body: finalResultData,
    theme: 'grid',
    styles: { 
      cellPadding: 3,
      fontSize: 9,
      lineColor: [0, 0, 0],
      lineWidth: 0.1
    },
    columnStyles: {
      0: { cellWidth: 35 },
      1: { cellWidth: 45 },
      2: { cellWidth: 30 },
      3: { cellWidth: 45 }
    },
    margin: { left: 14, right: 14 }
  });
  
  // Add signature if available
  if (inspectionData?.signatureUrl) {
    try {
      // Position signature in the last cell
      doc.addImage(inspectionData.signatureUrl, 'PNG', 150, finalY + 12, 30, 20);
    } catch (error) {
      console.error("Error adding signature:", error);
    }
  }
  
  // Add inspection date below signature
  finalY = (doc as any).lastAutoTable.finalY + 5;
  doc.setFontSize(9);
  doc.text(`DATE: ${inspectionData?.date ? format(new Date(inspectionData.date), 'dd.MM.yyyy') : format(new Date(), 'dd.MM.yyyy')}`, 170, finalY, { align: 'right' });
  
  // Add footer with page numbers
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
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
  const filename = `${ppeItem.type || 'PPE'}_Inspection_${ppeItem.serialNumber || ''}_${format(new Date(), 'yyyyMMdd')}.pdf`;
  doc.save(filename);
  
  return filename;
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
  
  // Add header with logo, title and document info
  try {
    doc.addImage("/lovable-uploads/logo.png", "PNG", 14, 10, 30, 20);
  } catch (error) {
    console.error("Error adding logo to PDF:", error);
  }
  
  // Title in center
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text('PPE INVENTORY REPORT', doc.internal.pageSize.width / 2, 20, { align: 'center' });
  
  // Document number and date on right
  doc.setFontSize(8);
  doc.text("Doc. No: ABCD", 270, 15);
  doc.text(`Report Date: ${format(new Date(), 'dd.MM.yyyy')}`, 270, 20);
  
  // Draw divider
  doc.setDrawColor(0, 0, 0);
  doc.line(14, 33, doc.internal.pageSize.width - 14, 33);
  
  // Add report summary
  doc.setFontSize(12);
  doc.text("INVENTORY SUMMARY", 14, 40);
  
  // Calculate status counts
  const statusCounts = {
    active: ppeItems.filter(item => item.status === 'active').length,
    expired: ppeItems.filter(item => item.status === 'expired').length,
    maintenance: ppeItems.filter(item => item.status === 'maintenance').length,
    flagged: ppeItems.filter(item => item.status === 'flagged').length
  };
  
  // Summary table in 2-column layout
  const summaryData = [
    ["TOTAL ITEMS:", ppeItems.length.toString(), "SITE:", "Example Site"],
    ["ACTIVE:", statusCounts.active.toString(), "EXPIRED:", statusCounts.expired.toString()],
    ["MAINTENANCE:", statusCounts.maintenance.toString(), "FLAGGED:", statusCounts.flagged.toString()]
  ];
  
  (doc as any).autoTable({
    startY: 45,
    body: summaryData,
    theme: 'grid',
    styles: { 
      cellPadding: 3,
      fontSize: 9,
      lineColor: [0, 0, 0],
      lineWidth: 0.1
    },
    columnStyles: {
      0: { cellWidth: 35, fontStyle: 'bold' },
      1: { cellWidth: 35 },
      2: { cellWidth: 35, fontStyle: 'bold' },
      3: { cellWidth: 35 }
    },
    margin: { left: 14, right: 14 }
  });
  
  let finalY = (doc as any).lastAutoTable.finalY + 5;
  
  // Add main inventory table
  doc.setFontSize(12);
  doc.text("PPE INVENTORY DETAILS", 14, finalY + 5);
  
  // Format data for main table
  const now = new Date();
  const tableHeaders = [
    [{ content: 'S.No.', styles: { fontStyle: 'bold', halign: 'center' } },
     { content: 'Serial Number', styles: { fontStyle: 'bold' } },
     { content: 'PPE Type', styles: { fontStyle: 'bold' } },
     { content: 'Brand', styles: { fontStyle: 'bold' } },
     { content: 'Model', styles: { fontStyle: 'bold' } },
     { content: 'Mfg. Date', styles: { fontStyle: 'bold', halign: 'center' } },
     { content: 'Expiry Date', styles: { fontStyle: 'bold', halign: 'center' } },
     { content: 'Status', styles: { fontStyle: 'bold', halign: 'center' } },
     { content: 'Next Inspection', styles: { fontStyle: 'bold', halign: 'center' } }]
  ];
  
  const tableRows = ppeItems.map((item, index) => {
    let expiryStatus = 'N/A';
    let statusColor = [0, 0, 0];
    
    if (item.status) {
      switch(item.status) {
        case 'active':
          statusColor = [0, 128, 0]; // Green
          break;
        case 'expired':
          statusColor = [255, 0, 0]; // Red
          break;
        case 'maintenance':
          statusColor = [255, 165, 0]; // Orange
          break;
        case 'flagged':
          statusColor = [255, 0, 0]; // Red
          break;
        default:
          statusColor = [0, 0, 0]; // Black
      }
    }
    
    return [
      { content: (index + 1).toString(), styles: { halign: 'center' } },
      { content: item.serialNumber || 'N/A' },
      { content: item.type || 'N/A' },
      { content: item.brand || 'N/A' },
      { content: item.modelNumber || 'N/A' },
      { content: item.manufacturingDate ? format(new Date(item.manufacturingDate), 'dd.MM.yyyy') : 'N/A', styles: { halign: 'center' } },
      { content: item.expiryDate ? format(new Date(item.expiryDate), 'dd.MM.yyyy') : 'N/A', styles: { halign: 'center' } },
      { content: item.status ? item.status.toUpperCase() : 'N/A', styles: { halign: 'center', fontStyle: 'bold', textColor: statusColor } },
      { content: item.nextInspection ? format(new Date(item.nextInspection), 'dd.MM.yyyy') : 'N/A', styles: { halign: 'center' } }
    ];
  });
  
  // Generate the inventory table
  (doc as any).autoTable({
    startY: finalY + 10,
    head: tableHeaders,
    body: tableRows,
    theme: 'grid',
    headStyles: { fillColor: [220, 220, 220], textColor: [0, 0, 0] },
    styles: { 
      cellPadding: 3,
      fontSize: 8,
      lineColor: [0, 0, 0],
      lineWidth: 0.1
    },
    columnStyles: {
      0: { cellWidth: 15 },  // S.No.
      1: { cellWidth: 30 },  // Serial Number
      2: { cellWidth: 30 },  // Type
      3: { cellWidth: 30 },  // Brand
      4: { cellWidth: 25 },  // Model
      5: { cellWidth: 22 },  // Mfg Date
      6: { cellWidth: 22 },  // Expiry
      7: { cellWidth: 25 },  // Status
      8: { cellWidth: 25 }   // Next Inspection
    },
    margin: { left: 14, right: 14 }
  });
  
  // Add footer with page numbers
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
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
  const timestamp = format(new Date(), 'yyyyMMdd');
  const filename = `PPE_Inventory_Report_${timestamp}.pdf`;
  doc.save(filename);
  
  return filename;
};
