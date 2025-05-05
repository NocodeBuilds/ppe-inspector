
/**
 * Safely get a property from an object that might be null/undefined
 * 
 * @param obj The object to get a property from
 * @param path The property path to get
 * @param defaultValue A default value if the property doesn't exist
 * @returns The property value or the default value
 */
export function safeGet<T, K extends keyof T>(
  obj: T | null | undefined,
  path: K,
  defaultValue: any = undefined
): any {
  if (obj == null) return defaultValue;
  const value = obj[path];
  return value === undefined ? defaultValue : value;
}

/**
 * Safely get a nested property from an object that might be null/undefined
 * 
 * @param obj The object to get a property from 
 * @param path The property path (e.g. 'user.profile.name')
 * @param defaultValue A default value if the property doesn't exist
 * @returns The property value or the default value
 */
export function safeGetNested(
  obj: any,
  path: string,
  defaultValue: any = undefined
): any {
  if (obj == null) return defaultValue;
  
  const keys = path.split('.');
  let result = obj;
  
  for (const key of keys) {
    if (result == null) return defaultValue;
    result = result[key];
    if (result === undefined) return defaultValue;
  }
  
  return result;
}
