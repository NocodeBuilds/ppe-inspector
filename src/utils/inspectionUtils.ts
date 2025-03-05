
import { addMonths, addDays, format } from 'date-fns';
import { InspectionType } from '@/integrations/supabase/client';

/**
 * Calculate the next inspection date based on the inspection type
 * @param lastInspectionDate The date of the last inspection
 * @param inspectionType The type of inspection
 * @returns The date when the next inspection should be performed
 */
export const calculateNextInspectionDate = (
  lastInspectionDate: Date | string,
  inspectionType: InspectionType
): Date => {
  const date = new Date(lastInspectionDate);
  
  switch (inspectionType) {
    case 'pre-use':
      // Pre-use inspections typically happen next time it's used
      return addDays(date, 1);
    case 'monthly':
      return addMonths(date, 1);
    case 'quarterly':
      return addMonths(date, 3);
    default:
      return addMonths(date, 1); // Default to monthly if type is unknown
  }
};

/**
 * Format a date for display
 * @param date The date to format
 * @param defaultValue Value to return if date is invalid
 * @returns Formatted date string
 */
export const formatInspectionDate = (
  date: Date | string | null | undefined,
  defaultValue = 'N/A'
): string => {
  if (!date) return defaultValue;
  
  try {
    return format(new Date(date), 'PP');
  } catch (error) {
    console.error('Invalid date format:', error);
    return defaultValue;
  }
};

/**
 * Get a formatted string of days until the next inspection
 * @param nextInspectionDate 
 * @returns 
 */
export const getDaysUntilNextInspection = (
  nextInspectionDate: Date | string | null | undefined
): string => {
  if (!nextInspectionDate) return 'N/A';
  
  try {
    const today = new Date();
    const nextDate = new Date(nextInspectionDate);
    
    const diffTime = nextDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return 'Overdue';
    } else if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Tomorrow';
    } else {
      return `${diffDays} days`;
    }
  } catch (error) {
    console.error('Invalid date for days calculation:', error);
    return 'N/A';
  }
};
