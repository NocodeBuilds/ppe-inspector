
import React from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogFooter, DialogTitle } from '@/components/ui/dialog';
import { FileCheck, Download, FileCog, Share2, FileSpreadsheet, Mail } from 'lucide-react';
import { StandardInspectionData } from '@/utils/reportGeneratorService';

interface InspectionSuccessDialogProps {
  isOpen: boolean;
  onClose: () => void;
  inspectionId: string;
  ppeId: string;
  onPDFDownload: (data: StandardInspectionData) => Promise<void>;
  onExcelDownload: (data: StandardInspectionData) => Promise<void>;
  onWhatsAppShare: () => Promise<void>;
  onEmailShare: () => Promise<void>;
}

const InspectionSuccessDialog: React.FC<InspectionSuccessDialogProps> = ({
  isOpen,
  onClose,
  inspectionId,
  ppeId,
  onPDFDownload,
  onExcelDownload,
  onWhatsAppShare,
  onEmailShare
}) => {
  // Mock data for demonstration/testing
  const mockInspectionData: StandardInspectionData = {
    id: inspectionId,
    date: new Date().toISOString(),
    type: "pre-use",
    overall_result: "pass",
    inspector_name: "Current User",
    ppe_type: "Safety Helmet",
    ppe_serial: "SH-1234",
    ppe_brand: "SafetyFirst",
    ppe_model: "Standard",
    inspector_id: "user-id",
    site_name: "Main Site",
    manufacturing_date: "2023-01-01",
    expiry_date: "2025-01-01",
    batch_number: "B-123",
    notes: "Standard inspection completed",
    signature_url: null,
    checkpoints: [
      {
        id: "cp1",
        description: "Straps in good condition",
        passed: true,
        notes: null,
        photo_url: null
      },
      {
        id: "cp2",
        description: "No cracks or damage",
        passed: true,
        notes: null,
        photo_url: null
      }
    ]
  };

  // Handle actions
  const handlePDFDownload = async () => {
    await onPDFDownload(mockInspectionData);
  };

  const handleExcelDownload = async () => {
    await onExcelDownload(mockInspectionData);
  };

  const handleWhatsAppShare = async () => {
    await onWhatsAppShare();
  };

  const handleEmailShare = async () => {
    await onEmailShare();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileCheck className="h-6 w-6 text-green-500" />
            Inspection Completed!
          </DialogTitle>
          <DialogDescription>
            The inspection has been successfully recorded. What would you like to do next?
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-2 gap-4 py-4">
          <Button 
            variant="outline" 
            onClick={handlePDFDownload}
            className="flex flex-col items-center justify-center h-20 px-2"
          >
            <Download className="h-5 w-5 mb-2" />
            <span className="text-xs text-center">Download PDF Report</span>
          </Button>
          
          <Button 
            variant="outline" 
            onClick={handleExcelDownload}
            className="flex flex-col items-center justify-center h-20 px-2"
          >
            <FileSpreadsheet className="h-5 w-5 mb-2" />
            <span className="text-xs text-center">Download Excel Report</span>
          </Button>
          
          <Button 
            variant="outline" 
            onClick={handleWhatsAppShare}
            className="flex flex-col items-center justify-center h-20 px-2"
          >
            <Share2 className="h-5 w-5 mb-2" />
            <span className="text-xs text-center">Share via WhatsApp</span>
          </Button>
          
          <Button 
            variant="outline" 
            onClick={handleEmailShare}
            className="flex flex-col items-center justify-center h-20 px-2"
          >
            <Mail className="h-5 w-5 mb-2" />
            <span className="text-xs text-center">Share via Email</span>
          </Button>
        </div>
        
        <DialogFooter className="sm:justify-between">
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
          <Button 
            variant="default" 
            onClick={() => window.location.href = `/equipment/${ppeId}`}
          >
            View Equipment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default InspectionSuccessDialog;
