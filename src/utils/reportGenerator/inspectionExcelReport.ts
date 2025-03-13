
interface InspectionDetail {
  id: string;
  date: string;
  type: string;
  overall_result: string;
  notes: string | null;
  signature_url: string | null;
  inspector_name: string;
  ppe_type: string;
  ppe_serial: string;
  ppe_brand: string;
  ppe_model: string;
  checkpoints: {
    id: string;
    description: string;
    passed: boolean | null;
    notes: string | null;
    photo_url: string | null;
  }[];
}

export const generateInspectionExcelReport = async (inspection: InspectionDetail): Promise<void> => {
  try {
    // We'll use the SheetJS library when it's installed
    // For now, let's create a CSV as a fallback
    const rows: string[] = [];
    
    // Add header row
    rows.push('Inspection Report');
    rows.push(`Date: ${new Date(inspection.date).toLocaleDateString()}`);
    rows.push(`Type: ${inspection.type}`);
    rows.push(`Result: ${inspection.overall_result.toUpperCase()}`);
    rows.push(`Inspector: ${inspection.inspector_name}`);
    rows.push('');
    
    // Add equipment details
    rows.push('Equipment Details');
    rows.push('Type,Serial Number,Brand,Model');
    rows.push(`${inspection.ppe_type},${inspection.ppe_serial},${inspection.ppe_brand},${inspection.ppe_model}`);
    rows.push('');
    
    // Add checkpoints
    rows.push('Inspection Checkpoints');
    rows.push('Checkpoint,Result,Notes');
    
    inspection.checkpoints.forEach(checkpoint => {
      const result = checkpoint.passed === null ? 'N/A' : checkpoint.passed ? 'PASS' : 'FAIL';
      const notes = checkpoint.notes || '';
      // Escape commas and quotes in notes
      const escapedNotes = notes.replace(/"/g, '""');
      rows.push(`"${checkpoint.description}",${result},"${escapedNotes}"`);
    });
    
    rows.push('');
    
    // Add additional notes
    rows.push('Additional Notes');
    rows.push(`"${inspection.notes || 'No additional notes provided.'}"`);
    
    // Convert to CSV content
    const csvContent = rows.join('\n');
    
    // Create a Blob with the CSV content
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    
    // Create a download link
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `inspection_${inspection.ppe_serial}_${new Date(inspection.date).toISOString().split('T')[0]}.csv`);
    
    // Append to body, click, and remove
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
  } catch (error) {
    console.error('Error generating Excel report:', error);
    throw error;
  }
};
