import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { PPEItem } from '@/types';
import EquipmentCard from '@/components/equipment/EquipmentCard';
import { Input } from '@/components/ui/input';
import { Search, AlertCircle, FileDown, RefreshCw, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { generatePPEItemReport } from '@/utils/reportGeneratorService';
import InspectionsSkeleton from '@/components/inspections/InspectionsSkeleton';

const UpcomingInspections = () => {
  const [ppeItems, setPpeItems] = useState<PPEItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<PPEItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [hasNetworkError, setHasNetworkError] = useState(false);
  const [filter, setFilter] = useState<'all' | 'due' | 'overdue'>('all');
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchUpcomingInspections();
  }, []);

  useEffect(() => {
    filterItems();
  }, [searchQuery, ppeItems, sortOrder, filter]);

  const fetchUpcomingInspections = async () => {
    try {
      setIsLoading(true);
      setIsRefreshing(true);
      setHasNetworkError(false);
      
      const now = new Date();
      const futureDate = new Date();
      futureDate.setDate(now.getDate() + 10); // Set threshold to 10 days from now
      const thresholdDateISO = futureDate.toISOString();
      
      if (!navigator.onLine) {
        setHasNetworkError(true);
        setIsLoading(false);
        setIsRefreshing(false);
        
        const cachedData = localStorage.getItem('upcoming_inspections_cache');
        if (cachedData) {
          const { items, timestamp } = JSON.parse(cachedData);
          const cacheTime = new Date(timestamp);
          const now = new Date();
          const diffHours = (now.getTime() - cacheTime.getTime()) / (1000 * 60 * 60);
          
          if (diffHours < 24) {
            setPpeItems(items);
            setFilteredItems(items);
            toast({
              title: 'Offline Mode',
              description: 'Showing cached data. Connect to internet to update.',
              variant: 'default',
            });
            return;
          }
        }
        
        toast({
          title: 'Network Error',
          description: 'You are offline. Connect to the internet and try again.',
          variant: 'destructive',
        });
        return;
      }
      
      const { data, error } = await supabase
        .from('ppe_items')
        .select('*')
        // .eq('status', 'active') // Temporarily commented out for debugging
        .lte('next_inspection', thresholdDateISO); // Due within the next 10 days or past due
      
      console.log("Raw data from Supabase:", data);
      
      if (error) {
        // Check if the error is the invalid enum value again, though it shouldn't be
        if (error.code === '22P02') { 
          console.error('Supabase enum error persists:', error.message);
          toast({
            title: 'Configuration Error',
            description: `Invalid status value used in query: ${error.message}`,
            variant: 'destructive',
          });
        } else {
          throw error; // Rethrow other errors
        }
      }
      
      if (!data || data.length === 0) {
        setPpeItems([]);
        setFilteredItems([]);
        setIsLoading(false);
        setIsRefreshing(false);
        return;
      }
      
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
      console.log("Mapped items:", mappedItems);
      
      localStorage.setItem('upcoming_inspections_cache', JSON.stringify({
        items: mappedItems,
        timestamp: new Date().toISOString()
      }));
      
      setPpeItems(mappedItems);
      setFilteredItems(mappedItems);
    } catch (error) {
      console.error('Error fetching upcoming inspections:', error);
      setHasNetworkError(true);
      
      toast({
        title: 'Error',
        description: 'Failed to load upcoming inspections',
        variant: 'destructive',
      });
      
      const cachedData = localStorage.getItem('upcoming_inspections_cache');
      if (cachedData) {
        try {
          const { items } = JSON.parse(cachedData);
          setPpeItems(items);
          setFilteredItems(items);
          toast({
            title: 'Using Cached Data',
            description: 'Showing previously loaded data due to connection error',
            variant: 'default',
          });
        } catch (cacheError) {
          console.error('Error parsing cache:', cacheError);
        }
      } else {
        setPpeItems([]);
        setFilteredItems([]);
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const filterItems = () => {
    let results = [...ppeItems];
    
    if (filter !== 'all') {
      const now = new Date();
      
      if (filter === 'overdue') {
        results = results.filter(item => {
          const inspDate = new Date(item.nextInspection || item.createdAt);
          return inspDate < now;
        });
      } else if (filter === 'due') {
        results = results.filter(item => {
          const inspDate = new Date(item.nextInspection || item.createdAt);
          const diffTime = inspDate.getTime() - now.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          return diffDays >= 0 && diffDays <= 10;
        });
      }
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
  
  const handleGenerateReport = async () => {
    try {
      setIsGeneratingReport(true);
      
      const ids = filteredItems.map(item => item.id);
      
      if (ids.length === 0) {
        toast({
          title: 'No Items',
          description: 'There are no items to include in the report',
          variant: 'default',
        });
        return;
      }
      
      await generatePPEItemReport('all');
      
      toast({
        title: 'Report Generated',
        description: 'The report has been downloaded successfully',
      });
    } catch (error) {
      console.error('Error generating report:', error);
      toast({
        title: 'Report Error',
        description: 'Failed to generate report',
        variant: 'destructive',
      });
    } finally {
      setIsGeneratingReport(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Upcoming Inspections</h1>
      
      {hasNetworkError && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Connection Error</AlertTitle>
          <AlertDescription>
            You may be offline or having connection issues. Some features might be limited.
          </AlertDescription>
        </Alert>
      )}
      
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
          value={filter}
          onValueChange={(value) => setFilter(value as 'all' | 'due' | 'overdue')}
        >
          <SelectTrigger className="w-[180px]">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Items</SelectItem>
            <SelectItem value="due">Due Soon (10 days)</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
          </SelectContent>
        </Select>
        
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
        
        <div className="flex gap-2">
          <Button onClick={fetchUpcomingInspections} disabled={isRefreshing}>
            {isRefreshing ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>
          
          <Button 
            variant="outline" 
            onClick={handleGenerateReport} 
            disabled={isGeneratingReport || filteredItems.length === 0}
          >
            {isGeneratingReport ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            ) : (
              <FileDown className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
      
      {isLoading ? (
        <InspectionsSkeleton count={4} />
      ) : filteredItems.length > 0 ? (
        <>
          <p className="text-sm text-muted-foreground mb-4">
            Showing {filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'}
          </p>
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
        </>
      ) : (
        <Card className="text-center py-12 border border-dashed rounded-lg">
          <p className="text-muted-foreground mb-4">No upcoming inspections found</p>
          <Button variant="outline" onClick={() => navigate('/equipment')}>
            View All Equipment
          </Button>
        </Card>
      )}
    </div>
  );
};

export default UpcomingInspections;
