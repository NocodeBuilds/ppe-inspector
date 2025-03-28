
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';

/**
 * Generate a PDF report with analytics data
 * @param analyticsData Object containing analytics data
 */
export const generateAnalyticsReportPDF = async (analyticsData: any): Promise<void> => {
  // Create a new PDF document
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true
  });

  // Set document properties
  doc.setProperties({
    title: 'PPE Analytics Report',
    subject: 'Analytics data for PPE management',
    creator: 'PPE Management System',
    author: 'System Generated'
  });

  // Add title and date
  doc.setFontSize(16);
  doc.text('PPE ANALYTICS REPORT', doc.internal.pageSize.width / 2, 20, { align: 'center' });
  
  doc.setFontSize(10);
  doc.text(`Generated on: ${format(new Date(), 'dd-MM-yyyy HH:mm')}`, doc.internal.pageSize.width / 2, 27, { align: 'center' });

  let yPosition = 35;
  
  // PPE Type Distribution
  if (analyticsData?.ppeTypeDistribution) {
    doc.setFontSize(12);
    doc.text('PPE Type Distribution', 14, yPosition);
    
    const typeData = Object.entries(analyticsData.ppeTypeDistribution).map(([type, count]) => [
      type,
      count
    ]);
    
    autoTable(doc, {
      startY: yPosition + 5,
      head: [['PPE Type', 'Count']],
      body: typeData,
      theme: 'grid',
      headStyles: { fillColor: [66, 133, 244], textColor: [255, 255, 255] },
      styles: { fontSize: 8 }
    });
    
    yPosition = (doc as any).lastAutoTable.finalY + 10;
  }
  
  // PPE Status Counts
  if (analyticsData?.ppeStatusCounts) {
    if (yPosition > 180) {
      doc.addPage();
      yPosition = 20;
    }
    
    doc.setFontSize(12);
    doc.text('PPE Status Overview', 14, yPosition);
    
    const statusData = [
      ['Active', analyticsData.ppeStatusCounts.active || 0],
      ['Expired', analyticsData.ppeStatusCounts.expired || 0],
      ['Maintenance', analyticsData.ppeStatusCounts.maintenance || 0],
      ['Flagged', analyticsData.ppeStatusCounts.flagged || 0]
    ];
    
    autoTable(doc, {
      startY: yPosition + 5,
      head: [['Status', 'Count']],
      body: statusData,
      theme: 'grid',
      headStyles: { fillColor: [66, 133, 244], textColor: [255, 255, 255] },
      styles: { fontSize: 8 }
    });
    
    yPosition = (doc as any).lastAutoTable.finalY + 10;
  }
  
  // Inspection Type Counts
  if (analyticsData?.inspectionTypeCounts) {
    if (yPosition > 180) {
      doc.addPage();
      yPosition = 20;
    }
    
    doc.setFontSize(12);
    doc.text('Inspection Type Distribution', 14, yPosition);
    
    const inspectionData = [
      ['Pre-use', analyticsData.inspectionTypeCounts['pre-use'] || 0],
      ['Monthly', analyticsData.inspectionTypeCounts['monthly'] || 0],
      ['Quarterly', analyticsData.inspectionTypeCounts['quarterly'] || 0]
    ];
    
    autoTable(doc, {
      startY: yPosition + 5,
      head: [['Inspection Type', 'Count']],
      body: inspectionData,
      theme: 'grid',
      headStyles: { fillColor: [66, 133, 244], textColor: [255, 255, 255] },
      styles: { fontSize: 8 }
    });
    
    yPosition = (doc as any).lastAutoTable.finalY + 10;
  }
  
  // Inspection Result Counts
  if (analyticsData?.inspectionResultCounts) {
    if (yPosition > 180) {
      doc.addPage();
      yPosition = 20;
    }
    
    doc.setFontSize(12);
    doc.text('Inspection Results Overview', 14, yPosition);
    
    const resultData = [
      ['Pass', analyticsData.inspectionResultCounts.pass || 0],
      ['Fail', analyticsData.inspectionResultCounts.fail || 0]
    ];
    
    autoTable(doc, {
      startY: yPosition + 5,
      head: [['Result', 'Count']],
      body: resultData,
      theme: 'grid',
      headStyles: { fillColor: [66, 133, 244], textColor: [255, 255, 255] },
      styles: { fontSize: 8 }
    });
    
    yPosition = (doc as any).lastAutoTable.finalY + 10;
  }
  
  // Upcoming Inspections
  if (analyticsData?.upcomingInspections && analyticsData.upcomingInspections.length > 0) {
    if (yPosition > 140) {
      doc.addPage();
      yPosition = 20;
    }
    
    doc.setFontSize(12);
    doc.text('Upcoming Inspections (Next 30 Days)', 14, yPosition);
    
    const upcomingData = analyticsData.upcomingInspections.map((item: any) => [
      item.type,
      item.serial_number,
      format(new Date(item.next_inspection), 'dd-MM-yyyy'),
      item.days_remaining
    ]);
    
    autoTable(doc, {
      startY: yPosition + 5,
      head: [['PPE Type', 'Serial Number', 'Due Date', 'Days Remaining']],
      body: upcomingData,
      theme: 'grid',
      headStyles: { fillColor: [66, 133, 244], textColor: [255, 255, 255] },
      styles: { fontSize: 8 }
    });
    
    yPosition = (doc as any).lastAutoTable.finalY + 10;
  }
  
  // Expiring Items
  if (analyticsData?.expiringItems && analyticsData.expiringItems.length > 0) {
    if (yPosition > 140) {
      doc.addPage();
      yPosition = 20;
    }
    
    doc.setFontSize(12);
    doc.text('Expiring PPE Items (Next 30 Days)', 14, yPosition);
    
    const expiringData = analyticsData.expiringItems.map((item: any) => [
      item.type,
      item.serial_number,
      format(new Date(item.expiry_date), 'dd-MM-yyyy'),
      item.days_remaining
    ]);
    
    autoTable(doc, {
      startY: yPosition + 5,
      head: [['PPE Type', 'Serial Number', 'Expiry Date', 'Days Remaining']],
      body: expiringData,
      theme: 'grid',
      headStyles: { fillColor: [66, 133, 244], textColor: [255, 255, 255] },
      styles: { fontSize: 8 }
    });
  }
  
  // Add page numbers
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.text(`Page ${i} of ${pageCount}`, doc.internal.pageSize.width - 20, doc.internal.pageSize.height - 10);
  }
  
  // Save the PDF
  const filename = `analytics_report_${format(new Date(), 'yyyyMMdd')}.pdf`;
  doc.save(filename);
};
