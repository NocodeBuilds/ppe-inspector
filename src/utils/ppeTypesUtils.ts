
import { standardPPETypes } from '@/components/equipment/ConsolidatedPPETypeFilter';
import { PPEType } from '@/types';

/**
 * Validates that a given string is a valid PPE type
 * @param typeToCheck The PPE type string to validate
 * @returns Boolean indicating if the type is valid
 */
export const isValidPPEType = (typeToCheck: string): boolean => {
  return standardPPETypes.includes(typeToCheck as PPEType);
};

/**
 * Normalizes PPE type string to match standard types
 * @param type The PPE type string to normalize
 * @returns A normalized PPE type from the standard list
 */
export const normalizePPEType = (type: string): PPEType => {
  // Remove extra spaces and normalize case
  const normalizedType = type.trim().replace(/\s+/g, ' ');
  
  // Find exact match
  const exactMatch = standardPPETypes.find(
    standardType => standardType.toLowerCase() === normalizedType.toLowerCase()
  );
  
  if (exactMatch) {
    return exactMatch as PPEType;
  }
  
  // Find close match
  const closeMatch = standardPPETypes.find(
    standardType => standardType.toLowerCase().includes(normalizedType.toLowerCase()) ||
    normalizedType.toLowerCase().includes(standardType.toLowerCase())
  );
  
  if (closeMatch) {
    return closeMatch as PPEType;
  }
  
  // If no match, return Safety Helmet as default
  return 'Safety Helmet';
};

/**
 * Gets color for PPE type
 * @param type The PPE type 
 * @returns CSS class string for the type
 */
export const getPPETypeColor = (type: PPEType | string): string => {
  const normalizedType = normalizePPEType(type as string);
  
  switch (normalizedType) {
    case 'Full Body Harness':
      return 'bg-blue-500 border-blue-300';
    case 'Fall Arrester':
      return 'bg-amber-500 border-amber-300';
    case 'Double Lanyard':
      return 'bg-green-500 border-green-300';
    case 'Safety Helmet':
      return 'bg-yellow-500 border-yellow-300';
    case 'Safety Boots':
      return 'bg-orange-500 border-orange-300';
    case 'Safety Gloves':
      return 'bg-purple-500 border-purple-300';
    case 'Safety Goggles':
      return 'bg-sky-500 border-sky-300';
    case 'Ear Protection':
      return 'bg-rose-500 border-rose-300';
    case 'Respirator':
      return 'bg-red-500 border-red-300';
    case 'Safety Vest':
      return 'bg-lime-500 border-lime-300';
    case 'Face Shield':
      return 'bg-teal-500 border-teal-300';
    default:
      return 'bg-gray-500 border-gray-300';
  }
};

/**
 * Gets icon color for PPE type
 * @param type The PPE type 
 * @returns CSS class string for the icon
 */
export const getPPETypeIconColor = (type: PPEType | string): string => {
  const normalizedType = normalizePPEType(type as string);
  
  switch (normalizedType) {
    case 'Full Body Harness':
      return 'text-blue-100';
    case 'Fall Arrester':
      return 'text-amber-100';
    case 'Double Lanyard':
      return 'text-green-100';
    case 'Safety Helmet':
      return 'text-yellow-100';
    case 'Safety Boots':
      return 'text-orange-100';
    case 'Safety Gloves':
      return 'text-purple-100';
    case 'Safety Goggles':
      return 'text-sky-100';
    case 'Ear Protection':
      return 'text-rose-100';
    case 'Respirator':
      return 'text-red-100';
    case 'Safety Vest':
      return 'text-lime-100';
    case 'Face Shield':
      return 'text-teal-100';
    default:
      return 'text-gray-100';
  }
};
