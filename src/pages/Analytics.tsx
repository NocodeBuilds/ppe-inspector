
import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StandardCard } from '@/components/ui/standard-card';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { BarChart3, PieChart as PieChartIcon, Calendar, AlertCircle, Activity } from 'lucide-react';
import PageHeader from '@/components/common/PageHeader';
import { PageLayout } from '@/components/layout/PageLayout';
import { useQuery } from '@tanstack/react-query';
import EnhancedErrorBoundary from '@/components/error/EnhancedErrorBoundary';

const ChartSkeleton = () => (
  <div className="h-[300px] w-full bg-muted/20 animate-pulse rounded-lg flex items-center justify-center">
    <span className="text-muted-foreground text-sm">Loading chart data...</span>
  </div>
);

// Separate components for each chart for better code organization and error isolation
const InspectionChart = ({ data }: { data: any[] }) => {
  return (
    <EnhancedErrorBoundary component="InspectionChart" fallback={<ChartSkeleton />}>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" strokeOpacity={0.2} />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'var(--background)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                fontSize: '12px'
              }} 
            />
            <Bar dataKey="count" fill="#4f46e5" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </EnhancedErrorBoundary>
  );
};

const TypeDistributionChart = ({ data }: { data: any[] }) => {
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];
  
  return (
    <EnhancedErrorBoundary component="TypeDistributionChart" fallback={<ChartSkeleton />}>
      <div className="h-[300px] flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            >
              {data.map((entry: any, index: number) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'var(--background)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                fontSize: '12px'
              }} 
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </EnhancedErrorBoundary>
  );
};

const StatusOverviewChart = ({ data }: { data: any[] }) => {
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];
  
  return (
    <EnhancedErrorBoundary component="StatusOverviewChart" fallback={<ChartSkeleton />}>
      <div className="h-[300px] flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            >
              {data.map((entry: any, index: number) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'var(--background)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                fontSize: '12px'
              }} 
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </EnhancedErrorBoundary>
  );
};

const ExpiryChart = ({ data }: { data: any[] }) => {
  return (
    <EnhancedErrorBoundary component="ExpiryChart" fallback={<ChartSkeleton />}>
      <div className="h-[300px] flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            >
              {data.map((entry: any) => (
                <Cell key={`cell-${entry.name}`} fill={entry.fill || '#8884d8'} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'var(--background)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                fontSize: '12px'
              }} 
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </EnhancedErrorBoundary>
  );
};

// Custom hook to fetch analytics data
const useAnalyticsData = () => {
  const fetchPPEItems = async () => {
    const { data, error } = await supabase
      .from('ppe_items')
      .select('*');
      
    if (error) throw error;
    return data || [];
  };

  return useQuery({
    queryKey: ['analytics-data'],
    queryFn: fetchPPEItems,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

const Analytics = () => {
  // Use React Query to fetch and cache data
  const { data: ppeItems = [], isLoading, error } = useAnalyticsData();
  
  // Mock inspection data (in a real app, this would come from the database)
  const inspectionStats = useMemo(() => [
    { name: 'Jan', count: 4 },
    { name: 'Feb', count: 7 },
    { name: 'Mar', count: 12 },
    { name: 'Apr', count: 9 },
    { name: 'May', count: 16 },
    { name: 'Jun', count: 8 },
  ], []);

  // Process PPE type data with memoization to avoid recalculating on re-renders
  const ppeTypeDistribution = useMemo(() => {
    if (!ppeItems?.length) return [];
    
    const typeCount: Record<string, number> = {};
    ppeItems.forEach(item => {
      typeCount[item.type] = (typeCount[item.type] || 0) + 1;
    });
    
    return Object.entries(typeCount).map(([name, value]) => ({
      name,
      value
    }));
  }, [ppeItems]);
  
  // Process status data with memoization
  const statusDistribution = useMemo(() => {
    if (!ppeItems?.length) return [];
    
    const statusCount: Record<string, number> = {};
    ppeItems.forEach(item => {
      if (item.status) {
        statusCount[item.status] = (statusCount[item.status] || 0) + 1;
      }
    });
    
    return Object.entries(statusCount).map(([status, count]) => ({
      name: status === 'active' ? 'Active' : 
            status === 'expired' ? 'Expired' :
            status === 'flagged' ? 'Flagged' :
            status === 'maintenance' ? 'Maintenance' : 'Unknown',
      value: count
    }));
  }, [ppeItems]);
  
  // Process expiry data with memoization
  const expiryStats = useMemo(() => {
    if (!ppeItems?.length) return [];
    
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    
    const nextMonth = new Date(today);
    nextMonth.setMonth(today.getMonth() + 1);
    
    // Process expiry data by grouping
    const expiryCount = {
      expired: 0,
      thisWeek: 0,
      thisMonth: 0,
    };
    
    ppeItems.forEach(item => {
      if (!item.expiry_date) return;
      
      const expiryDate = new Date(item.expiry_date);
      if (expiryDate < today) {
        expiryCount.expired++;
      } else if (expiryDate < nextWeek) {
        expiryCount.thisWeek++;
      } else if (expiryDate < nextMonth) {
        expiryCount.thisMonth++;
      }
    });
    
    return [
      { name: 'Expired', value: expiryCount.expired, fill: '#ef4444' },
      { name: 'This Week', value: expiryCount.thisWeek, fill: '#f97316' },
      { name: 'This Month', value: expiryCount.thisMonth, fill: '#22c55e' },
    ];
  }, [ppeItems]);
  
  if (error) {
    return (
      <PageLayout title="Analytics" icon={<Activity className="h-5 w-5 text-primary" />}>
        <Card className="border-destructive/50">
          <CardContent className="p-6">
            <div className="flex flex-col items-center justify-center text-center gap-2">
              <AlertCircle className="h-8 w-8 text-destructive" />
              <h2 className="text-lg font-medium">Error Loading Analytics</h2>
              <p className="text-muted-foreground text-sm">
                There was a problem loading the analytics data. Please try again later.
              </p>
            </div>
          </CardContent>
        </Card>
      </PageLayout>
    );
  }
  
  return (
    <PageLayout title="Analytics" icon={<Activity className="h-5 w-5 text-primary" />}>
      <StandardCard
        title="Inspections Over Time"
        headerAction={null}
        className="mb-6"
      >
        {isLoading ? <ChartSkeleton /> : <InspectionChart data={inspectionStats} />}
      </StandardCard>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StandardCard
          title="PPE Type Distribution"
          icon={<PieChartIcon className="h-5 w-5 text-primary" />}
        >
          {isLoading ? <ChartSkeleton /> : <TypeDistributionChart data={ppeTypeDistribution} />}
        </StandardCard>
        
        <StandardCard
          title="PPE Status Overview"
          icon={<BarChart3 className="h-5 w-5 text-primary" />}
        >
          {isLoading ? <ChartSkeleton /> : <StatusOverviewChart data={statusDistribution} />}
        </StandardCard>
        
        <StandardCard
          title="Expiring Equipment"
          icon={<AlertCircle className="h-5 w-5 text-primary" />}
        >
          {isLoading ? <ChartSkeleton /> : <ExpiryChart data={expiryStats} />}
        </StandardCard>
      </div>
    </PageLayout>
  );
};

export default Analytics;
