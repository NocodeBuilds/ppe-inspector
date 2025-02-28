
import { useState } from 'react';
import { ppeItems } from '@/data/mockData';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PPEItem } from '@/types';
import AddPPEForm from '@/components/forms/AddPPEForm';
import CardOverlay from '@/components/ui/card-overlay';
import { toast } from '@/hooks/use-toast';

const Equipment = () => {
  const [showAddPPE, setShowAddPPE] = useState(false);
  
  const handleEditPPE = (ppe: PPEItem) => {
    toast({
      title: 'Edit PPE',
      description: `Editing ${ppe.type} (${ppe.serialNumber})`,
    });
  };
  
  return (
    <div className="fade-in">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Equipment</h1>
        <Button 
          onClick={() => setShowAddPPE(true)} 
          className="bg-success hover:bg-success/90"
        >
          <Plus size={16} className="mr-1" /> Add New PPE
        </Button>
      </div>
      
      <div className="space-y-4">
        {ppeItems.map((ppe) => (
          <div 
            key={ppe.id}
            className="glass-card rounded-lg p-4 transition-all hover:shadow-md"
            onClick={() => handleEditPPE(ppe)}
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold uppercase">{ppe.type}</h3>
                <p className="text-sm">SN: {ppe.serialNumber}</p>
                <p className="text-sm">Brand: {ppe.brand}</p>
              </div>
              <div className={`
                px-2 py-1 rounded-full text-xs 
                ${ppe.status === 'active' ? 'bg-success/20 text-success' : 
                  ppe.status === 'expired' ? 'bg-destructive/20 text-destructive' : 
                  ppe.status === 'maintenance' ? 'bg-warning/20 text-warning' : 
                  'bg-muted text-muted-foreground'}
              `}>
                {ppe.status === 'active' && (
                  <span className="flex items-center">
                    <span className="w-2 h-2 bg-success rounded-full mr-1"></span>
                    active
                  </span>
                )}
                {ppe.status === 'expired' && 'expired'}
                {ppe.status === 'maintenance' && 'maintenance'}
                {ppe.status === 'flagged' && 'flagged'}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <CardOverlay show={showAddPPE} onClose={() => setShowAddPPE(false)}>
        <div className="mb-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-primary">Add New PPE</h2>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setShowAddPPE(false)}
            className="h-8 w-8 p-0 rounded-full"
          >
            ✕
          </Button>
        </div>
        <AddPPEForm onSuccess={() => setShowAddPPE(false)} />
      </CardOverlay>
    </div>
  );
};

export default Equipment;
