
import { getUpcomingInspections } from '@/data/mockData';
import EquipmentCard from '@/components/equipment/EquipmentCard';
import { toast } from '@/hooks/use-toast';
import { PPEItem } from '@/types';

const UpcomingInspections = () => {
  const upcomingInspections = getUpcomingInspections();
  
  const handleEdit = (item: PPEItem) => {
    // In a real app, we would navigate to an inspection page
    toast({
      title: 'Start Inspection',
      description: `Starting inspection for ${item.type} (${item.serialNumber})`,
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
      
      {upcomingInspections.length === 0 ? (
        <div className="text-center my-12">
          <p className="text-muted-foreground">No upcoming inspections found</p>
        </div>
      ) : (
        <div className="space-y-2">
          {upcomingInspections.map((item) => (
            <EquipmentCard
              key={item.id}
              item={item}
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
