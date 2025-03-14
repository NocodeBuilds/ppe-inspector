
import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { Calendar, Upload, Image as ImageIcon } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { supabase, PPEType } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import ErrorBoundaryWithFallback from '@/components/ErrorBoundaryWithFallback';
import { Progress } from '@/components/ui/progress';

interface AddPPEFormProps {
  onSuccess?: () => void;
}

interface FormValues {
  serialNumber: string;
  type: PPEType;
  brand: string;
  modelNumber: string;
  manufacturingDate: string;
  expiryDate: string;
}

// Standardized PPE types across the application
const ppeTypes: PPEType[] = [
  'Full Body Harness',
  'Fall Arrester',
  'Double Lanyard',
  'Safety Helmet',
  'Safety Boots',
  'Safety Gloves',
  'Safety Goggles',
  'Ear Protection',
  'Respirator',
  'Safety Vest',
  'Face Shield'
];

const AddPPEForm = ({ onSuccess }: AddPPEFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<FormValues>();

  const onSubmit = async (data: FormValues) => {
    if (!user) {
      toast({
        title: 'Error',
        description: 'You must be logged in to add PPE items',
        variant: 'destructive',
      });
      return;
    }
    
    setIsSubmitting(true);
    setUploadProgress(0);
    
    try {
      console.log("Adding PPE with user ID:", user.id);
      
      // Upload image if selected
      let imageUrl = null;
      if (imageFile) {
        try {
          setUploadProgress(10);
          
          // Resize image before upload to reduce size
          const resizedImage = await resizeImage(imageFile, 800);
          setUploadProgress(30);
          
          const filename = `${Date.now()}-${imageFile.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
          
          setUploadProgress(40);
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('ppe-images')
            .upload(filename, resizedImage, {
              cacheControl: '3600',
              contentType: resizedImage.type,
              upsert: false
            });
            
          if (uploadError) {
            console.error('Image upload error:', uploadError);
            throw new Error(`Image upload failed: ${uploadError.message}`);
          }
          
          setUploadProgress(80);
          const { data: { publicUrl } } = supabase.storage
            .from('ppe-images')
            .getPublicUrl(filename);
            
          imageUrl = publicUrl;
          setUploadProgress(90);
        } catch (imageError: any) {
          console.error('Image processing error:', imageError);
          toast({
            title: 'Image Upload Issue',
            description: imageError.message || 'Failed to upload image, but continuing with PPE creation',
            variant: 'default',
          });
          // Continue without image
        }
      }
      
      // Calculate next inspection date (3 months from manufacturing date)
      const manufacturingDate = new Date(data.manufacturingDate);
      const nextInspection = new Date(manufacturingDate);
      nextInspection.setMonth(nextInspection.getMonth() + 3);
      
      // Insert PPE item with explicit created_by
      const { error: insertError } = await supabase
        .from('ppe_items')
        .insert({
          serial_number: data.serialNumber,
          type: data.type,
          brand: data.brand,
          model_number: data.modelNumber,
          manufacturing_date: data.manufacturingDate,
          expiry_date: data.expiryDate,
          status: new Date(data.expiryDate) < new Date() ? 'expired' : 'active',
          image_url: imageUrl,
          created_by: user.id, // Explicitly set created_by to the current user's ID
          next_inspection: nextInspection.toISOString(),
        });
        
      if (insertError) {
        console.error('PPE insert error:', insertError);
        throw insertError;
      }
      
      setUploadProgress(100);
      
      toast({
        title: 'Success!',
        description: 'PPE item added successfully',
      });
      
      // Reset form
      setImageFile(null);
      setImagePreview(null);
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      console.error('Error adding PPE:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to add PPE item',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    
    if (file) {
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'File too large',
          description: 'Image must be less than 5MB',
          variant: 'destructive',
        });
        return;
      }
      
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: 'Invalid file type',
          description: 'Please select a JPEG, PNG, or WebP image',
          variant: 'destructive',
        });
        return;
      }
      
      setImageFile(file);
      
      // Create image preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setImageFile(null);
      setImagePreview(null);
    }
  };
  
  // Function to resize images before upload
  const resizeImage = (file: File, maxWidth: number): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (readerEvent) => {
        const image = new Image();
        image.onload = () => {
          // Don't resize if the image is already smaller
          if (image.width <= maxWidth) {
            resolve(file);
            return;
          }
          
          const canvas = document.createElement('canvas');
          const ratio = maxWidth / image.width;
          canvas.width = maxWidth;
          canvas.height = image.height * ratio;
          
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Could not get canvas context'));
            return;
          }
          
          ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
          
          // Convert to blob
          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(blob);
              } else {
                reject(new Error('Failed to create blob from canvas'));
              }
            },
            file.type,
            0.85 // Quality parameter
          );
        };
        
        image.onerror = () => {
          reject(new Error('Failed to load image for resizing'));
        };
        
        if (typeof readerEvent.target?.result === 'string') {
          image.src = readerEvent.target.result;
        } else {
          reject(new Error('Failed to read file'));
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
      
      reader.readAsDataURL(file);
    });
  };
  
  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <ErrorBoundaryWithFallback>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="serialNumber">Serial Number</Label>
            <Input
              id="serialNumber"
              type="text"
              className="mt-1"
              {...register('serialNumber', { required: 'Serial number is required' })}
            />
            {errors.serialNumber && (
              <p className="text-xs text-destructive mt-1">{errors.serialNumber.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="ppeType">PPE Type</Label>
            <Select 
              onValueChange={(value) => setValue('type', value as PPEType)} 
              required
            >
              <SelectTrigger id="ppeType" className="mt-1">
                <SelectValue placeholder="Select PPE type" />
              </SelectTrigger>
              <SelectContent>
                {ppeTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="brand">Brand</Label>
            <Input
              id="brand"
              type="text"
              className="mt-1"
              {...register('brand', { required: 'Brand is required' })}
            />
            {errors.brand && (
              <p className="text-xs text-destructive mt-1">{errors.brand.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="modelNumber">Model Number</Label>
            <Input
              id="modelNumber"
              type="text"
              className="mt-1"
              {...register('modelNumber', { required: 'Model number is required' })}
            />
            {errors.modelNumber && (
              <p className="text-xs text-destructive mt-1">{errors.modelNumber.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="manufacturingDate">Manufacturing Date</Label>
            <div className="relative mt-1">
              <Input
                id="manufacturingDate"
                type="date"
                className="mt-1 pl-10"
                {...register('manufacturingDate', { required: 'Manufacturing date is required' })}
              />
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            </div>
            {errors.manufacturingDate && (
              <p className="text-xs text-destructive mt-1">{errors.manufacturingDate.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="expiryDate">Expiry Date</Label>
            <div className="relative mt-1">
              <Input
                id="expiryDate"
                type="date"
                className="mt-1 pl-10"
                {...register('expiryDate', { required: 'Expiry date is required' })}
              />
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            </div>
            {errors.expiryDate && (
              <p className="text-xs text-destructive mt-1">{errors.expiryDate.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="image">Image</Label>
            
            {imagePreview ? (
              <div className="mt-2 relative">
                <div className="relative aspect-square w-full max-w-[200px] rounded-md overflow-hidden border border-border">
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="w-full h-full object-cover" 
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 h-8 w-8"
                    onClick={removeImage}
                  >
                    <span>×</span>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="mt-1">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full flex items-center justify-center gap-2 h-auto py-3"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload size={20} />
                  <span>Upload Photo</span>
                </Button>
              </div>
            )}
            
            <Input
              ref={fileInputRef}
              id="image-upload"
              type="file"
              accept="image/jpeg,image/png,image/jpg,image/webp"
              className="hidden"
              onChange={handleImageChange}
            />
            
            {imageFile && (
              <p className="text-xs text-muted-foreground mt-2">
                File selected: {imageFile.name} ({(imageFile.size / 1024 / 1024).toFixed(2)} MB)
              </p>
            )}
          </div>
        </div>

        {uploadProgress > 0 && uploadProgress < 100 && (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Uploading...</p>
            <Progress value={uploadProgress} />
          </div>
        )}

        <Button 
          type="submit" 
          className="w-full" 
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <div className="flex items-center">
              <span className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full"></span>
              Saving...
            </div>
          ) : 'Save PPE Item'}
        </Button>
      </form>
    </ErrorBoundaryWithFallback>
  );
};

export default AddPPEForm;
