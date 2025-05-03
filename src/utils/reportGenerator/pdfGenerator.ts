
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { InspectionDetails } from '@/types/ppe';

/**
 * Base class for PDF generation
 */
export class PDFGenerator {
  doc: jsPDF;
  pageWidth: number;
  pageHeight: number;
  marginLeft: number = 15;
  marginRight: number = 15;
  marginTop: number = 15;
  marginBottom: number = 15;
  currentY: number;

  constructor(orientation: 'portrait' | 'landscape' = 'portrait') {
    this.doc = new jsPDF({
      orientation,
      unit: 'mm',
      format: 'a4',
    });
    
    this.pageWidth = orientation === 'portrait' ? 210 : 297;
    this.pageHeight = orientation === 'portrait' ? 297 : 210;
    this.currentY = this.marginTop;
  }

  /**
   * Add a header to the PDF document
   */
  addHeader(text: string): void {
    this.doc.setFontSize(18);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(text, this.pageWidth / 2, this.currentY, { align: 'center' });
    this.currentY += 10;
  }

  /**
   * Add a subheader to the PDF document
   */
  addSubHeader(text: string): void {
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(text, this.marginLeft, this.currentY);
    this.currentY += 7;
  }

  /**
   * Add normal text to the PDF document
   */
  addText(text: string, fontSize: number = 11): void {
    this.doc.setFontSize(fontSize);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(text, this.marginLeft, this.currentY);
    this.currentY += 6;
  }

  /**
   * Add a table to the PDF document
   */
  addTable(head: any[], body: any[][]): void {
    // Check if we need a new page
    if (this.currentY > this.pageHeight - 50) {
      this.doc.addPage();
      this.currentY = this.marginTop;
    }

    autoTable(this.doc, {
      startY: this.currentY,
      head: [head],
      body: body,
      margin: { top: this.currentY, left: this.marginLeft, right: this.marginRight },
      styles: {
        fontSize: 9,
      },
    });

    // Update currentY to be after the table
    this.currentY = (this.doc as any).lastAutoTable.finalY + 10;
  }

  /**
   * Add a key-value data section to the PDF document
   */
  addKeyValueSection(title: string, data: Record<string, string | number>): void {
    this.addSubHeader(title);
    
    Object.entries(data).forEach(([key, value]) => {
      const text = `${key}: ${value}`;
      this.addText(text);
    });
    
    this.currentY += 5;
  }

  /**
   * Add an image to the PDF document
   */
  addImage(imgData: string, x: number, y: number, width: number, height: number): void {
    try {
      if (imgData && imgData.startsWith('data:image')) {
        this.doc.addImage(imgData, 'PNG', x, y, width, height);
      }
    } catch (error) {
      console.error('Error adding image to PDF:', error);
    }
  }

  /**
   * Save the PDF document and trigger download
   */
  save(filename: string): void {
    this.doc.save(filename);
  }
}

/**
 * Generate an inspection detail PDF report
 */
export const generateInspectionDetailPDF = async (inspectionData: InspectionDetails): Promise<void> => {
  try {
    const pdf = new PDFGenerator();
    
    // Add header
    pdf.addHeader('Inspection Report');
    
    // Add inspection details
    pdf.addKeyValueSection('Inspection Details', {
      'Inspection ID': inspectionData.id,
      'Date': new Date(inspectionData.date).toLocaleDateString(),
      'Type': inspectionData.type,
      'Result': inspectionData.overall_result.toUpperCase(),
      'Inspector': inspectionData.inspector_name,
    });
    
    // Add equipment details
    pdf.addKeyValueSection('Equipment Details', {
      'Type': inspectionData.ppe_type,
      'Serial Number': inspectionData.ppe_serial,
      'Brand': inspectionData.ppe_brand,
      'Model': inspectionData.ppe_model,
      'Batch Number': inspectionData.batch_number || 'N/A',
      'Manufacturing Date': inspectionData.manufacturing_date ? new Date(inspectionData.manufacturing_date).toLocaleDateString() : 'N/A',
      'Expiry Date': inspectionData.expiry_date ? new Date(inspectionData.expiry_date).toLocaleDateString() : 'N/A',
    });
    
    // Add checkpoints
    pdf.addSubHeader('Inspection Checkpoints');
    
    const tableHead = ['Description', 'Result', 'Notes'];
    const tableBody = inspectionData.checkpoints.map((checkpoint) => [
      checkpoint.description,
      checkpoint.passed === null ? 'N/A' : checkpoint.passed ? 'PASS' : 'FAIL',
      checkpoint.notes || 'N/A',
    ]);
    
    pdf.addTable(tableHead, tableBody);
    
    // Add notes if any
    if (inspectionData.notes) {
      pdf.addSubHeader('Additional Notes');
      pdf.addText(inspectionData.notes);
    }
    
    // Add signature if available
    if (inspectionData.signature_url) {
      pdf.addSubHeader('Signature');
      pdf.addImage(inspectionData.signature_url, pdf.marginLeft, pdf.currentY, 60, 30);
      pdf.currentY += 35;
    }
    
    // Generate filename
    const filename = `inspection_${inspectionData.id}_${new Date().toISOString().split('T')[0]}.pdf`;
    
    // Save the PDF
    pdf.save(filename);
    
    return;
  } catch (error) {
    console.error('Error generating PDF report:', error);
    throw error;
  }
};
