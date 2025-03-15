
import React, { useState, useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp } from 'lucide-react';
import BarChartComponent from '@/components/reports/BarChartComponent';
import PieChartComponent from '@/components/reports/PieChartComponent';
import AnalyticsSummary from '@/components/reports/AnalyticsSummary';
import { supabase } from '@/integrations/supabase/client';

const AnalyticsPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'year'>('month');
  const [activeTab, setActiveTab] = useState('inspections');
  const [ppeCount, setPpeCount] = useState(0);
  const [inspectionCount, setInspectionCount] = useState(0);
  const [flaggedCount, setFlaggedCount] = useState(0);
  const [inspectionTrend, setInspectionTrend] = useState(0);
  const [inspectionData, setInspectionData] = useState<any[]>([]);
  const [ppeTypeData, setPpeTypeData] = useState<any[]>([]);
  const [inspectionStatusData, setInspectionStatusData] = useState<any[]>([]);
  const [ppeStatusData, setPpeStatusData] = useState<any[]>([]);

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeframe]);

  const fetchAnalyticsData = async () => {
    setIsLoading(true);
    
    try {
      // Get current counts
      const { count: ppeCountResult, error: ppeError } = await supabase
        .from('ppe_items')
        .select('*', { count: 'exact', head: true });
      
      if (ppeError) throw ppeError;
      setPpeCount(ppeCountResult || 0);
      
      const { count: inspCountResult, error: inspError } = await supabase
        .from('inspections')
        .select('*', { count: 'exact', head: true });
      
      if (inspError) throw inspError;
      setInspectionCount(inspCountResult || 0);
      
      const { count: flaggedCountResult, error: flaggedError } = await supabase
        .from('ppe_items')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'flagged');
      
      if (flaggedError) throw flaggedError;
      setFlaggedCount(flaggedCountResult || 0);
      
      // Calculate inspection trend (simplified)
      setInspectionTrend(5); // Simplified 5% increase

      // Get PPE counts by type
      const { data: ppeTypes, error: ppeTypeError } = await supabase
        .from('ppe_items')
        .select('type');
      
      if (ppeTypeError) throw ppeTypeError;
      
      // Process PPE type data
      const typeCount: Record<string, number> = {};
      ppeTypes?.forEach((item: any) => {
        typeCount[item.type] = (typeCount[item.type] || 0) + 1;
      });
      
      const formattedTypeData = Object.entries(typeCount).map(([name, value]) => ({
        name,
        value
      }));
      
      setPpeTypeData(formattedTypeData);
      
      // Fetch PPE status data
      const { data: ppeItems, error: ppeStatusError } = await supabase
        .from('ppe_items')
        .select('status');
      
      if (ppeStatusError) throw ppeStatusError;
      
      // Process PPE status data
      const statusCount: Record<string, number> = {
        active: 0,
        expired: 0,
        maintenance: 0,
        flagged: 0
      };
      
      ppeItems?.forEach((item: any) => {
        if (item.status) {
          statusCount[item.status] = (statusCount[item.status] || 0) + 1;
        }
      });
      
      const formattedStatusData = Object.entries(statusCount).map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value,
        color: getStatusColor(name)
      }));
      
      setPpeStatusData(formattedStatusData);
      
      // Fetch inspection data
      const { data: inspections, error: inspectionError } = await supabase
        .from('inspections')
        .select('type, overall_result, date');
      
      if (inspectionError) throw inspectionError;
      
      // Process inspection type data
      const inspectionTypes: Record<string, number> = {
        'pre-use': 0,
        'monthly': 0, 
        'quarterly': 0
      };
      
      inspections?.forEach((item: any) => {
        if (item.type) {
          inspectionTypes[item.type] = (inspectionTypes[item.type] || 0) + 1;
        }
      });
      
      const formattedInspectionData = Object.entries(inspectionTypes).map(([name, count]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        count
      }));
      
      setInspectionData(formattedInspectionData);
      
      // Process inspection result data
      const resultCount = {
        Pass: 0,
        Fail: 0,
        Pending: 0
      };
      
      inspections?.forEach((item: any) => {
        const result = item.overall_result?.toLowerCase() || '';
        if (result === 'pass') resultCount.Pass++;
        else if (result === 'fail') resultCount.Fail++;
        else resultCount.Pending++;
      });
      
      const formattedResultData = Object.entries(resultCount)
        .filter(([_, value]) => value > 0)
        .map(([name, value]) => ({
          name,
          value,
          color: getResultColor(name)
        }));
      
      setInspectionStatusData(formattedResultData);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Helper function to get status colors
  const getStatusColor = (status: string): string => {
    switch (status.toLowerCase()) {
      case 'active': return '#16a34a';
      case 'expired': return '#dc2626';
      case 'maintenance': return '#f59e0b';
      case 'flagged': return '#ef4444';
      default: return '#6b7280';
    }
  };
  
  // Helper function to get result colors
  const getResultColor = (result: string): string => {
    switch (result.toLowerCase()) {
      case 'pass': return '#16a34a';
      case 'fail': return '#dc2626';
      case 'pending': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-2">
        <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
        <div className="flex gap-2 items-center">
          <span className="text-sm text-muted-foreground">Timeframe:</span>
          <Select defaultValue={timeframe} onValueChange={(value: any) => setTimeframe(value)}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Select timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Past Week</SelectItem>
              <SelectItem value="month">Past Month</SelectItem>
              <SelectItem value="year">Past Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-8 w-64" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Skeleton className="h-[300px] w-full" />
            <Skeleton className="h-[300px] w-full" />
            <Skeleton className="h-[300px] w-full" />
            <Skeleton className="h-[300px] w-full" />
          </div>
        </div>
      ) : (
        <>
          <AnalyticsSummary
            ppeCount={ppeCount}
            inspectionCount={inspectionCount}
            flaggedCount={flaggedCount}
            inspectionTrend={inspectionTrend}
          />
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
            <TabsList className="mb-4">
              <TabsTrigger value="inspections">Inspections</TabsTrigger>
              <TabsTrigger value="equipment">Equipment</TabsTrigger>
            </TabsList>
            
            <TabsContent value="inspections" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Inspection Types</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <BarChartComponent
                      data={inspectionData}
                      xKey="name"
                      yKey="count"
                      barColor="#2563eb"
                      height={250}
                    />
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Inspection Results</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <PieChartComponent
                      data={inspectionStatusData}
                      height={250}
                      innerRadius={50}
                      outerRadius={80}
                    />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="equipment" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">PPE Type Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <PieChartComponent
                      data={ppeTypeData}
                      height={250}
                      innerRadius={50}
                      outerRadius={80}
                    />
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">PPE Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <PieChartComponent
                      data={ppeStatusData}
                      height={250}
                      innerRadius={50}
                      outerRadius={80}
                    />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
};

export default AnalyticsPage;
