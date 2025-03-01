
import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import CardOverlay from '@/components/ui/card-overlay';
import AddPPEForm from '@/components/forms/AddPPEForm';
import { supabase, PPEItem } from '@/integrations/supabase/client';

const Equipment = () => {
  const [showAddPPE, setShowAddPPE] = useState(false);
  const [ppeItems, setPpeItems] = useState<PPEItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    fetchPPEItems();
  }, []);
  
  const fetchPPEItems = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('ppe_items')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      setPpeItems(data || []);
    } catch (error: any) {
      console.error('Error fetching PPE items:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to load PPE items',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleEditPPE = (ppe: PPEItem) => {
    toast({
      title: 'Edit PPE',
      description: `Editing ${ppe.type} (${ppe.serial_number})`,
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
      
      {isLoading ? (
        <div className="flex justify-center my-12">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : ppeItems.length === 0 ? (
        <div className="text-center my-12">
          <p className="text-muted-foreground">No PPE items found</p>
          <Button 
            onClick={() => setShowAddPPE(true)} 
            variant="outline" 
            className="mt-4"
          >
            Add Your First PPE Item
          </Button>
        </div>
      ) : (
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
                  <p className="text-sm">SN: {ppe.serial_number}</p>
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
      )}
      
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
        <AddPPEForm onSuccess={() => {
          setShowAddPPE(false);
          fetchPPEItems();
        }} />
      </CardOverlay>
    </div>
  );
};

export default Equipment;
