
// src/utils/exportUtils.ts
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { safeGet } from '@/utils/typeUtils';

interface Inspector {
  full_name?: string | null;
  Employee_Role?: string | null;
  department?: string | null;
  site_name?: string | null;
  [key: string]: any;
}

interface PPEItem {
  type?: string | null;
  serial_number?: string | null;
  brand?: string | null;
  model_number?: string | null;
  [key: string]: any;
}

interface InspectionData {
  id: string;
  date: string;
  type: string;
  overall_result: string;
  inspector_id?: string;
  notes?: string | null;
  profiles?: Inspector | null;
  ppe_items?: PPEItem | null;
  [key: string]: any;
}

// Function to export filtered inspections to Excel
export const exportFilteredInspectionsToExcel = (inspections: any[], filenamePrefix: string = 'InspectionHistory') => {
  // Create worksheet data
  const worksheetData = [
    ['Inspection ID', 'Date', 'Type', 'Result', 'PPE Type', 'Serial Number', 'Inspector', 'Role', 'Department']
  ];

  // Add inspection data to worksheet
  inspections.forEach(inspection => {
    worksheetData.push([
      inspection.id || '',
      inspection.date ? format(new Date(inspection.date), 'PPP') : '',
      inspection.type || '',
      inspection.overall_result || '',
      inspection.ppe_type || '',
      inspection.ppe_serial || '',
      inspection.inspector_name || '',
      '', // Role will be populated for detailed exports
      ''  // Department will be populated for detailed exports
    ]);
  });

  // Create workbook and worksheet
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(worksheetData);

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, 'Inspections');

  // Generate Excel file
  const filename = `${filenamePrefix}_${format(new Date(), 'yyyy-MM-dd')}.xlsx`;
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([wbout], { type: 'application/octet-stream' });
  
  // Save file
  saveAs(blob, filename);
};

// Function to export detailed inspection data for a specific date range
export async function exportDetailedInspections(startDate: Date, endDate: Date, inspectorId?: string) {
  // Fetch inspections within the date range
  const query = supabase
    .from('inspections')
    .select(`
      id, date, type, overall_result, notes, inspector_id,
      profiles:inspector_id(*),
      ppe_items:ppe_id(*)
    `)
    .gte('date', format(startDate, 'yyyy-MM-dd'))
    .lte('date', format(endDate, 'yyyy-MM-dd'));

  // Add inspector filter if provided
  if (inspectorId) {
    query.eq('inspector_id', inspectorId);
  }

  const { data, error } = await query.order('date', { ascending: false });

  if (error) {
    console.error('Error fetching inspections for export:', error);
    throw new Error('Failed to fetch inspection data for export');
  }

  // Create worksheet data
  const worksheetData = [
    [
      'Inspection ID', 'Date', 'Type', 'Result', 'Notes',
      'PPE Type', 'Serial Number', 'Brand', 'Model',
      'Inspector Name', 'Inspector Role', 'Department', 'Site'
    ]
  ];

  // Add each inspection to the worksheet
  data.forEach((inspection: InspectionData) => {
    const inspector: Inspector = safeGet(inspection.profiles, {});
    const ppeItem: PPEItem = safeGet(inspection.ppe_items, {});

    worksheetData.push([
      inspection.id || '',
      inspection.date ? format(new Date(inspection.date), 'PPP') : '',
      inspection.type || '',
      inspection.overall_result || '',
      inspection.notes || '',
      safeGet(ppeItem.type, ''),
      safeGet(ppeItem.serial_number, ''),
      safeGet(ppeItem.brand, ''),
      safeGet(ppeItem.model_number, ''),
      safeGet(inspector.full_name, 'Unknown'),
      safeGet(inspector.Employee_Role, ''),
      safeGet(inspector.department, ''),
      safeGet(inspector.site_name, '')
    ]);
  });

  // Create and save Excel file
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(worksheetData);

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, 'Detailed Inspections');

  // Generate Excel file
  const dateRange = `${format(startDate, 'yyyy-MM-dd')}_to_${format(endDate, 'yyyy-MM-dd')}`;
  const filename = `InspectionReport_${dateRange}.xlsx`;
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([wbout], { type: 'application/octet-stream' });
  
  // Save file
  saveAs(blob, filename);
  
  return {
    filename,
    recordCount: data.length
  };
}

// Export for PPE items
export const exportPPEItemsToExcel = (ppeItems: any[], filenamePrefix: string = 'PPEInventory') => {
  // Create worksheet data
  const worksheetData = [
    ['ID', 'Type', 'Serial Number', 'Brand', 'Model Number', 'Manufacturing Date', 'Expiry Date', 'Status', 'Next Inspection']
  ];

  // Add PPE item data to worksheet
  ppeItems.forEach(item => {
    worksheetData.push([
      item.id || '',
      item.type || '',
      item.serial_number || item.serialNumber || '',
      item.brand || '',
      item.model_number || item.modelNumber || '',
      item.manufacturing_date || item.manufacturingDate ? format(new Date(item.manufacturing_date || item.manufacturingDate), 'PPP') : '',
      item.expiry_date || item.expiryDate ? format(new Date(item.expiry_date || item.expiryDate), 'PPP') : '',
      item.status || '',
      item.next_inspection || item.nextInspection ? format(new Date(item.next_inspection || item.nextInspection), 'PPP') : ''
    ]);
  });

  // Create workbook and worksheet
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(worksheetData);

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, 'PPE Items');

  // Generate Excel file
  const filename = `${filenamePrefix}_${format(new Date(), 'yyyy-MM-dd')}.xlsx`;
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([wbout], { type: 'application/octet-stream' });
  
  // Save file
  saveAs(blob, filename);
};

// Function placeholder for filtering PPE items before export
export const exportFilteredPPEToExcel = (ppeItems: any[], filenamePrefix: string = 'FilteredPPE') => {
  exportPPEItemsToExcel(ppeItems, filenamePrefix);
};
