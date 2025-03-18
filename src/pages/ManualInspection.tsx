
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import PageHeader from '@/components/common/PageHeader';
import { PPEType } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePPE } from '@/hooks/usePPE';
import { standardPPETypes } from '@/components/equipment/ConsolidatedPPETypeFilter';

// Define form schema using zod
const formSchema = z.object({
  serialNumber: z.string().min(1, 'Serial number is required'),
  type: z.string().optional(),
  brand: z.string().optional(),
  modelNumber: z.string().optional(),
  manufacturingDate: z.string().optional(),
  expiryDate: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const ManualInspection: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { getPPEBySerialNumber } = usePPE();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submittedSerialNumber, setSubmittedSerialNumber] = useState<string>('');

  // Initialize form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      serialNumber: '',
      type: '',
      brand: '',
      modelNumber: '',
      manufacturingDate: '',
      expiryDate: '',
    },
  });

  const onSubmit = async (data: FormValues) => {
    try {
      if (!user) {
        toast({
          title: 'Authentication Required',
          description: 'You must be logged in to perform inspections',
          variant: 'destructive',
        });
        return;
      }

      setIsLoading(true);
      setError(null);
      setSubmittedSerialNumber(data.serialNumber);

      console.log("Form data:", data);

      // Check if the PPE exists
      const serialNumberQuery = data.serialNumber ? data.serialNumber.trim() : '';
      
      if (!serialNumberQuery) {
        throw new Error('Serial number is required');
      }
      
      console.log("Searching for PPE with serial number:", serialNumberQuery);
      
      // Use our new consolidated hook function
      const ppeItems = await getPPEBySerialNumber(serialNumberQuery);

      if (ppeItems && ppeItems.length > 0) {
        // PPE exists, redirect to inspection form
        const ppeItem = ppeItems[0];
        console.log("PPE found:", ppeItem);
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

      // Set default dates if not provided
      const currentDate = new Date().toISOString().split('T')[0];
      const defaultExpiryDate = new Date();
      defaultExpiryDate.setFullYear(defaultExpiryDate.getFullYear() + 5);
      const defaultExpiryString = defaultExpiryDate.toISOString().split('T')[0];

      const manufacturingDate = data.manufacturingDate || currentDate;
      const expiryDate = data.expiryDate || defaultExpiryString;

      // Calculate next inspection date (1 month from today)
      const nextInspection = new Date();
      nextInspection.setMonth(nextInspection.getMonth() + 1);

      console.log("Creating new PPE with data:", {
        serial_number: data.serialNumber,
        type: data.type,
        brand: data.brand || 'Unknown',
        model_number: data.modelNumber || 'Unknown',
        manufacturing_date: manufacturingDate,
        expiry_date: expiryDate,
        created_by: user.id,
      });

      // Use our consolidated hook for PPE creation
      const { createPPE } = usePPE();
      
      const newPpeData = await createPPE({
        serial_number: data.serialNumber,
        type: data.type,
        brand: data.brand || 'Unknown',
        model_number: data.modelNumber || 'Unknown',
        manufacturing_date: manufacturingDate,
        expiry_date: expiryDate,
      });

      if (!newPpeData || !newPpeData.id) {
        throw new Error('Failed to create new PPE item');
      }

      console.log("New PPE created with ID:", newPpeData.id);
      navigate(`/inspect/${newPpeData.id}`);

    } catch (error: any) {
      console.error('Error in manual inspection:', error);
      setError(error.message || 'An unexpected error occurred');
      toast({
        title: 'Error',
        description: error.message || 'Failed to process inspection request',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container max-w-3xl mx-auto py-6 space-y-6">
      <PageHeader title="Manual Inspection" />
      
      <Card className="w-full">
        <CardHeader>
          <CardTitle>PPE Information</CardTitle>
          <CardDescription>
            Enter the serial number or create a new PPE item
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="serialNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Serial Number*</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter serial number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="bg-muted/50 p-4 rounded-md">
                <h3 className="text-sm font-medium mb-3">If creating new PPE, fill the details below:</h3>
                
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>PPE Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select PPE type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {standardPPETypes.map((type) => (
                              <SelectItem key={type} value={type}>
                                {type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="brand"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Brand</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter brand name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="modelNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Model Number</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter model number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="manufacturingDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Manufacturing Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(new Date(field.value), "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value ? new Date(field.value) : undefined}
                              onSelect={(date) => field.onChange(date ? format(date, "yyyy-MM-dd") : "")}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="expiryDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Expiry Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(new Date(field.value), "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value ? new Date(field.value) : undefined}
                              onSelect={(date) => field.onChange(date ? format(date, "yyyy-MM-dd") : "")}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              
              {error && (
                <div className="p-3 bg-destructive/10 text-destructive rounded-md text-sm">
                  {error}
                </div>
              )}
              
              <CardFooter className="px-0 pt-2">
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </span>
                  ) : 'Start Inspection'}
                </Button>
              </CardFooter>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ManualInspection;
