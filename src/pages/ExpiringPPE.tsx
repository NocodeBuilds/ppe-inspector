
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { PPEItem } from '@/types';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PageLayout } from '@/components/layout/PageLayout';
import { FilterBar } from '@/components/ui/filter-bar';
import { StandardCard } from '@/components/ui/standard-card';
import StandardEquipmentCard from '@/components/equipment/StandardEquipmentCard';
import EquipmentSkeleton from '@/components/equipment/EquipmentSkeleton';

const ExpiringPPE = () => {
  const [ppeItems, setPpeItems] = useState<PPEItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<PPEItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [timeFrame, setTimeFrame] = useState<'3-months' | '6-months' | '1-year'>('1-year');
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchExpiringPPE();
  }, [timeFrame]);

  useEffect(() => {
    filterItems();
  }, [searchQuery, ppeItems]);

  const fetchExpiringPPE = async () => {
    try {
      setIsLoading(true);
      
      const today = new Date();
      const cutoffDate = new Date();
      
      if (timeFrame === '3-months') {
        cutoffDate.setMonth(today.getMonth() + 3);
      } else if (timeFrame === '6-months') {
        cutoffDate.setMonth(today.getMonth() + 6);
      } else { // 1-year
        cutoffDate.setFullYear(today.getFullYear() + 1);
      }
      
      const { data, error } = await supabase
        .from('ppe_items')
        .select('*')
        .lt('expiry_date', cutoffDate.toISOString())
        .gte('expiry_date', today.toISOString())
        .order('expiry_date', { ascending: true });
      
      if (error) throw error;
      
      const { data: expiredData, error: expiredError } = await supabase
        .from('ppe_items')
        .select('*')
        .lt('expiry_date', today.toISOString())
        .order('expiry_date', { ascending: false });
        
      if (expiredError) throw expiredError;
      
      const allExpiringItems = [...(data || []), ...(expiredData || [])];
      
      const mappedItems: PPEItem[] = allExpiringItems.map((item: any) => ({
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
      console.error('Error fetching expiring PPE:', error);
      toast({
        title: 'Error',
        description: 'Failed to load expiring PPE items',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterItems = () => {
    if (!searchQuery) {
      setFilteredItems(ppeItems);
      return;
    }
    
    const query = searchQuery.toLowerCase();
    const results = ppeItems.filter(
      item =>
        item.serialNumber.toLowerCase().includes(query) ||
        item.type.toLowerCase().includes(query) ||
        item.brand.toLowerCase().includes(query)
    );
    
    setFilteredItems(results);
  };

  return (
    <PageLayout 
      title="Expiring PPE"
      icon={<AlertTriangle className="mr-2 text-orange-500" size={24} />}
    >
      <FilterBar
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search by serial number, type or brand..."
      >
        <Select
          value={timeFrame}
          onValueChange={(value) => setTimeFrame(value as '3-months' | '6-months' | '1-year')}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Time frame" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="3-months">Next 3 months</SelectItem>
            <SelectItem value="6-months">Next 6 months</SelectItem>
            <SelectItem value="1-year">Next year</SelectItem>
          </SelectContent>
        </Select>
        
        <Button onClick={() => fetchExpiringPPE()}>
          Refresh
        </Button>
      </FilterBar>
      
      <StandardCard>
        {isLoading ? (
          <EquipmentSkeleton />
        ) : filteredItems.length > 0 ? (
          <div className="space-y-4">
            {filteredItems.map((item) => (
              <StandardEquipmentCard
                key={item.id}
                item={item}
                type="expiring"
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 border border-dashed rounded-lg">
            <p className="text-muted-foreground mb-4">No expiring PPE items found in the selected time frame</p>
            <Button variant="outline" onClick={() => navigate('/equipment')}>
              View All Equipment
            </Button>
          </div>
        )}
      </StandardCard>
    </PageLayout>
  );
};

export default ExpiringPPE;
