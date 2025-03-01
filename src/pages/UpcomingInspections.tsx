
import { useState, useEffect } from 'react';
import EquipmentCard from '@/components/equipment/EquipmentCard';
import { toast } from '@/hooks/use-toast';
import { supabase, PPEItem } from '@/integrations/supabase/client';

const UpcomingInspections = () => {
  const [upcomingInspections, setUpcomingInspections] = useState<PPEItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    fetchUpcomingInspections();
  }, []);
  
  const fetchUpcomingInspections = async () => {
    try {
      setIsLoading(true);
      const today = new Date().toISOString();
      
      const { data, error } = await supabase
        .from('ppe_items')
        .select('*')
        .gte('next_inspection', today)
        .order('next_inspection', { ascending: true });
        
      if (error) throw error;
      
      setUpcomingInspections(data || []);
    } catch (error: any) {
      console.error('Error fetching upcoming inspections:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to load upcoming inspections',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleEdit = (item: PPEItem) => {
    // In a real app, we would navigate to an inspection page
    toast({
      title: 'Start Inspection',
      description: `Starting inspection for ${item.type} (${item.serial_number})`,
    });
  };

  const handleDownload = (item: PPEItem) => {
    // In a real app, we would download inspection details
    toast({
      title: 'Download',
      description: `Downloading inspection details for ${item.type}`,
    });
  };
  
  return (
    <div className="fade-in">
      <h1 className="text-2xl font-bold mb-6">Upcoming Inspections</h1>
      
      {isLoading ? (
        <div className="flex justify-center my-12">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : upcomingInspections.length === 0 ? (
        <div className="text-center my-12">
          <p className="text-muted-foreground">No upcoming inspections found</p>
        </div>
      ) : (
        <div className="space-y-2">
          {upcomingInspections.map((item) => (
            <EquipmentCard
              key={item.id}
              item={{
                id: item.id,
                serialNumber: item.serial_number,
                type: item.type,
                brand: item.brand,
                modelNumber: item.model_number,
                manufacturingDate: item.manufacturing_date,
                expiryDate: item.expiry_date,
                status: item.status,
                imageUrl: item.image_url || undefined,
                lastInspection: item.last_inspection || undefined,
                nextInspection: item.next_inspection || undefined,
              }}
              type="upcoming"
              onEdit={() => handleEdit(item)}
              onDownload={() => handleDownload(item)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default UpcomingInspections;
