
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

/**
 * Calculate overall result from checkpoint results
 * @param results Map of checkpoint results
 * @param checkpoints List of checkpoints
 * @returns Overall result as 'pass', 'fail', or null if inconclusive
 */
export const calculateOverallResult = (
  results: Record<string, { passed: boolean | null | undefined; notes: string; photoUrl?: string }>,
  checkpoints: any[]
): 'pass' | 'fail' | null => {
  console.log("Calculating overall result with results:", results);
  
  // Get all checkpoints that have been answered (not undefined)
  const answeredCheckpoints = Object.entries(results).filter(
    ([_, result]) => result.passed !== undefined
  );
  
  // If no checkpoints have been answered, return null
  if (answeredCheckpoints.length === 0) {
    console.log("No answered checkpoints, overall result: null");
    return null;
  }
  
  // Count results by type
  const failCount = answeredCheckpoints.filter(([_, result]) => result.passed === false).length;
  const passCount = answeredCheckpoints.filter(([_, result]) => result.passed === true).length;
  const naCount = answeredCheckpoints.filter(([_, result]) => result.passed === null).length;
  
  console.log(`Result counts - Pass: ${passCount}, Fail: ${failCount}, N/A: ${naCount}`);
  
  // If any checkpoint fails, overall result is fail
  if (failCount > 0) {
    console.log("Has failed checkpoints, overall result: fail");
    return 'fail';
  }
  
  // If all checkpoints are N/A, result is null (inconclusive)
  if (naCount === answeredCheckpoints.length) {
    console.log("All checkpoints are N/A, overall result: null");
    return null;
  }
  
  // If there are any passes and no fails, result is pass
  if (passCount > 0) {
    console.log("Has passing checkpoints and no fails, overall result: pass");
    return 'pass';
  }
  
  // Default case (shouldn't reach here but providing a fallback)
  console.log("Default case reached, overall result: null");
  return null;
};
