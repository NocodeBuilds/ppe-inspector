
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { PPEItem } from '@/types';
import EquipmentCard from '@/components/equipment/EquipmentCard';
import { Input } from '@/components/ui/input';
import { Search, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import EquipmentSkeleton from '@/components/equipment/EquipmentSkeleton';

const UpcomingInspections = () => {
  const [ppeItems, setPpeItems] = useState<PPEItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<PPEItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [timeFrame, setTimeFrame] = useState<'today' | 'week' | 'month' | 'overdue'>('week');
  const [sortBy, setSortBy] = useState<'dueDate' | 'dateAdded'>('dueDate');
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchUpcomingInspections();
  }, [timeFrame]);

  useEffect(() => {
    filterAndSortItems();
  }, [searchQuery, ppeItems, sortBy]);

  const fetchUpcomingInspections = async () => {
    try {
      setIsLoading(true);
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      let startDate = new Date(today);
      let endDate = new Date(today);
      
      if (timeFrame === 'today') {
        endDate.setDate(today.getDate() + 1);
      } else if (timeFrame === 'week') {
        endDate.setDate(today.getDate() + 7);
      } else if (timeFrame === 'month') {
        endDate.setMonth(today.getMonth() + 1);
      } else if (timeFrame === 'overdue') {
        endDate = today;
        startDate = new Date('2000-01-01'); // Far past date to catch all overdue items
      }
      
      let query = supabase
        .from('ppe_items')
        .select('*')
        .not('next_inspection', 'is', null);
      
      if (timeFrame === 'overdue') {
        query = query.lt('next_inspection', today.toISOString());
      } else {
        query = query
          .gte('next_inspection', startDate.toISOString())
          .lt('next_inspection', endDate.toISOString());
      }
      
      const { data, error } = await query.order('next_inspection', { ascending: true });
      
      if (error) throw error;
      
      const mappedItems: PPEItem[] = (data || []).map((item: any) => ({
        id: item.id,
        serial_number: item.serial_number,
        type: item.type,
        brand: item.brand,
        model_number: item.model_number,
        manufacturing_date: item.manufacturing_date,
        expiry_date: item.expiry_date,
        status: item.status,
        image_url: item.image_url,
        next_inspection: item.next_inspection,
        created_at: item.created_at,
        updated_at: item.updated_at,
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

  const filterAndSortItems = () => {
    let results = [...ppeItems];
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      results = results.filter(
        item =>
          item.serial_number.toLowerCase().includes(query) ||
          item.type.toLowerCase().includes(query) ||
          item.brand.toLowerCase().includes(query)
      );
    }
    
    // Sort items
    results.sort((a, b) => {
      if (sortBy === 'dueDate') {
        const dateA = a.next_inspection ? new Date(a.next_inspection).getTime() : 0;
        const dateB = b.next_inspection ? new Date(b.next_inspection).getTime() : 0;
        return dateA - dateB;
      } else {
        const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
        return dateB - dateA;
      }
    });
    
    setFilteredItems(results);
  };

  const getStatusText = (item: PPEItem) => {
    if (!item.next_inspection) return 'No inspection scheduled';
    
    const dueDate = new Date(item.next_inspection);
    const today = new Date();
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return `Overdue by ${Math.abs(diffDays)} days`;
    } else if (diffDays === 0) {
      return 'Due today';
    } else if (diffDays === 1) {
      return 'Due tomorrow';
    } else {
      return `Due in ${diffDays} days`;
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6 flex items-center">
        <Calendar className="mr-2" size={24} />
        Upcoming Inspections
      </h1>
      
      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
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
            value={timeFrame}
            onValueChange={(value) => setTimeFrame(value as 'today' | 'week' | 'month' | 'overdue')}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Time frame" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">Next 7 days</SelectItem>
              <SelectItem value="month">Next month</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
            </SelectContent>
          </Select>
          
          <Select
            value={sortBy}
            onValueChange={(value) => setSortBy(value as 'dueDate' | 'dateAdded')}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="dueDate">Due date</SelectItem>
              <SelectItem value="dateAdded">Date added</SelectItem>
            </SelectContent>
          </Select>
          
          <Button onClick={() => fetchUpcomingInspections()}>
            Refresh
          </Button>
        </div>
      </div>
      
      {isLoading ? (
        <EquipmentSkeleton />
      ) : filteredItems.length > 0 ? (
        <div className="space-y-4">
          {filteredItems.map((item) => (
            <div key={item.id} className="space-y-2">
              <EquipmentCard
                item={item}
                type="upcoming"
              />
              <div className="ml-4 pl-4 border-l-2 border-orange-300">
                <p className="text-sm text-muted-foreground">
                  {getStatusText(item)}
                </p>
              </div>
            </div>
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
