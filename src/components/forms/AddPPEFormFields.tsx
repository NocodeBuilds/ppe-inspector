import React from 'react';
import { Control } from 'react-hook-form';
import { AddPPEFormValues } from './AddPPEFormSchema';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormDescription,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

interface AddPPEFormFieldsProps {
  control: Control<AddPPEFormValues>;
}

const AddPPEFormFields: React.FC<AddPPEFormFieldsProps> = ({ 
  control 
}) => {
  return (
    <div className="space-y-4">
      <FormField
        control={control}
        name="type"
        render={({ field }) => (
          <FormItem>
            <FormLabel>PPE Type</FormLabel>
            <FormControl>
              <Input placeholder="Enter PPE type" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="serialNumber"
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
        control={control}
        name="brand"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Brand</FormLabel>
            <FormControl>
              <Input placeholder="Enter brand name" {...field} />
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
              <Input placeholder="Enter model number" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="manufacturingDate"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Manufacturing Date</FormLabel>
            <FormControl>
              <Input type="date" {...field} />
            </FormControl>
            <FormDescription>
              Date of manufacture as shown on the PPE item
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default AddPPEFormFields;
