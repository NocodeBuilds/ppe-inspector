
import { format } from 'date-fns';
import { InspectionDetails } from '@/types/ppe';

/**
 * Generates a PDF for inspection details
 * @param inspection - The inspection data to generate the PDF from
 */
export const generateInspectionDetailPDF = async (inspection: InspectionDetails) => {
  try {
    // Using browser's window.print for now as a simple solution
    // In a production environment, you might want to use a library like jsPDF or pdfmake
    
    // Create a temporary div to hold the content
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      throw new Error('Could not open print window. Please check if popups are blocked.');
    }
    
    const content = `
      <html>
        <head>
          <title>Inspection Report - ${inspection.ppe_serial}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 800px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 2px solid #333;
              padding-bottom: 10px;
            }
            .section {
              margin-bottom: 20px;
              border-bottom: 1px solid #eee;
              padding-bottom: 15px;
            }
            .section-title {
              font-size: 18px;
              font-weight: bold;
              margin-bottom: 10px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 20px;
            }
            table, th, td {
              border: 1px solid #ddd;
            }
            th, td {
              padding: 10px;
              text-align: left;
            }
            th {
              background-color: #f2f2f2;
            }
            .result-pass {
              color: green;
              font-weight: bold;
            }
            .result-fail {
              color: red;
              font-weight: bold;
            }
            .checkpoint-pass {
              background-color: rgba(0, 128, 0, 0.1);
            }
            .checkpoint-fail {
              background-color: rgba(255, 0, 0, 0.1);
            }
            .footer {
              margin-top: 30px;
              text-align: center;
              font-size: 12px;
              color: #666;
            }
            .signature-container {
              margin-top: 20px;
              border-top: 1px solid #ddd;
              padding-top: 10px;
            }
            img.signature {
              max-width: 200px;
              max-height: 80px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>PPE Inspection Report</h1>
            <p>Generated on ${format(new Date(), 'PPP')}</p>
          </div>
          
          <div class="section">
            <div class="section-title">Equipment Information</div>
            <table>
              <tr>
                <th>Serial Number</th>
                <td>${inspection.ppe_serial || 'N/A'}</td>
                <th>Type</th>
                <td>${inspection.ppe_type || 'N/A'}</td>
              </tr>
              <tr>
                <th>Brand</th>
                <td>${inspection.ppe_brand || 'N/A'}</td>
                <th>Model</th>
                <td>${inspection.ppe_model || 'N/A'}</td>
              </tr>
              <tr>
                <th>Manufacturing Date</th>
                <td>${inspection.manufacturing_date ? format(new Date(inspection.manufacturing_date), 'PPP') : 'N/A'}</td>
                <th>Expiry Date</th>
                <td>${inspection.expiry_date ? format(new Date(inspection.expiry_date), 'PPP') : 'N/A'}</td>
              </tr>
              <tr>
                <th>Batch Number</th>
                <td colspan="3">${inspection.batch_number || 'N/A'}</td>
              </tr>
            </table>
          </div>
          
          <div class="section">
            <div class="section-title">Inspection Information</div>
            <table>
              <tr>
                <th>Inspection Date</th>
                <td>${format(new Date(inspection.date), 'PPP')}</td>
                <th>Inspector</th>
                <td>${inspection.inspector_name || 'N/A'}</td>
              </tr>
              <tr>
                <th>Inspection Type</th>
                <td>${inspection.type || 'N/A'}</td>
                <th>Result</th>
                <td class="${inspection.overall_result?.toLowerCase() === 'pass' ? 'result-pass' : 'result-fail'}">
                  ${(inspection.overall_result || '').toUpperCase()}
                </td>
              </tr>
              <tr>
                <th>Site</th>
                <td colspan="3">${inspection.site_name || 'N/A'}</td>
              </tr>
            </table>
          </div>
          
          ${inspection.notes ? `
          <div class="section">
            <div class="section-title">Notes</div>
            <p>${inspection.notes}</p>
          </div>
          ` : ''}
          
          <div class="section">
            <div class="section-title">Inspection Checkpoints</div>
            <table>
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Result</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                ${inspection.checkpoints.map(checkpoint => `
                <tr class="${checkpoint.passed ? 'checkpoint-pass' : checkpoint.passed === false ? 'checkpoint-fail' : ''}">
                  <td>${checkpoint.description}</td>
                  <td>${checkpoint.passed === null ? 'N/A' : checkpoint.passed ? 'PASS' : 'FAIL'}</td>
                  <td>${checkpoint.notes || '-'}</td>
                </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
          
          ${inspection.signature_url ? `
          <div class="signature-container">
            <div class="section-title">Inspector's Signature</div>
            <img src="${inspection.signature_url}" alt="Inspector Signature" class="signature" />
          </div>
          ` : ''}
          
          <div class="footer">
            <p>This is an official PPE inspection document. Keep for your records.</p>
          </div>
        </body>
      </html>
    `;
    
    printWindow.document.open();
    printWindow.document.write(content);
    printWindow.document.close();
    
    // Wait for content to load
    setTimeout(() => {
      printWindow.print();
    }, 500);
    
    return true;
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};
