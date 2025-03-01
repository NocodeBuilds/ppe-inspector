
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Download, FileSpreadsheet, FileText, Share2 } from 'lucide-react';

const Reports = () => {
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [activeTab, setActiveTab] = useState('status');
  const [inspectors, setInspectors] = useState<{ id: string; name: string }[]>([]);
  const [selectedInspector, setSelectedInspector] = useState<string | null>(null);
  const [statusData, setStatusData] = useState<any[]>([]);
  const [inspectionData, setInspectionData] = useState<any[]>([]);
  const [expiryData, setExpiryData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const COLORS = ['#4caf50', '#ff9800', '#f44336', '#9e9e9e'];
  
  useEffect(() => {
    // Set default date range
    updateDateRange('month');
    fetchInspectors();
  }, []);
  
  useEffect(() => {
    if (startDate && endDate) {
      fetchReportData();
    }
  }, [startDate, endDate, selectedInspector, activeTab]);
  
  const updateDateRange = (range: 'week' | 'month' | 'quarter' | 'year') => {
    const end = new Date();
    let start = new Date();
    
    switch (range) {
      case 'week':
        start.setDate(end.getDate() - 7);
        break;
      case 'month':
        start.setMonth(end.getMonth() - 1);
        break;
      case 'quarter':
        start.setMonth(end.getMonth() - 3);
        break;
      case 'year':
        start.setFullYear(end.getFullYear() - 1);
        break;
    }
    
    setDateRange(range);
    setStartDate(start);
    setEndDate(end);
  };
  
  const fetchInspectors = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name')
        .eq('role', 'inspector');
      
      if (error) throw error;
      
      const formattedInspectors = data.map(inspector => ({
        id: inspector.id,
        name: inspector.full_name || 'Unknown'
      }));
      
      setInspectors(formattedInspectors);
    } catch (error) {
      console.error('Error fetching inspectors:', error);
    }
  };
  
  const fetchReportData = async () => {
    if (!startDate || !endDate) return;
    
    setIsLoading(true);
    
    try {
      switch (activeTab) {
        case 'status':
          await fetchStatusData();
          break;
        case 'inspections':
          await fetchInspectionData();
          break;
        case 'expiry':
          await fetchExpiryData();
          break;
      }
    } catch (error) {
      console.error('Error fetching report data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load report data',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const fetchStatusData = async () => {
    // In a real implementation, this would fetch actual data from Supabase
    const { data, error } = await supabase
      .from('ppe_items')
      .select('status, count')
      .eq('status', 'active');
    
    if (error) throw error;
    
    // Sample data structure for demonstration
    const statusCounts = [
      { name: 'Active', value: 45 },
      { name: 'Expired', value: 12 },
      { name: 'Maintenance', value: 8 },
      { name: 'Flagged', value: 5 }
    ];
    
    setStatusData(statusCounts);
  };
  
  const fetchInspectionData = async () => {
    // Sample data structure for demonstration
    const inspectionCounts = [
      { name: 'Jan', 'Pre-use': 20, 'Monthly': 8, 'Quarterly': 3 },
      { name: 'Feb', 'Pre-use': 18, 'Monthly': 7, 'Quarterly': 0 },
      { name: 'Mar', 'Pre-use': 25, 'Monthly': 9, 'Quarterly': 4 },
      { name: 'Apr', 'Pre-use': 22, 'Monthly': 6, 'Quarterly': 0 },
      { name: 'May', 'Pre-use': 28, 'Monthly': 10, 'Quarterly': 0 },
      { name: 'Jun', 'Pre-use': 24, 'Monthly': 8, 'Quarterly': 3 }
    ];
    
    setInspectionData(inspectionCounts);
  };
  
  const fetchExpiryData = async () => {
    // Sample data structure for demonstration
    const expiryMonths = [
      { name: 'This Month', value: 3 },
      { name: '1-3 Months', value: 8 },
      { name: '3-6 Months', value: 15 },
      { name: '6+ Months', value: 44 }
    ];
    
    setExpiryData(expiryMonths);
  };
  
  const exportToPDF = () => {
    toast({
      title: 'Exporting PDF',
      description: 'Your report is being generated and will be downloaded shortly.'
    });
    
    // In a real implementation, this would generate and download a PDF
  };
  
  const exportToExcel = () => {
    toast({
      title: 'Exporting Excel',
      description: 'Your report is being generated and will be downloaded shortly.'
    });
    
    // In a real implementation, this would generate and download an Excel file
  };
  
  const shareReport = () => {
    toast({
      title: 'Share Report',
      description: 'Sharing options will be available soon.'
    });
    
    // In a real implementation, this would open sharing options
  };
  
  return (
    <div className="fade-in">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Reports & Analytics</h1>
      </div>
      
      <Card className="p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Date Range</label>
            <Select value={dateRange} onValueChange={(value: any) => updateDateRange(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Last Week</SelectItem>
                <SelectItem value="month">Last Month</SelectItem>
                <SelectItem value="quarter">Last Quarter</SelectItem>
                <SelectItem value="year">Last Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="text-sm font-medium mb-1 block">Inspector</label>
            <Select 
              value={selectedInspector || ''} 
              onValueChange={setSelectedInspector}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Inspectors" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Inspectors</SelectItem>
                {inspectors.map(inspector => (
                  <SelectItem key={inspector.id} value={inspector.id}>
                    {inspector.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="text-sm font-medium mb-1 block">Start Date</label>
            <DatePicker
              date={startDate}
              setDate={setStartDate}
            />
          </div>
          
          <div>
            <label className="text-sm font-medium mb-1 block">End Date</label>
            <DatePicker
              date={endDate}
              setDate={setEndDate}
            />
          </div>
        </div>
      </Card>
      
      <Tabs defaultValue="status" value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="w-full">
          <TabsTrigger value="status" className="flex-1">PPE Status</TabsTrigger>
          <TabsTrigger value="inspections" className="flex-1">Inspections</TabsTrigger>
          <TabsTrigger value="expiry" className="flex-1">Expiry</TabsTrigger>
        </TabsList>
        
        <TabsContent value="status" className="pt-4">
          <Card className="p-4">
            <h2 className="text-lg font-semibold mb-4">PPE Status Distribution</h2>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </Card>
        </TabsContent>
        
        <TabsContent value="inspections" className="pt-4">
          <Card className="p-4">
            <h2 className="text-lg font-semibold mb-4">Inspections by Month and Type</h2>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={inspectionData}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="Pre-use" stackId="a" fill="#4caf50" />
                    <Bar dataKey="Monthly" stackId="a" fill="#2196f3" />
                    <Bar dataKey="Quarterly" stackId="a" fill="#ff9800" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </Card>
        </TabsContent>
        
        <TabsContent value="expiry" className="pt-4">
          <Card className="p-4">
            <h2 className="text-lg font-semibold mb-4">PPE Expiry Timeline</h2>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={expiryData}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#ff9800" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>
      
      <div className="flex flex-wrap gap-2 justify-end">
        <Button variant="outline" onClick={exportToPDF}>
          <FileText size={16} className="mr-2" />
          Export PDF
        </Button>
        <Button variant="outline" onClick={exportToExcel}>
          <FileSpreadsheet size={16} className="mr-2" />
          Export Excel
        </Button>
        <Button variant="outline" onClick={shareReport}>
          <Share2 size={16} className="mr-2" />
          Share
        </Button>
      </div>
    </div>
  );
};

export default Reports;
