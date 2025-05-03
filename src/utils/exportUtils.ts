
import * as XLSX from 'xlsx';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { PPEItem } from '@/types/ppe';

/**
 * Exports filtered inspections to Excel file
 * @param inspections - The filtered inspections data to export
 * @param filenamePrefix - Optional prefix for the export filename
 */
export function exportFilteredInspectionsToExcel(inspections: any[], filenamePrefix = 'InspectionHistory') {
  try {
    // Transform data for better Excel formatting
    const formattedData = inspections.map(item => ({
      'Date': format(new Date(item.date), 'yyyy-MM-dd'),
      'Type': item.type,
      'Result': item.overall_result,
      'Inspector': item.inspector_name,
      'Equipment Type': item.ppe_type,
      'Serial Number': item.ppe_serial,
      'Brand': item.ppe_brand,
      'Model': item.ppe_model
    }));
    
    // Create a worksheet and workbook
    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Inspections");
    
    // Set column widths
    const columnWidths = [
      { wch: 12 }, // Date
      { wch: 10 }, // Type
      { wch: 6 }, // Result
      { wch: 20 }, // Inspector
      { wch: 20 }, // Equipment Type
      { wch: 15 }, // Serial Number
      { wch: 15 }, // Brand
      { wch: 15 }  // Model
    ];
    worksheet["!cols"] = columnWidths;
    
    // Generate filename with date
    const currentDate = format(new Date(), 'yyyy-MM-dd');
    const filename = `${filenamePrefix}_${currentDate}.xlsx`;
    
    // Write and download
    XLSX.writeFile(workbook, filename);
    return filename;
  } catch (error) {
    console.error('Error exporting inspections to Excel:', error);
    throw error;
  }
}

/**
 * Generates and exports inspector report with stats
 */
export async function generateInspectorReport(startDate: Date, endDate: Date) {
  try {
    // Fetch inspections within date range
    const { data: inspectionsData, error: inspectionsError } = await supabase
      .from('inspections')
      .select(`
        id, date, type, overall_result, notes,
        profiles:inspector_id(*),
        ppe_items:ppe_id(type, serial_number)
      `)
      .gte('date', startDate.toISOString())
      .lte('date', endDate.toISOString());
      
    if (inspectionsError) throw inspectionsError;
    
    // Group by inspector and calculate stats
    const inspectorStats = {};
    
    inspectionsData.forEach(inspection => {
      const inspector = inspection.profiles || {};
      const inspectorId = inspection.inspector_id;
      
      if (!inspectorId) return;
      
      if (!inspectorStats[inspectorId]) {
        inspectorStats[inspectorId] = {
          inspectorName: inspector.full_name || 'Unknown',
          role: inspector.Employee_Role || 'Unknown',
          department: inspector.department || 'Unknown',
          totalInspections: 0,
          passCount: 0,
          failCount: 0,
          byType: {}
        };
      }
      
      const stats = inspectorStats[inspectorId];
      stats.totalInspections++;
      
      if (inspection.overall_result === 'pass') {
        stats.passCount++;
      } else {
        stats.failCount++;
      }
      
      // Count by inspection type
      const type = inspection.type || 'unknown';
      if (!stats.byType[type]) {
        stats.byType[type] = 0;
      }
      stats.byType[type]++;
    });
    
    // Format data for Excel
    const reportRows = Object.values(inspectorStats).map((stats: any) => ({
      'Inspector Name': stats.inspectorName,
      'Role': stats.role,
      'Department': stats.department,
      'Total Inspections': stats.totalInspections,
      'Pass': stats.passCount,
      'Fail': stats.failCount,
      'Pass Rate': stats.totalInspections > 0 
        ? `${(stats.passCount / stats.totalInspections * 100).toFixed(1)}%` 
        : 'N/A',
      'Pre-Use Inspections': stats.byType['pre-use'] || 0,
      'Monthly Inspections': stats.byType['monthly'] || 0,
      'Quarterly Inspections': stats.byType['quarterly'] || 0
    }));
    
    // Create and download Excel
    const worksheet = XLSX.utils.json_to_sheet(reportRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Inspector Report");
    
    const filename = `Inspector_Report_${format(startDate, 'yyyy-MM-dd')}_to_${format(endDate, 'yyyy-MM-dd')}.xlsx`;
    XLSX.writeFile(workbook, filename);
    
    return filename;
  } catch (error) {
    console.error('Error generating inspector report:', error);
    throw error;
  }
}

/**
 * Exports filtered PPE items to Excel
 * @param ppeItems - The filtered PPE items to export
 * @param filenamePrefix - Optional prefix for the file name
 */
export function exportFilteredPPEToExcel(ppeItems: PPEItem[], filenamePrefix = 'PPE_Inventory') {
  try {
    // Transform data for better Excel formatting
    const formattedData = ppeItems.map(item => ({
      'Type': item.type,
      'Serial Number': item.serialNumber,
      'Brand': item.brand || '',
      'Model': item.modelNumber || '',
      'Manufacturing Date': item.manufacturingDate ? format(new Date(item.manufacturingDate), 'yyyy-MM-dd') : '',
      'Expiry Date': item.expiryDate ? format(new Date(item.expiryDate), 'yyyy-MM-dd') : '',
      'Status': item.status,
      'Next Inspection': item.nextInspection ? format(new Date(item.nextInspection), 'yyyy-MM-dd') : '',
      'Last Inspection': item.lastInspection ? format(new Date(item.lastInspection), 'yyyy-MM-dd') : ''
    }));
    
    // Create worksheet and workbook
    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "PPE Inventory");
    
    // Set column widths
    const columnWidths = [
      { wch: 20 }, // Type
      { wch: 15 }, // Serial Number
      { wch: 15 }, // Brand
      { wch: 15 }, // Model
      { wch: 15 }, // Manufacturing Date
      { wch: 15 }, // Expiry Date
      { wch: 10 }, // Status
      { wch: 15 }, // Next Inspection
      { wch: 15 }  // Last Inspection
    ];
    worksheet["!cols"] = columnWidths;
    
    // Generate filename with date
    const currentDate = format(new Date(), 'yyyy-MM-dd');
    const filename = `${filenamePrefix}_${currentDate}.xlsx`;
    
    // Write and download
    XLSX.writeFile(workbook, filename);
    return filename;
  } catch (error) {
    console.error('Error exporting PPE items to Excel:', error);
    throw error;
  }
}
