import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PPEType } from '@/types/index';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { usePPE } from '@/hooks/usePPE';
import { standardPPETypes } from '@/components/equipment/ConsolidatedPPETypeFilter';
import { X } from "lucide-react";
import { DatePicker } from '@/components/ui/date-picker';

// Define form schema
const formSchema = z.object({
  serialNumber: z.string().min(1, "Serial number is required"),
  type: z.string().min(1, "PPE type is required"),
  brand: z.string().min(1, "Brand is required"),
  modelNumber: z.string().min(1, "Model number is required"),
  manufacturingDate: z.date({
    required_error: "Manufacturing date is required",
  }),
  expiryDate: z.date({
    required_error: "Expiry date is required",
  }),
});

type FormValues = z.infer<typeof formSchema>;

const ManualInspection = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { createPPE, getPPEBySerialNumber } = usePPE();

  // Initialize form with default dates
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      serialNumber: "",
      type: "",
      brand: "",
      modelNumber: "",
      manufacturingDate: new Date(),
      expiryDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
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
        manufacturing_date: values.manufacturingDate.toISOString(),
        expiry_date: values.expiryDate.toISOString(),
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
    <div className="container max-w-lg mx-auto py-6">
      <div className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 rounded-xl border shadow-sm">
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-primary font-semibold">Manual Inspection</h2>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              onClick={() => navigate(-1)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Serial Number Field */}
              <FormField
                control={form.control}
                name="serialNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-body-sm">Serial Number</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter serial number" 
                        {...field} 
                        className="text-body bg-background"
                      />
                    </FormControl>
                    <FormMessage className="text-caption" />
                  </FormItem>
                )}
              />
              
              {/* PPE Type */}
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-body-sm">PPE Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="text-body bg-background">
                          <SelectValue placeholder="Select PPE type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {standardPPETypes.map((type) => (
                          <SelectItem key={type} value={type} className="text-body">
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-caption" />
                  </FormItem>
                )}
              />
              
              {/* Brand */}
              <FormField
                control={form.control}
                name="brand"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-body-sm">Brand</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter brand name" 
                        {...field} 
                        className="text-body bg-background"
                      />
                    </FormControl>
                    <FormMessage className="text-caption" />
                  </FormItem>
                )}
              />
              
              {/* Model Number */}
              <FormField
                control={form.control}
                name="modelNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-body-sm">Model Number</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter model number" 
                        {...field} 
                        className="text-body bg-background"
                      />
                    </FormControl>
                    <FormMessage className="text-caption" />
                  </FormItem>
                )}
              />
              
              {/* Manufacturing Date */}
              <FormField
                control={form.control}
                name="manufacturingDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-body-sm">Manufacturing Date</FormLabel>
                    <FormControl>
                      <DatePicker
                        date={field.value}
                        setDate={field.onChange}
                        placeholder="Select manufacturing date"
                        disableFutureDates
                        className="text-body"
                      />
                    </FormControl>
                    <FormMessage className="text-caption" />
                  </FormItem>
                )}
              />
              
              {/* Expiry Date */}
              <FormField
                control={form.control}
                name="expiryDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-body-sm">Expiry Date</FormLabel>
                    <FormControl>
                      <DatePicker
                        date={field.value}
                        setDate={field.onChange}
                        placeholder="Select expiry date"
                        disablePastDates
                        className="text-body"
                      />
                    </FormControl>
                    <FormMessage className="text-caption" />
                  </FormItem>
                )}
              />

              {error && (
                <div className="p-3 bg-destructive/10 text-destructive rounded-md text-caption">
                  {error}
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full text-body-sm bg-primary hover:bg-primary/90"
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
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default ManualInspection;
