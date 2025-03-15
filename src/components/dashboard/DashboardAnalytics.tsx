
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  ClipboardCheck, 
  CheckCircle, 
  XCircle, 
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
      <div className="w-full p-6 rounded-xl shadow-lg animate-pulse">
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-6 w-16" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="flex flex-col space-y-2">
              <Skeleton className="h-10 w-10 rounded-full" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-5 w-3/4" />
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  return (
    <div className={`w-full rounded-xl overflow-hidden backdrop-blur-md bg-gradient-to-r from-primary/5 to-background/80 
      border border-primary/20 shadow-lg ${className}`}>
      <div className="flex items-center justify-between p-3 sm:p-4 border-b border-primary/10 bg-primary/5">
        <h2 className="text-lg sm:text-xl font-semibold flex items-center gap-2">
          <BarChart3 className="text-primary h-5 w-5" />
          <span>Performance Dashboard</span>
        </h2>
        <span className="text-xs sm:text-sm text-muted-foreground bg-background/40 px-2 py-1 rounded-full">
          Real-time insights
        </span>
      </div>
      
      <div className="p-4 sm:p-6 grid grid-cols-2 sm:grid-cols-5 gap-4 sm:gap-6 fade-in">
        <div className="flex flex-col items-center text-center p-3 rounded-lg transition-all hover:bg-primary/5 hover:scale-105 duration-300">
          <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center mb-2 shadow-md">
            <ClipboardCheck className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <span className="text-2xl font-bold text-foreground">{stats.totalInspections}</span>
          <span className="text-sm text-muted-foreground">Total Inspections</span>
        </div>
        
        <div className="flex flex-col items-center text-center p-3 rounded-lg transition-all hover:bg-primary/5 hover:scale-105 duration-300">
          <div className="h-12 w-12 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center mb-2 shadow-md">
            <CheckCircle className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
          </div>
          <span className="text-2xl font-bold text-foreground">{stats.passRate}%</span>
          <span className="text-sm text-muted-foreground">Pass Rate</span>
        </div>
        
        <div className="flex flex-col items-center text-center p-3 rounded-lg transition-all hover:bg-primary/5 hover:scale-105 duration-300">
          <div className="h-12 w-12 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center mb-2 shadow-md">
            <Clock className="h-6 w-6 text-amber-600 dark:text-amber-400" />
          </div>
          <span className="text-2xl font-bold text-foreground">{stats.pendingInspections}</span>
          <span className="text-sm text-muted-foreground">Pending Inspections</span>
        </div>
        
        <div className="flex flex-col items-center text-center p-3 rounded-lg transition-all hover:bg-primary/5 hover:scale-105 duration-300">
          <div className="h-12 w-12 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center mb-2 shadow-md">
            <Calendar className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div className="flex items-center gap-1">
            <span className="text-2xl font-bold text-foreground">{stats.thisMonth}</span>
            {stats.trend !== 0 && (
              <span className={`text-xs ${stats.trend > 0 ? 'text-green-500' : 'text-red-500'} flex items-center`}>
                {stats.trend > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {Math.abs(stats.trend)}%
              </span>
            )}
          </div>
          <span className="text-sm text-muted-foreground">This Month</span>
        </div>
        
        <div className="flex flex-col items-center text-center p-3 rounded-lg transition-all hover:bg-primary/5 hover:scale-105 duration-300">
          <div className="h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/40 flex items-center justify-center mb-2 shadow-md">
            <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          <span className="text-2xl font-bold text-foreground">{stats.criticalItems}</span>
          <span className="text-sm text-muted-foreground">Critical Items</span>
        </div>
      </div>
    </div>
  );
};

export default DashboardAnalytics;
