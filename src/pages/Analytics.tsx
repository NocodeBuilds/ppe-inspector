
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { BarChart3, PieChart as PieChartIcon, Calendar, AlertCircle } from 'lucide-react';
import PageHeader from '@/components/common/PageHeader';

const Analytics = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [inspectionStats, setInspectionStats] = useState<any>([]);
  const [ppeTypeDistribution, setPpeTypeDistribution] = useState<any>([]);
  const [statusDistribution, setStatusDistribution] = useState<any>([]);
  const [expiryStats, setExpiryStats] = useState<any>([]);
  
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
      const { data: ppeItems, error: ppeError } = await supabase
        .from('ppe_items')
        .select('type');
        
      if (ppeError) throw ppeError;
      
      // Process PPE type data
      const typeCount: Record<string, number> = {};
      ppeItems?.forEach(item => {
        typeCount[item.type] = (typeCount[item.type] || 0) + 1;
      });
      
      const formattedPpeTypes = Object.entries(typeCount).map(([name, value]) => ({
        name,
        value
      }));
      
      setPpeTypeDistribution(formattedPpeTypes);
      
      // Fetch status distribution
      const { data: statusItems, error: statusError } = await supabase
        .from('ppe_items')
        .select('status');
        
      if (statusError) throw statusError;
      
      // Process status data
      const statusCount: Record<string, number> = {};
      statusItems?.forEach(item => {
        if (item.status) {
          statusCount[item.status] = (statusCount[item.status] || 0) + 1;
        }
      });
      
      const formattedStatuses = Object.entries(statusCount).map(([status, count]) => ({
        name: status === 'active' ? 'Active' : 
              status === 'expired' ? 'Expired' :
              status === 'flagged' ? 'Flagged' :
              status === 'maintenance' ? 'Maintenance' : 'Unknown',
        value: count
      }));
      
      setStatusDistribution(formattedStatuses);
      
      // Add expiry stats
      const today = new Date();
      const nextMonth = new Date();
      nextMonth.setMonth(today.getMonth() + 1);
      
      const { data: expiryItems, error: expiryError } = await supabase
        .from('ppe_items')
        .select('*')
        .lt('expiry_date', nextMonth.toISOString());
        
      if (expiryError) throw expiryError;
      
      // Process expiry data by grouping
      const expiryCount = {
        expired: 0,
        thisWeek: 0,
        thisMonth: 0,
      };
      
      const nextWeek = new Date();
      nextWeek.setDate(today.getDate() + 7);
      
      expiryItems?.forEach(item => {
        const expiryDate = new Date(item.expiry_date);
        if (expiryDate < today) {
          expiryCount.expired++;
        } else if (expiryDate < nextWeek) {
          expiryCount.thisWeek++;
        } else if (expiryDate < nextMonth) {
          expiryCount.thisMonth++;
        }
      });
      
      const formattedExpiryData = [
        { name: 'Expired', value: expiryCount.expired, fill: '#ff4d4f' },
        { name: 'This Week', value: expiryCount.thisWeek, fill: '#faad14' },
        { name: 'This Month', value: expiryCount.thisMonth, fill: '#52c41a' },
      ];
      
      setExpiryStats(formattedExpiryData);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];
  
  return (
    <div className="container mx-auto py-6 pb-28">
      <PageHeader title="Analytics" />
      
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
              <CardTitle className="text-lg font-medium flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-primary" />
                Inspections Over Time
              </CardTitle>
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
                <CardTitle className="text-lg font-medium flex items-center">
                  <PieChartIcon className="h-5 w-5 mr-2 text-primary" />
                  PPE Type Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={ppeTypeDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {ppeTypeDistribution.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-medium flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2 text-primary" />
                  PPE Status Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {statusDistribution.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-medium flex items-center">
                  <AlertCircle className="h-5 w-5 mr-2 text-primary" />
                  Expiring Equipment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={expiryStats}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {expiryStats.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={entry.fill || COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
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
