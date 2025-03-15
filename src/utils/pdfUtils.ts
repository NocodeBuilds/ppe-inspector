
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';

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
  startY: number,
  options: any = {}
): number => {
  autoTable(doc, {
    startY,
    head,
    body,
    theme: 'grid',
    ...options
  });
  
  return doc.lastAutoTable?.finalY || startY;
};

/**
 * Formats a date to a locale string or returns 'N/A' if null
 */
export const formatDateOrNA = (date: string | Date | null | undefined): string => {
  if (!date) return 'N/A';
  try {
    return format(new Date(date), 'MMM d, yyyy');
  } catch (error) {
    console.error("Date formatting error:", error);
    return 'Invalid Date';
  }
};

/**
 * Adds an image to the PDF with error handling
 */
export const addImageToPDF = (
  doc: ExtendedJsPDF,
  imageUrl: string,
  x: number,
  y: number,
  width: number,
  height: number
): Promise<number> => {
  return new Promise((resolve, reject) => {
    try {
      // For data URLs, we can add directly
      if (imageUrl.startsWith('data:image')) {
        doc.addImage(imageUrl, 'JPEG', x, y, width, height);
        resolve(y + height);
      } else {
        // For remote URLs, we need to fetch
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Could not get canvas context'));
            return;
          }
          ctx.drawImage(img, 0, 0);
          const dataUrl = canvas.toDataURL('image/jpeg');
          doc.addImage(dataUrl, 'JPEG', x, y, width, height);
          resolve(y + height);
        };
        img.onerror = (e) => {
          console.error('Image loading error', e);
          resolve(y); // Continue without the image
        };
        img.src = imageUrl;
      }
    } catch (error) {
      console.error('Error adding image to PDF:', error);
      resolve(y); // Continue without the image
    }
  });
};

/**
 * Adds a signature to the PDF
 */
export const addSignatureToPDF = async (
  doc: ExtendedJsPDF,
  signatureUrl: string | null,
  y: number
): Promise<number> => {
  if (!signatureUrl) {
    doc.setFontSize(10);
    doc.text('No signature provided', 14, y + 5);
    return y + 10;
  }

  try {
    return await addImageToPDF(doc, signatureUrl, 14, y, 60, 30);
  } catch (error) {
    console.error('Error adding signature to PDF:', error);
    doc.setFontSize(10);
    doc.text('Signature could not be displayed', 14, y + 5);
    return y + 10;
  }
};

/**
 * Saves the PDF with the given filename
 */
export const savePDF = (doc: ExtendedJsPDF, filename: string): void => {
  doc.save(filename);
};
