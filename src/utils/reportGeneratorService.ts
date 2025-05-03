
import { supabase } from '@/integrations/supabase/client';
import { safeGet } from './typeUtils';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { format } from 'date-fns';
import { saveAs } from 'file-saver';

interface Inspector {
  full_name?: string | null;
  site_name?: string | null;
  [key: string]: any;
}

interface PPEItem {
  type?: string | null;
  serial_number?: string | null;
  brand?: string | null;
  model_number?: string | null;
  manufacturing_date?: string | null;
  expiry_date?: string | null;
  batch_number?: string | null;
  [key: string]: any;
}

interface InspectionCheckpoint {
  id: string;
  description: string;
  passed: boolean | null;
  notes: string | null;
  photo_url?: string | null;
}

export interface InspectionData {
  id: string;
  date: string;
  type: string;
  overall_result: string;
  notes: string;
  signature_url: string | null;
  inspector_id: string;
  inspector_name: string;
  site_name: string;
  ppe_type: string;
  ppe_serial: string;
  ppe_brand: string;
  ppe_model: string;
  manufacturing_date: string | null;
  expiry_date: string | null;
  batch_number: string;
  photoUrl: string | null;
  checkpoints: InspectionCheckpoint[];
}

export async function fetchCompleteInspectionData(supabaseClient: typeof supabase, inspectionId: string): Promise<InspectionData> {
  // Fetch the inspection record with related data
  const { data, error } = await supabaseClient
    .from('inspections')
    .select(`
      id, date, type, overall_result, notes, signature_url,
      profiles:inspector_id(*),
      ppe_items:ppe_id(type, serial_number, brand, model_number, manufacturing_date, expiry_date, batch_number)
    `)
    .eq('id', inspectionId)
    .single();

  if (error) throw error;
  if (!data) throw new Error('Inspection not found');

  // Fetch the inspection checkpoints
  const { data: checkpointsData, error: checkpointsError } = await supabaseClient
    .from('inspection_results')
    .select(`
      id, passed, notes, photo_url,
      inspection_checkpoints:checkpoint_id(description)
    `)
    .eq('inspection_id', inspectionId);

  if (checkpointsError) throw checkpointsError;

  // Create inspection details object with safe fallbacks
  const inspector: Inspector = safeGet(data.profiles, {});
  const ppeItem: PPEItem = safeGet(data.ppe_items, {});

  return {
    id: data.id,
    date: data.date,
    type: data.type,
    overall_result: data.overall_result,
    notes: data.notes || '',
    signature_url: data.signature_url,
    inspector_id: data.inspector_id || '',
    inspector_name: safeGet(inspector.full_name, 'Unknown'),
    site_name: safeGet(inspector.site_name, 'Unknown'),
    ppe_type: safeGet(ppeItem.type, 'Unknown'),
    ppe_serial: safeGet(ppeItem.serial_number, 'Unknown'),
    ppe_brand: safeGet(ppeItem.brand, 'Unknown'),
    ppe_model: safeGet(ppeItem.model_number, 'Unknown'),
    manufacturing_date: safeGet(ppeItem.manufacturing_date, null),
    expiry_date: safeGet(ppeItem.expiry_date, null),
    batch_number: safeGet(ppeItem.batch_number, ''),
    photoUrl: null,
    checkpoints: checkpointsData.map(cp => ({
      id: cp.id,
      description: cp.inspection_checkpoints?.description || 'Unknown checkpoint',
      passed: cp.passed,
      notes: cp.notes || '',
      photo_url: cp.photo_url
    }))
  };
}

export async function generatePPEItemReport(ppeId: string, format: 'pdf' | 'excel' = 'pdf') {
  try {
    // Fetch PPE details
    const { data: ppeData, error: ppeError } = await supabase
      .from('ppe_items')
      .select('*')
      .eq('id', ppeId)
      .single();
      
    if (ppeError) throw ppeError;
    if (!ppeData) throw new Error('PPE item not found');
    
    // Fetch inspection history
    const { data: inspections, error: inspectionsError } = await supabase
      .from('inspections')
      .select(`
        id, date, type, overall_result, notes,
        profiles:inspector_id(full_name)
      `)
      .eq('ppe_id', ppeId)
      .order('date', { ascending: false });
      
    if (inspectionsError) throw inspectionsError;
    
    // Generate the appropriate format report
    if (format === 'pdf') {
      return generatePPEPdfReport(ppeData, inspections || []);
    } else {
      return generatePPEExcelReport(ppeData, inspections || []);
    }
  } catch (error) {
    console.error('Error generating PPE report:', error);
    throw new Error('Failed to generate PPE report');
  }
}

function generatePPEPdfReport(ppeData: any, inspections: any[]) {
  // Create a new PDF document
  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(20);
  doc.text('PPE Item Report', 105, 20, { align: 'center' });
  
  // Add PPE details
  doc.setFontSize(14);
  doc.text('PPE Details', 20, 40);
  
  doc.setFontSize(11);
  const details = [
    ['Type', ppeData.type || 'N/A'],
    ['Serial Number', ppeData.serial_number || 'N/A'],
    ['Brand', ppeData.brand || 'N/A'],
    ['Model', ppeData.model_number || 'N/A'],
    ['Manufacturing Date', ppeData.manufacturing_date ? format(new Date(ppeData.manufacturing_date), 'PP') : 'N/A'],
    ['Expiry Date', ppeData.expiry_date ? format(new Date(ppeData.expiry_date), 'PP') : 'N/A'],
    ['Status', ppeData.status || 'N/A'],
    ['Next Inspection', ppeData.next_inspection ? format(new Date(ppeData.next_inspection), 'PP') : 'N/A']
  ];
  
  // @ts-ignore
  doc.autoTable({
    startY: 45,
    head: [['Property', 'Value']],
    body: details,
    theme: 'striped',
    headStyles: { fillColor: [41, 128, 185], textColor: [255, 255, 255] },
    margin: { top: 45 }
  });
  
  // Add inspection history
  doc.setFontSize(14);
  // @ts-ignore
  doc.text('Inspection History', 20, doc.autoTable.previous.finalY + 15);
  
  if (inspections.length === 0) {
    doc.setFontSize(11);
    // @ts-ignore
    doc.text('No inspection records found', 20, doc.autoTable.previous.finalY + 25);
  } else {
    const inspectionRows = inspections.map(inspection => [
      format(new Date(inspection.date), 'PP'),
      inspection.type || 'N/A',
      inspection.overall_result || 'N/A',
      inspection.profiles?.full_name || 'Unknown',
      inspection.notes || ''
    ]);
    
    // @ts-ignore
    doc.autoTable({
      // @ts-ignore
      startY: doc.autoTable.previous.finalY + 20,
      head: [['Date', 'Type', 'Result', 'Inspector', 'Notes']],
      body: inspectionRows,
      theme: 'striped',
      headStyles: { fillColor: [41, 128, 185], textColor: [255, 255, 255] }
    });
  }
  
  // Add footer
  const pageCount = doc.getNumberOfPages();
  for(let i=1; i<=pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.text(`Report generated on ${format(new Date(), 'PPP')} - Page ${i} of ${pageCount}`, 105, 287, { align: 'center' });
  }
  
  // Save the PDF
  doc.save(`PPE_Report_${ppeData.serial_number}_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
  
  return {
    success: true,
    filename: `PPE_Report_${ppeData.serial_number}_${format(new Date(), 'yyyy-MM-dd')}.pdf`
  };
}

function generatePPEExcelReport(ppeData: any, inspections: any[]) {
  // Create workbook
  const wb = XLSX.utils.book_new();
  
  // Create PPE details worksheet
  const detailsData = [
    ['Property', 'Value'],
    ['Type', ppeData.type || 'N/A'],
    ['Serial Number', ppeData.serial_number || 'N/A'],
    ['Brand', ppeData.brand || 'N/A'],
    ['Model', ppeData.model_number || 'N/A'],
    ['Manufacturing Date', ppeData.manufacturing_date || 'N/A'],
    ['Expiry Date', ppeData.expiry_date || 'N/A'],
    ['Status', ppeData.status || 'N/A'],
    ['Next Inspection', ppeData.next_inspection || 'N/A']
  ];
  
  const detailsWs = XLSX.utils.aoa_to_sheet(detailsData);
  XLSX.utils.book_append_sheet(wb, detailsWs, 'PPE Details');
  
  // Create inspection history worksheet
  const inspectionData = [
    ['Date', 'Type', 'Result', 'Inspector', 'Notes']
  ];
  
  inspections.forEach(inspection => {
    inspectionData.push([
      inspection.date || 'N/A',
      inspection.type || 'N/A',
      inspection.overall_result || 'N/A',
      inspection.profiles?.full_name || 'Unknown',
      inspection.notes || ''
    ]);
  });
  
  const inspectionsWs = XLSX.utils.aoa_to_sheet(inspectionData);
  XLSX.utils.book_append_sheet(wb, inspectionsWs, 'Inspection History');
  
  // Generate Excel file
  const filename = `PPE_Report_${ppeData.serial_number}_${format(new Date(), 'yyyy-MM-dd')}.xlsx`;
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([wbout], { type: 'application/octet-stream' });
  
  // Save file
  saveAs(blob, filename);
  
  return {
    success: true,
    filename: filename
  };
}

export async function generateInspectionsDateReport(startDate: Date, endDate: Date, format: 'pdf' | 'excel' = 'pdf') {
  try {
    // Fetch inspections within date range
    const { data: inspections, error: inspectionsError } = await supabase
      .from('inspections')
      .select(`
        id, date, type, overall_result, notes, 
        profiles:inspector_id(full_name, site_name),
        ppe_items:ppe_id(type, serial_number, brand, model_number)
      `)
      .gte('date', startDate.toISOString())
      .lte('date', endDate.toISOString())
      .order('date', { ascending: false });
      
    if (inspectionsError) throw inspectionsError;
    
    // Generate report in selected format
    if (format === 'pdf') {
      return generateInspectionsPdfReport(inspections || [], startDate, endDate);
    } else {
      return generateInspectionsExcelReport(inspections || [], startDate, endDate);
    }
  } catch (error) {
    console.error('Error generating date range report:', error);
    throw new Error('Failed to generate inspection report for date range');
  }
}

function generateInspectionsPdfReport(inspections: any[], startDate: Date, endDate: Date) {
  // Implementation similar to generatePPEPdfReport, but for a collection of inspections
  const doc = new jsPDF();
  
  // Add title and date range
  doc.setFontSize(20);
  doc.text('Inspections Report', 105, 20, { align: 'center' });
  
  doc.setFontSize(12);
  doc.text(`Date Range: ${format(startDate, 'PP')} to ${format(endDate, 'PP')}`, 105, 30, { align: 'center' });
  
  // Add inspection data
  if (inspections.length === 0) {
    doc.setFontSize(14);
    doc.text('No inspection records found in this date range', 105, 50, { align: 'center' });
  } else {
    const inspectionRows = inspections.map(inspection => {
      const inspector = inspection.profiles || {};
      const ppeItem = inspection.ppe_items || {};
      
      return [
        format(new Date(inspection.date), 'PP'),
        inspection.type || 'N/A',
        inspection.overall_result || 'N/A',
        safeGet(inspector.full_name, 'Unknown'),
        safeGet(ppeItem.type, 'Unknown'),
        safeGet(ppeItem.serial_number, 'Unknown'),
        inspection.notes || ''
      ];
    });
    
    // @ts-ignore
    doc.autoTable({
      startY: 40,
      head: [['Date', 'Type', 'Result', 'Inspector', 'PPE Type', 'Serial Number', 'Notes']],
      body: inspectionRows,
      theme: 'striped',
      headStyles: { fillColor: [41, 128, 185], textColor: [255, 255, 255] },
      margin: { top: 40 }
    });
  }
  
  // Add footer
  const pageCount = doc.getNumberOfPages();
  for(let i=1; i<=pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.text(`Report generated on ${format(new Date(), 'PPP')} - Page ${i} of ${pageCount}`, 105, 287, { align: 'center' });
  }
  
  // Save the PDF
  const filename = `Inspections_${format(startDate, 'yyyy-MM-dd')}_to_${format(endDate, 'yyyy-MM-dd')}.pdf`;
  doc.save(filename);
  
  return {
    success: true,
    filename: filename,
    recordCount: inspections.length
  };
}

function generateInspectionsExcelReport(inspections: any[], startDate: Date, endDate: Date) {
  // Create workbook
  const wb = XLSX.utils.book_new();
  
  // Create summary worksheet
  const summaryData = [
    ['Inspections Report'],
    [`Date Range: ${format(startDate, 'PP')} to ${format(endDate, 'PP')}`],
    [`Total Inspections: ${inspections.length}`],
    [`Generated on: ${format(new Date(), 'PPP')}`]
  ];
  
  const summaryWs = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, summaryWs, 'Summary');
  
  // Create inspections worksheet
  const inspectionData = [
    ['Date', 'Type', 'Result', 'Inspector', 'Site', 'PPE Type', 'Serial Number', 'Brand', 'Model', 'Notes']
  ];
  
  inspections.forEach(inspection => {
    const inspector = inspection.profiles || {};
    const ppeItem = inspection.ppe_items || {};
    
    inspectionData.push([
      inspection.date ? format(new Date(inspection.date), 'PP') : 'N/A',
      inspection.type || 'N/A',
      inspection.overall_result || 'N/A',
      safeGet(inspector.full_name, 'Unknown'),
      safeGet(inspector.site_name, 'Unknown'),
      safeGet(ppeItem.type, 'Unknown'),
      safeGet(ppeItem.serial_number, 'Unknown'),
      safeGet(ppeItem.brand, 'Unknown'),
      safeGet(ppeItem.model_number, 'Unknown'),
      inspection.notes || ''
    ]);
  });
  
  const inspectionsWs = XLSX.utils.aoa_to_sheet(inspectionData);
  XLSX.utils.book_append_sheet(wb, inspectionsWs, 'Inspections');
  
  // Generate Excel file
  const filename = `Inspections_${format(startDate, 'yyyy-MM-dd')}_to_${format(endDate, 'yyyy-MM-dd')}.xlsx`;
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([wbout], { type: 'application/octet-stream' });
  
  // Save file
  saveAs(blob, filename);
  
  return {
    success: true,
    filename: filename,
    recordCount: inspections.length
  };
}
