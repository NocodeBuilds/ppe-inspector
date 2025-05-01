
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { PPEItem } from '@/types';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CardOverlay from '@/components/ui/card-overlay';
import AddPPEForm from '@/components/forms/AddPPEForm';
import { PageLayout } from '@/components/layout/PageLayout';
import { FilterBar } from '@/components/ui/filter-bar';
import StandardEquipmentCard from '@/components/equipment/StandardEquipmentCard';
import { StandardCard } from '@/components/ui/standard-card';
import EquipmentSkeleton from '@/components/equipment/EquipmentSkeleton';

const Equipment = () => {
  const [ppeItems, setPpeItems] = useState<PPEItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<PPEItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddPPE, setShowAddPPE] = useState(false);
  const [activeType, setActiveType] = useState<string>('all');
  const { toast } = useToast();
  
  const allPPETypes = [
    'Full Body Harness',
    'Fall Arrester',
    'Double Lanyard',
    'Safety Helmet',
    'Safety Boots',
    'Safety Gloves',
    'Safety Goggles',
    'Ear Protection',
    'Respirator',
    'Safety Vest',
    'Face Shield'
  ];

  useEffect(() => {
    fetchEquipment();
  }, []);

  useEffect(() => {
    filterItems();
  }, [searchQuery, ppeItems, activeType]);

  const fetchEquipment = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('ppe_items')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      const mappedItems: PPEItem[] = data.map((item: any) => ({
        id: item.id,
        serialNumber: item.serial_number,
        type: item.type,
        brand: item.brand,
        modelNumber: item.model_number,
        manufacturingDate: item.manufacturing_date,
        expiryDate: item.expiry_date,
        status: item.status,
        imageUrl: item.image_url,
        nextInspection: item.next_inspection,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
      }));
      
      setPpeItems(mappedItems);
      setFilteredItems(mappedItems);
    } catch (error) {
      console.error('Error fetching equipment:', error);
      toast({
        title: 'Error',
        description: 'Failed to load equipment',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterItems = () => {
    let results = [...ppeItems];
    
    if (activeType !== 'all') {
      results = results.filter(item => item.type === activeType);
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      results = results.filter(
        item =>
          item.serialNumber.toLowerCase().includes(query) ||
          item.type.toLowerCase().includes(query) ||
          item.brand.toLowerCase().includes(query)
      );
    }
    
    setFilteredItems(results);
  };

  const getUniqueTypes = () => {
    const typesSet = new Set(allPPETypes);
    
    ppeItems.forEach(item => typesSet.add(item.type));
    
    return ['all', ...Array.from(typesSet)];
  };

  const handleAddPPESuccess = () => {
    setShowAddPPE(false);
    fetchEquipment();
    toast({
      title: 'Success',
      description: 'PPE item added successfully',
    });
  };

  const headerActions = (
    <Button onClick={() => setShowAddPPE(true)}>
      <Plus size={18} className="mr-2" />
      Add PPE
    </Button>
  );

  return (
    <PageLayout
      title="Equipment"
      headerActions={headerActions}
    >
      <FilterBar
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search by serial number, type or brand..."
      />
      
      <StandardCard>
        <Tabs defaultValue="all" value={activeType} onValueChange={setActiveType}>
          <div className="relative overflow-hidden mb-4">
            <TabsList className="flex overflow-x-auto pb-2 -mb-2 no-scrollbar snap-x whitespace-nowrap">
              {getUniqueTypes().map(type => (
                <TabsTrigger 
                  key={type} 
                  value={type} 
                  className="capitalize whitespace-nowrap snap-start"
                >
                  {type === 'all' ? 'All Types' : type}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
          
          <TabsContent value={activeType} className="mt-0">
            {isLoading ? (
              <EquipmentSkeleton />
            ) : filteredItems.length > 0 ? (
              <div className="space-y-4">
                {filteredItems.map((item) => (
                  <StandardEquipmentCard
                    key={item.id}
                    item={item}
                    type="equipment"
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 border border-dashed rounded-lg">
                <p className="text-muted-foreground mb-4">No equipment found</p>
                <Button variant="outline" onClick={() => setShowAddPPE(true)}>
                  Add New PPE
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </StandardCard>
      
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
        <AddPPEForm onSuccess={handleAddPPESuccess} />
      </CardOverlay>
    </PageLayout>
  );
};

export default Equipment;
