import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import PageHeader from '@/components/common/PageHeader';
import { PPEType } from '@/types/index';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { usePPE } from '@/hooks/usePPE';
import { standardPPETypes } from '@/components/equipment/ConsolidatedPPETypeFilter';

// Define form schema
const formSchema = z.object({
  serialNumber: z.string().min(1, "Serial number is required"),
  type: z.string().optional(),
  brand: z.string().optional(),
  modelNumber: z.string().optional(),
  manufacturingDate: z.string().optional(),
  expiryDate: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const ManualInspection = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { createPPE, getPPEBySerialNumber } = usePPE();

  // Initialize form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      serialNumber: "",
      type: "",
      brand: "",
      modelNumber: "",
      manufacturingDate: "",
      expiryDate: "",
    }
  });

  // Form submission handler
  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // First, check if PPE with serial number exists
      const ppeItems = await getPPEBySerialNumber(values.serialNumber);
      
      if (ppeItems && ppeItems.length > 0) {
        // If it exists, start inspection for the first matching PPE item
        const existingPPE = ppeItems[0];
        navigate(`/inspect/${existingPPE.id}`);
        return;
      }
      
      // If it doesn't exist, create new PPE with the provided details
      if (!values.type) {
        setError("Type is required when creating a new PPE item");
        setIsLoading(false);
        return;
      }
      
      const newPPE = await createPPE({
        serial_number: values.serialNumber,
        type: values.type as PPEType,
        brand: values.brand || "",
        model_number: values.modelNumber || "",
        manufacturing_date: values.manufacturingDate || "",
        expiry_date: values.expiryDate || "",
      });
      
      if (newPPE) {
        toast({
          title: "PPE Created",
          description: "The new PPE item has been successfully created",
        });
        navigate(`/inspect/${newPPE.id}`);
      }
    } catch (err: any) {
      setError(err.message || "An error occurred while processing");
      console.error("Error in manual inspection:", err);
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
              {/* Serial Number Field */}
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
              {/* PPE Details */}
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