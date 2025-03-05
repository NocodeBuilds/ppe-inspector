
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatInspectionDate } from '@/utils/inspectionUtils';

interface AnalyticsData {
  ppeStatusCounts: {
    active: number;
    expired: number;
    maintenance: number;
    flagged: number;
  };
  inspectionTypeCounts: {
    'pre-use': number;
    'monthly': number;
    'quarterly': number;
  };
  inspectionResultCounts: {
    pass: number;
    fail: number;
  };
  ppeTypeDistribution: Record<string, number>;
  upcomingInspections: {
    id: string;
    serial_number: string;
    type: string;
    next_inspection: string;
    days_remaining: number;
  }[];
  expiringItems: {
    id: string;
    serial_number: string;
    type: string;
    expiry_date: string;
    days_remaining: number;
  }[];
}

/**
 * Generate a PDF analytics report
 */
export const generateAnalyticsReport = (data: AnalyticsData) => {
  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(18);
  doc.text('PPE Analytics Report', 14, 22);
  
  // Add generation date
  doc.setFontSize(10);
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
  
  // PPE Status Summary
  doc.setFontSize(14);
  doc.text('PPE Status Summary', 14, 40);
  
  autoTable(doc, {
    head: [['Status', 'Count']],
    body: [
      ['Active', data.ppeStatusCounts.active.toString()],
      ['Expired', data.ppeStatusCounts.expired.toString()],
      ['Maintenance', data.ppeStatusCounts.maintenance.toString()],
      ['Flagged', data.ppeStatusCounts.flagged.toString()],
      ['Total', (
        data.ppeStatusCounts.active + 
        data.ppeStatusCounts.expired + 
        data.ppeStatusCounts.maintenance + 
        data.ppeStatusCounts.flagged
      ).toString()]
    ],
    startY: 45,
    styles: { fontSize: 10 },
    headStyles: { fillColor: [41, 128, 185], textColor: 255 },
    alternateRowStyles: { fillColor: [240, 240, 240] }
  });
  
  // PPE Type Distribution
  doc.setFontSize(14);
  let y = (doc as any).lastAutoTable.finalY + 15;
  doc.text('PPE Type Distribution', 14, y);
  
  const typeData = Object.entries(data.ppeTypeDistribution).map(([type, count]) => [type, count.toString()]);
  
  autoTable(doc, {
    head: [['PPE Type', 'Count']],
    body: typeData,
    startY: y + 5,
    styles: { fontSize: 10 },
    headStyles: { fillColor: [41, 128, 185], textColor: 255 },
    alternateRowStyles: { fillColor: [240, 240, 240] }
  });
  
  // Inspection Summary
  doc.setFontSize(14);
  y = (doc as any).lastAutoTable.finalY + 15;
  doc.text('Inspection Summary', 14, y);
  
  autoTable(doc, {
    head: [['Category', 'Count']],
    body: [
      ['Pre-use Inspections', data.inspectionTypeCounts['pre-use'].toString()],
      ['Monthly Inspections', data.inspectionTypeCounts['monthly'].toString()],
      ['Quarterly Inspections', data.inspectionTypeCounts['quarterly'].toString()],
      ['Total Inspections', (
        data.inspectionTypeCounts['pre-use'] + 
        data.inspectionTypeCounts['monthly'] + 
        data.inspectionTypeCounts['quarterly']
      ).toString()],
      ['Passed Inspections', data.inspectionResultCounts.pass.toString()],
      ['Failed Inspections', data.inspectionResultCounts.fail.toString()]
    ],
    startY: y + 5,
    styles: { fontSize: 10 },
    headStyles: { fillColor: [41, 128, 185], textColor: 255 },
    alternateRowStyles: { fillColor: [240, 240, 240] }
  });
  
  // Check if we need to add a new page
  if ((doc as any).lastAutoTable.finalY > 200) {
    doc.addPage();
    y = 20;
  } else {
    y = (doc as any).lastAutoTable.finalY + 15;
  }
  
  // Upcoming Inspections
  doc.setFontSize(14);
  doc.text('Upcoming Inspections', 14, y);
  
  if (data.upcomingInspections.length > 0) {
    const upcomingData = data.upcomingInspections.map(item => [
      item.serial_number,
      item.type,
      formatInspectionDate(item.next_inspection),
      item.days_remaining.toString()
    ]);
    
    autoTable(doc, {
      head: [['Serial #', 'Type', 'Inspection Date', 'Days Left']],
      body: upcomingData,
      startY: y + 5,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [41, 128, 185], textColor: 255 },
      alternateRowStyles: { fillColor: [240, 240, 240] }
    });
  } else {
    doc.setFontSize(10);
    doc.text('No upcoming inspections', 14, y + 10);
    y += 20;
  }
  
  // Check if we need to add a new page
  if ((doc as any).lastAutoTable?.finalY > 200) {
    doc.addPage();
    y = 20;
  } else {
    y = ((doc as any).lastAutoTable?.finalY || y + 20) + 15;
  }
  
  // Expiring Items
  doc.setFontSize(14);
  doc.text('Expiring PPE Items', 14, y);
  
  if (data.expiringItems.length > 0) {
    const expiringData = data.expiringItems.map(item => [
      item.serial_number,
      item.type,
      formatInspectionDate(item.expiry_date),
      item.days_remaining.toString()
    ]);
    
    autoTable(doc, {
      head: [['Serial #', 'Type', 'Expiry Date', 'Days Left']],
      body: expiringData,
      startY: y + 5,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [41, 128, 185], textColor: 255 },
      alternateRowStyles: { fillColor: [240, 240, 240] }
    });
  } else {
    doc.setFontSize(10);
    doc.text('No expiring items', 14, y + 10);
  }
  
  // Download the PDF
  doc.save('ppe-analytics-report.pdf');
};
