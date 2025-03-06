
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import QRCodeScanner from '@/components/inspection/QRCodeScanner';
import { PPEType } from '@/types';
import { getAllPPETypes } from '@/services/checkpointService';

const ManualInspection = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [ppeTypes, setPpeTypes] = useState<PPEType[]>([]);
  const [submittedSerialNumber, setSubmittedSerialNumber] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors }
  } = useForm();
  
  useEffect(() => {
    // Use standardized PPE types
    setPpeTypes(getAllPPETypes());
  }, []);
  
  const onSubmit = async (data: any) => {
    try {
      setIsLoading(true);
      setSubmittedSerialNumber(data.serialNumber);
      
      // Check if the PPE exists
      const { data: ppeData, error: ppeError } = await supabase
        .from('ppe_items')
        .select('*')
        .or(`serial_number.eq.${data.serialNumber},id.eq.${data.serialNumber}`);
      
      if (ppeError) throw ppeError;
      
      if (ppeData && ppeData.length > 0) {
        // PPE exists, redirect to inspection form
        const ppeItem = ppeData[0];
        navigate(`/inspect/${ppeItem.id}`);
        return;
      }
      
      // PPE doesn't exist, create a new one
      if (!data.type) {
        toast({
          title: 'Error',
          description: 'PPE type is required for new equipment',
          variant: 'destructive',
        });
        setIsLoading(false);
        return;
      }
      
      // Calculate next inspection date (3 months from today)
      const manufacturingDate = data.manufacturingDate ? new Date(data.manufacturingDate) : new Date();
      const nextInspection = new Date();
      nextInspection.setMonth(nextInspection.getMonth() + 3);
      
      // Insert new PPE
      const { data: newPpeData, error: insertError } = await supabase
        .from('ppe_items')
        .insert({
          serial_number: data.serialNumber,
          type: data.type,
          brand: data.brand || 'Unknown',
          model_number: data.modelNumber || 'Unknown',
          manufacturing_date: data.manufacturingDate || new Date().toISOString(),
          expiry_date: data.expiryDate || new Date(new Date().setFullYear(new Date().getFullYear() + 5)).toISOString(),
          status: 'active',
          next_inspection: nextInspection.toISOString(),
        })
        .select('id')
        .single();
      
      if (insertError) throw insertError;
      
      // Navigate to inspection form with new PPE ID
      navigate(`/inspect/${newPpeData.id}`);
      
    } catch (error) {
      console.error('Error in manual inspection:', error);
      toast({
        title: 'Error',
        description: 'Failed to process inspection request',
        variant: 'destructive',
      });
      setIsLoading(false);
    }
  };
  
  const handleQRCodeResult = (result: string) => {
    // Assuming the QR code contains the serial number
    setValue('serialNumber', result);
    setIsScanning(false);
    
    toast({
      title: 'QR Code Scanned',
      description: `Serial number: ${result}`,
    });
  };
  
  const handleScanError = (error: string) => {
    console.error('QR scan error:', error);
    setIsScanning(false);
    
    toast({
      title: 'Scan Cancelled',
      description: 'QR code scanning was cancelled or encountered an error',
      variant: 'destructive',
    });
  };
  
  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Start Inspection</h1>
      
      <div className="mb-6">
        <Button 
          onClick={() => setIsScanning(true)} 
          className="w-full"
        >
          Scan QR Code
        </Button>
      </div>
      
      <Card className="border border-border/40 shadow-sm">
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="serialNumber">Serial Number / ID</Label>
              <Input
                id="serialNumber"
                placeholder="Enter PPE serial number or ID"
                {...register('serialNumber', { required: 'Serial number is required' })}
              />
              {errors.serialNumber && (
                <p className="text-xs text-destructive">{errors.serialNumber.message as string}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                If this is new equipment, please provide additional details:
              </p>
              
              <div className="space-y-2">
                <Label htmlFor="type">PPE Type</Label>
                <Select 
                  onValueChange={(value) => setValue('type', value)}
                >
                  <SelectTrigger id="type">
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
              
              <div className="space-y-2">
                <Label htmlFor="brand">Brand (Optional)</Label>
                <Input
                  id="brand"
                  placeholder="Enter brand name"
                  {...register('brand')}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="modelNumber">Model Number (Optional)</Label>
                <Input
                  id="modelNumber"
                  placeholder="Enter model number"
                  {...register('modelNumber')}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="manufacturingDate">Manufacturing Date (Optional)</Label>
                <div className="relative">
                  <Input
                    id="manufacturingDate"
                    type="date"
                    className="pl-10"
                    {...register('manufacturingDate')}
                  />
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="expiryDate">Expiry Date (Optional)</Label>
                <div className="relative">
                  <Input
                    id="expiryDate"
                    type="date"
                    className="pl-10"
                    {...register('expiryDate')}
                  />
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                </div>
              </div>
            </div>
            
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Processing...' : 'Start Inspection'}
            </Button>
          </form>
        </CardContent>
      </Card>
      
      {isScanning && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-lg shadow-lg max-w-md w-full p-6 border border-border/40">
            <QRCodeScanner 
              onResult={handleQRCodeResult} 
              onError={handleScanError} 
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ManualInspection;
