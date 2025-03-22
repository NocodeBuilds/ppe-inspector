import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import ErrorBoundaryWithFallback from '@/components/ErrorBoundaryWithFallback';
import { Form } from '@/components/ui/form';
import AddPPEFormFields from './AddPPEFormFields';
import AddPPEFormActions from './AddPPEFormActions';
import CameraCapture from './CameraCapture';
import { usePPEData } from '@/hooks/usePPEData';
import { useToast } from '@/hooks/use-toast';
import { addPPEFormSchema, AddPPEFormValues, defaultFormValues } from './AddPPEFormSchema';

const AddPPEForm = () => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const { toast } = useToast();
  const { createPPE, isUploading } = usePPEData();
  const form = useForm<AddPPEFormValues>({
    resolver: zodResolver(addPPEFormSchema),
    defaultValues: defaultFormValues,
  });

  const onSubmit = async (data: AddPPEFormValues) => {
    setIsSubmitting(true);
    setUploadProgress(0);
    
    try {
      await createPPE({
        brand: data.brand,
        type: data.type,
        serial_number: data.serialNumber,
        model_number: data.modelNumber,
        manufacturing_date: data.manufacturingDate,
        expiry_date: data.manufacturingDate, 
        imageFile: imageFile || undefined
      });

      toast({
        title: 'PPE Added Successfully',
        variant: 'success',
      });

      // Reset form
      form.reset(defaultFormValues);
      setImageFile(null);
      
    } catch (error: any) {
      console.error('Error adding PPE:', error);
      toast({
        title: 'Error Adding PPE',
        description: error.message || 'An error occurred while adding the PPE',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  };

  return (
    <ErrorBoundaryWithFallback>
      <div className="space-y-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <AddPPEFormFields 
              control={form.control}
            />
            
            {/* Photo Capture Section at Bottom */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Equipment Photo (Optional)</span>
              </div>
              
              <CameraCapture
                onImageCapture={setImageFile}
                existingImage={imageFile}
                autoSubmit={false}
              />
            </div>

            <AddPPEFormActions
              isSubmitting={isSubmitting}
              uploadProgress={uploadProgress}
              isUploading={isUploading}
            />
          </form>
        </Form>
      </div>
    </ErrorBoundaryWithFallback>
  );
};

export default AddPPEForm;
