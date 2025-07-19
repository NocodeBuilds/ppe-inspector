import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Control, useWatch } from 'react-hook-form';
import { useFormContext } from 'react-hook-form';
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
  onDuplicateChange?: (isDuplicate: boolean) => void;
}

const AddPPEFormFields: React.FC<AddPPEFormFieldsProps> = ({ 
  control,
  onImageCapture,
  imageFile,
  onDuplicateChange 
}) => {
  const [duplicateState, setDuplicateState] = useState({
    isDuplicate: false,
    isChecking: false,
    lastCheckedSerial: '',
    lastCheckedType: ''
  });
  
  const { getPPEBySerialNumber } = usePPEData();
  const form = useFormContext<AddPPEFormValues>();

  // Watch for changes in serial number and type
  const serialNumber = useWatch({ control, name: 'serialNumber' });
  const ppeType = useWatch({ control, name: 'type' });
  const batchNumber = useWatch({ control, name: 'batchNumber' });

  // Memoize the check function to prevent unnecessary recreations
  const checkDuplicate = useCallback(async (serial: string, type: string) => {
    if (serial === duplicateState.lastCheckedSerial && type === duplicateState.lastCheckedType) {
      return;
    }

    if (serial && serial.length >= 3 && type) {
      setDuplicateState(prev => ({ ...prev, isChecking: true }));
      try {
        const items = await getPPEBySerialNumber(serial);
        const hasDuplicate = items.some((item: any) => item.type === type);
        setDuplicateState({
          isDuplicate: hasDuplicate,
          isChecking: false,
          lastCheckedSerial: serial,
          lastCheckedType: type
        });
        onDuplicateChange?.(hasDuplicate);
      } catch (error) {
        console.error('Error checking for duplicate PPE:', error);
        setDuplicateState(prev => ({ ...prev, isChecking: false }));
      }
    } else {
      setDuplicateState({
        isDuplicate: false,
        isChecking: false,
        lastCheckedSerial: serial,
        lastCheckedType: type
      });
      onDuplicateChange?.(false);
    }
  }, [getPPEBySerialNumber, onDuplicateChange]);

  // Debounced effect for checking duplicates
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      checkDuplicate(serialNumber || '', ppeType || '');
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [serialNumber, ppeType, checkDuplicate]);

  // Memoize the batch number validation state
  const showBatchValidation = useMemo(() => {
    return duplicateState.isDuplicate && !duplicateState.isChecking;
  }, [duplicateState.isDuplicate, duplicateState.isChecking]);

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
                {showBatchValidation && <span className="text-destructive ml-1">*</span>}
              </FormLabel>
              <FormControl>
                <Input 
                  placeholder={showBatchValidation
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
