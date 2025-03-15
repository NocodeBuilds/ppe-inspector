
import React from 'react';
import { Control } from 'react-hook-form';
import { AddPPEFormValues, ppeTypes } from './AddPPEFormSchema';
import CameraCapture from './CameraCapture';
import { DatePicker } from '@/components/ui/date-picker';
import { Input } from '@/components/ui/input';
import {
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

interface AddPPEFormFieldsProps {
  control: Control<AddPPEFormValues>;
  onImageCapture: (file: File) => void;
  imageFile: File | null;
}

const AddPPEFormFields: React.FC<AddPPEFormFieldsProps> = ({ 
  control,
  onImageCapture,
  imageFile 
}) => {
  return (
    <div className="space-y-4">
      <FormField
        control={control}
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
        control={control}
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
        control={control}
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
        control={control}
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
          control={control}
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
          control={control}
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
        <CameraCapture onImageCapture={onImageCapture} />
        {imageFile && (
          <p className="text-xs text-muted-foreground mt-2">
            Image captured: {imageFile.name}
          </p>
        )}
      </div>
    </div>
  );
};

export default AddPPEFormFields;
