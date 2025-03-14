
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { BarChart3, Calendar, CheckSquare, ClipboardCheck, FileText, Filter, Clock } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useRoleAccess } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import AnalyticsChart from '@/components/dashboard/AnalyticsChart';
import AnalyticsSummary from '@/components/reports/AnalyticsSummary';
import { Button } from '@/components/ui/button';
import { generateAnalyticsDataReport, generatePPEItemReport } from '@/utils/reportGeneratorService';

const AnalyticsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [timeframe, setTimeframe] = useState('30days');
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();
  const { isAdmin, isUser } = useRoleAccess();
  const navigate = useNavigate();
  
  // Analytics data state
  const [summaryData, setSummaryData] = useState({
    ppeCount: 0,
    inspectionCount: 0,
    flaggedCount: 0
  });
  
  const [inspectionTrends, setInspectionTrends] = useState<any[]>([]);
  const [ppeDistribution, setPpeDistribution] = useState<any[]>([]);
  const [complianceData, setComplianceData] = useState<any[]>([]);
  const [departmentData, setDepartmentData] = useState<any[]>([]);
  
  useEffect(() => {
    if (!isAdmin && !isUser) {
      toast({
        title: 'Access Restricted',
        description: 'You need to be logged in to access the analytics page',
        variant: 'destructive',
      });
      navigate('/');
      return;
    }
    
    fetchAnalyticsData();
  }, [isAdmin, isUser, navigate, timeframe]);
  
  const fetchAnalyticsData = async () => {
    setIsLoading(true);
    try {
      // Fetch summary data
      const { count: ppeCount } = await supabase
        .from('ppe_items')
        .select('*', { count: 'exact', head: true });
      
      const { count: inspectionCount } = await supabase
        .from('inspections')
        .select('*', { count: 'exact', head: true });
      
      const { count: flaggedCount } = await supabase
        .from('ppe_items')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'flagged');
      
      setSummaryData({
        ppeCount: ppeCount || 0,
        inspectionCount: inspectionCount || 0,
        flaggedCount: flaggedCount || 0
      });
      
      // Get timeframe date
      const endDate = new Date();
      const startDate = new Date();
      if (timeframe === '7days') {
        startDate.setDate(endDate.getDate() - 7);
      } else if (timeframe === '30days') {
        startDate.setDate(endDate.getDate() - 30);
      } else if (timeframe === '90days') {
        startDate.setDate(endDate.getDate() - 90);
      } else if (timeframe === '12months') {
        startDate.setDate(endDate.getDate() - 365);
      }
      
      // Fetch inspection trends
      const { data: inspections } = await supabase
        .from('inspections')
        .select('date, type, overall_result')
        .gte('date', startDate.toISOString())
        .order('date');
      
      if (inspections) {
        // Process data for trend visualization
        const trendData = processTrendData(inspections, startDate, endDate, timeframe);
        setInspectionTrends(trendData);
      }
      
      // Fetch PPE distribution data
      const { data: ppeItems } = await supabase
        .from('ppe_items')
        .select('type, status');
      
      if (ppeItems) {
        // Process PPE type distribution
        const typeDistribution = ppeItems.reduce((acc: any, item: any) => {
          const existingType = acc.find((x: any) => x.name === item.type);
          if (existingType) {
            existingType.value++;
            if (item.status === 'active') existingType.active++;
            if (item.status === 'expired') existingType.expired++;
            if (item.status === 'maintenance') existingType.maintenance++;
            if (item.status === 'flagged') existingType.flagged++;
          } else {
            acc.push({
              name: item.type,
              value: 1,
              active: item.status === 'active' ? 1 : 0,
              expired: item.status === 'expired' ? 1 : 0,
              maintenance: item.status === 'maintenance' ? 1 : 0, 
              flagged: item.status === 'flagged' ? 1 : 0
            });
          }
          return acc;
        }, []);
        
        setPpeDistribution(typeDistribution);
      }
      
      // Mock data for compliance status
      // In a real implementation, this would come from regulatory requirements and inspection results
      setComplianceData([
        { name: 'OSHA Standards', compliant: 95, nonCompliant: 5 },
        { name: 'ANSI Standards', compliant: 90, nonCompliant: 10 },
        { name: 'Company Policy', compliant: 98, nonCompliant: 2 },
        { name: 'Manufacturer Specs', compliant: 92, nonCompliant: 8 }
      ]);
      
      // Mock data for department insights
      // In a real implementation, this would be linked to department info in user profiles
      setDepartmentData([
        { name: 'Operations', inspections: 48, compliance: 96, flagged: 2 },
        { name: 'Maintenance', inspections: 35, compliance: 93, flagged: 4 },
        { name: 'Field Services', inspections: 62, compliance: 91, flagged: 6 },
        { name: 'Construction', inspections: 53, compliance: 89, flagged: 8 }
      ]);
      
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load analytics data',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const processTrendData = (inspections: any[], startDate: Date, endDate: Date, timeframe: string) => {
    if (!inspections || inspections.length === 0) return [];
    
    const trendData: any[] = [];
    let currentDate = new Date(startDate);
    
    // Determine the date format and increment based on timeframe
    let dateFormat: 'day' | 'week' | 'month' = 'day';
    let increment = 1;
    
    if (timeframe === '7days') {
      dateFormat = 'day';
      increment = 1;
    } else if (timeframe === '30days') {
      dateFormat = 'day';
      increment = 3; // Group by 3-day periods
    } else if (timeframe === '90days') {
      dateFormat = 'week';
      increment = 7; // Group by weeks
    } else if (timeframe === '12months') {
      dateFormat = 'month';
      increment = 30; // Group by months
    }
    
    while (currentDate <= endDate) {
      const periodEnd = new Date(currentDate);
      periodEnd.setDate(periodEnd.getDate() + increment - 1);
      
      const periodLabel = formatTrendDate(currentDate, dateFormat);
      
      // Filter inspections for the current period
      const periodInspections = inspections.filter(inspection => {
        const inspDate = new Date(inspection.date);
        return inspDate >= currentDate && inspDate <= periodEnd;
      });
      
      const passes = periodInspections.filter(i => i.overall_result.toLowerCase() === 'pass').length;
      const fails = periodInspections.filter(i => i.overall_result.toLowerCase() === 'fail').length;
      
      trendData.push({
        name: periodLabel,
        pass: passes,
        fail: fails,
        total: periodInspections.length
      });
      
      // Move to the next period
      currentDate.setDate(currentDate.getDate() + increment);
    }
    
    return trendData;
  };
  
  const formatTrendDate = (date: Date, format: 'day' | 'week' | 'month') => {
    if (format === 'day') {
      return `${date.getMonth() + 1}/${date.getDate()}`;
    } else if (format === 'week') {
      return `Week ${Math.ceil(date.getDate() / 7)} - ${date.getMonth() + 1}`;
    } else {
      return `${date.toLocaleString('default', { month: 'short' })}`;
    }
  };
  
  const handleGenerateReport = async () => {
    try {
      setIsGenerating(true);
      await generateAnalyticsDataReport();
      toast({
        title: 'Report Generated',
        description: 'Analytics report has been generated and downloaded',
      });
    } catch (error) {
      console.error('Error generating report:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate analytics report',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  if (!isAdmin && !isUser) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Track performance and compliance metrics</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 Days</SelectItem>
              <SelectItem value="30days">Last 30 Days</SelectItem>
              <SelectItem value="90days">Last 90 Days</SelectItem>
              <SelectItem value="12months">Last 12 Months</SelectItem>
            </SelectContent>
          </Select>
          
          <Button 
            variant="outline" 
            onClick={handleGenerateReport}
            disabled={isGenerating}
          >
            {isGenerating ? 'Generating...' : 'Download Report'}
          </Button>
        </div>
      </div>
      
      {/* Summary Section */}
      <AnalyticsSummary
        ppeCount={summaryData.ppeCount}
        inspectionCount={summaryData.inspectionCount}
        flaggedCount={summaryData.flaggedCount}
      />
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="overview">
            <BarChart3 className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="compliance">
            <CheckSquare className="h-4 w-4 mr-2" />
            Compliance
          </TabsTrigger>
          <TabsTrigger value="departments">
            <ClipboardCheck className="h-4 w-4 mr-2" />
            Departments
          </TabsTrigger>
        </TabsList>
        
        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Inspection Trends Chart */}
            <AnalyticsChart
              title="Inspection Trends"
              data={inspectionTrends}
              type="bar"
              dataKeys={['pass', 'fail']}
              colors={['#16a34a', '#dc2626']}
              className="col-span-1 md:col-span-2"
            />
            
            {/* PPE Type Distribution */}
            <AnalyticsChart
              title="PPE Type Distribution"
              data={ppeDistribution}
              type="pie"
              dataKeys={['value']}
              xAxisKey="name"
            />
            
            {/* PPE Status by Type */}
            <AnalyticsChart
              title="PPE Status by Type"
              data={ppeDistribution}
              type="bar"
              dataKeys={['active', 'maintenance', 'expired', 'flagged']}
              colors={['#16a34a', '#f59e0b', '#64748b', '#dc2626']}
              xAxisKey="name"
            />
          </div>
        </TabsContent>
        
        {/* Compliance Tab */}
        <TabsContent value="compliance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Compliance Status Chart */}
            <AnalyticsChart
              title="Compliance Status"
              data={complianceData}
              type="bar"
              dataKeys={['compliant', 'nonCompliant']}
              colors={['#16a34a', '#dc2626']}
              xAxisKey="name"
              className="col-span-1 md:col-span-2"
            />
            
            {/* Compliance Trend */}
            <Card>
              <CardHeader>
                <CardTitle>Compliance Requirements</CardTitle>
                <CardDescription>Regulatory requirements and their status</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  {complianceData.map((item, index) => (
                    <li key={index} className="flex justify-between items-center">
                      <span className="font-medium">{item.name}</span>
                      <div className="flex items-center">
                        <div className="w-48 h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-green-500" 
                            style={{ width: `${item.compliant}%` }}
                          />
                        </div>
                        <span className="ml-2 text-sm">{item.compliant}%</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            
            {/* Audit Trail Mock */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Audit Activity</CardTitle>
                <CardDescription>Latest compliance activities</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  <li className="flex items-start gap-2">
                    <Clock className="h-4 w-4 mt-0.5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Monthly Compliance Check</p>
                      <p className="text-sm text-muted-foreground">Completed by John Doe on May 12, 2023</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <Clock className="h-4 w-4 mt-0.5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">OSHA Standard Update</p>
                      <p className="text-sm text-muted-foreground">Requirements updated on May 5, 2023</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <Clock className="h-4 w-4 mt-0.5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Quarterly Review</p>
                      <p className="text-sm text-muted-foreground">Performed by Safety Team on Apr 30, 2023</p>
                    </div>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Departments Tab */}
        <TabsContent value="departments" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Department Performance Chart */}
            <AnalyticsChart
              title="Department Performance"
              data={departmentData}
              type="bar"
              dataKeys={['inspections', 'compliance']}
              colors={['#2563eb', '#16a34a']}
              xAxisKey="name"
              className="col-span-1 md:col-span-2"
            />
            
            {/* Department Flagged Items */}
            <Card>
              <CardHeader>
                <CardTitle>Flagged Items by Department</CardTitle>
                <CardDescription>Critical issues requiring attention</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  {departmentData.map((dept, index) => (
                    <li key={index} className="flex justify-between items-center">
                      <span className="font-medium">{dept.name}</span>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          dept.flagged > 5 ? 'bg-red-100 text-red-800' : 
                          dept.flagged > 2 ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-green-100 text-green-800'
                        }`}>
                          {dept.flagged} items
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            
            {/* Department Compliance Status */}
            <Card>
              <CardHeader>
                <CardTitle>Department Compliance</CardTitle>
                <CardDescription>Overall compliance rates</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  {departmentData.map((dept, index) => (
                    <li key={index} className="flex justify-between items-center">
                      <span className="font-medium">{dept.name}</span>
                      <div className="flex items-center">
                        <div className="w-36 h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${
                              dept.compliance > 95 ? 'bg-green-500' : 
                              dept.compliance > 90 ? 'bg-yellow-500' : 
                              'bg-red-500'
                            }`}
                            style={{ width: `${dept.compliance}%` }}
                          />
                        </div>
                        <span className="ml-2 text-sm">{dept.compliance}%</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsPage;
