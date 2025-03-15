
import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Form } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { usePPEData } from '@/hooks/usePPEData';
import ErrorBoundaryWithFallback from '@/components/ErrorBoundaryWithFallback';
import { addPPEFormSchema, AddPPEFormValues, defaultFormValues } from './AddPPEFormSchema';
import AddPPEFormFields from './AddPPEFormFields';
import AddPPEFormActions from './AddPPEFormActions';

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
          <AddPPEFormFields 
            control={form.control}
            onImageCapture={handleImageCapture}
            imageFile={imageFile}
          />
          
          <AddPPEFormActions
            isSubmitting={isSubmitting}
            uploadProgress={uploadProgress}
            isUploading={isUploading}
          />
        </form>
      </Form>
    </ErrorBoundaryWithFallback>
  );
};

export default AddPPEForm;
