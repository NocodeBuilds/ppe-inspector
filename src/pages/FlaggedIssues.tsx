import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { PPEItem } from '@/types';
import EquipmentCard from '@/components/equipment/EquipmentCard';
import { Input } from '@/components/ui/input';
import { Search, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import FlaggedIssuesSkeleton from '@/components/flagged/FlaggedIssuesSkeleton';

const FlaggedIssues = () => {
  const [ppeItems, setPpeItems] = useState<PPEItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<PPEItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchFlaggedItems();
    }
  }, [user]);

  useEffect(() => {
    filterItems();
  }, [searchQuery, ppeItems]);

  const fetchFlaggedItems = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('ppe_items')
        .select(`
          id,
          serial_number,
          type,
          brand,
          model_number,
          manufacturing_date,
          expiry_date,
          status,
          image_url,
          next_inspection,
          created_at,
          updated_at,
          inspections (
            id,
            date,
            notes,
            overall_result
          )
        `)
        .eq('status', 'flagged')
        .order('updated_at', { ascending: false });
      
      if (error) throw error;
      
      console.log("Flagged items data:", data);
      
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
        latestInspection: item.inspections && item.inspections.length > 0 
          ? item.inspections.sort((a: any, b: any) => 
              new Date(b.date).getTime() - new Date(a.date).getTime()
            )[0] 
          : null
      }));
      
      setPpeItems(mappedItems);
      setFilteredItems(mappedItems);
    } catch (error) {
      console.error('Error fetching flagged items:', error);
      toast({
        title: 'Error',
        description: 'Failed to load flagged items. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterItems = () => {
    if (!searchQuery.trim()) {
      setFilteredItems(ppeItems);
      return;
    }
    
    const query = searchQuery.toLowerCase().trim();
    const results = ppeItems.filter(
      item =>
        item.serialNumber.toLowerCase().includes(query) ||
        item.type.toLowerCase().includes(query) ||
        item.brand.toLowerCase().includes(query)
    );
    
    setFilteredItems(results);
  };

  return (
    <div className="container mx-auto px-4 py-6 pb-20">
      <h1 className="text-2xl font-bold mb-6 flex items-center">
        <AlertTriangle className="mr-2 text-orange-500" size={24} />
        Flagged Issues
      </h1>
      
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
        
        <Button onClick={() => fetchFlaggedItems()}>
          Refresh
        </Button>
      </div>
      
      {isLoading ? (
        <FlaggedIssuesSkeleton />
      ) : filteredItems.length > 0 ? (
        <div className="space-y-6">
          {filteredItems.map((item) => (
            <div key={item.id} className="space-y-2">
              <EquipmentCard
                item={item}
                type="flagged"
              />
              
              {item.latestInspection && (
                <div className="ml-4 pl-4 border-l-2 border-destructive/30">
                  <h4 className="text-sm font-medium">Inspection Notes:</h4>
                  <p className="text-sm text-muted-foreground">
                    {item.latestInspection.notes || 'No notes provided'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Inspection date: {new Date(item.latestInspection.date).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 border border-dashed rounded-lg">
          <p className="text-muted-foreground mb-4">No flagged items found</p>
          <Button variant="outline" onClick={() => navigate('/equipment')}>
            View All Equipment
          </Button>
        </div>
      )}
    </div>
  );
};

export default FlaggedIssues;
