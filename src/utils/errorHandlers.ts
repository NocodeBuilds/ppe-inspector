
/**
 * Safely extracts a property from an object or a SelectQueryError
 * Returns a default value if the property doesn't exist or if there's an error
 * 
 * @param obj The object or error to extract from
 * @param property The property name to extract
 * @param defaultValue The default value to return if extraction fails
 */
export function safeExtract<T>(obj: any, property: string, defaultValue: T): T {
  try {
    // Check if it's an error object
    if (obj && obj.message && obj.details) {
      console.error(`Error accessing property ${property}:`, obj.message);
      return defaultValue;
    }
    
    // Try to access the property
    if (obj && property in obj) {
      return obj[property] as T;
    }
    
    return defaultValue;
  } catch (e) {
    console.error(`Exception extracting ${property}:`, e);
    return defaultValue;
  }
}

/**
 * Safely extracts a nested property from a deeply nested object
 * Returns a default value if any part of the path doesn't exist
 * 
 * @param obj The object to extract from
 * @param path Array of property names forming a path to the desired value
 * @param defaultValue The default value to return if extraction fails
 */
export function safeDeepExtract<T>(obj: any, path: string[], defaultValue: T): T {
  try {
    let current = obj;
    
    for (const prop of path) {
      // Check if current is an error object
      if (current && current.message && current.details) {
        console.error(`Error accessing path ${path.join('.')}:`, current.message);
        return defaultValue;
      }
      
      // Check if property exists
      if (current && prop in current) {
        current = current[prop];
      } else {
        return defaultValue;
      }
    }
    
    return current as T;
  } catch (e) {
    console.error(`Exception extracting ${path.join('.')}:`, e);
    return defaultValue;
  }
}
