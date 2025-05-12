
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
  const [isDuplicate, setIsDuplicate] = useState(false);
  
  const { toast } = useToast();
  const { createPPE, isUploading } = usePPEData();

  const form = useForm<AddPPEFormValues>({
    resolver: zodResolver(addPPEFormSchema),
    defaultValues: defaultFormValues,
    mode: 'onChange'
  });

  const handleImageCapture = (file: File) => {
    setImageFile(file);
  };

  const onSubmit = async (data: AddPPEFormValues) => {
    // Check if batch number is required but missing
    if (isDuplicate && !data.batchNumber) {
      toast({
        title: 'Validation Error',
        description: 'Batch number is required for duplicate PPE items',
        variant: 'destructive',
      });
      return;
    }

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
      // Convert firstUseDate to ISO string if it exists
      const firstUseDate = data.firstUseDate ? data.firstUseDate.toISOString() : undefined;
      
      // Ensure batch_number is passed as string
      await createPPE({
        brand: data.brand,
        type: data.type,
        serial_number: data.serialNumber,
        model_number: data.modelNumber,
        manufacturing_date: data.manufacturingDate.toISOString(),
        expiry_date: data.expiryDate.toISOString(),
        batch_number: data.batchNumber ? String(data.batchNumber) : undefined, // Convert to string
        first_use: firstUseDate,
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
            onDuplicateChange={setIsDuplicate}
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
