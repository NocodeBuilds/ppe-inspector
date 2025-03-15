
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { BarChart3, PieChart as PieChartIcon } from 'lucide-react';

const Analytics = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [inspectionStats, setInspectionStats] = useState<any>([]);
  const [ppeTypeDistribution, setPpeTypeDistribution] = useState<any>([]);
  const [statusDistribution, setStatusDistribution] = useState<any>([]);
  
  useEffect(() => {
    fetchAnalyticsData();
  }, []);
  
  const fetchAnalyticsData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch inspection statistics (mock data for now)
      const inspectionData = [
        { name: 'Jan', count: 4 },
        { name: 'Feb', count: 7 },
        { name: 'Mar', count: 12 },
        { name: 'Apr', count: 9 },
        { name: 'May', count: 16 },
        { name: 'Jun', count: 8 },
      ];
      setInspectionStats(inspectionData);
      
      // Fetch PPE type distribution
      const { data: ppeTypes, error: ppeError } = await supabase
        .from('ppe_items')
        .select('type, count')
        .group('type');
        
      if (ppeError) throw ppeError;
      
      const formattedPpeTypes = ppeTypes?.map(item => ({
        name: item.type,
        value: item.count
      })) || [];
      
      setPpeTypeDistribution(formattedPpeTypes);
      
      // Fetch status distribution
      const { data: statuses, error: statusError } = await supabase
        .from('ppe_items')
        .select('status, count')
        .group('status');
        
      if (statusError) throw statusError;
      
      const formattedStatuses = statuses?.map(item => ({
        name: item.status === 'active' ? 'Active' : 
              item.status === 'expired' ? 'Expired' :
              item.status === 'flagged' ? 'Flagged' :
              item.status === 'maintenance' ? 'Maintenance' : 'Unknown',
        value: item.count
      })) || [];
      
      setStatusDistribution(formattedStatuses);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];
  
  return (
    <div className="container mx-auto py-6 pb-28">
      <h1 className="text-2xl font-bold mb-6">Analytics</h1>
      
      {isLoading ? (
        <>
          <Skeleton className="h-[300px] w-full mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Skeleton className="h-[350px]" />
            <Skeleton className="h-[350px]" />
          </div>
        </>
      ) : (
        <>
          <Card className="mb-6">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-medium">
                Inspections Over Time
              </CardTitle>
              <BarChart3 className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={inspectionStats}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-medium">
                  PPE Type Distribution
                </CardTitle>
                <PieChartIcon className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={ppeTypeDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {ppeTypeDistribution.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-medium">
                  PPE Status Overview
                </CardTitle>
                <PieChartIcon className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {statusDistribution.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
};

export default Analytics;
