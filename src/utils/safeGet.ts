
/**
 * Safely access nested properties from objects that might be null, undefined,
 * or have a different shape than expected.
 * 
 * @param obj The object to access properties from
 * @param defaultValue The default value to return if the property doesn't exist
 * @returns The property value or the default value
 */
export function safeGet<T, K extends keyof T>(obj: T | null | undefined, key: K, defaultValue: T[K]): T[K] {
  if (!obj || obj[key] === undefined || obj[key] === null) {
    return defaultValue;
  }
  return obj[key];
}

/**
 * Type guard to check if an object is not empty
 */
export function isNotEmpty<T extends object>(obj: T | {} | null | undefined): obj is T {
  return obj !== null && obj !== undefined && Object.keys(obj).length > 0;
}

/**
 * Safely access possibly non-existent nested objects
 */
export function safeObject<T extends object>(obj: T | {} | null | undefined, defaultValue: T): T {
  if (isNotEmpty(obj)) {
    return obj;
  }
  return defaultValue;
}
