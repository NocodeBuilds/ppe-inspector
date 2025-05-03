
import { jsPDF } from 'jspdf';
import { ExtendedJsPDF, addPDFHeader, addSectionTitle, addPDFFooter, formatDateOrNA, addDataTable, addSignatureToPDF } from '@/utils/pdfUtils';
import { InspectionDetails } from '@/types/ppe';
import { format } from 'date-fns';

/**
 * Generates a PDF report for inspection details
 */
export const generateInspectionDetailPDF = async (inspection: InspectionDetails): Promise<void> => {
  try {
    // Create a new PDF document
    const doc = new jsPDF() as ExtendedJsPDF;
    
    // Add header
    addPDFHeader(doc, 'Inspection Report', `PPE Type: ${inspection.ppe_type}`);
    
    // Add equipment details section
    let yPos = 30;
    addSectionTitle(doc, 'Equipment Details', yPos);
    yPos += 5;
    
    const equipmentData = [
      ['Serial Number:', inspection.ppe_serial, 'PPE Type:', inspection.ppe_type],
      ['Brand:', inspection.ppe_brand, 'Model:', inspection.ppe_model],
      ['Manufacturing Date:', formatDateOrNA(inspection.manufacturing_date), 'Expiry Date:', formatDateOrNA(inspection.expiry_date)],
      ['Site Name:', inspection.site_name, 'Batch Number:', inspection.batch_number || 'N/A'],
    ];
    
    yPos = addDataTable(doc, [], equipmentData, yPos, { theme: 'plain', headStyles: { fontStyle: 'bold' } });
    
    // Add inspection details section
    yPos += 10;
    addSectionTitle(doc, 'Inspection Details', yPos);
    yPos += 5;
    
    const inspectionData = [
      ['Date:', format(new Date(inspection.date), 'MMM d, yyyy'), 'Inspector:', inspection.inspector_name],
      ['Type:', inspection.type, 'Result:', inspection.overall_result.toUpperCase()],
    ];
    
    yPos = addDataTable(doc, [], inspectionData, yPos, { theme: 'plain' });
    
    // Add notes if any
    if (inspection.notes) {
      yPos += 5;
      doc.setFontSize(11);
      doc.text('Notes:', 14, yPos);
      yPos += 5;
      
      const splitNotes = doc.splitTextToSize(inspection.notes, 180);
      doc.text(splitNotes, 14, yPos);
      yPos += splitNotes.length * 5 + 5;
    }
    
    // Add checkpoints section
    yPos += 5;
    addSectionTitle(doc, 'Inspection Checkpoints', yPos);
    yPos += 5;
    
    const checkpointTableHead = [['No.', 'Description', 'Result', 'Notes']];
    const checkpointTableBody = inspection.checkpoints.map((checkpoint, index) => {
      const result = checkpoint.passed === null ? 'N/A' : checkpoint.passed ? 'PASS' : 'FAIL';
      return [
        (index + 1).toString(),
        checkpoint.description,
        result,
        checkpoint.notes || '',
      ];
    });
    
    yPos = addDataTable(doc, checkpointTableHead, checkpointTableBody, yPos);
    
    // Add signature section
    yPos += 10;
    addSectionTitle(doc, 'Inspector Signature', yPos);
    yPos += 5;
    
    if (inspection.signature_url) {
      yPos = await addSignatureToPDF(doc, inspection.signature_url, yPos);
    } else {
      doc.text('No signature provided', 14, yPos + 5);
      yPos += 10;
    }
    
    // Add footer
    addPDFFooter(doc, `Generated on ${format(new Date(), 'MMM d, yyyy')}`);
    
    // Save the PDF
    doc.save(`inspection_${inspection.id}_${format(new Date(), 'yyyyMMdd')}.pdf`);
    
    return;
  } catch (error) {
    console.error('Error generating inspection PDF:', error);
    throw error;
  }
};
