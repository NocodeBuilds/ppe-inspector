
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
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { usePPE } from '@/hooks/usePPE';
import { standardPPETypes } from '@/components/equipment/ConsolidatedPPETypeFilter';
import { X } from "lucide-react";
import { DatePicker } from '@/components/ui/date-picker';
import CardOverlay from '@/components/ui/card-overlay';

// Define form schema
const formSchema = z.object({
  serialNumber: z.string().min(1, "Serial number is required"),
  batchNumber: z.string().optional(),
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

interface ManualInspectionProps {
  show?: boolean;
  onClose?: () => void;
}

const ManualInspection = ({ show = true, onClose }: ManualInspectionProps) => {
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
      batchNumber: "",
      type: "",
      brand: "",
      modelNumber: "",
      manufacturingDate: new Date(),
      expiryDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
    }
  });

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      navigate(-1);
    }
  };

  // Form submission handler
  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // First, check if PPE with serial number and batch number exists
      const ppeItems = await getPPEBySerialNumber(values.serialNumber, values.batchNumber);
      
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
        batch_number: values.batchNumber,
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

  const content = (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-primary">Manual Inspection</h2>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleClose}
          className="h-8 w-8 p-0 rounded-full"
        >
          ✕
        </Button>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* PPE Type */}
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-body-sm">PPE Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="text-body">
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

          {/* Serial Number and Batch Number */}
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="serialNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-body-sm">
                    Serial Number
                    <span className="text-destructive ml-1">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter serial number" 
                      {...field} 
                      className="text-body"
                    />
                  </FormControl>
                  <FormMessage className="text-caption" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="batchNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-body-sm">Batch Number</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter batch number" 
                      {...field} 
                      className="text-body"
                    />
                  </FormControl>
                  <FormMessage className="text-caption" />
                </FormItem>
              )}
            />
          </div>

          {/* Brand and Model Number */}
          <div className="grid grid-cols-2 gap-4">
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
                      className="text-body"
                    />
                  </FormControl>
                  <FormMessage className="text-caption" />
                </FormItem>
              )}
            />

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
                      className="text-body"
                    />
                  </FormControl>
                  <FormMessage className="text-caption" />
                </FormItem>
              )}
            />
          </div>

          {/* Manufacturing Date and Expiry Date */}
          <div className="grid grid-cols-2 gap-4">
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
                      disableFutureDates
                    />
                  </FormControl>
                  <FormMessage className="text-caption" />
                </FormItem>
              )}
            />

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
                      disablePastDates
                    />
                  </FormControl>
                  <FormMessage className="text-caption" />
                </FormItem>
              )}
            />
          </div>

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
            {isLoading ? 'Processing...' : 'Start Inspection'}
          </Button>
        </form>
      </Form>
    </div>
  );

  if (onClose) {
    return (
      <CardOverlay show={show} onClose={onClose}>
        {content}
      </CardOverlay>
    );
  }

  return (
    <div className="container max-w-lg mx-auto py-6">
      <div className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 rounded-xl border shadow-sm p-6">
        {content}
      </div>
    </div>
  );
};

export default ManualInspection;
