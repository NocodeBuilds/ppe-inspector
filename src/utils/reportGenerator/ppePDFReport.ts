
import { supabase } from '@/integrations/supabase/client';
import { 
  createPDFDocument, 
  addPDFHeader, 
  addSectionTitle, 
  addDataTable, 
  addPDFFooter, 
  formatDateOrNA,
  savePDF,
  ExtendedJsPDF 
} from '@/utils/pdfUtils';

/**
 * Generates and downloads a PDF report for a specific PPE item
 * @param ppeId - The ID of the PPE item to generate a report for
 */
export const generatePPEReport = async (ppeId: string): Promise<void> => {
  try {
    // Fetch PPE data
    const { data: ppeData, error: ppeError } = await supabase
      .from('ppe_items')
      .select('*')
      .eq('id', ppeId)
      .single();
    
    if (ppeError) throw ppeError;
    if (!ppeData) throw new Error('PPE item not found');
    
    // Fetch latest inspection data
    const { data: inspectionData, error: inspectionError } = await supabase
      .from('inspections')
      .select(`
        *,
        inspection_results (*)
      `)
      .eq('ppe_id', ppeId)
      .order('date', { ascending: false })
      .limit(1);
    
    if (inspectionError) throw inspectionError;
    
    // Initialize PDF document
    const doc = createPDFDocument();
    
    // Add title
    addPDFHeader(doc, 'PPE Inspection Report');
    
    // Add PPE details
    addSectionTitle(doc, 'PPE Details', 30);
    
    const ppeInfo = [
      ['Serial Number', ppeData.serial_number],
      ['Type', ppeData.type],
      ['Brand', ppeData.brand],
      ['Model Number', ppeData.model_number],
      ['Manufacturing Date', formatDateOrNA(ppeData.manufacturing_date)],
      ['Expiry Date', formatDateOrNA(ppeData.expiry_date)],
      ['Status', ppeData.status.toUpperCase()],
    ];
    
    addDataTable(doc, [['Property', 'Value']], ppeInfo, 35);
    
    // Add inspection details if available
    if (inspectionData && inspectionData.length > 0) {
      const inspection = inspectionData[0];
      
      const finalY = doc.lastAutoTable?.finalY || 35;
      addSectionTitle(doc, 'Latest Inspection Details', finalY + 15);
      
      // Get next inspection date from the PPE item if available, as it might be more up-to-date
      const nextInspectionDate = ppeData.next_inspection 
        ? formatDateOrNA(ppeData.next_inspection)
        : 'N/A';
      
      const inspectionInfo = [
        ['Inspection Date', formatDateOrNA(inspection.date)],
        ['Inspector', inspection.inspector_id],
        ['Result', inspection.overall_result === 'pass' ? 'PASS' : 'FAIL'],
        ['Next Inspection Due', nextInspectionDate],
      ];
      
      addDataTable(doc, [['Property', 'Value']], inspectionInfo, (doc.lastAutoTable?.finalY || 35) + 20);
      
      // Add inspection results if available
      if (inspection.inspection_results && inspection.inspection_results.length > 0) {
        addSectionTitle(doc, 'Inspection Checkpoints', (doc.lastAutoTable?.finalY || 35) + 15);
        
        const checkpointData = inspection.inspection_results.map((result: any) => [
          result.checkpoint_description || result.checkpoint_id,
          result.passed ? 'PASS' : 'FAIL',
          result.notes || 'N/A'
        ]);
        
        addDataTable(
          doc, 
          [['Checkpoint', 'Result', 'Notes']], 
          checkpointData, 
          (doc.lastAutoTable?.finalY || 35) + 20
        );
      }
      
      // Add signature if available
      if (inspection.signature_url) {
        addSectionTitle(doc, 'Inspector Signature', (doc.lastAutoTable?.finalY || 35) + 15);
        
        // Add signature image
        try {
          const img = new Image();
          img.src = inspection.signature_url;
          doc.addImage(img, 'PNG', 14, (doc.lastAutoTable?.finalY || 35) + 20, 80, 30);
        } catch (e) {
          console.error('Error adding signature to PDF:', e);
          doc.text('Signature available but could not be displayed', 14, (doc.lastAutoTable?.finalY || 35) + 25);
        }
      }
    } else {
      doc.setFontSize(12);
      doc.text('No inspection records found for this PPE item.', 14, (doc.lastAutoTable?.finalY || 35) + 15);
    }
    
    // Add footer
    addPDFFooter(doc, `Generated on ${new Date().toLocaleString()}`);
    
    // Generate filename
    const filename = `PPE_Report_${ppeData.serial_number}_${new Date().toISOString().split('T')[0]}.pdf`;
    
    // Save the PDF
    savePDF(doc, filename);
    
  } catch (error) {
    console.error('Error generating PPE report:', error);
    throw error;
  }
};
