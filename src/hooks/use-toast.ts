
import { useToast as useToastOriginal, toast as toastOriginal } from "@/components/ui/toast";

// Re-export to ensure React is explicitly imported in consumer components
export const useToast = useToastOriginal;
export const toast = toastOriginal;

export default useToast;
