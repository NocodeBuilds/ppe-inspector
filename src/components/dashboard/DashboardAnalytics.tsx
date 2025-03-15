
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
      
      // Get total inspections
      const { count: totalCount, error: totalError } = await supabase
        .from('inspections')
        .select('*', { count: 'exact', head: true });
      
      if (totalError) throw totalError;
      
      // Get this month's inspections
      const { count: monthCount, error: monthError } = await supabase
        .from('inspections')
        .select('*', { count: 'exact', head: true })
        .gte('date', startOfMonth);
      
      if (monthError) throw monthError;
      
      // Get last month's inspections for trend calculation
      const { count: lastMonthCount, error: lastMonthError } = await supabase
        .from('inspections')
        .select('*', { count: 'exact', head: true })
        .gte('date', startOfLastMonth)
        .lt('date', endOfLastMonth);
      
      if (lastMonthError) throw lastMonthError;
      
      // Calculate trend (percentage change)
      const trend = lastMonthCount 
        ? Math.round(((monthCount - lastMonthCount) / lastMonthCount) * 100) 
        : 0;
      
      // Get pending inspections (equipment due for inspection)
      const { count: pendingCount, error: pendingError } = await supabase
        .from('ppe_items')
        .select('*', { count: 'exact', head: true })
        .lte('next_inspection', now.toISOString());
      
      if (pendingError) throw pendingError;
      
      // Get pass rate (based on overall_result)
      const { data: passData, error: passError } = await supabase
        .from('inspections')
        .select('overall_result')
        .eq('overall_result', 'pass');
      
      if (passError) throw passError;
      
      const passRate = totalCount ? Math.round((passData.length / totalCount) * 100) : 0;
      
      // Get critical items (flagged PPE)
      const { count: criticalCount, error: criticalError } = await supabase
        .from('ppe_items')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'flagged');
      
      if (criticalError) throw criticalError;
      
      setStats({
        totalInspections: totalCount || 0,
        thisMonth: monthCount || 0,
        pendingInspections: pendingCount || 0,
        passRate,
        criticalItems: criticalCount || 0,
        trend
      });
    } catch (error) {
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
    const channel = supabase
      .channel('analytics-changes')
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
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
  
  if (isLoading) {
    return (
      <div className="w-full rounded-xl bg-gradient-to-br from-primary/5 to-background/80 border border-primary/10 p-6 animate-pulse">
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-6 w-24" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="flex flex-col space-y-2">
              <Skeleton className="h-12 w-12 rounded-full mx-auto" />
              <Skeleton className="h-6 w-3/4 mx-auto" />
              <Skeleton className="h-4 w-1/2 mx-auto" />
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  const statItems = [
    {
      icon: <ClipboardCheck className="h-6 w-6 text-blue-600 dark:text-blue-400" />,
      value: stats.totalInspections,
      label: "Total Inspections",
      bgColor: "bg-blue-100 dark:bg-blue-900/40",
      textColor: "text-blue-800 dark:text-blue-200"
    },
    {
      icon: <CheckCircle className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />,
      value: `${stats.passRate}%`,
      label: "Pass Rate",
      bgColor: "bg-emerald-100 dark:bg-emerald-900/40",
      textColor: "text-emerald-800 dark:text-emerald-200"
    },
    {
      icon: <Clock className="h-6 w-6 text-amber-600 dark:text-amber-400" />,
      value: stats.pendingInspections,
      label: "Pending Inspections",
      bgColor: "bg-amber-100 dark:bg-amber-900/40",
      textColor: "text-amber-800 dark:text-amber-200"
    },
    {
      icon: <Calendar className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />,
      value: stats.thisMonth,
      label: "This Month",
      bgColor: "bg-indigo-100 dark:bg-indigo-900/40",
      textColor: "text-indigo-800 dark:text-indigo-200",
      trend: stats.trend,
      trendLabel: `${Math.abs(stats.trend)}%`
    },
    {
      icon: <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />,
      value: stats.criticalItems,
      label: "Critical Items",
      bgColor: "bg-red-100 dark:bg-red-900/40",
      textColor: "text-red-800 dark:text-red-200"
    }
  ];
  
  return (
    <div className={`w-full rounded-xl overflow-hidden ${className}`}>
      <div className="bg-gradient-to-br from-primary/10 via-background/90 to-background shadow-lg border border-primary/20 rounded-xl">
        <div className="flex items-center justify-between p-5 border-b border-primary/10">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <BarChart3 className="text-primary h-5 w-5" />
            <span>Analytics Overview</span>
          </h2>
          <span className="text-sm bg-primary/10 text-primary px-3 py-1 rounded-full border border-primary/20">
            Real-time data
          </span>
        </div>
        
        <div className="p-5 md:p-6 grid grid-cols-2 md:grid-cols-5 gap-5 fade-in">
          {statItems.map((item, index) => (
            <div 
              key={index} 
              className="flex flex-col items-center text-center p-4 rounded-xl transition-all hover:bg-primary/5 duration-300 border border-transparent hover:border-primary/10"
            >
              <div className={`h-14 w-14 rounded-full ${item.bgColor} flex items-center justify-center mb-3 shadow-md`}>
                {item.icon}
              </div>
              <div className="flex flex-col items-center">
                <div className="flex items-center gap-1">
                  <span className={`text-2xl font-bold ${item.textColor}`}>{item.value}</span>
                  {item.trend !== undefined && item.trend !== 0 && (
                    <span className={`text-xs ${item.trend > 0 ? 'text-green-500' : 'text-red-500'} flex items-center`}>
                      {item.trend > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                      {item.trendLabel}
                    </span>
                  )}
                </div>
                <span className="text-sm text-muted-foreground mt-1">{item.label}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardAnalytics;
