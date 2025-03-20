
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useInspectionHistory } from '@/hooks/useInspectionHistory';
import InspectionList from '@/components/inspections/InspectionList';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';

const EquipmentInspectionHistory = () => {
  const { ppeId } = useParams<{ ppeId: string }>();
  const navigate = useNavigate();
  const [ppeItem, setPpeItem] = useState<any>(null);
  const [isLoadingPPE, setIsLoadingPPE] = useState(true);
  const [filters, setFilters] = useState({
    searchTerm: '',
    type: 'all',
    result: 'all'
  });
  
  // Fetch PPE item details
  useEffect(() => {
    const fetchPPEItem = async () => {
      if (!ppeId) return;
      
      try {
        setIsLoadingPPE(true);
        const { data, error } = await supabase
          .from('ppe_items')
          .select('*')
          .eq('id', ppeId)
          .single();
        
        if (error) throw error;
        setPpeItem(data);
      } catch (error) {
        console.error('Error fetching PPE item:', error);
        toast({
          title: 'Error',
          description: 'Failed to load equipment details',
          variant: 'destructive',
        });
      } finally {
        setIsLoadingPPE(false);
      }
    };
    
    fetchPPEItem();
  }, [ppeId]);
  
  // Use our custom hook to fetch inspection history for this PPE
  const { inspections, isLoading, error, refetch } = useInspectionHistory({ 
    ppeId: ppeId,
  });
  
  // Handle filter changes
  const handleFilterChange = (newFilters: any) => {
    setFilters({ ...filters, ...newFilters });
    
    // Apply client-side filtering
    // In a real app, we'd update the useInspectionHistory hook to handle this server-side
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button 
          variant="ghost" 
          size="sm"
          className="mr-2"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={18} />
        </Button>
        
        <div>
          <h1 className="text-2xl font-bold">Inspection History</h1>
          {ppeItem && (
            <p className="text-muted-foreground">
              {ppeItem.type} - Serial: {ppeItem.serial_number}
            </p>
          )}
        </div>
      </div>
      
      {isLoadingPPE ? (
        <div className="h-[400px] flex items-center justify-center">
          <p>Loading equipment details...</p>
        </div>
      ) : (
        <div className="space-y-6">
          <InspectionList
            inspections={inspections}
            isLoading={isLoading}
            showFilters={true}
            onFilterChange={handleFilterChange}
            emptyMessage="No inspection records found for this equipment"
          />
          
          <div className="flex justify-between mt-8">
            <Button
              variant="outline"
              onClick={() => navigate(-1)}
            >
              Back
            </Button>
            
            {ppeItem && (
              <Button
                onClick={() => navigate(`/inspect/${ppeItem.serial_number}`)}
              >
                Perform New Inspection
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default EquipmentInspectionHistory;
