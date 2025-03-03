
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { AlertTriangle, Calendar, ArrowRight, Info, Loader2, Search, Filter, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';

interface FlaggedItem {
  id: string;
  ppe_id: string;
  ppe_type: string;
  ppe_serial: string;
  inspection_date: string;
  issue_count: number;
  inspector_name: string;
}

const FlaggedIssues = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [flaggedItems, setFlaggedItems] = useState<FlaggedItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<FlaggedItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string | null>(null);
  
  useEffect(() => {
    if (user) {
      fetchFlaggedIssues();
    }
  }, [user]);
  
  useEffect(() => {
    if (searchQuery.trim() === '' && !filterType) {
      setFilteredItems(flaggedItems);
    } else {
      let filtered = flaggedItems;
      
      // Apply text search filter
      if (searchQuery.trim() !== '') {
        filtered = filtered.filter(item => 
          item.ppe_serial.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.ppe_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.inspector_name.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }
      
      // Apply type filter
      if (filterType) {
        filtered = filtered.filter(item => item.ppe_type === filterType);
      }
      
      setFilteredItems(filtered);
    }
  }, [searchQuery, filterType, flaggedItems]);
  
  const fetchFlaggedIssues = async () => {
    try {
      setIsLoading(true);
      
      // Query to get flagged inspections with failed checkpoints
      const { data, error } = await supabase
        .from('inspections')
        .select(`
          id,
          ppe_id,
          date,
          inspector_id,
          overall_result,
          ppe_items(type, serial_number),
          profiles(full_name)
        `)
        .eq('overall_result', 'fail')
        .order('date', { ascending: false });
        
      if (error) throw error;
      
      if (data) {
        // Get counts of failed checkpoints for each inspection
        const inspectionIds = data.map(item => item.id);
        
        // Changed approach: Instead of using group(), we'll fetch all failed results
        // and count them for each inspection ID in JavaScript
        const { data: failedResults, error: countError } = await supabase
          .from('inspection_results')
          .select('inspection_id')
          .eq('passed', false)
          .in('inspection_id', inspectionIds);
          
        if (countError) throw countError;
        
        // Count failed checkpoints for each inspection
        const failCounts: Record<string, number> = {};
        
        if (failedResults) {
          failedResults.forEach(result => {
            const id = result.inspection_id;
            if (id) {
              failCounts[id] = (failCounts[id] || 0) + 1;
            }
          });
        }
        
        // Format data for display
        const formattedData = data.map(item => {
          const failCount = failCounts[item.id] || 0;
          
          return {
            id: item.id,
            ppe_id: item.ppe_id,
            ppe_type: item.ppe_items?.type || 'Unknown',
            ppe_serial: item.ppe_items?.serial_number || 'Unknown',
            inspection_date: item.date,
            issue_count: failCount,
            inspector_name: item.profiles?.full_name || 'Unknown',
          };
        });
        
        setFlaggedItems(formattedData);
        setFilteredItems(formattedData);
      }
    } catch (error: any) {
      console.error('Error fetching flagged issues:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to load flagged issues',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleViewDetails = (inspectionId: string) => {
    navigate(`/inspection/${inspectionId}`);
  };

  const getUniqueTypes = () => {
    const types = new Set(flaggedItems.map(item => item.ppe_type));
    return Array.from(types);
  };
  
  const clearFilters = () => {
    setSearchQuery('');
    setFilterType(null);
  };
  
  return (
    <div className="fade-in pb-20">
      <div className="flex flex-col mb-6">
        <h1 className="text-2xl font-bold mb-2">Flagged Issues</h1>
        <p className="text-muted-foreground mb-6">
          View PPE items that have failed inspection
        </p>
        
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by serial number, type or inspector..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex gap-2">
                  <Filter size={16} />
                  {filterType ? filterType : 'Filter by Type'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {getUniqueTypes().map((type) => (
                  <DropdownMenuItem key={type} onClick={() => setFilterType(type)}>
                    {type}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={clearFilters}
              title="Clear filters"
              disabled={!searchQuery && !filterType}
            >
              <RefreshCw size={16} />
            </Button>
          </div>
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center my-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center my-12 p-6 border rounded-lg bg-muted/30">
          <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
            <Info size={24} className="text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-2">No Flagged Issues</h3>
          <p className="text-muted-foreground mb-6">
            {searchQuery || filterType ? 
              'No items match your search criteria.' : 
              'There are no PPE items that have failed inspection.'}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={() => navigate('/start-inspection')}>
              Start New Inspection
            </Button>
            {(searchQuery || filterType) && (
              <Button variant="outline" onClick={clearFilters}>
                Clear Filters
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-medium">Equipment with Issues</h2>
            <p className="text-sm text-muted-foreground">{filteredItems.length} items found</p>
          </div>
          {filteredItems.map((item) => (
            <Card 
              key={item.id}
              className="p-4 hover:bg-muted/30 cursor-pointer transition-colors"
              onClick={() => handleViewDetails(item.id)}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center">
                  <AlertTriangle size={16} className="text-destructive mr-2" />
                  <h3 className="font-medium">{item.ppe_type}</h3>
                </div>
                <Badge variant="destructive">{item.issue_count} Failed</Badge>
              </div>
              
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-sm">SN: {item.ppe_serial}</p>
                  <p className="text-sm text-muted-foreground flex items-center">
                    <Calendar size={12} className="mr-1" />
                    {format(new Date(item.inspection_date), 'MMM d, yyyy')}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Inspector: {item.inspector_name}
                  </p>
                </div>
                <ArrowRight size={16} className="text-muted-foreground" />
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default FlaggedIssues;
