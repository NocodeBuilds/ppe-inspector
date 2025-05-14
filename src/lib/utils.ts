import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combines multiple class names and merges Tailwind CSS classes efficiently.
 * @param inputs - The class names to combine
 * @returns A merged class string
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a date to a human-readable string
 * @param date - The date to format
 * @param options - Optional Intl.DateTimeFormatOptions
 * @returns A formatted date string
 */
export function formatDate(
  date: Date | string | number,
  options: Intl.DateTimeFormatOptions = {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }
): string {
  const d = date instanceof Date ? date : new Date(date);
  return new Intl.DateTimeFormat('en-US', options).format(d);
}

/**
 * Truncates a string to a specified maximum length and adds an ellipsis if needed
 * @param str - The string to truncate
 * @param maxLength - The maximum length of the string
 * @returns The truncated string
 */
export function truncateString(str: string, maxLength: number): string {
  if (!str || str.length <= maxLength) return str;
  return `${str.substring(0, maxLength)}...`;
}

/**
 * Debounces a function to limit how often it can be called
 * @param fn - The function to debounce
 * @param delay - The delay in milliseconds
 * @returns The debounced function
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  
  return function(...args: Parameters<T>) {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    
    timeoutId = setTimeout(() => {
      fn(...args);
      timeoutId = null;
    }, delay);
  };
}

/**
 * Creates a unique ID
 * @param prefix - Optional prefix for the ID
 * @returns A unique ID string
 */
export function uniqueId(prefix = 'id'): string {
  return `${prefix}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Safely parses JSON without throwing an error
 * @param json - The JSON string to parse
 * @param fallback - The fallback value if parsing fails
 * @returns The parsed object or fallback
 */
export function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json) as T;
  } catch (error) {
    return fallback;
  }
}
