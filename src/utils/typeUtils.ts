
/**
 * Safely access a potentially undefined nested property with proper TypeScript typing
 * @param obj The object to access properties from
 * @param defaultValue Default value to return if the property doesn't exist
 * @returns The property value or the default value
 */
export function safeGet<T, D>(obj: T | null | undefined, defaultValue: D): T | D {
  return (obj !== null && obj !== undefined) ? obj : defaultValue;
}

/**
 * Convert any error to a string message
 * @param error Any error object
 * @returns String representation of the error
 */
export function errorToString(error: unknown): string {
  if (typeof error === 'string') return error;
  if (error instanceof Error) return error.message;
  return String(error);
}

/**
 * Type guard to check if an object has a property
 * @param obj The object to check
 * @param key The property key to look for
 * @returns Boolean indicating if the property exists
 */
export function hasProperty<T extends object, K extends PropertyKey>(
  obj: T | null | undefined,
  key: K
): obj is T & Record<K, unknown> {
  return obj !== null && obj !== undefined && key in obj;
}

/**
 * Safely extract a property from an object with proper type checking
 * @param obj The object to extract a property from
 * @param key The property key to extract
 * @param defaultValue Default value if property doesn't exist
 * @returns The property value or default
 */
export function safeExtract<T extends object, K extends keyof any, D>(
  obj: T | null | undefined,
  key: K,
  defaultValue: D
): D {
  if (obj === null || obj === undefined) return defaultValue;
  return (key in obj) ? (obj as any)[key] : defaultValue;
}
