
import { ExtendedJsPDF, createPDFDocument, addPDFHeader, addPDFFooter, addSectionTitle, addDataTable, formatDateOrNA, addSignatureToPDF } from '../pdfUtils';
import { format } from 'date-fns';

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
  const doc = createPDFDocument();
  
  // Add title
  addPDFHeader(doc, 'Inspection Report', `${inspection.ppe_type} - ${inspection.ppe_serial}`);
  
  // Add inspection details
  let yPos = 40;
  doc.setFontSize(12);
  doc.text(`Date: ${formatDateOrNA(inspection.date)}`, 14, yPos);
  yPos += 7;
  doc.text(`Type: ${inspection.type.charAt(0).toUpperCase() + inspection.type.slice(1)} Inspection`, 14, yPos);
  yPos += 7;
  doc.text(`Result: ${inspection.overall_result.toUpperCase()}`, 14, yPos);
  yPos += 7;
  doc.text(`Inspector: ${inspection.inspector_name}`, 14, yPos);
  yPos += 15;
  
  // Add equipment details
  addSectionTitle(doc, 'Equipment Details', yPos);
  yPos += 10;
  
  const equipmentData = [
    ['Type', 'Serial Number', 'Brand', 'Model'],
    [inspection.ppe_type, inspection.ppe_serial, inspection.ppe_brand, inspection.ppe_model]
  ];
  
  yPos = addDataTable(doc, [equipmentData[0]], [equipmentData[1]], yPos) + 15;
  
  // Add inspection checkpoints
  addSectionTitle(doc, 'Inspection Checkpoints', yPos);
  yPos += 10;
  
  const checkpointHeaders = [['Checkpoint', 'Result', 'Notes']];
  const checkpointRows = inspection.checkpoints.map(checkpoint => [
    checkpoint.description,
    checkpoint.passed === null ? 'N/A' : checkpoint.passed ? 'PASS' : 'FAIL',
    checkpoint.notes || ''
  ]);
  
  yPos = addDataTable(doc, checkpointHeaders, checkpointRows, yPos) + 15;
  
  // Check if we need a new page for additional notes
  if (yPos > 230) {
    doc.addPage();
    yPos = 20;
  }
  
  // Add additional notes if any
  addSectionTitle(doc, 'Additional Notes', yPos);
  yPos += 10;
  
  if (inspection.notes) {
    doc.setFontSize(10);
    const splitNotes = doc.splitTextToSize(inspection.notes, 180);
    doc.text(splitNotes, 14, yPos);
    yPos += splitNotes.length * 5 + 10;
  } else {
    doc.setFontSize(10);
    doc.text('No additional notes provided.', 14, yPos);
    yPos += 10;
  }
  
  // Check if we need a new page for signature
  if (yPos > 230) {
    doc.addPage();
    yPos = 20;
  }
  
  // Add signature
  addSectionTitle(doc, 'Inspector Signature', yPos);
  yPos += 10;
  
  await addSignatureToPDF(doc, inspection.signature_url, yPos);
  
  // Add footer
  addPDFFooter(doc, `Generated on ${format(new Date(), 'MMM d, yyyy')}`);
  
  // Save the PDF
  const filename = `inspection_${inspection.ppe_serial}_${format(new Date(inspection.date), 'yyyyMMdd')}.pdf`;
  doc.save(filename);
};
