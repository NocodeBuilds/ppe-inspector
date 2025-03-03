
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase, PPEType } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { Calendar, ArrowLeft, Loader2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const ppeTypes: PPEType[] = [
  'Full Body Harness',
  'Fall Arrester',
  'Double Lanyard',
  'Safety Helmet',
  'Safety Boots',
  'Safety Gloves',
  'Safety Goggles',
  'Ear Protection'
];

const ManualInspection = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  
  const [serialNumber, setSerialNumber] = useState('');
  const [ppeType, setPpeType] = useState<PPEType | ''>('');
  const [brand, setBrand] = useState('');
  const [modelNumber, setModelNumber] = useState('');
  const [manufacturingDate, setManufacturingDate] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  
  // Check if serial number exists when user types it
  const [isCheckingSerial, setIsCheckingSerial] = useState(false);
  const [existingPPE, setExistingPPE] = useState<any>(null);
  
  const checkSerialNumber = async (value: string) => {
    if (!value.trim()) return;
    
    try {
      setIsCheckingSerial(true);
      const { data, error } = await supabase
        .from('ppe_items')
        .select('*')
        .eq('serial_number', value.trim())
        .single();
        
      if (error && error.code !== 'PGRST116') throw error;
      
      if (data) {
        setExistingPPE(data);
        // Auto-fill other fields
        setPpeType(data.type as PPEType);
        setBrand(data.brand);
        setModelNumber(data.model_number);
        setManufacturingDate(data.manufacturing_date);
        setExpiryDate(data.expiry_date);
        
        toast({
          title: 'PPE Found',
          description: 'Details have been auto-filled from database',
        });
      } else {
        setExistingPPE(null);
      }
    } catch (error) {
      console.error('Error checking serial number:', error);
    } finally {
      setIsCheckingSerial(false);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!serialNumber || !ppeType || !brand || !modelNumber || !manufacturingDate || !expiryDate) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // If PPE doesn't exist, create it first
      let ppeId;
      
      if (existingPPE) {
        ppeId = existingPPE.id;
      } else {
        // Calculate next inspection date (3 months from manufacturing date)
        const mfgDate = new Date(manufacturingDate);
        const nextInspection = new Date(mfgDate);
        nextInspection.setMonth(nextInspection.getMonth() + 3);
        
        // Create the PPE item
        const { data: newPPE, error: ppeError } = await supabase
          .from('ppe_items')
          .insert({
            serial_number: serialNumber,
            type: ppeType,
            brand: brand,
            model_number: modelNumber,
            manufacturing_date: manufacturingDate,
            expiry_date: expiryDate,
            status: new Date(expiryDate) < new Date() ? 'expired' : 'active',
            created_by: user?.id,
            next_inspection: nextInspection.toISOString(),
          })
          .select('id')
          .single();
          
        if (ppeError) throw ppeError;
        ppeId = newPPE.id;
      }
      
      // Redirect to inspection form with the PPE ID
      navigate(`/inspect/${ppeId}`);
      
    } catch (error: any) {
      console.error('Error creating PPE:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create PPE record',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="fade-in pb-20">
      <div className="flex items-center mb-6">
        <Button 
          variant="ghost" 
          size="sm"
          className="mr-2"
          onClick={() => navigate('/start-inspection')}
        >
          <ArrowLeft size={18} />
        </Button>
        <h1 className="text-2xl font-bold">Manual Entry</h1>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="serialNumber">Serial Number</Label>
            <div className="relative mt-1">
              <Input
                id="serialNumber"
                type="text"
                value={serialNumber}
                onChange={(e) => setSerialNumber(e.target.value)}
                onBlur={(e) => checkSerialNumber(e.target.value)}
                className="pr-8"
              />
              {isCheckingSerial && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                </div>
              )}
            </div>
            {existingPPE && (
              <p className="text-xs text-green-600 mt-1">
                PPE with this serial number found in database
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="ppeType">PPE Type</Label>
            <Select 
              value={ppeType} 
              onValueChange={(value) => setPpeType(value as PPEType)}
              disabled={!!existingPPE}
            >
              <SelectTrigger id="ppeType" className="mt-1">
                <SelectValue placeholder="Select PPE type" />
              </SelectTrigger>
              <SelectContent>
                {ppeTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="brand">Brand</Label>
            <Input
              id="brand"
              type="text"
              className="mt-1"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              disabled={!!existingPPE}
            />
          </div>

          <div>
            <Label htmlFor="modelNumber">Model Number</Label>
            <Input
              id="modelNumber"
              type="text"
              className="mt-1"
              value={modelNumber}
              onChange={(e) => setModelNumber(e.target.value)}
              disabled={!!existingPPE}
            />
          </div>

          <div>
            <Label htmlFor="manufacturingDate">Manufacturing Date</Label>
            <div className="relative mt-1">
              <Input
                id="manufacturingDate"
                type="date"
                className="mt-1 pl-10"
                value={manufacturingDate}
                onChange={(e) => setManufacturingDate(e.target.value)}
                disabled={!!existingPPE}
              />
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            </div>
          </div>

          <div>
            <Label htmlFor="expiryDate">Expiry Date</Label>
            <div className="relative mt-1">
              <Input
                id="expiryDate"
                type="date"
                className="mt-1 pl-10"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                disabled={!!existingPPE}
              />
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            </div>
          </div>
        </div>

        <Button 
          type="submit" 
          className="w-full" 
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            'Proceed to Inspection'
          )}
        </Button>
      </form>
    </div>
  );
};

export default ManualInspection;
