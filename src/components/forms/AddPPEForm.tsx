import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { usePPE } from '@/hooks/usePPE';

// Define schema for form validation
const formSchema = z.object({
  serial_number: z.string().min(3, { message: 'Serial number must be at least 3 characters.' }),
  type: z.string({
    required_error: "Please select a PPE type.",
  }),
  brand: z.string().min(1, { message: 'Brand is required.' }),
  model_number: z.string().min(1, { message: 'Model number is required.' }),
  manufacturing_date: z.string().min(1, { message: 'Manufacturing date is required.' }),
  expiry_date: z.string().min(1, { message: 'Expiry date is required.' }),
  batch_number: z.string().optional(),
  first_use: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function AddPPEForm() {
  const [imageFile, setImageFile] = useState<File | undefined>();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const { createPPE, isLoading, isUploading } = usePPE();
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      serial_number: '',
      type: '',
      brand: '',
      model_number: '',
      manufacturing_date: '',
      expiry_date: '',
      batch_number: '',
      first_use: '',
    },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      // Ensure batch_number is a string
      const submitData = {
        ...values,
        batch_number: values.batch_number || '', // Ensure it's a string
        imageFile: imageFile,
      };

      await createPPE(submitData);
      form.reset();
      setImageFile(undefined);
      setImagePreview(null);

      toast({
        title: 'Success',
        description: 'PPE item has been created successfully.',
      });
    } catch (error: any) {
      console.error('Failed to create PPE:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create PPE item.',
        variant: 'destructive',
      });
    }
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4 border rounded-lg shadow-sm bg-card">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="serial_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Serial Number</FormLabel>
                <FormControl>
                  <Input placeholder="Enter serial number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="helmet">Helmet</SelectItem>
                    <SelectItem value="gloves">Gloves</SelectItem>
                    <SelectItem value="safety_glasses">Safety Glasses</SelectItem>
                    <SelectItem value="harness">Harness</SelectItem>
                    <SelectItem value="respirator">Respirator</SelectItem>
                    <SelectItem value="protective_clothing">Protective Clothing</SelectItem>
                    <SelectItem value="safety_shoes">Safety Shoes</SelectItem>
                    <SelectItem value="earplugs">Earplugs</SelectItem>
                    <SelectItem value="face_shield">Face Shield</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
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
                  <Input placeholder="Enter brand" {...field} />
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
            name="manufacturing_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Manufacturing Date</FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="expiry_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Expiry Date</FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    {...field}
                  />
                </FormControl>
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
                  <Input placeholder="Enter batch number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="first_use"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Use Date (Optional)</FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormItem>
            <FormLabel>Image (Optional)</FormLabel>
            <FormControl>
              <Input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="cursor-pointer
                file:bg-muted file:border-muted file:text-muted-foreground
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
                disabled:cursor-not-allowed disabled:opacity-50"
              />
            </FormControl>
            <FormMessage />
            {imagePreview && (
              <img
                src={imagePreview}
                alt="Preview"
                className="mt-2 rounded-md max-h-40 object-contain"
              />
            )}
          </FormItem>

          <Button type="submit" disabled={isLoading || isUploading}>
            {isLoading || isUploading ? 'Submitting...' : 'Submit'}
          </Button>
        </form>
      </Form>
    </div>
  );
}
