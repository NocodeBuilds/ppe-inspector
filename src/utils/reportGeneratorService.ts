
import { PPEItem, InspectionData } from '@/types';
import { generatePPEReport } from './reportGenerator/ppePDFReport';
import { generateInspectionsReport } from './reportGenerator/inspectionsPDFReport';
import { generateAnalyticsReport } from './reportGenerator/analyticsPDFReport';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

// Cache to avoid re-fetching the same data
const reportCache = new Map<string, {data: any, timestamp: number}>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes cache TTL

/**
 * Check if we have valid cache data
 */
const getFromCache = <T>(cacheKey: string): T | null => {
  if (reportCache.has(cacheKey)) {
    const cached = reportCache.get(cacheKey)!;
    if (Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data as T;
    }
  }
  return null;
};

/**
 * Generate a PDF report for a specific PPE item or all PPE items
 * @param ppeId The ID of the PPE item or 'all' to generate report for all PPE items
 */
export const generatePPEItemReport = async (ppeId: string): Promise<void> => {
  try {
    // Show user feedback
    toast({
      title: 'Generating Report',
      description: 'Please wait while we generate your report...',
    });
    
    // Check if we have this report cached
    const cacheKey = `ppe_report_${ppeId}`;
    const cachedData = getFromCache<PPEItem[]>(cacheKey);
    
    let ppeItems: PPEItem[];
    
    if (cachedData) {
      console.log('Using cached PPE data for report');
      ppeItems = cachedData;
    } else {
      try {
        let ppeData;
        
        if (ppeId === 'all') {
          // Get all PPE items
          const { data, error } = await supabase
            .from('ppe_items')
            .select('*');
          
          if (error) throw error;
          ppeData = data;
        } else {
          // Get a specific PPE item
          const { data, error } = await supabase
            .from('ppe_items')
            .select('*')
            .eq('id', ppeId)
            .single();
          
          if (error) throw error;
          ppeData = [data];
        }
        
        // Map database items to PPEItem type from Supabase schema to our app schema
        ppeItems = ppeData.map((item: any) => ({
          id: item.id,
          serialNumber: item.serial_number,
          type: item.type,
          brand: item.brand,
          modelNumber: item.model_number,
          manufacturingDate: item.manufacturing_date,
          expiryDate: item.expiry_date,
          status: item.status,
          imageUrl: item.image_url,
          nextInspection: item.next_inspection,
          createdAt: item.created_at,
          updatedAt: item.updated_at
        }));
        
        // Cache the result
        reportCache.set(cacheKey, {
          data: ppeItems,
          timestamp: Date.now()
        });
      } catch (error) {
        console.error('Network error fetching PPE data:', error);
        
        // Try to use data from local storage as fallback for offline usage
        const localData = localStorage.getItem('upcoming_inspections_cache');
        if (localData) {
          const { items } = JSON.parse(localData);
          ppeItems = items;
          
          toast({
            title: 'Using Cached Data',
            description: 'Could not connect to server. Using locally stored data.',
          });
        } else {
          throw new Error('No data available. Please connect to the internet and try again.');
        }
      }
    }
    
    // Generate the PDF report using the PPE item data
    if (ppeItems && ppeItems.length > 0) {
      await generatePPEReport(ppeItems);
      
      toast({
        title: 'Report Generated',
        description: 'Your report has been generated and downloaded successfully.',
      });
    } else {
      toast({
        title: 'No Data',
        description: 'No PPE items found to include in the report.',
        variant: 'destructive',
      });
    }
    
  } catch (error) {
    console.error('Error generating PPE report:', error);
    toast({
      title: 'Report Error',
      description: typeof error === 'object' && error && 'message' in error ? 
        (error as Error).message : 'Failed to generate the report',
      variant: 'destructive',
    });
  }
};

/**
 * Generate a PDF report for inspections within a date range
 * @param startDate The start date for the report
 * @param endDate The end date for the report
 */
export const generateInspectionsDateReport = async (startDate: Date, endDate: Date): Promise<void> => {
  try {
    // Show user feedback
    toast({
      title: 'Generating Report',
      description: 'Please wait while we generate your inspection report...',
    });
    
    // Format dates for Supabase query and cache key
    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];
    
    // Check if we have this report cached
    const cacheKey = `inspection_report_${startDateStr}_${endDateStr}`;
    const cachedData = getFromCache<any[]>(cacheKey);
    
    let formattedInspections;
    
    if (cachedData) {
      console.log('Using cached inspection data for report');
      formattedInspections = cachedData;
    } else {
      // Fetch inspections within the date range
      const { data: inspectionsData, error: inspectionsError } = await supabase
        .from('inspections')
        .select(`
          id, date, type, overall_result,
          profiles:inspector_id (full_name),
          ppe_items:ppe_id (type, serial_number)
        `)
        .gte('date', startDateStr)
        .lte('date', endDateStr)
        .order('date', { ascending: false });
      
      if (inspectionsError) throw inspectionsError;
      
      // Map the data for the PDF report
      formattedInspections = inspectionsData.map((item: any) => ({
        id: item.id,
        date: item.date,
        type: item.type,
        inspector_name: item.profiles?.full_name || 'Unknown',
        result: item.overall_result,
        ppe_type: item.ppe_items?.type || 'Unknown',
        serial_number: item.ppe_items?.serial_number || 'Unknown'
      }));
      
      // Cache the result
      reportCache.set(cacheKey, {
        data: formattedInspections,
        timestamp: Date.now()
      });
    }
    
    // Generate the PDF report using the inspection data
    if (formattedInspections && formattedInspections.length > 0) {
      await generateInspectionsReport(formattedInspections);
      
      toast({
        title: 'Report Generated',
        description: 'Your inspection report has been generated and downloaded successfully.',
      });
    } else {
      toast({
        title: 'No Data',
        description: 'No inspections found in the selected date range.',
        variant: 'default',
      });
    }
    
  } catch (error) {
    console.error('Error generating inspections report:', error);
    toast({
      title: 'Report Error',
      description: 'Failed to generate the inspection report',
      variant: 'destructive',
    });
  }
};

/**
 * Generate an analytics PDF report
 */
export const generateAnalyticsDataReport = async (): Promise<void> => {
  try {
    // Show user feedback
    toast({
      title: 'Generating Report',
      description: 'Please wait while we generate your analytics report...',
    });
    
    // Check if we have this report cached
    const cacheKey = `analytics_report`;
    const cachedData = getFromCache<any>(cacheKey);
    
    let analyticsData;
    
    if (cachedData) {
      console.log('Using cached analytics data for report');
      analyticsData = cachedData;
    } else {
      // Get PPE counts by type
      const { data: ppeTypeData, error: ppeTypeError } = await supabase
        .from('ppe_items')
        .select('type, status')
        .order('type');
      
      if (ppeTypeError) throw ppeTypeError;
      
      // Calculate counts for each type
      const typeCounts = ppeTypeData.reduce((acc: Record<string, number>, item: any) => {
        acc[item.type] = (acc[item.type] || 0) + 1;
        return acc;
      }, {});
      
      // Get inspection pass/fail counts
      const { data: inspectionData, error: inspectionError } = await supabase
        .from('inspections')
        .select('overall_result, type');
      
      if (inspectionError) throw inspectionError;
      
      const passCount = inspectionData.filter((item: any) => 
        item.overall_result?.toLowerCase() === 'pass').length;
      
      const failCount = inspectionData.filter((item: any) => 
        item.overall_result?.toLowerCase() === 'fail').length;
      
      const inspectionTypeCounts = inspectionData.reduce((acc: any, item: any) => {
        if (item.type) {
          acc[item.type] = (acc[item.type] || 0) + 1;
        }
        return acc;
      }, { 'pre-use': 0, 'monthly': 0, 'quarterly': 0 });
      
      // Get upcoming inspections
      const today = new Date();
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(today.getDate() + 30);
      
      const { data: upcomingInspections, error: upcomingError } = await supabase
        .from('ppe_items')
        .select('id, serial_number, type, next_inspection')
        .gte('next_inspection', today.toISOString())
        .lte('next_inspection', thirtyDaysFromNow.toISOString())
        .order('next_inspection', { ascending: true })
        .limit(10);
        
      if (upcomingError) throw upcomingError;
      
      // Get expiring items
      const { data: expiringItems, error: expiringError } = await supabase
        .from('ppe_items')
        .select('id, serial_number, type, expiry_date')
        .gte('expiry_date', today.toISOString())
        .lte('expiry_date', thirtyDaysFromNow.toISOString())
        .order('expiry_date', { ascending: true })
        .limit(10);
        
      if (expiringError) throw expiringError;
      
      // Prepare upcoming inspections data
      const formattedUpcoming = upcomingInspections ? upcomingInspections.map((item: any) => {
        const nextDate = new Date(item.next_inspection);
        const daysRemaining = Math.ceil((nextDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        
        return {
          id: item.id,
          serial_number: item.serial_number,
          type: item.type,
          next_inspection: item.next_inspection,
          days_remaining: daysRemaining
        };
      }) : [];
      
      // Prepare expiring items data
      const formattedExpiring = expiringItems ? expiringItems.map((item: any) => {
        const expiryDate = new Date(item.expiry_date);
        const daysRemaining = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        
        return {
          id: item.id,
          serial_number: item.serial_number,
          type: item.type,
          expiry_date: item.expiry_date,
          days_remaining: daysRemaining
        };
      }) : [];
      
      // Collect all analytics data
      analyticsData = {
        ppeTypeDistribution: typeCounts,
        ppeStatusCounts: {
          active: ppeTypeData.filter((item: any) => item.status === 'active').length || 0,
          expired: ppeTypeData.filter((item: any) => item.status === 'expired').length || 0,
          maintenance: ppeTypeData.filter((item: any) => item.status === 'maintenance').length || 0,
          flagged: ppeTypeData.filter((item: any) => item.status === 'flagged').length || 0
        },
        inspectionTypeCounts: {
          'pre-use': inspectionTypeCounts['pre-use'] || 0,
          'monthly': inspectionTypeCounts['monthly'] || 0,
          'quarterly': inspectionTypeCounts['quarterly'] || 0
        },
        inspectionResultCounts: {
          pass: passCount,
          fail: failCount
        },
        upcomingInspections: formattedUpcoming,
        expiringItems: formattedExpiring
      };
      
      // Cache the result
      reportCache.set(cacheKey, {
        data: analyticsData,
        timestamp: Date.now()
      });
    }
    
    // Generate the report
    await generateAnalyticsReport(analyticsData);
    
    toast({
      title: 'Report Generated',
      description: 'Your analytics report has been generated and downloaded successfully.',
    });
    
  } catch (error) {
    console.error('Error generating analytics report:', error);
    toast({
      title: 'Report Error',
      description: 'Failed to generate the analytics report',
      variant: 'destructive',
    });
  }
};

/**
 * Clear report cache to force fresh data on next generation
 */
export const clearReportCache = (): void => {
  reportCache.clear();
  console.log('Report cache cleared');
};
