import React, { useState, useEffect } from 'react';
import { Control, useWatch } from 'react-hook-form';
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
import { usePPEData } from '@/hooks/usePPEData';
import { Badge } from '@/components/ui/badge';

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
  const [isDuplicatePPE, setIsDuplicatePPE] = useState(false);
  const [isCheckingDuplicate, setIsCheckingDuplicate] = useState(false);
  const { getPPEBySerialNumber } = usePPEData();

  // Watch for changes in serial number and type
  const serialNumber = useWatch({ control, name: 'serialNumber' });
  const ppeType = useWatch({ control, name: 'type' });

  // Check for duplicate PPE when serial number and type change
  useEffect(() => {
    const checkDuplicate = async () => {
      if (serialNumber && serialNumber.length >= 3 && ppeType) {
        setIsCheckingDuplicate(true);
        try {
          const items = await getPPEBySerialNumber(serialNumber);
          const hasDuplicate = items.some(item => item.type === ppeType);
          setIsDuplicatePPE(hasDuplicate);
        } catch (error) {
          console.error('Error checking for duplicate PPE:', error);
        } finally {
          setIsCheckingDuplicate(false);
        }
      } else {
        setIsDuplicatePPE(false);
      }
    };

    checkDuplicate();
  }, [serialNumber, ppeType, getPPEBySerialNumber]);

  return (
    <div className="space-y-4">
      <FormField
        control={control}
        name="type"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-body-sm">PPE Type</FormLabel>
            <Select 
              onValueChange={field.onChange} 
              defaultValue={field.value}
            >
              <FormControl>
                <SelectTrigger className="text-body">
                  <SelectValue placeholder="Select PPE type" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {ppeTypes.map((type) => (
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

      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={control}
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
                  minLength={3}
                  {...field} 
                  className="text-body"
                />
              </FormControl>
              <FormMessage className="text-caption" />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="batchNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-body-sm">
                Batch Number
                {isDuplicatePPE && <span className="text-destructive ml-1">*</span>}
              </FormLabel>
              <FormControl>
                <Input 
                  placeholder={isDuplicatePPE 
                    ? "A PPE with this serial number and type exists. Enter different batch number." 
                    : "Enter batch number (optional)"} 
                  {...field} 
                  className="text-body"
                />
              </FormControl>
              <FormMessage className="text-caption" />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={control}
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
          control={control}
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

      <FormField
        control={control}
        name="firstUseDate"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-body-sm">First Use Date</FormLabel>
            <FormControl>
              <DatePicker 
                date={field.value} 
                setDate={field.onChange}
                disableFutureDates={true}
              />
            </FormControl>
            <FormMessage className="text-caption" />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={control}
          name="manufacturingDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-body-sm">Manufacturing Date</FormLabel>
              <FormControl>
                <DatePicker 
                  date={field.value} 
                  setDate={field.onChange}
                  disableFutureDates={true}
                />
              </FormControl>
              <FormMessage className="text-caption" />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="expiryDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-body-sm">Expiry Date</FormLabel>
              <FormControl>
                <DatePicker 
                  date={field.value} 
                  setDate={field.onChange}
                  disablePastDates={true}
                />
              </FormControl>
              <FormMessage className="text-caption" />
            </FormItem>
          )}
        />
      </div>

      <div>
        <FormLabel className="block mb-2 text-body-sm">Equipment Photo</FormLabel>
        <CameraCapture onImageCapture={onImageCapture} />
        {imageFile && (
          <p className="text-caption mt-2">
            Image captured: {imageFile.name}
          </p>
        )}
      </div>
    </div>
  );
};

export default AddPPEFormFields;
