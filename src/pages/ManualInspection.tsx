
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
import { Camera, Calendar, Loader2, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import QRCodeScanner from '@/components/inspection/QRCodeScanner';
import { PPEType } from '@/types';
import { getAllPPETypes } from '@/services/checkpointService';
import { useAuth } from '@/hooks/useAuth';

interface ManualInspectionFormValues {
  serialNumber: string;
  type: string;
  brand: string;
  modelNumber: string;
  manufacturingDate: string;
  expiryDate: string;
}

const ManualInspection = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [ppeTypes, setPpeTypes] = useState<PPEType[]>([]);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors }
  } = useForm<ManualInspectionFormValues>();
  
  const selectedType = watch('type');
  
  useEffect(() => {
    // Use standardized PPE types
    setPpeTypes(getAllPPETypes());
  }, []);
  
  const checkPPEExistence = async (serialNumber: string) => {
    console.log("checkPPEExistence called with serialNumber:", serialNumber);
    try {
      setIsLoading(true);
      setError(null);
      
      // Determine if input is a valid UUID
      const isValidUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(serialNumber);
      
      let ppeData;
      
      if (isValidUUID) {
        // If valid UUID, try to find by ID first
        const { data, error } = await supabase
          .from('ppe_items')
          .select('*')
          .eq('id', serialNumber)
          .maybeSingle();
          
        if (error) {
          console.error("Error checking PPE by ID:", error);
          throw error;
        }
        
        ppeData = data;
      }
      
      // If not found by ID or not a UUID, search by serial number
      if (!ppeData) {
        const { data, error } = await supabase
          .from('ppe_items')
          .select('*')
          .eq('serial_number', serialNumber)
          .maybeSingle();
          
        if (error) {
          console.error("Error checking PPE by serial number:", error);
          throw error;
        }
        
        ppeData = data;
      }

      if (!ppeData) {
        // PPE doesn't exist, create a new one
        if (!watch('type')) {
          toast({
            title: 'Error',
            description: 'PPE type is required for new equipment',
            variant: 'destructive'
          });
          return;
        }

        // Set default expiry date (5 years from now)
        const defaultExpiryDate = new Date();
        defaultExpiryDate.setFullYear(defaultExpiryDate.getFullYear() + 5);
        const defaultExpiryString = defaultExpiryDate.toISOString().split('T')[0];

        const currentDate = new Date().toISOString().split('T')[0];
        const manufacturingDate = watch('manufacturingDate') || currentDate;
        const expiryDate = watch('expiryDate') || defaultExpiryString;

        // Calculate next inspection date (1 month from today)
        const nextInspection = new Date();
        nextInspection.setMonth(nextInspection.getMonth() + 1);
        const nextInspectionString = nextInspection.toISOString().split('T')[0];

        console.log("Creating new PPE with data:", {
          serial_number: serialNumber,
          type: watch('type'),
          brand: watch('brand') || 'Unknown',
          model_number: watch('modelNumber') || 'Unknown',
          manufacturing_date: manufacturingDate,
          expiry_date: expiryDate,
          created_by: user.id,
          status: 'active',
          next_inspection_date: nextInspectionString,
        });

        const { data: newPpeData, error: insertError } = await supabase
          .from('ppe_items')
          .insert({
            serial_number: serialNumber,
            type: watch('type'),
            brand: watch('brand') || 'Unknown',
            model_number: watch('modelNumber') || 'Unknown',
            manufacturing_date: manufacturingDate,
            expiry_date: expiryDate,
            status: 'active',
            next_inspection_date: nextInspectionString,
            created_by: user.id,
          })
          .select()
          .single();

        if (insertError) {
          console.error("Error inserting new PPE:", insertError);
          toast({
            title: 'Error Inserting PPE',
            description: insertError.message,
            variant: 'destructive'
          });
          return;
        }

        toast({
          title: 'PPE Created',
          description: 'New PPE item created successfully'
        });

        navigate(`/inspect/${newPpeData.id}`);

      } else {
        // PPE exists, navigate to inspection page
        console.log("PPE exists, navigating to inspection page");
        navigate(`/inspect/${ppeData.id}`);
      }
    } catch (error: any) {
      console.error('Error checking PPE existence:', error);
      setError(error.message || 'Failed to check PPE existence');
      toast({
        title: 'Error Checking PPE',
        description: error.message || 'An unexpected error occurred',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (values: ManualInspectionFormValues) => {
    if (!values.serialNumber.trim()) {
      toast({
        title: 'Error',
        description: 'Serial number is required',
        variant: 'destructive'
      });
      return;
    }
    
    await checkPPEExistence(values.serialNumber);
  };

  const handleQRCodeResult = (result: string) => {
    // Assuming the QR code contains the serial number
    setValue('serialNumber', result);
    setIsScanning(false);
    
    toast({
      title: 'QR Code Scanned',
      description: `Serial number: ${result}`
    });
  };
  
  const handleScanError = (error: string) => {
    console.error('QR scan error:', error);
    setIsScanning(false);
    
    // Only show toast for actual errors, not for user cancellations
    if (error !== 'Scanning cancelled') {
      toast({
        title: 'Scan Error',
        description: 'QR code scanning encountered an error',
        variant: 'destructive'
      });
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-6 pb-24">
      <h1 className="text-2xl font-bold mb-6">Start Inspection</h1>
      
      <div className="mb-6">
        <Button 
          onClick={() => setIsScanning(true)} 
          className="w-full flex items-center justify-center"
        >
          <Camera className="mr-2" size={18} />
          Scan QR Code
        </Button>
      </div>
      
      {error && (
        <div className="mb-6 p-4 border border-destructive/50 bg-destructive/10 rounded-md text-destructive">
          <p className="font-medium">Error</p>
          <p className="text-sm">{error}</p>
        </div>
      )}
      
      <Card className="border border-border/40 shadow-sm">
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="serialNumber">PPE Serial Number / ID</Label>
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
                  value={selectedType}
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
            
            <Button 
              type="submit" 
              className="w-full flex items-center justify-center" 
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                'Start Inspection'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
      
      {isScanning && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-lg shadow-lg max-w-md w-full p-6 border border-border/40">
            <div className="flex justify-end mb-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setIsScanning(false);
                }}
                className="h-8 w-8"
              >
                <X size={18} />
              </Button>
            </div>
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
