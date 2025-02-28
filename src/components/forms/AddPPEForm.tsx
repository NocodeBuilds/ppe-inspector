
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Calendar, Upload } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { PPEType, getPPETypes } from '@/data/mockData';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';

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

const AddPPEForm = ({ onSuccess }: AddPPEFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const ppeTypes = getPPETypes();

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<FormValues>();

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    
    try {
      // In a real app, we would send the data to the backend
      console.log('Submitting PPE data:', data);
      console.log('Image file:', imageFile);
      
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      toast({
        title: 'Success!',
        description: 'PPE item added successfully',
      });
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error adding PPE:', error);
      toast({
        title: 'Error',
        description: 'Failed to add PPE item',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setImageFile(file);
  };

  return (
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
          <Label htmlFor="image">Upload Image</Label>
          <div className="mt-1">
            <Button 
              type="button" 
              variant="outline" 
              className="w-full flex items-center justify-center gap-2 h-auto py-3"
              onClick={() => document.getElementById('image-upload')?.click()}
            >
              <Upload size={20} />
              <span>Upload Photo</span>
            </Button>
            <Input
              id="image-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
            {imageFile && (
              <p className="text-xs text-muted-foreground mt-2">
                File selected: {imageFile.name}
              </p>
            )}
          </div>
        </div>
      </div>

      <Button 
        type="submit" 
        className="w-full" 
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Saving...' : 'Save PPE Item'}
      </Button>
    </form>
  );
};

export default AddPPEForm;
