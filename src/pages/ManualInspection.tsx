
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { Search, Scan } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePPE } from '@/hooks/usePPE';

const ManualInspection = () => {
  const [ppeTypes, setPpeTypes] = useState<string[]>([]);
  const [selectedType, setSelectedType] = useState<string>('');
  const [serialNumber, setSerialNumber] = useState<string>('');
  const [isSearching, setIsSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { getPPEBySerialNumber } = usePPE();

  useEffect(() => {
    if (!user) {
      toast({
        title: 'Not authenticated',
        description: 'Please login to access this page',
        variant: 'destructive'
      });
      navigate('/login');
      return;
    }

    fetchPPETypes();
  }, [user, navigate, toast]);

  const fetchPPETypes = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('ppe_items')
        .select('type')
        .order('type');

      if (error) {
        throw error;
      }

      // Extract unique types
      const uniqueTypes = [...new Set(data.map(item => item.type))];
      setPpeTypes(uniqueTypes);
    } catch (error) {
      console.error('Error fetching PPE types:', error);
      toast({
        title: 'Error',
        description: 'Failed to load PPE types',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serialNumber.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a serial number',
        variant: 'destructive'
      });
      return;
    }

    try {
      setIsSearching(true);
      const ppeItems = await getPPEBySerialNumber(serialNumber.trim());
      
      if (!ppeItems || ppeItems.length === 0) {
        toast({
          title: 'Not Found',
          description: 'No PPE found with this serial number',
          variant: 'destructive'
        });
        return;
      }
      
      if (ppeItems.length === 1) {
        // Navigate to inspection form with the found PPE ID
        navigate(`/inspect/${ppeItems[0].id}`);
      } else {
        // Multiple items found, could show a selection dialog
        toast({
          title: 'Multiple Found',
          description: 'Multiple PPE items found with similar serial numbers. Please be more specific.',
          variant: 'warning'
        });
      }
    } catch (error) {
      console.error('Error searching by serial:', error);
      toast({
        title: 'Error',
        description: 'Failed to search for PPE',
        variant: 'destructive'
      });
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Manual Inspection</h1>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Search by Serial Number</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="flex space-x-2">
                <Input
                  value={serialNumber}
                  onChange={(e) => setSerialNumber(e.target.value)}
                  placeholder="Enter serial number"
                  className="flex-1"
                />
                <Button type="submit" disabled={isSearching}>
                  {isSearching ? (
                    <div className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Searching
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <Search className="h-4 w-4 mr-2" />
                      Search
                    </div>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Browse by Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Select
                value={selectedType}
                onValueChange={setSelectedType}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select PPE Type" />
                </SelectTrigger>
                <SelectContent>
                  {ppeTypes.map(type => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Button 
                className="w-full"
                disabled={!selectedType}
                onClick={() => {
                  if (selectedType) {
                    navigate('/equipment', { state: { filterType: selectedType } });
                  }
                }}
              >
                Browse Equipment
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Button
        variant="outline"
        className="mt-6"
        onClick={() => navigate(-1)}
      >
        Go Back
      </Button>
    </div>
  );
};

export default ManualInspection;
