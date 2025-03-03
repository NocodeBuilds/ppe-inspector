
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, PPEItem } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { Search, Camera, ArrowRight, Loader2 } from 'lucide-react';
import QRCodeScanner from '@/components/inspection/QRCodeScanner';
import CardOverlay from '@/components/ui/card-overlay';

const StartInspection = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [ppeItems, setPpeItems] = useState<PPEItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<PPEItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showQRScanner, setShowQRScanner] = useState(false);
  
  useEffect(() => {
    fetchPPEItems();
  }, []);
  
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredItems(ppeItems);
    } else {
      const filtered = ppeItems.filter(item => 
        item.serial_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.brand.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredItems(filtered);
    }
  }, [searchQuery, ppeItems]);
  
  const fetchPPEItems = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('ppe_items')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      setPpeItems(data || []);
      setFilteredItems(data || []);
    } catch (error: any) {
      console.error('Error fetching PPE items:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to load PPE items',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleQRScan = (data: string) => {
    setShowQRScanner(false);
    if (!data) return;
    
    try {
      // Assuming QR code contains the serial number
      const serialNumber = data.trim();
      const foundItem = ppeItems.find(item => item.serial_number === serialNumber);
      
      if (foundItem) {
        navigate(`/inspect/${foundItem.id}`);
      } else {
        toast({
          title: 'PPE Not Found',
          description: `No PPE found with serial number: ${serialNumber}`,
          variant: 'destructive',
        });
        setSearchQuery(serialNumber);
      }
    } catch (error) {
      toast({
        title: 'Invalid QR Code',
        description: 'The scanned QR code is not in the expected format',
        variant: 'destructive',
      });
    }
  };
  
  const handleSelect = (ppeId: string) => {
    navigate(`/inspect/${ppeId}`);
  };
  
  const handleManualEntry = () => {
    navigate('/inspect/new');
  };
  
  return (
    <div className="fade-in pb-20">
      <div className="flex flex-col mb-6">
        <h1 className="text-2xl font-bold mb-2">Start Inspection</h1>
        <p className="text-muted-foreground mb-6">
          Scan a QR code or search for PPE by serial number
        </p>
        
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search by serial number, type or brand..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2 mb-6">
          <Button 
            onClick={() => setShowQRScanner(true)}
            className="flex-1"
          >
            <Camera size={16} className="mr-2" />
            Scan QR Code
          </Button>
          
          <Button 
            variant="outline" 
            onClick={handleManualEntry}
            className="flex-1"
          >
            Manual Entry
          </Button>
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center my-12">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center my-8">
          <p className="text-muted-foreground mb-4">No PPE items found matching your search.</p>
          <Button onClick={handleManualEntry} variant="default">
            Create New Inspection
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <h2 className="text-lg font-medium">Select Equipment</h2>
          {filteredItems.map((ppe) => (
            <Card 
              key={ppe.id}
              className="p-4 hover:bg-muted/50 cursor-pointer transition-colors flex justify-between items-center"
              onClick={() => handleSelect(ppe.id)}
            >
              <div>
                <h3 className="font-medium uppercase">{ppe.type}</h3>
                <p className="text-sm text-muted-foreground">SN: {ppe.serial_number}</p>
                <p className="text-sm text-muted-foreground">Brand: {ppe.brand}</p>
              </div>
              <ArrowRight size={16} className="text-muted-foreground" />
            </Card>
          ))}
        </div>
      )}
      
      <CardOverlay show={showQRScanner} onClose={() => setShowQRScanner(false)}>
        <QRCodeScanner 
          onScan={handleQRScan}
          onCancel={() => setShowQRScanner(false)}
        />
      </CardOverlay>
    </div>
  );
};

export default StartInspection;
