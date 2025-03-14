
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { PPEItem } from '@/integrations/supabase/client';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDistance } from 'date-fns';

interface PPESelectionDialogProps {
  ppeItems: PPEItem[];
  isOpen: boolean;
  onPPESelect: (ppe: PPEItem) => void;
  onClose: () => void;
}

const PPESelectionDialog: React.FC<PPESelectionDialogProps> = ({
  ppeItems,
  isOpen,
  onPPESelect,
  onClose
}) => {
  if (!isOpen || ppeItems.length === 0) return null;

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Multiple PPE Items Found</DialogTitle>
          <DialogDescription>
            {ppeItems.length} items with the same serial number were found. 
            Please select the specific item you want to inspect.
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="max-h-[400px] mt-4">
          <div className="space-y-3 pr-3">
            {ppeItems.map((ppe) => (
              <div 
                key={ppe.id}
                className="border rounded-lg p-4 hover:border-primary cursor-pointer transition-colors"
                onClick={() => onPPESelect(ppe)}
              >
                <div className="flex items-start gap-3">
                  {ppe.image_url && (
                    <div className="w-16 h-16 rounded-md overflow-hidden flex-shrink-0">
                      <img 
                        src={ppe.image_url} 
                        alt={ppe.type} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  
                  <div className="flex-1">
                    <div className="font-medium">{ppe.type}</div>
                    <div className="text-sm text-muted-foreground">
                      {ppe.brand} - {ppe.model_number}
                    </div>
                    <div className="text-xs mt-1">
                      <span className={`px-2 py-0.5 rounded-full ${getStatusClass(ppe.status || 'active')}`}>
                        {ppe.status || 'active'}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {ppe.last_inspection ? (
                        <span>Last inspected: {formatDistance(new Date(ppe.last_inspection), new Date(), { addSuffix: true })}</span>
                      ) : (
                        <span>No previous inspections</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

function getStatusClass(status: string): string {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-800';
    case 'expired':
      return 'bg-red-100 text-red-800';
    case 'maintenance':
      return 'bg-amber-100 text-amber-800';
    case 'flagged':
      return 'bg-orange-100 text-orange-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

export default PPESelectionDialog;
