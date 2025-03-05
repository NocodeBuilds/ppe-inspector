
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Extension of jsPDF to include the lastAutoTable property added by jspdf-autotable
 */
export interface ExtendedJsPDF extends jsPDF {
  lastAutoTable?: {
    finalY: number;
  };
}

/**
 * Creates a new PDF document with basic setup
 */
export const createPDFDocument = (): ExtendedJsPDF => {
  return new jsPDF() as ExtendedJsPDF;
};

/**
 * Adds title and subtitle to a PDF document
 */
export const addPDFHeader = (
  doc: ExtendedJsPDF, 
  title: string, 
  subtitle?: string
): void => {
  doc.setFontSize(20);
  doc.text(title, 105, 15, { align: 'center' });
  
  if (subtitle) {
    doc.setFontSize(12);
    doc.text(subtitle, 105, 25, { align: 'center' });
  }
};

/**
 * Adds a section title to the PDF
 */
export const addSectionTitle = (
  doc: ExtendedJsPDF, 
  title: string, 
  yPosition: number
): void => {
  doc.setFontSize(14);
  doc.text(title, 14, yPosition);
};

/**
 * Adds footer with pagination to all pages
 */
export const addPDFFooter = (
  doc: ExtendedJsPDF, 
  footerText: string
): void => {
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(10);
    doc.text(
      `${footerText} - Page ${i} of ${pageCount}`,
      105,
      doc.internal.pageSize.height - 10,
      { align: 'center' }
    );
  }
};

/**
 * Adds a data table to the PDF
 */
export const addDataTable = (
  doc: ExtendedJsPDF,
  head: string[][],
  body: any[][],
  startY: number
): number => {
  autoTable(doc, {
    startY,
    head,
    body,
    theme: 'grid',
  });
  
  return doc.lastAutoTable?.finalY || startY;
};

/**
 * Formats a date to a locale string or returns 'N/A' if null
 */
export const formatDateOrNA = (date: string | Date | null | undefined): string => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString();
};

/**
 * Saves the PDF with the given filename
 */
export const savePDF = (doc: ExtendedJsPDF, filename: string): void => {
  doc.save(filename);
};
