
import { ExtendedJsPDF, createPDFDocument, addPDFHeader, addPDFFooter, addSectionTitle, addDataTable, formatDateOrNA, addSignatureToPDF } from '../pdfUtils';
import { format } from 'date-fns';
import jsPDF from 'jspdf';
import autoTable, { FontStyle, HAlignType, CellInput, RowInput, Color } from 'jspdf-autotable';

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

// Helper function to convert string to FontStyle type
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

// Helper function to convert string to HAlignType
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

// Helper function to convert number array to Color type
const getColor = (color: number[]): Color => {
  if (color.length === 3) {
    return [color[0], color[1], color[2]] as [number, number, number];
  }
  // Default black color
  return [0, 0, 0];
};

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
  
  // PPE Type in center - standardize to uppercase
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text(`${inspection.ppe_type.toUpperCase()} INSPECTION CHECKLIST`, doc.internal.pageSize.width / 2, 20, { align: 'center' });
  
  // Document number and approval date on right
  doc.setFontSize(8);
  doc.text("Doc. No: ABCD", 170, 15);
  doc.text(`Approval Date: ${format(new Date(), 'dd.MM.yyyy')}`, 170, 20);
  
  // Draw divider
  doc.setDrawColor(0, 0, 0);
  doc.line(14, 33, doc.internal.pageSize.width - 14, 33);
  
  // Updated equipment details in 2-column layout with site name from profile
  doc.setFontSize(12);
  doc.text("EQUIPMENT DETAILS", 14, 40);
  
  // Get site name from location (assuming first word is the site)
  const siteName = inspection.inspector_name || "Example Site";
  
  const equipmentData = [
    ["SITE NAME:", siteName, "INSPECTION DATE:", format(new Date(inspection.date), 'dd.MM.yyyy')],
    ["PPE TYPE:", inspection.ppe_type.toUpperCase(), "SERIAL NUMBER:", inspection.ppe_serial],
    ["MAKE (BRAND):", inspection.ppe_brand, "MODEL NUMBER:", inspection.ppe_model],
    ["MANUFACTURING DATE:", "N/A", "EXPIRY DATE:", "N/A"]
  ];
  
  autoTable(doc as any, {
    startY: 45,
    body: equipmentData,
    theme: 'grid',
    styles: { 
      cellPadding: 2, // Reduced padding
      fontSize: 9,
      lineColor: [0, 0, 0],
      lineWidth: 0.1,
      minCellHeight: 8 // Standardized height
    },
    columnStyles: {
      0: { cellWidth: 35, fontStyle: getFontStyle('bold') },
      1: { cellWidth: 45 },
      2: { cellWidth: 30, fontStyle: getFontStyle('bold') },
      3: { cellWidth: 45 }
    },
    margin: { left: 14, right: 14 }
  });
  
  let finalY = (doc as any).lastAutoTable.finalY + 5;
  
  // Add checkpoints section if available
  if (inspection.checkpoints && inspection.checkpoints.length > 0) {
    doc.setFontSize(12);
    doc.text("INSPECTION CHECKPOINTS", 14, finalY + 5);
    
    // Format checkpoint data for table with properly typed values
    const checkpointHeaders: RowInput[] = [
      [
        { content: 'S.No.', styles: { fontStyle: getFontStyle('bold'), halign: getHAlign('center') } },
        { content: 'Checkpoint Description', styles: { fontStyle: getFontStyle('bold'), halign: getHAlign('left') } },
        { content: 'Result', styles: { fontStyle: getFontStyle('bold'), halign: getHAlign('center') } },
        { content: 'Photo Evidence', styles: { fontStyle: getFontStyle('bold'), halign: getHAlign('center') } },
        { content: 'Remarks', styles: { fontStyle: getFontStyle('bold'), halign: getHAlign('left') } }
      ]
    ];
    
    let checkpointRows: RowInput[] = [];
    
    // Process each checkpoint for the table
    for (let i = 0; i < inspection.checkpoints.length; i++) {
      const cp = inspection.checkpoints[i];
      
      let hasPhoto = !!cp.photo_url;
      let photoCell: CellInput = {};
      
      if (hasPhoto) {
        // Leave cell empty for now, we'll add images after table creation
        photoCell = { content: '', styles: { minCellHeight: 25 } }; // Standardized height
      } else {
        photoCell = { 
          content: 'No photo', 
          styles: { 
            halign: getHAlign('center'), 
            fontStyle: getFontStyle('italic'), 
            textColor: getColor([150, 150, 150]) 
          } 
        };
      }
      
      let resultText = cp.passed === null ? 'NA' : cp.passed ? 'PASS' : 'FAIL';
      let resultColor = cp.passed === null ? getColor([100, 100, 100]) : 
                        cp.passed ? getColor([0, 128, 0]) : getColor([255, 0, 0]);
      
      checkpointRows.push([
        { content: (i + 1).toString(), styles: { halign: getHAlign('center') } },
        { content: cp.description },
        { content: resultText, styles: { fontStyle: getFontStyle('bold'), halign: getHAlign('center'), textColor: resultColor } },
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
        cellPadding: 2, // Reduced padding
        fontSize: 8,
        lineColor: [0, 0, 0],
        lineWidth: 0.1,
        minCellHeight: 8 // Standardized height
      },
      columnStyles: {
        0: { cellWidth: 15 },
        1: { cellWidth: 50 },
        2: { cellWidth: 25 },
        3: { cellWidth: 40 },
        4: { cellWidth: 45 }
      },
      margin: { left: 14, right: 14 }
    });
    
    finalY = (doc as any).lastAutoTable.finalY + 5;
    
    // Add photos to cells where applicable - improved positioning
    try {
      for (let i = 0; i < inspection.checkpoints.length; i++) {
        const cp = inspection.checkpoints[i];
        if (cp.photo_url) {
          // Improved position calculation for better photo placement
          const rowHeight = 25; // height per row
          const tableStart = finalY - (inspection.checkpoints.length * rowHeight) - 5;
          const imgY = tableStart + (i * rowHeight) - rowHeight/2 - 2;
          
          // Ensure photo stays within the cell boundaries
          doc.addImage(cp.photo_url, 'JPEG', 115, imgY, 25, 20);
        }
      }
    } catch (error) {
      console.error("Error adding checkpoint photos:", error);
    }
  }
  
  // Add inspector details table from profile data
  doc.setFontSize(12);
  doc.text("INSPECTOR DETAILS", 14, finalY + 5);
  
  // Create inspector details table in 2-column layout with profile data
  const inspectorData: RowInput[] = [
    [
      { content: "EMPLOYEE NAME:", styles: { fontStyle: getFontStyle('bold') } },
      { content: inspection.inspector_name },
      { content: "EMPLOYEE ID:", styles: { fontStyle: getFontStyle('bold') } },
      { content: "___________" }
    ],
    [
      { content: "ROLE:", styles: { fontStyle: getFontStyle('bold') } },
      { content: "Inspector" },
      { content: "DEPARTMENT:", styles: { fontStyle: getFontStyle('bold') } },
      { content: "Safety" }
    ]
  ];
  
  autoTable(doc as any, {
    startY: finalY + 10,
    body: inspectorData,
    theme: 'grid',
    styles: { 
      cellPadding: 2, // Reduced padding
      fontSize: 9,
      lineColor: [0, 0, 0],
      lineWidth: 0.1,
      minCellHeight: 8 // Standardized height
    },
    columnStyles: {
      0: { cellWidth: 35 },
      1: { cellWidth: 45 },
      2: { cellWidth: 30 },
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
  const resultColor = !inspection.overall_result ? getColor([100, 100, 100]) : 
                      inspection.overall_result.toLowerCase() === 'pass' ? getColor([0, 128, 0]) : getColor([255, 0, 0]);
  
  // Create final result and signature table
  const finalResultData: RowInput[] = [
    [
      { content: "OVERALL RESULT:", styles: { fontStyle: getFontStyle('bold') } },
      { content: resultText.toUpperCase(), styles: { fontStyle: getFontStyle('bold'), halign: getHAlign('center'), textColor: resultColor } },
      { content: "INSPECTOR SIGNATURE:", styles: { fontStyle: getFontStyle('bold') } },
      { content: ' ', styles: { minCellHeight: 25 } }
    ]
  ];
  
  autoTable(doc as any, {
    startY: finalY + 10,
    body: finalResultData,
    theme: 'grid',
    styles: { 
      cellPadding: 2, // Reduced padding
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
      // Updated position to stay within signature cell
      doc.addImage(inspection.signature_url, 'PNG', 150, finalY + 8, 30, 20);
    } catch (error) {
      console.error("Error adding signature:", error);
    }
  }
  
  // Add inspection date - closer to the table
  finalY = (doc as any).lastAutoTable.finalY + 3;
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
