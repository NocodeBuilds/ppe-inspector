
import { PPEItem } from '@/types';
import { format } from 'date-fns';

/**
 * Generate an Excel report for PPE items
 * Uses a CSV approach for maximum compatibility
 */
export const generatePPEExcelReport = (ppeItems: PPEItem[], includeDetails: boolean = false) => {
  // Generate CSV content
  let csvContent = "data:text/csv;charset=utf-8,";
  
  // Add headers
  const headers = [
    "Serial Number",
    "Type",
    "Brand",
    "Model",
    "Manufacturing Date",
    "Expiry Date",
    "Status",
    "Next Inspection",
    "Days Until Next Inspection",
    "Days Until Expiry"
  ];
  
  if (includeDetails) {
    headers.push("Created At", "Updated At", "Image URL");
  }
  
  csvContent += headers.join(",") + "\n";
  
  // Calculate days between dates
  const calculateDaysDifference = (dateStr: string | null | undefined) => {
    if (!dateStr) return "N/A";
    const targetDate = new Date(dateStr);
    const today = new Date();
    const diffTime = targetDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)).toString();
  };
  
  // Format date for Excel compatibility
  const formatDateForExcel = (dateStr: string | null | undefined) => {
    if (!dateStr) return "";
    return format(new Date(dateStr), "yyyy-MM-dd");
  };
  
  // Process each PPE item
  ppeItems.forEach(item => {
    const row = [
      `"${item.serialNumber || ""}"`, // Wrap in quotes to handle commas
      `"${item.type || ""}"`,
      `"${item.brand || ""}"`,
      `"${item.modelNumber || ""}"`,
      formatDateForExcel(item.manufacturingDate),
      formatDateForExcel(item.expiryDate),
      `"${item.status || ""}"`,
      formatDateForExcel(item.nextInspection),
      calculateDaysDifference(item.nextInspection),
      calculateDaysDifference(item.expiryDate)
    ];
    
    if (includeDetails) {
      row.push(
        formatDateForExcel(item.createdAt),
        formatDateForExcel(item.updatedAt),
        `"${item.imageUrl || ""}"`
      );
    }
    
    csvContent += row.join(",") + "\n";
  });
  
  // Create download link
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `ppe_inventory_${format(new Date(), "yyyyMMdd")}.csv`);
  document.body.appendChild(link);
  
  // Trigger download
  link.click();
  
  // Clean up
  document.body.removeChild(link);
};

/**
 * Generate an Excel report for inspection data
 */
export const generateInspectionExcelReport = (inspectionData: any, ppeItem?: PPEItem) => {
  // Generate CSV content
  let csvContent = "data:text/csv;charset=utf-8,";
  
  // First sheet: Inspection details
  csvContent += "INSPECTION DETAILS\n\n";
  
  // Add inspection metadata
  csvContent += "Inspection ID," + `"${inspectionData.id || ""}"\n`;
  csvContent += "Date," + format(new Date(inspectionData.date || new Date()), "yyyy-MM-dd") + "\n";
  csvContent += "Type," + `"${inspectionData.type || ""}"\n`;
  csvContent += "Inspector," + `"${inspectionData.inspector_name || ""}"\n`;
  csvContent += "Result," + `"${inspectionData.result || ""}"\n`;
  csvContent += "Notes," + `"${(inspectionData.notes || "").replace(/"/g, '""')}"\n\n`;
  
  // Add PPE details if available
  if (ppeItem) {
    csvContent += "PPE DETAILS\n\n";
    csvContent += "Serial Number," + `"${ppeItem.serialNumber || ""}"\n`;
    csvContent += "Type," + `"${ppeItem.type || ""}"\n`;
    csvContent += "Brand," + `"${ppeItem.brand || ""}"\n`;
    csvContent += "Model," + `"${ppeItem.modelNumber || ""}"\n`;
    csvContent += "Manufacturing Date," + (ppeItem.manufacturingDate ? format(new Date(ppeItem.manufacturingDate), "yyyy-MM-dd") : "") + "\n";
    csvContent += "Expiry Date," + (ppeItem.expiryDate ? format(new Date(ppeItem.expiryDate), "yyyy-MM-dd") : "") + "\n";
    csvContent += "Status," + `"${ppeItem.status || ""}"\n`;
    csvContent += "Next Inspection," + (ppeItem.nextInspection ? format(new Date(ppeItem.nextInspection), "yyyy-MM-dd") : "") + "\n\n";
  }
  
  // Add checkpoints if available
  if (inspectionData.checkpoints && inspectionData.checkpoints.length > 0) {
    csvContent += "CHECKPOINTS\n\n";
    csvContent += "Description,Result,Notes\n";
    
    inspectionData.checkpoints.forEach((checkpoint: any) => {
      csvContent += `"${checkpoint.description || ""}",`;
      csvContent += `"${checkpoint.passed ? "PASS" : "FAIL"}",`;
      csvContent += `"${(checkpoint.notes || "").replace(/"/g, '""')}"\n`;
    });
  }
  
  // Create download link
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `inspection_report_${format(new Date(), "yyyyMMdd")}.csv`);
  document.body.appendChild(link);
  
  // Trigger download
  link.click();
  
  // Clean up
  document.body.removeChild(link);
};

/**
 * Generate a shareable report link
 * This is a placeholder for future implementation of sharing via WhatsApp or email
 */
export const generateShareableReportLink = (reportType: string, itemId: string): string => {
  // This is a placeholder - in a real implementation, you would:
  // 1. Generate a report and save it to a storage service
  // 2. Generate a shareable link
  // 3. Return the link for sharing
  
  const baseUrl = window.location.origin;
  return `${baseUrl}/share-report?type=${reportType}&id=${itemId}`;
};

/**
 * Share report via WhatsApp
 */
export const shareReportViaWhatsApp = (reportTitle: string, itemId: string) => {
  // Create a shareable message
  const message = `Check out this safety inspection report: ${reportTitle}`;
  const shareLink = generateShareableReportLink('inspection', itemId);
  
  // Open WhatsApp with pre-filled message
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message + ' ' + shareLink)}`;
  window.open(whatsappUrl, '_blank');
};

/**
 * Share report via Email
 */
export const shareReportViaEmail = (reportTitle: string, itemId: string, recipientEmail?: string) => {
  // Create email content
  const subject = `Safety Inspection Report: ${reportTitle}`;
  const body = `Please find the safety inspection report below:\n\n${generateShareableReportLink('inspection', itemId)}`;
  
  // Open email client with pre-filled content
  const mailtoUrl = `mailto:${recipientEmail || ''}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  window.location.href = mailtoUrl;
};
