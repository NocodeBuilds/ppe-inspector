
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { usePPE } from '@/hooks/usePPE';
import { DatePicker } from '@/components/ui/date-picker';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { PPECreateInput } from '@/types/ppe';

// Define the form schema with Zod
const formSchema = z.object({
  type: z.string().min(1, 'Type is required'),
  serial_number: z.string().min(1, 'Serial number is required'),
  brand: z.string().min(1, 'Brand is required'),
  model_number: z.string().min(1, 'Model number is required'),
  manufacturing_date: z.date({
    required_error: 'Manufacturing date is required',
  }),
  expiry_date: z.date({
    required_error: 'Expiry date is required',
  }),
  batch_number: z.string().optional(),
  first_use: z.date().optional(),
});

// Define the component props
interface AddPPEFormProps {
  onPPECreated?: () => void;
}

const AddPPEForm: React.FC<AddPPEFormProps> = ({ onPPECreated }) => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { createPPE, isUploading } = usePPE();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: '',
      serial_number: '',
      brand: '',
      model_number: '',
      batch_number: '',
    },
  });
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(file);
      
      // Preview the image
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    
    try {
      // Convert dates to ISO strings for the backend
      const formData: PPECreateInput = {
        type: values.type,
        serial_number: values.serial_number,
        brand: values.brand,
        model_number: values.model_number,
        batch_number: values.batch_number?.toString() || '',
        manufacturing_date: values.manufacturing_date.toISOString(),
        expiry_date: values.expiry_date.toISOString(),
        first_use: values.first_use ? values.first_use.toISOString() : undefined,
        imageFile: selectedImage || undefined,
      };
      
      await createPPE(formData);
      
      // Reset form after successful submission
      form.reset();
      setSelectedImage(null);
      setImagePreview(null);
      
      // Call onPPECreated callback if provided
      if (onPPECreated) {
        onPPECreated();
      }
    } catch (error) {
      console.error('Error creating PPE:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>PPE Type*</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select PPE Type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Full Body Harness">Full Body Harness</SelectItem>
                    <SelectItem value="Fall Arrester">Fall Arrester</SelectItem>
                    <SelectItem value="Double Lanyard">Double Lanyard</SelectItem>
                    <SelectItem value="Safety Helmet">Safety Helmet</SelectItem>
                    <SelectItem value="Safety Boots">Safety Boots</SelectItem>
                    <SelectItem value="Safety Gloves">Safety Gloves</SelectItem>
                    <SelectItem value="Safety Goggles">Safety Goggles</SelectItem>
                    <SelectItem value="Ear Protection">Ear Protection</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="serial_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Serial Number*</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Enter serial number" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="brand"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Brand*</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Enter brand name" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="model_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Model Number*</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Enter model number" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="manufacturing_date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Manufacturing Date*</FormLabel>
                <DatePicker
                  date={field.value}
                  onDateChange={field.onChange}
                  disabled={(date) => date > new Date()}
                />
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="expiry_date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Expiry Date*</FormLabel>
                <DatePicker
                  date={field.value}
                  onDateChange={field.onChange}
                />
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="batch_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Batch Number</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Enter batch number" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="first_use"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>First Use Date</FormLabel>
                <DatePicker
                  date={field.value}
                  onDateChange={field.onChange}
                  disabled={(date) => date > new Date()}
                />
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <Separator />
        
        <div>
          <Label htmlFor="image">Equipment Image (Optional)</Label>
          <div className="mt-2 flex items-center gap-4">
            <Input
              id="image"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="max-w-xs"
            />
            {imagePreview && (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Selected"
                  className="w-20 h-20 object-cover rounded-md"
                />
                <button
                  type="button"
                  onClick={() => {
                    setSelectedImage(null);
                    setImagePreview(null);
                  }}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center"
                >
                  ✕
                </button>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={isSubmitting || isUploading}
          >
            {isSubmitting || isUploading ? (
              <div className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating...
              </div>
            ) : 'Create Equipment'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

// Make sure to properly export both named and default exports
export { AddPPEForm };
export default AddPPEForm;
