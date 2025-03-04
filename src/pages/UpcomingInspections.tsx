
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { PPEItem } from '@/types';
import EquipmentCard from '@/components/equipment/EquipmentCard';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const UpcomingInspections = () => {
  const [ppeItems, setPpeItems] = useState<PPEItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<PPEItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchUpcomingInspections();
  }, []);

  useEffect(() => {
    filterItems();
  }, [searchQuery, ppeItems, sortOrder]);

  const fetchUpcomingInspections = async () => {
    try {
      setIsLoading(true);
      
      // Get current date
      const currentDate = new Date().toISOString();
      
      // Fetch PPE items with upcoming inspections
      const { data, error } = await supabase
        .from('ppe_items')
        .select('*')
        .lte('next_inspection', currentDate)
        .or(`status.eq.active,status.eq.due`);
      
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
      console.error('Error fetching upcoming inspections:', error);
      toast({
        title: 'Error',
        description: 'Failed to load upcoming inspections',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterItems = () => {
    let results = [...ppeItems];
    
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
    
    // Apply sort
    results = results.sort((a, b) => {
      const dateA = new Date(a.nextInspection || a.createdAt).getTime();
      const dateB = new Date(b.nextInspection || b.createdAt).getTime();
      
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });
    
    setFilteredItems(results);
  };

  const handleInspect = (item: PPEItem) => {
    navigate(`/inspect/${item.id}`);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Upcoming Inspections</h1>
      
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            type="text"
            placeholder="Search by serial number, type or brand..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select
          value={sortOrder}
          onValueChange={(value) => setSortOrder(value as 'asc' | 'desc')}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by due date" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="asc">Earliest first</SelectItem>
            <SelectItem value="desc">Latest first</SelectItem>
          </SelectContent>
        </Select>
        
        <Button onClick={() => fetchUpcomingInspections()}>
          Refresh
        </Button>
      </div>
      
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
              type="upcoming"
              onInspect={() => handleInspect(item)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 border border-dashed rounded-lg">
          <p className="text-muted-foreground mb-4">No upcoming inspections found</p>
          <Button variant="outline" onClick={() => navigate('/equipment')}>
            View All Equipment
          </Button>
        </div>
      )}
    </div>
  );
};

export default UpcomingInspections;
