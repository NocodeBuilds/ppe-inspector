
import { format } from 'date-fns';

interface InspectionDataForExport {
  id: string;
  date: string;
  type: string;
  overall_result: string;
  inspector_name: string;
  ppe_type: string;
  ppe_serial: string;
  ppe_brand: string;
  ppe_model: string;
}

/**
 * Export inspection data to Excel format
 */
export const exportFilteredInspectionsToExcel = (
  inspections: InspectionDataForExport[], 
  filenamePrefix: string = 'InspectionReport'
) => {
  if (!inspections || inspections.length === 0) {
    throw new Error('No inspection data to export');
  }

  // CSV Headers
  const headers = [
    'ID',
    'Date',
    'Type',
    'Result',
    'Inspector',
    'Equipment Type',
    'Serial Number',
    'Brand',
    'Model'
  ];

  // Convert data to CSV rows
  const csvRows = [
    headers.join(','), // Header row
    ...inspections.map(inspection => {
      const date = inspection.date ? format(new Date(inspection.date), 'yyyy-MM-dd') : 'N/A';
      const type = inspection.type || 'N/A';
      const result = inspection.overall_result || 'N/A';
      const inspectorName = (inspection.inspector_name || 'Unknown').replace(/,/g, ' '); 
      const ppeType = (inspection.ppe_type || 'Unknown').replace(/,/g, ' ');
      const serialNumber = (inspection.ppe_serial || 'Unknown').replace(/,/g, ' ');
      const brand = (inspection.ppe_brand || 'Unknown').replace(/,/g, ' ');
      const model = (inspection.ppe_model || 'Unknown').replace(/,/g, ' ');

      return [
        inspection.id,
        date,
        type,
        result,
        inspectorName,
        ppeType,
        serialNumber,
        brand,
        model
      ].join(',');
    })
  ];

  // Create CSV content
  const csvContent = `data:text/csv;charset=utf-8,${csvRows.join('\n')}`;
  
  // Create filename with date stamp
  const timestamp = format(new Date(), 'yyyyMMdd_HHmmss');
  const filename = `${filenamePrefix}_${timestamp}.csv`;

  // Create download link
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  
  // Download file
  link.click();
  
  // Cleanup
  document.body.removeChild(link);
};

/**
 * Utility function to fetch complete inspection data for reporting
 */
export async function fetchCompleteInspectionData(supabase, inspectionId) {
  try {
    // Fetch inspection with related data
    const { data, error } = await supabase
      .from('inspections')
      .select(`
        id, date, type, overall_result, notes, signature_url,
        profiles:inspector_id(*),
        ppe_items:ppe_id(*)
      `)
      .eq('id', inspectionId)
      .single();
      
    if (error) throw error;
    if (!data) throw new Error('Inspection not found');
    
    // Fetch checkpoint results
    const { data: checkpointsData, error: checkpointsError } = await supabase
      .from('inspection_results')
      .select(`
        id, passed, notes, photo_url,
        inspection_checkpoints:checkpoint_id(description)
      `)
      .eq('inspection_id', inspectionId);
      
    if (checkpointsError) throw checkpointsError;
    
    // Create inspection details object
    const inspector = data.profiles || {};
    const ppeItem = data.ppe_items || {};
    
    return {
      id: data.id,
      date: data.date,
      type: data.type,
      overall_result: data.overall_result,
      notes: data.notes || '',
      signature_url: data.signature_url || null,
      inspector_id: data.inspector_id,
      inspector_name: inspector.full_name || 'Unknown',
      site_name: inspector.site_name || 'Unknown',
      department: inspector.department || 'Unknown',
      employee_role: inspector.employee_role || 'Unknown',
      ppe_type: ppeItem.type || 'Unknown',
      ppe_serial: ppeItem.serial_number || 'Unknown',
      ppe_brand: ppeItem.brand || 'Unknown',
      ppe_model: ppeItem.model_number || 'Unknown',
      manufacturing_date: ppeItem.manufacturing_date || null,
      expiry_date: ppeItem.expiry_date || null,
      batch_number: ppeItem.batch_number || '',
      checkpoints: checkpointsData.map(cp => ({
        id: cp.id,
        description: cp.inspection_checkpoints?.description || '',
        passed: cp.passed,
        notes: cp.notes || '',
        photo_url: cp.photo_url || null
      }))
    };
  } catch (error) {
    console.error('Error fetching complete inspection data:', error);
    throw error;
  }
}
