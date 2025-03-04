
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { PPEItem } from '@/types';
import EquipmentCard from '@/components/equipment/EquipmentCard';
import { Input } from '@/components/ui/input';
import { Search, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CardOverlay from '@/components/ui/card-overlay';
import AddPPEForm from '@/components/forms/AddPPEForm';

const Equipment = () => {
  const [ppeItems, setPpeItems] = useState<PPEItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<PPEItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddPPE, setShowAddPPE] = useState(false);
  const [activeType, setActiveType] = useState<string>('all');
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchEquipment();
  }, []);

  useEffect(() => {
    filterItems();
  }, [searchQuery, ppeItems, activeType]);

  const fetchEquipment = async () => {
    try {
      setIsLoading(true);
      
      // Fetch all PPE items
      const { data, error } = await supabase
        .from('ppe_items')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Map data to PPEItem type
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
    
    // Apply type filter
    if (activeType !== 'all') {
      results = results.filter(item => item.type === activeType);
    }
    
    // Apply search filter
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
    const types = new Set(ppeItems.map(item => item.type));
    return ['all', ...Array.from(types)];
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
          <TabsList className="mb-4 w-full overflow-x-auto flex-wrap">
            {getUniqueTypes().map(type => (
              <TabsTrigger key={type} value={type} className="capitalize">
                {type === 'all' ? 'All Types' : type}
              </TabsTrigger>
            ))}
          </TabsList>
          
          <TabsContent value={activeType} className="mt-0">
            {isLoading ? (
              <div className="flex justify-center items-center h-60">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
              </div>
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
