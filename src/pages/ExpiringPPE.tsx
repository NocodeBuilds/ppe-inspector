
import { useState, useEffect } from 'react';
import EquipmentCard from '@/components/equipment/EquipmentCard';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import CardOverlay from '@/components/ui/card-overlay';
import { supabase, PPEItem, PPEType } from '@/integrations/supabase/client';

const ExpiringPPE = () => {
  const [showSuccessOverlay, setShowSuccessOverlay] = useState(false);
  const [selectedItem, setSelectedItem] = useState<PPEItem | null>(null);
  const [expiringItems, setExpiringItems] = useState<PPEItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    fetchExpiringPPE();
  }, []);
  
  const fetchExpiringPPE = async () => {
    try {
      setIsLoading(true);
      
      // Get items that are expired or expiring within 30 days
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      
      const { data, error } = await supabase
        .from('ppe_items')
        .select('*')
        .or(`status.eq.expired,expiry_date.lte.${thirtyDaysFromNow.toISOString()}`)
        .order('expiry_date', { ascending: true });
        
      if (error) throw error;
      
      setExpiringItems(data || []);
    } catch (error: any) {
      console.error('Error fetching expiring PPE:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to load expiring PPE items',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleEdit = (item: PPEItem) => {
    setSelectedItem(item);
    // In a real app, we would navigate to an edit page or show a modal
    toast({
      title: 'Edit PPE',
      description: `Editing ${item.type} (${item.serial_number})`,
    });
  };

  const handleDownload = (item: PPEItem) => {
    // Simulate download and then show success overlay
    setTimeout(() => {
      setSelectedItem(item);
      setShowSuccessOverlay(true);
    }, 500);
  };
  
  const handleExportFormat = (format: 'pdf' | 'excel' | 'whatsapp' | 'email') => {
    toast({
      title: 'Export',
      description: `Exporting ${format.toUpperCase()} for ${selectedItem?.type}`,
    });
    
    setTimeout(() => {
      setShowSuccessOverlay(false);
    }, 1000);
  };
  
  return (
    <div className="fade-in">
      <h1 className="text-2xl font-bold mb-6">Expiring PPE</h1>
      
      {isLoading ? (
        <div className="flex justify-center my-12">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : expiringItems.length === 0 ? (
        <div className="text-center my-12">
          <p className="text-muted-foreground">No expiring PPE items found</p>
        </div>
      ) : (
        <div className="space-y-2">
          {expiringItems.map((item) => (
            <EquipmentCard
              key={item.id}
              item={{
                id: item.id,
                serialNumber: item.serial_number,
                type: item.type as PPEType,
                brand: item.brand,
                modelNumber: item.model_number,
                manufacturingDate: item.manufacturing_date,
                expiryDate: item.expiry_date,
                status: item.status,
                imageUrl: item.image_url || undefined,
                lastInspection: item.last_inspection || undefined,
                nextInspection: item.next_inspection || undefined,
              }}
              type="expiring"
              onEdit={() => handleEdit(item)}
              onDownload={() => handleDownload(item)}
            />
          ))}
        </div>
      )}
      
      <CardOverlay show={showSuccessOverlay} onClose={() => setShowSuccessOverlay(false)}>
        <div className="text-center mb-4">
          <h3 className="text-xl font-bold mb-2">Inspection Submitted Successfully!</h3>
          <p className="text-muted-foreground text-sm mb-6">
            Choose how you would like to share the inspection report or start a new inspection.
          </p>
          
          <div className="grid grid-cols-2 gap-3 mb-6">
            <Button onClick={() => handleExportFormat('pdf')} variant="outline" className="h-12 space-x-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <path d="M14 2v6h6"></path>
                <path d="M16 13H8"></path>
                <path d="M16 17H8"></path>
                <path d="M10 9H8"></path>
              </svg>
              <span>PDF</span>
            </Button>
            
            <Button onClick={() => handleExportFormat('excel')} variant="outline" className="h-12 space-x-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <path d="M14 2v6h6"></path>
                <path d="M8 13h2"></path>
                <path d="M8 17h2"></path>
                <path d="M14 13h2"></path>
                <path d="M14 17h2"></path>
              </svg>
              <span>Excel</span>
            </Button>
            
            <Button onClick={() => handleExportFormat('whatsapp')} variant="outline" className="h-12 space-x-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
              </svg>
              <span>WhatsApp</span>
            </Button>
            
            <Button onClick={() => handleExportFormat('email')} variant="outline" className="h-12 space-x-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="20" height="16" x="2" y="4" rx="2"></rect>
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
              </svg>
              <span>Email</span>
            </Button>
          </div>
          
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1 h-12" onClick={() => setShowSuccessOverlay(false)}>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
              </svg>
              Home
            </Button>
            
            <Button className="flex-1 h-12 bg-success hover:bg-success/90" onClick={() => setShowSuccessOverlay(false)}>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                <path d="M5 12h14"></path>
                <path d="M12 5v14"></path>
              </svg>
              New Inspection
            </Button>
          </div>
        </div>
      </CardOverlay>
    </div>
  );
};

export default ExpiringPPE;
