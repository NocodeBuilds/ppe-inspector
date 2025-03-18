
import { ExtendedJsPDF, createPDFDocument, addPDFHeader, addPDFFooter, addSectionTitle, addDataTable, formatDateOrNA, addSignatureToPDF } from '../pdfUtils';
import { format } from 'date-fns';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Interface for the inspection data structure
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

export const generateInspectionDetailPDF = async (inspection: InspectionDetail): Promise<void> => {
  if (!inspection) {
    console.error('No inspection data provided');
    return;
  }

  // Create PDF document
  const doc = new jsPDF({
    orientation: 'portrait',
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
  
  // PPE Type in center
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text(`${inspection.ppe_type} INSPECTION CHECKLIST`, doc.internal.pageSize.width / 2, 20, { align: 'center' });
  
  // Document number and approval date on right
  doc.setFontSize(8);
  doc.text("Doc. No: ABCD", 170, 15);
  doc.text(`Approval Date: ${format(new Date(), 'dd.MM.yyyy')}`, 170, 20);
  
  // Draw divider
  doc.setDrawColor(0, 0, 0);
  doc.line(14, 33, doc.internal.pageSize.width - 14, 33);
  
  // Equipment details in 2-column layout
  doc.setFontSize(12);
  doc.text("EQUIPMENT DETAILS", 14, 40);
  
  const equipmentData = [
    ["SITE:", "Example Site", "PPE TYPE:", inspection.ppe_type],
    ["SERIAL NUMBER:", inspection.ppe_serial, "MAKE:", inspection.ppe_brand],
    ["MODEL NUMBER:", inspection.ppe_model, "INSPECTION DATE:", format(new Date(inspection.date), 'dd.MM.yyyy')],
    ["INSPECTION TYPE:", inspection.type.toUpperCase(), "STATUS:", inspection.overall_result.toUpperCase()]
  ];
  
  autoTable(doc as any, {
    startY: 45,
    body: equipmentData,
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
  
  let finalY = (doc as any).lastAutoTable.finalY + 5;
  
  // Add checkpoints section if available
  if (inspection.checkpoints && inspection.checkpoints.length > 0) {
    doc.setFontSize(12);
    doc.text("INSPECTION CHECKPOINTS", 14, finalY + 5);
    
    // Format checkpoint data for table with properly typed fontStyle values
    const checkpointHeaders = [
      [
        { content: 'S.No.', styles: { fontStyle: 'bold', halign: 'center' } },
        { content: 'Checkpoint Description', styles: { fontStyle: 'bold', halign: 'left' } },
        { content: 'Result', styles: { fontStyle: 'bold', halign: 'center' } },
        { content: 'Photo Evidence', styles: { fontStyle: 'bold', halign: 'center' } },
        { content: 'Remarks', styles: { fontStyle: 'bold', halign: 'left' } }
      ]
    ];
    
    let checkpointRows = [];
    
    // Process each checkpoint for the table
    for (let i = 0; i < inspection.checkpoints.length; i++) {
      const cp = inspection.checkpoints[i];
      
      let hasPhoto = !!cp.photo_url;
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
    
    // Generate checkpoints table
    autoTable(doc as any, {
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
    
    // Add photos to cells where applicable
    try {
      for (let i = 0; i < inspection.checkpoints.length; i++) {
        const cp = inspection.checkpoints[i];
        if (cp.photo_url) {
          // Position calculation is approximate
          const rowHeight = 30; // approximate height per row
          const tableStart = finalY - (inspection.checkpoints.length * rowHeight);
          const imgY = tableStart + (i * rowHeight) - 15;
          
          doc.addImage(cp.photo_url, 'JPEG', 110, imgY, 30, 20);
        }
      }
    } catch (error) {
      console.error("Error adding checkpoint photos:", error);
    }
  }
  
  // Add inspector details table
  doc.setFontSize(12);
  doc.text("INSPECTOR DETAILS", 14, finalY + 5);
  
  // Create inspector details table in 2-column layout
  const inspectorData = [
    ["EMPLOYEE NAME:", inspection.inspector_name, "EMPLOYEE ID:", "___________"],
    ["ROLE:", "Inspector", "DEPARTMENT:", "Safety"]
  ];
  
  autoTable(doc as any, {
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
  
  // Format result based on pass/fail
  const resultText = inspection.overall_result || 'N/A';
  const resultColor = !inspection.overall_result ? [100, 100, 100] : 
                      inspection.overall_result.toLowerCase() === 'pass' ? [0, 128, 0] : [255, 0, 0];
  
  // Create final result and signature table with properly typed fontStyle values
  const finalResultData = [
    [
      { content: "OVERALL RESULT:", styles: { fontStyle: 'bold' } },
      { content: resultText.toUpperCase(), styles: { fontStyle: 'bold', halign: 'center', textColor: resultColor } },
      { content: "INSPECTOR SIGNATURE:", styles: { fontStyle: 'bold' } },
      { content: ' ', styles: { minCellHeight: 30 } }
    ]
  ];
  
  autoTable(doc as any, {
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
  if (inspection.signature_url) {
    try {
      doc.addImage(inspection.signature_url, 'PNG', 150, finalY + 12, 30, 20);
    } catch (error) {
      console.error("Error adding signature:", error);
    }
  }
  
  // Add inspection date
  finalY = (doc as any).lastAutoTable.finalY + 5;
  doc.setFontSize(9);
  doc.text(`DATE: ${format(new Date(inspection.date), 'dd.MM.yyyy')}`, 170, finalY, { align: 'right' });
  
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
  const filename = `inspection_${inspection.ppe_serial}_${format(new Date(inspection.date), 'yyyyMMdd')}.pdf`;
  doc.save(filename);
};
