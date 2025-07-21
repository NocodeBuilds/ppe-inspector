
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { PPEItem } from '@/integrations/supabase/client';
import EquipmentCard from '@/components/equipment/EquipmentCard';
import { Input } from '@/components/ui/input';
import { Search, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CardOverlay from '@/components/ui/card-overlay';
import AddPPEForm from '@/components/forms/AddPPEForm';
import EquipmentSkeleton from '@/components/equipment/EquipmentSkeleton';

const Equipment = () => {
  const [ppeItems, setPpeItems] = useState<PPEItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<PPEItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddPPE, setShowAddPPE] = useState(false);
  const [activeType, setActiveType] = useState<string>('all');
  const { toast } = useToast();
  const navigate = useNavigate();

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
      
      setPpeItems(data || []);
      setFilteredItems(data || []);
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
          item.serial_number.toLowerCase().includes(query) ||
          item.type.toLowerCase().includes(query) ||
          (item.brand && item.brand.toLowerCase().includes(query))
      );
    }
    
    setFilteredItems(results);
  };

  const getUniqueTypes = () => {
    const typesSet = new Set(allPPETypes);
    
    ppeItems.forEach(item => typesSet.add(item.type));
    
    return ['all', ...Array.from(typesSet)];
  };

  const handleInspect = (item: PPEItem) => {
    navigate(`/inspect/${item.id}`);
  };

  const handleAddPPESuccess = () => {
    setShowAddPPE(false);
    fetchEquipment();
    toast({
      title: 'Success',
      description: 'PPE item added successfully',
    });
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Equipment</h1>
        <Button onClick={() => setShowAddPPE(true)}>
          <Plus size={18} className="mr-2" />
          Add PPE
        </Button>
      </div>
      
      <div className="mb-6">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            type="text"
            placeholder="Search by serial number, type or brand..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
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
                  <EquipmentCard
                    key={item.id}
                    item={item}
                    type="equipment"
                    onInspect={() => handleInspect(item)}
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
        <AddPPEForm onSuccess={handleAddPPESuccess} />
      </CardOverlay>
    </div>
  );
};

export default Equipment;
