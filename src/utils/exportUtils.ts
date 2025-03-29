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
        'Last Inspection': formatDateOrNA(item.last_inspection),
        'Next Inspection': formatDateOrNA(item.next_inspection)
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
          Employee_Role,
          department
        ),
        ppe_items:ppe_id (type, serial_number)
      `);
    
    if (error) throw error;
    
    if (data && data.length > 0) {
      // Format data for Excel
      const formattedData = data.map(item => ({
        'Date': formatDateOrNA(item.date),
        'Type': item.type,
        'Result': item.overall_result,
        'Inspector': item.profiles?.full_name || 'Unknown',
        'Role': item.profiles?.Employee_Role || 'Unknown',
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
