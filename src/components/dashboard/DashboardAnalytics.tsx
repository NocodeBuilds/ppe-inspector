
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  ClipboardCheck, 
  CheckCircle, 
  Clock, 
  Calendar,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  BarChart3
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useIsMobile } from '@/hooks/use-mobile';

// This is a temporary mock data interface until we get types from the database
interface DashboardData {
  inspections: any[];
  ppeItems: any[];
}

interface DashboardAnalyticsProps {
  className?: string;
}

const DashboardAnalytics: React.FC<DashboardAnalyticsProps> = ({ className = '' }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalInspections: 0,
    passRate: 0,
    pendingInspections: 0,
    thisMonth: 0,
    criticalItems: 0,
    trend: 0 // percentage change from last month
  });
  const { toast } = useToast();
  const isMobile = useIsMobile();

  useEffect(() => {
    fetchAnalytics();
  }, []);
  
  const fetchAnalytics = async () => {
    try {
      setIsLoading(true);
      
      // Get current date info for filtering
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
      const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0).toISOString();
      
      // Using a temporary approach to fetch data
      // This will be updated once the database schema is properly set up
      let data: DashboardData = {
        inspections: [],
        ppeItems: []
      };
      
      try {
        // Get total inspections
        const { data: inspectionsData, error: inspectionsError } = await supabase
          .from('inspections')
          .select('*');
        
        if (!inspectionsError && inspectionsData) {
          data.inspections = inspectionsData;
        }
        
        // Get PPE items
        const { data: ppeData, error: ppeError } = await supabase
          .from('ppe_items')
          .select('*');
        
        if (!ppeError && ppeData) {
          data.ppeItems = ppeData;
        }
      } catch (e) {
        console.error("Error fetching data:", e);
        // Continue with empty data
      }
      
      // Calculate stats from available data
      const totalCount = data.inspections.length || 0;
      
      // This month's inspections
      const monthCount = data.inspections.filter(i => 
        i.date && new Date(i.date) >= new Date(startOfMonth)
      ).length || 0;
      
      // Last month's inspections
      const lastMonthCount = data.inspections.filter(i => 
        i.date && new Date(i.date) >= new Date(startOfLastMonth) && 
        new Date(i.date) < new Date(endOfLastMonth)
      ).length || 0;
      
      // Calculate trend
      const trend = lastMonthCount 
        ? Math.round(((monthCount - lastMonthCount) / lastMonthCount) * 100) 
        : 0;
      
      // Get pending inspections
      const pendingCount = data.ppeItems.filter(i => 
        i.next_inspection && new Date(i.next_inspection) <= now
      ).length || 0;
      
      // Get pass rate
      const passCount = data.inspections.filter(i => 
        i.overall_result?.toLowerCase() === 'pass'
      ).length || 0;
      
      const passRate = totalCount ? Math.round((passCount / totalCount) * 100) : 0;
      
      // Get critical items
      const criticalCount = data.ppeItems.filter(i => 
        i.status === 'flagged'
      ).length || 0;
      
      setStats({
        totalInspections: totalCount,
        thisMonth: monthCount,
        pendingInspections: pendingCount,
        passRate,
        criticalItems: criticalCount,
        trend
      });
    } catch (error: any) {
      console.error('Error fetching analytics:', error);
      toast({
        title: 'Error',
        description: 'Failed to load dashboard analytics',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Set up realtime subscription
  useEffect(() => {
    let channel: any = null;
    
    try {
      channel = supabase.channel('analytics-changes')
        .on('postgres_changes', { 
          event: '*', 
          schema: 'public', 
          table: 'inspections' 
        }, () => {
          fetchAnalytics();
        })
        .on('postgres_changes', { 
          event: '*', 
          schema: 'public', 
          table: 'ppe_items' 
        }, () => {
          fetchAnalytics();
        })
        .subscribe();
    } catch (e) {
      console.error("Error setting up realtime subscription:", e);
    }
    
    return () => {
      if (channel) {
        supabase.removeChannel(channel).catch(e => {
          console.error("Error removing channel:", e);
        });
      }
    };
  }, []);
  
  if (isLoading) {
    return (
      <div className="w-full p-2 rounded-xl animate-pulse">
        <div className="flex items-center justify-between mb-2">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-16" />
        </div>
        <div className="grid grid-cols-5 gap-1">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="flex flex-col space-y-1">
              <Skeleton className="h-6 w-6 rounded-full mx-auto" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-3 w-3/4 mx-auto" />
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  const getIconSize = () => isMobile ? 14 : 18;
  
  return (
    <div className={`w-full rounded-lg overflow-hidden bg-background/80 
      border border-primary/20 shadow-sm ${className}`}>
      <div className="flex items-center justify-between p-1.5 border-b border-primary/10 bg-primary/5">
        <h2 className="text-sm font-medium flex items-center gap-1">
          <BarChart3 className="text-primary h-4 w-4" />
          <span>Performance Dashboard</span>
        </h2>
        <span className="text-xs text-muted-foreground bg-background/40 px-1.5 py-0.5 rounded-full">
          Real-time
        </span>
      </div>
      
      <div className="p-1 grid grid-cols-5 gap-1">
        <StatCard 
          icon={<ClipboardCheck className={`h-${getIconSize()} w-${getIconSize()} text-blue-600 dark:text-blue-400`} />}
          value={stats.totalInspections}
          label="Total"
          bgColor="bg-blue-100 dark:bg-blue-900/40"
        />
        
        <StatCard 
          icon={<CheckCircle className={`h-${getIconSize()} w-${getIconSize()} text-emerald-600 dark:text-emerald-400`} />}
          value={`${stats.passRate}%`}
          label="Pass"
          bgColor="bg-emerald-100 dark:bg-emerald-900/40"
        />
        
        <StatCard 
          icon={<Clock className={`h-${getIconSize()} w-${getIconSize()} text-amber-600 dark:text-amber-400`} />}
          value={stats.pendingInspections}
          label="Pending"
          bgColor="bg-amber-100 dark:bg-amber-900/40"
        />
        
        <StatCard 
          icon={<Calendar className={`h-${getIconSize()} w-${getIconSize()} text-indigo-600 dark:text-indigo-400`} />}
          value={stats.thisMonth}
          label="Month"
          bgColor="bg-indigo-100 dark:bg-indigo-900/40"
          trend={stats.trend}
        />
        
        <StatCard 
          icon={<AlertCircle className={`h-${getIconSize()} w-${getIconSize()} text-red-600 dark:text-red-400`} />}
          value={stats.criticalItems}
          label="Critical"
          bgColor="bg-red-100 dark:bg-red-900/40"
        />
      </div>
    </div>
  );
};

interface StatCardProps {
  icon: React.ReactNode;
  value: number | string;
  label: string;
  bgColor: string;
  trend?: number;
}

const StatCard: React.FC<StatCardProps> = ({ icon, value, label, bgColor, trend }) => {
  const isMobile = useIsMobile();
  
  return (
    <div className="flex flex-col items-center text-center py-1">
      <div className={`h-6 w-6 rounded-full ${bgColor} flex items-center justify-center mb-0.5 shadow-sm`}>
        {icon}
      </div>
      <div className="flex items-center gap-0.5 justify-center">
        <span className="text-body font-bold">{value}</span>
        {trend !== undefined && trend !== 0 && (
          <span className={`text-caption ${trend > 0 ? 'text-green-500' : 'text-red-500'}`}>
            {trend > 0 ? <TrendingUp className="h-2 w-2 inline" /> : <TrendingDown className="h-2 w-2 inline" />}
          </span>
        )}
      </div>
      <span className="text-caption leading-tight">{label}</span>
    </div>
  );
};

export default DashboardAnalytics;
