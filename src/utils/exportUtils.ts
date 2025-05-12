import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import { formatDateOrNA } from './pdfUtils';
import { supabase } from '@/integrations/supabase/client';
import { PPEItem } from '@/integrations/supabase/client';

export const exportToExcel = (data: any[], filename: string) => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
  XLSX.writeFile(workbook, `${filename}.xlsx`);
};

// Function to export PPE items to Excel
export const exportPPEItemsToExcel = async () => {
  try {
    const { data, error } = await supabase
      .from('ppe_items')
      .select('*');
    
    if (error) throw error;
    
    if (data && data.length > 0) {
      // Format data for Excel
      const formattedData = data.map(item => ({
        'Serial Number': item.serial_number,
        'Type': item.type,
        'Brand': item.brand,
        'Model': item.model_number,
        'Manufacturing Date': formatDateOrNA(item.manufacturing_date),
        'Expiry Date': formatDateOrNA(item.expiry_date),
        'Status': item.status,
        'Last Inspection': formatDateOrNA(item.last_inspection_date), // If this field exists
        'Next Inspection': formatDateOrNA(item.next_inspection) // Using next_inspection consistently
      }));
      
      exportToExcel(formattedData, 'ppe_inventory');
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error exporting PPE items to Excel:', error);
    return false;
  }
};

// Function to export inspection data to Excel
export const exportInspectionsToExcel = async () => {
  try {
    const { data, error } = await supabase
      .from('inspections')
      .select(`
        id, date, type, overall_result, notes,
        profiles:inspector_id (
          full_name,
          employee_role,
          department
        ),
        ppe_items:ppe_id (type, serial_number)
      `);
    
    if (error) throw error;
    
    if (data && data.length > 0) {
      // Format data for Excel with safe property access
      const formattedData = data.map(item => ({
        'Date': formatDateOrNA(item.date),
        'Type': item.type,
        'Result': item.overall_result,
        'Inspector': item.profiles?.full_name || 'Unknown',
        'Role': item.profiles?.employee_role || 'Unknown',
        'Department': item.profiles?.department || 'Unknown',
        'PPE Type': item.ppe_items?.type || 'Unknown',
        'Serial Number': item.ppe_items?.serial_number || 'Unknown',
        'Notes': item.notes || ''
      }));
      
      exportToExcel(formattedData, 'inspection_report');
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error exporting inspections to Excel:', error);
    return false;
  }
};

// Function to export analytics data to Excel
export const exportAnalyticsToExcel = async () => {
  try {
    // Get PPE counts by type
    const { data: ppeTypes, error: ppeTypeError } = await supabase
      .from('ppe_items')
      .select('type, status');
    
    if (ppeTypeError) throw ppeTypeError;
    
    // Process PPE type data
    const typeCount: Record<string, number> = {};
    ppeTypes.forEach((item: any) => {
      typeCount[item.type] = (typeCount[item.type] || 0) + 1;
    });
    
    // Process PPE status data
    const statusCount = {
      active: 0,
      expired: 0,
      maintenance: 0,
      flagged: 0
    };
    
    ppeTypes.forEach((item: any) => {
      if (item.status) {
        statusCount[item.status as keyof typeof statusCount] += 1;
      }
    });
    
    // Fetch inspection data
    const { data: inspections, error: inspectionError } = await supabase
      .from('inspections')
      .select('type, overall_result');
    
    if (inspectionError) throw inspectionError;
    
    // Process inspection type data
    const inspectionTypes = {
      'pre-use': 0,
      'monthly': 0, 
      'quarterly': 0
    };
    
    inspections.forEach((item: any) => {
      if (item.type) {
        inspectionTypes[item.type as keyof typeof inspectionTypes] += 1;
      }
    });
    
    // Process inspection result data
    const resultCount = {
      pass: 0,
      fail: 0,
      pending: 0
    };
    
    inspections.forEach((item: any) => {
      const result = item.overall_result?.toLowerCase() || '';
      if (result === 'pass') resultCount.pass++;
      else if (result === 'fail') resultCount.fail++;
      else resultCount.pending++;
    });
    
    // Prepare data for Excel
    const ppeTypeSheet = Object.entries(typeCount).map(([type, count]) => ({
      'Type': type,
      'Count': count
    }));
    
    const statusSheet = [
      { 'Status': 'Active', 'Count': statusCount.active },
      { 'Status': 'Expired', 'Count': statusCount.expired },
      { 'Status': 'Maintenance', 'Count': statusCount.maintenance },
      { 'Status': 'Flagged', 'Count': statusCount.flagged }
    ];
    
    const inspectionTypeSheet = [
      { 'Type': 'Pre-use', 'Count': inspectionTypes['pre-use'] },
      { 'Type': 'Monthly', 'Count': inspectionTypes['monthly'] },
      { 'Type': 'Quarterly', 'Count': inspectionTypes['quarterly'] }
    ];
    
    const resultSheet = [
      { 'Result': 'Pass', 'Count': resultCount.pass },
      { 'Result': 'Fail', 'Count': resultCount.fail },
      { 'Result': 'Pending', 'Count': resultCount.pending }
    ];
    
    // Create multi-sheet workbook
    const workbook = XLSX.utils.book_new();
    
    XLSX.utils.book_append_sheet(
      workbook, 
      XLSX.utils.json_to_sheet(ppeTypeSheet), 
      'PPE Types'
    );
    
    XLSX.utils.book_append_sheet(
      workbook, 
      XLSX.utils.json_to_sheet(statusSheet), 
      'PPE Status'
    );
    
    XLSX.utils.book_append_sheet(
      workbook, 
      XLSX.utils.json_to_sheet(inspectionTypeSheet), 
      'Inspection Types'
    );
    
    XLSX.utils.book_append_sheet(
      workbook, 
      XLSX.utils.json_to_sheet(resultSheet), 
      'Inspection Results'
    );
    
    XLSX.writeFile(workbook, 'analytics_report.xlsx');
    return true;
  } catch (error) {
    console.error('Error exporting analytics to Excel:', error);
    return false;
  }
};

import { format } from 'date-fns';

interface InspectionExportData {
  id: string;
  ppe_id: string;
  inspection_date: string;
  inspector_name?: string;
  ppe_type?: string;
  serial_number?: string;
  overall_result?: string;
}

export const exportFilteredInspectionsToExcel = async (
  inspections: any[], 
  filenamePrefix: string = 'Inspections'
): Promise<boolean> => {
  try {
    if (!inspections || inspections.length === 0) {
      console.warn('No inspection data provided for export.');
      return false;
    }

    const dataForSheet = inspections.map(inspection => ({
      'Inspection ID': inspection.id,
      'PPE ID': inspection.ppe_id,
      'Inspection Date': inspection.inspection_date 
          ? format(new Date(inspection.inspection_date), 'yyyy-MM-dd HH:mm') 
          : 'N/A',
      'Inspector': inspection.user?.full_name || inspection.inspector_name || 'N/A', 
      'PPE Type': inspection.ppe?.type || inspection.ppe_type || 'N/A', 
      'Serial Number': inspection.ppe?.serial_number || inspection.serial_number || 'N/A', 
      'Result': inspection.overall_result?.toUpperCase() || 'N/A',
      'Location': inspection.location || 'N/A',
      'Notes': inspection.notes || ''
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataForSheet);

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Inspections');

    const timestamp = format(new Date(), 'yyyyMMdd_HHmmss');
    const filename = `${filenamePrefix}_${timestamp}.xlsx`;
    XLSX.writeFile(workbook, filename);

    console.log(`Successfully exported data to ${filename}`);
    return true;

  } catch (error) {
    console.error("Error generating Excel export:", error);
    return false;
  }
};

// --- PPE Export Utility --- 

// Define a type for the PPE data structure (adjust based on actual data)
interface PPEExportData {
  id: string;
  serial_number?: string;
  type?: string;
  brand?: string;
  model_number?: string;
  status?: string;
  manufacturing_date?: string | Date;
  expiry_date?: string | Date;
  last_inspection_date?: string | Date;
  next_inspection_date?: string | Date;
  created_at?: string | Date;
  // Add other relevant fields
}

/**
 * Exports a filtered list of PPE items to an Excel file.
 * @param ppeItems - Array of PPE item objects to export.
 * @param filenamePrefix - Prefix for the generated filename.
 * @returns True if export was successful, false otherwise.
 */
export const exportFilteredPPEToExcel = async (
  ppeItems: any[], // Use a more specific type like PPEItem if available
  filenamePrefix: string = 'PPEInventory'
): Promise<boolean> => {
  try {
    if (!ppeItems || ppeItems.length === 0) {
      console.warn('No PPE data provided for export.');
      return false;
    }

    // 1. Format data for the worksheet
    const dataForSheet = ppeItems.map(item => ({
      'Serial Number': item.serial_number || 'N/A',
      'Type': item.type || 'N/A',
      'Brand': item.brand || 'N/A',
      'Model': item.model_number || 'N/A',
      'Status': item.status?.toUpperCase() || 'N/A',
      'Manufacture Date': item.manufacturing_date 
          ? format(new Date(item.manufacturing_date), 'yyyy-MM-dd') 
          : 'N/A',
      'Expiry Date': item.expiry_date 
          ? format(new Date(item.expiry_date), 'yyyy-MM-dd') 
          : 'N/A',
      'Last Inspection': item.last_inspection_date 
          ? format(new Date(item.last_inspection_date), 'yyyy-MM-dd') 
          : 'N/A',
      'Next Inspection': item.next_inspection_date 
          ? format(new Date(item.next_inspection_date), 'yyyy-MM-dd') 
          : 'N/A',
      'Date Added': item.created_at 
          ? format(new Date(item.created_at), 'yyyy-MM-dd HH:mm') 
          : 'N/A',
      // Add other relevant fields
      'Location': item.location || 'N/A', // Example
    }));

    // 2. Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(dataForSheet);

    // Optional: Adjust column widths

    // 3. Create workbook and add worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'PPE Inventory');

    // 4. Generate filename and trigger download
    const timestamp = format(new Date(), 'yyyyMMdd_HHmmss');
    const filename = `${filenamePrefix}_${timestamp}.xlsx`;
    XLSX.writeFile(workbook, filename);

    console.log(`Successfully exported PPE data to ${filename}`);
    return true;

  } catch (error) {
    console.error("Error generating PPE Excel export:", error);
    return false;
  }
};

// Helper function to safely format dates
function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '';
  try {
    return new Date(dateStr).toLocaleDateString();
  } catch (e) {
    return '';
  }
}

export const formatPPEDataForExport = (item: any) => {
  return {
    'Serial Number': item.serial_number || '',
    'Type': item.type || '',
    'Brand': item.brand || '',
    'Model': item.model_number || '',
    'Manufacturing Date': formatDate(item.manufacturing_date),
    'Expiry Date': formatDate(item.expiry_date),
    'Status': item.status || '',
    'Batch Number': item.batch_number || '',
    'First Use Date': formatDate(item.first_use_date),
    'Next Inspection': formatDate(item.next_inspection || ''), // Using next_inspection consistently
  };
};

export const formatInspectionDataForExport = (inspection: any) => {
  // Add fallbacks for all possible undefined properties
  const inspector = inspection.profiles || {};
  const ppe = inspection.ppe_items || {};
  
  return {
    'Date': formatDateOrNA(inspection.date),
    'Type': inspection.type || '',
    'Result': inspection.overall_result || '',
    'Inspector': inspector.full_name || 'Unknown',
    'Role': inspector.employee_role || 'Unknown', // Using employee_role consistently
    'Department': inspector.department || 'Unknown',
    'PPE Type': ppe.type || 'Unknown',
    'PPE Serial': ppe.serial_number || 'Unknown',
    'Notes': inspection.notes || '',
    // ... keep existing code (other properties)
  };
};
