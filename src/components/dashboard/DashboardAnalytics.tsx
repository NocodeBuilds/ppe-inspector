
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
  AlertCircle
} from 'lucide-react';
import { Card } from '@/components/ui/card';
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
    
    fetchAnalytics();
    
    // Set up realtime subscription
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
  }, [toast]);
  
  if (isLoading) {
    return (
      <div className={`grid grid-cols-3 gap-3 sm:gap-3 mb-4 ${className}`}>
        {[1, 2, 3].map(i => (
          <Card key={i} className="p-3 h-24">
            <div className="flex justify-between">
              <div className="space-y-2">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-6 w-12" />
              </div>
              <Skeleton className="h-10 w-10 rounded-full" />
            </div>
          </Card>
        ))}
      </div>
    );
  }
  
  return (
    <div className={`grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-3 mb-4 fade-in ${className}`}>
      <Card className="p-2 sm:p-3 border border-blue-100 dark:border-blue-900 bg-gradient-to-br from-blue-50/50 to-transparent dark:from-blue-950/30 dark:to-transparent">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Total Inspections</p>
            <p className="text-lg sm:text-xl font-semibold">{stats.totalInspections}</p>
          </div>
          <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
            <ClipboardCheck className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 dark:text-blue-400" />
          </div>
        </div>
      </Card>
      
      <Card className="p-2 sm:p-3 border border-emerald-100 dark:border-emerald-900 bg-gradient-to-br from-emerald-50/50 to-transparent dark:from-emerald-950/30 dark:to-transparent">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Pass Rate</p>
            <p className="text-lg sm:text-xl font-semibold">{stats.passRate}%</p>
          </div>
          <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center">
            <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-600 dark:text-emerald-400" />
          </div>
        </div>
      </Card>
      
      <Card className="p-2 sm:p-3 border border-amber-100 dark:border-amber-900 bg-gradient-to-br from-amber-50/50 to-transparent dark:from-amber-950/30 dark:to-transparent">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Pending</p>
            <p className="text-lg sm:text-xl font-semibold">{stats.pendingInspections}</p>
          </div>
          <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-amber-100 dark:bg-amber-900 flex items-center justify-center">
            <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-amber-600 dark:text-amber-400" />
          </div>
        </div>
      </Card>
      
      <Card className="p-2 sm:p-3 border border-indigo-100 dark:border-indigo-900 bg-gradient-to-br from-indigo-50/50 to-transparent dark:from-indigo-950/30 dark:to-transparent">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">This Month</p>
            <div className="flex items-center gap-1">
              <p className="text-lg sm:text-xl font-semibold">{stats.thisMonth}</p>
              {stats.trend !== 0 && (
                <span className={`text-xs ${stats.trend > 0 ? 'text-green-500' : 'text-red-500'} flex items-center`}>
                  {stats.trend > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {Math.abs(stats.trend)}%
                </span>
              )}
            </div>
          </div>
          <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
            <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-600 dark:text-indigo-400" />
          </div>
        </div>
      </Card>
      
      <Card className="p-2 sm:p-3 border border-red-100 dark:border-red-900 bg-gradient-to-br from-red-50/50 to-transparent dark:from-red-950/30 dark:to-transparent">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Critical Items</p>
            <p className="text-lg sm:text-xl font-semibold">{stats.criticalItems}</p>
          </div>
          <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center">
            <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-red-600 dark:text-red-400" />
          </div>
        </div>
      </Card>
    </div>
  );
};

export default DashboardAnalytics;
