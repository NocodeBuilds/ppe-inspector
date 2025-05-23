import { ExtendedJsPDF, createPDFDocument, addPDFHeader, addPDFFooter, addSectionTitle, addDataTable, formatDateOrNA, addSignatureToPDF } from '../pdfUtils';
import { format } from 'date-fns';
import jsPDF from 'jspdf';
import autoTable, { FontStyle, HAlignType, CellInput, RowInput, Color } from 'jspdf-autotable';
import { StandardInspectionData, formatDate } from './reportDataFormatter';

// Helper functions from the original file
const getFontStyle = (style: string): FontStyle => {
  switch (style) {
    case 'bold':
      return 'bold';
    case 'italic':
      return 'italic';
    case 'bolditalic':
      return 'bolditalic';
    default:
      return 'normal';
  }
};

const getHAlign = (align: string): HAlignType => {
  switch (align) {
    case 'center':
      return 'center';
    case 'right':
      return 'right';
    case 'justify':
      return 'justify';
    default:
      return 'left';
  }
};

const getColor = (color: number[]): [number, number, number] => {
  if (color.length === 3) {
    return [color[0], color[1], color[2]];
  }
  // Default black color
  return [0, 0, 0];
};

export const generateInspectionDetailPDF = async (inspection: StandardInspectionData): Promise<void> => {
  if (!inspection) {
    console.error('No inspection data provided');
    return;
  }

  // Create PDF document with compression
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true
  });

  // Set consistent margins
  const margin = {
    left: 14,
    right: 14,
    top: 10
  };
  const pageWidth = doc.internal.pageSize.width;
  const contentWidth = pageWidth - margin.left - margin.right;

  // Add header with logo, title and document info
  try {
    doc.addImage("/lovable-uploads/logo.png", "PNG", margin.left, margin.top, 30, 20);
  } catch (error) {
    console.error("Error adding logo to PDF:", error);
  }
  
  // Adjust header to prevent overlap
  const headerText = `${inspection.ppe_type.toUpperCase()} INSPECTION CHECKLIST`;
  const headerLines = doc.splitTextToSize(headerText, contentWidth);
  doc.text(headerLines, pageWidth / 2, 20, { align: 'center' });
  
  // Document number and approval date on right
  doc.setFontSize(8);
  doc.text("Doc. No: ABCD", pageWidth - margin.right - 25, 15);
  doc.text(`Approval Date: ${format(new Date(), 'dd.MM.yyyy')}`, pageWidth - margin.right - 25, 20);
  
  // Draw divider
  doc.setDrawColor(0, 0, 0);
  doc.line(margin.left, 33, pageWidth - margin.right, 33);
  
  // Equipment details section
  doc.setFontSize(12);
  doc.text("EQUIPMENT DETAILS", margin.left, 40);
  
  // Use the standardized data
  const siteName = inspection.site_name || "Unknown Site";
  const manufacturingDate = inspection.manufacturing_date || "N/A";
  const expiryDate = inspection.expiry_date || "N/A";

  const equipmentData = [
    ["SITE NAME:", siteName, "INSPECTION DATE:", formatDate(inspection.date)],
    ["PPE TYPE:", inspection.ppe_type.toUpperCase(), "SERIAL NUMBER:", `${inspection.ppe_serial}${inspection.batch_number ? '_' + inspection.batch_number : ''}`],
    ["MAKE (BRAND):", inspection.ppe_brand, "MODEL NUMBER:", inspection.ppe_model],
    ["MANUFACTURING DATE:", manufacturingDate, "EXPIRY DATE:", expiryDate]
  ];
  
  // Equipment details table with consistent widths
  autoTable(doc as any, {
    startY: 45,
    body: equipmentData,
    theme: 'grid',
    styles: { 
      cellPadding: 3,
      fontSize: 9,
      lineColor: [0, 0, 0],
      lineWidth: 0.1,
      minCellHeight: 8
    },
    columnStyles: {
      0: { cellWidth: contentWidth * 0.2, fontStyle: 'bold' },
      1: { cellWidth: contentWidth * 0.3 },
      2: { cellWidth: contentWidth * 0.2, fontStyle: 'bold' },
      3: { cellWidth: contentWidth * 0.3 }
    },
    margin: { left: margin.left, right: margin.right }
  });
  
  let finalY = (doc as any).lastAutoTable.finalY + 10;
  
  // Reinsert inspector details
  const inspectorData: RowInput[] = [
    [
      { content: "EMPLOYEE NAME:", styles: { fontStyle: 'bold' } },
      { content: inspection.inspector_name || "Unknown" },
      { content: "EMPLOYEE ID:", styles: { fontStyle: 'bold' } },
      { content: inspection.inspector_employee_id || "N/A" }
    ],
    [
      { content: "ROLE:", styles: { fontStyle: 'bold' } },
      { content: inspection.inspector_role || "Inspector" },
      { content: "DEPARTMENT:", styles: { fontStyle: 'bold' } },
      { content: "Safety" }
    ]
  ];

  autoTable(doc as any, {
    startY: finalY,
    body: inspectorData,
    theme: 'grid',
    styles: { 
      cellPadding: 3,
      fontSize: 9,
      lineColor: [0, 0, 0],
      lineWidth: 0.1,
      minCellHeight: 8
    },
    columnStyles: {
      0: { cellWidth: contentWidth * 0.2 },
      1: { cellWidth: contentWidth * 0.3 },
      2: { cellWidth: contentWidth * 0.2 },
      3: { cellWidth: contentWidth * 0.3 }
    },
    margin: { left: margin.left, right: margin.right }
  });

  finalY = (doc as any).lastAutoTable.finalY + 5;

  // Checkpoints section
  if (inspection.checkpoints && inspection.checkpoints.length > 0) {
    doc.setFontSize(12);
    doc.text("INSPECTION CHECKPOINTS", margin.left, finalY);
    
    const checkpointHeaders: RowInput[] = [
      [
        { content: 'S.No.', styles: { fontStyle: 'bold', halign: 'center' } },
        { content: 'Checkpoint Description', styles: { fontStyle: 'bold', halign: 'left' } },
        { content: 'Result', styles: { fontStyle: 'bold', halign: 'center' } },
        { content: 'Photo Evidence', styles: { fontStyle: 'bold', halign: 'center' } },
        { content: 'Remarks', styles: { fontStyle: 'bold', halign: 'left' } }
      ]
    ];
    
    let checkpointRows: RowInput[] = [];
    
    // Process checkpoints with consistent photo cell height
    for (let i = 0; i < inspection.checkpoints.length; i++) {
      const cp = inspection.checkpoints[i];
      const photoHeight = 25; // Standardized photo height
      
      let photoCell: CellInput = {
        content: cp.photo_url ? '' : 'No photo',
        styles: { 
          minCellHeight: photoHeight,
          halign: 'center',
          valign: 'middle',
          fontStyle: cp.photo_url ? 'normal' : 'italic',
          textColor: cp.photo_url ? [0, 0, 0] as [number, number, number] : [150, 150, 150] as [number, number, number]
        }
      };
      
      let resultText = cp.passed === null ? 'NA' : cp.passed ? 'PASS' : 'FAIL';
      let resultColor: [number, number, number] = cp.passed === null ? [100, 100, 100] : 
                     cp.passed ? [0, 128, 0] : [255, 0, 0];
      
      checkpointRows.push([
        { content: (i + 1).toString(), styles: { halign: 'center', valign: 'middle' } },
        { content: cp.description, styles: { valign: 'middle' } },
        { content: resultText, styles: { fontStyle: 'bold', halign: 'center', valign: 'middle', textColor: resultColor } },
        photoCell,
        { content: cp.notes || '', styles: { valign: 'middle' } }
      ]);
    }
    
    // Generate checkpoints table with proportional widths
    autoTable(doc as any, {
      startY: finalY + 5,
      head: checkpointHeaders,
      body: checkpointRows,
      theme: 'grid',
      headStyles: { 
        fillColor: [220, 220, 220], 
        textColor: [0, 0, 0],
        minCellHeight: 10
      },
      styles: { 
        cellPadding: 3,
        fontSize: 8,
        lineColor: [0, 0, 0],
        lineWidth: 0.1
      },
      columnStyles: {
        0: { cellWidth: contentWidth * 0.08 },  // S.No
        1: { cellWidth: contentWidth * 0.32 },  // Description
        2: { cellWidth: contentWidth * 0.12 },  // Result
        3: { cellWidth: contentWidth * 0.23 },  // Photo
        4: { cellWidth: contentWidth * 0.25 }   // Remarks
      },
      margin: { left: margin.left, right: margin.right }
    });
    
    finalY = (doc as any).lastAutoTable.finalY;
    
    // Add photos with consistent positioning
    try {
      const photoWidth = contentWidth * 0.18;  // 80% of photo column width
      const photoHeight = 20;
      
      for (let i = 0; i < inspection.checkpoints.length; i++) {
        const cp = inspection.checkpoints[i];
        if (cp.photo_url) {
          const rowHeight = 25;
          const tableStartY = finalY - (inspection.checkpoints.length * rowHeight);
          const photoY = tableStartY + (i * rowHeight) + 2.5;
          const photoX = margin.left + (contentWidth * 0.52) + 2; // Aligned within photo column
          
          doc.addImage(cp.photo_url, 'JPEG', photoX, photoY, photoWidth, photoHeight);
        }
      }
    } catch (error) {
      console.error("Error adding checkpoint photos:", error);
    }
  }
  
  // Ensure no unwanted gaps between tables
  if (finalY > doc.internal.pageSize.height - 100) {
    doc.addPage();
    finalY = margin.top;
  }
  
  // Final Inspection Result section - consolidated
  doc.setFontSize(12);
  doc.text("FINAL INSPECTION RESULT", margin.left, finalY + 15);
  
  const resultText = inspection.overall_result || 'N/A';
  const resultColor: [number, number, number] = !inspection.overall_result ? [100, 100, 100] : 
                   inspection.overall_result.toLowerCase() === 'pass' ? [0, 128, 0] : [255, 0, 0];
  
  // Final result table with signature space
  const finalResultData: RowInput[] = [
    [
      { content: "OVERALL RESULT:", styles: { fontStyle: 'bold' } },
      { content: resultText.toUpperCase(), styles: { fontStyle: 'bold', halign: 'center', textColor: resultColor } },
      { content: "INSPECTOR SIGNATURE:", styles: { fontStyle: 'bold' } },
      { content: ' ', styles: { minCellHeight: 30 } }  // Increased height for signature
    ]
  ];
  
  autoTable(doc as any, {
    startY: finalY + 20,
    body: finalResultData,
    theme: 'grid',
    styles: { 
      cellPadding: 3,
      fontSize: 9,
      lineColor: [0, 0, 0],
      lineWidth: 0.1
    },
    columnStyles: {
      0: { cellWidth: contentWidth * 0.2 },
      1: { cellWidth: contentWidth * 0.3 },
      2: { cellWidth: contentWidth * 0.2 },
      3: { cellWidth: contentWidth * 0.3 }
    },
    margin: { left: margin.left, right: margin.right }
  });
  
  // Add signature with proper positioning
  if (inspection.signature_url) {
    try {
      const signatureY = finalY + 22;  // Positioned within the cell
      const signatureX = margin.left + (contentWidth * 0.7) + 5;  // Aligned in signature column
      doc.addImage(inspection.signature_url, 'PNG', signatureX, signatureY, 25, 25);
    } catch (error) {
      console.error("Error adding signature:", error);
    }
  }
  
  // Add inspection date aligned with signature
  finalY = (doc as any).lastAutoTable.finalY + 5;
  doc.setFontSize(9);
  doc.text(`DATE: ${formatDate(inspection.date)}`, 
           pageWidth - margin.right, finalY, { align: 'right' });
  
  // Consistent footer on all pages
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    
    // Page separator line
    doc.setDrawColor(200, 200, 200);
    doc.line(margin.left, doc.internal.pageSize.height - 15, 
             pageWidth - margin.right, doc.internal.pageSize.height - 15);
    
    // Footer text
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text(
      `Page ${i} of ${pageCount}`, 
      pageWidth / 2, 
      doc.internal.pageSize.height - 10, 
      { align: 'center' }
    );
    doc.text(
      'CONFIDENTIAL - FOR INTERNAL USE ONLY', 
      pageWidth / 2, 
      doc.internal.pageSize.height - 5, 
      { align: 'center' }
    );
  }
  
  // Save the PDF
  const filename = `inspection_${inspection.ppe_serial}_${format(new Date(inspection.date), 'yyyyMMdd')}.pdf`;
  doc.save(filename);
};
