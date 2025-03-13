
import React from 'react';
import { X, FileText, Download, MessageSquare, Mail, Home, Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface InspectionSuccessDialogProps {
  isOpen: boolean;
  onClose: () => void;
  inspectionId: string;
  ppeId: string;
  onPDFDownload: () => void;
  onExcelDownload: () => void;
  onWhatsAppShare: () => void;
  onEmailShare: () => void;
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
  const navigate = useNavigate();

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-zinc-900 text-white border-zinc-800">
        <DialogHeader>
          <DialogTitle className="text-xl text-white">Inspection Submitted Successfully!</DialogTitle>
          <DialogDescription className="text-gray-400">
            Choose how you would like to share the inspection report or start a new inspection.
          </DialogDescription>
        </DialogHeader>
        <div className="absolute right-4 top-4">
          <Button variant="ghost" size="icon" onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <Button 
            variant="outline" 
            className="w-full justify-start text-white border-zinc-800 hover:bg-zinc-800" 
            onClick={onPDFDownload}
          >
            <FileText className="mr-2 h-5 w-5" />
            PDF
          </Button>
          <Button 
            variant="outline" 
            className="w-full justify-start text-white border-zinc-800 hover:bg-zinc-800" 
            onClick={onExcelDownload}
          >
            <Download className="mr-2 h-5 w-5" />
            Excel
          </Button>
          <Button 
            variant="outline" 
            className="w-full justify-start text-white border-zinc-800 hover:bg-zinc-800" 
            onClick={onWhatsAppShare}
          >
            <MessageSquare className="mr-2 h-5 w-5" />
            WhatsApp
          </Button>
          <Button 
            variant="outline" 
            className="w-full justify-start text-white border-zinc-800 hover:bg-zinc-800" 
            onClick={onEmailShare}
          >
            <Mail className="mr-2 h-5 w-5" />
            Email
          </Button>
        </div>
        
        <div className="flex justify-between mt-2">
          <Button 
            variant="outline" 
            className="border-zinc-800 hover:bg-zinc-800 text-white" 
            onClick={() => navigate('/')}
          >
            <Home className="mr-2 h-4 w-4" />
            Home
          </Button>
          <Button 
            onClick={() => navigate('/start-inspection')}
            className="bg-green-500 hover:bg-green-600 text-white"
          >
            <Plus className="mr-2 h-4 w-4" />
            New Inspection
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InspectionSuccessDialog;
