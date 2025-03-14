
import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Camera, Calendar, UploadIcon } from 'lucide-react';
import { DatePicker } from '@/components/ui/date-picker';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { usePPEData } from '@/hooks/usePPEData';
import ErrorBoundaryWithFallback from '@/components/ErrorBoundaryWithFallback';
import { Progress } from '@/components/ui/progress';
import { addPPEFormSchema, AddPPEFormValues, defaultFormValues, ppeTypes } from './AddPPEFormSchema';
import CameraCapture from './CameraCapture';

interface AddPPEFormProps {
  onSuccess?: () => void;
}

const AddPPEForm = ({ onSuccess }: AddPPEFormProps) => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const { toast } = useToast();
  const { createPPE, isUploading } = usePPEData();

  const form = useForm<AddPPEFormValues>({
    resolver: zodResolver(addPPEFormSchema),
    defaultValues: defaultFormValues,
  });

  const handleImageCapture = (file: File) => {
    setImageFile(file);
  };

  const onSubmit = async (data: AddPPEFormValues) => {
    setIsSubmitting(true);
    setUploadProgress(0);
    
    // Simulate progress
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 300);
    
    try {
      // Call the createPPE mutation from usePPEData
      await createPPE({
        brand: data.brand,
        type: data.type,
        serial_number: data.serialNumber,
        model_number: data.modelNumber,
        manufacturing_date: data.manufacturingDate.toISOString(),
        expiry_date: data.expiryDate.toISOString(),
        imageFile: imageFile || undefined
      });
      
      // Set progress to complete
      setUploadProgress(100);
      
      // Run success callback if provided
      if (onSuccess) {
        onSuccess();
      }
      
      // Reset form
      form.reset(defaultFormValues);
      setImageFile(null);
      
    } catch (error: any) {
      console.error('Error adding PPE:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to add PPE item',
        variant: 'destructive',
      });
    } finally {
      clearInterval(progressInterval);
      setIsSubmitting(false);
    }
  };

  return (
    <ErrorBoundaryWithFallback>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="serialNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Serial Number</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter serial number" 
                      {...field} 
                    />
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
                  <FormLabel>PPE Type</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select PPE type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {ppeTypes.map((type) => (
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
                    <Input 
                      placeholder="Enter brand name" 
                      {...field} 
                    />
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
                    <Input 
                      placeholder="Enter model number" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="manufacturingDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Manufacturing Date</FormLabel>
                    <FormControl>
                      <DatePicker 
                        date={field.value} 
                        setDate={field.onChange}
                        disableFutureDates={true}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="expiryDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expiry Date</FormLabel>
                    <FormControl>
                      <DatePicker 
                        date={field.value} 
                        setDate={field.onChange}
                        disablePastDates={true}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div>
              <FormLabel className="block mb-2">Equipment Photo</FormLabel>
              <CameraCapture onImageCapture={handleImageCapture} />
              {imageFile && (
                <p className="text-xs text-muted-foreground mt-2">
                  Image captured: {imageFile.name}
                </p>
              )}
            </div>
          </div>

          {isSubmitting && (
            <div className="space-y-2">
              <Progress value={uploadProgress} className="h-2" />
              <p className="text-xs text-center text-muted-foreground">
                {uploadProgress < 100 
                  ? 'Saving PPE data...' 
                  : 'PPE data saved successfully!'}
              </p>
            </div>
          )}

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isSubmitting || isUploading}
          >
            {isSubmitting ? 'Saving...' : 'Save PPE Item'}
          </Button>
        </form>
      </Form>
    </ErrorBoundaryWithFallback>
  );
};

export default AddPPEForm;
