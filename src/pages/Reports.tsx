import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Download, FileText, BarChart3, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useRoleAccess } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  generatePPEItemReport, 
  generateInspectionsDateReport, 
  generateAnalyticsDataReport 
} from '@/utils/reportGeneratorService';
import { InspectionData } from '@/types';
import { useNotifications } from '@/hooks/useNotifications';

const ReportsPage = () => {
  const [activeTab, setActiveTab] = useState('ppe');
  const [isGenerating, setIsGenerating] = useState(false);
  const [inspectionCount, setInspectionCount] = useState(0);
  const [ppeCount, setPpeCount] = useState(0);
  const [flaggedCount, setFlaggedCount] = useState(0);
  const { isAdmin } = useRoleAccess();
  const navigate = useNavigate();
  const { showNotification } = useNotifications();
  
  useEffect(() => {
    if (!isAdmin) {
      showNotification('Access Restricted', 'error', {
        description: 'Only administrators can access the reports page',
      });
      navigate('/');
      return;
    }
    
    fetchStatistics();
  }, [isAdmin, navigate]);
  
  const fetchStatistics = async () => {
    try {
      // Get inspection count
      const { count: inspCount, error: inspError } = await supabase
        .from('inspections')
        .select('*', { count: 'exact', head: true });
      
      if (inspError) throw inspError;
      setInspectionCount(inspCount || 0);
      
      // Get PPE count
      const { count: ppeCountResult, error: ppeError } = await supabase
        .from('ppe_items')
        .select('*', { count: 'exact', head: true });
      
      if (ppeError) throw ppeError;
      setPpeCount(ppeCountResult || 0);
      
      // Get flagged count
      const { count: flaggedCountResult, error: flaggedError } = await supabase
        .from('ppe_items')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'flagged');
      
      if (flaggedError) throw flaggedError;
      setFlaggedCount(flaggedCountResult || 0);
      
    } catch (error) {
      console.error('Error fetching report statistics:', error);
      showNotification('Error', 'error', {
        description: 'Failed to load report statistics',
      });
    }
  };

  const handleGenerateReport = async (type: 'ppe' | 'inspections' | 'analytics') => {
    try {
      setIsGenerating(true);
      
      if (type === 'ppe') {
        // Fetch PPE data
        const { data: ppeData, error: ppeError } = await supabase
          .from('ppe_items')
          .select('*');
        
        if (ppeError) throw ppeError;
        
        // Generate report - use proper function name
        await generatePPEItemReport('all'); // We'll implement 'all' option in the function
        
      } else if (type === 'inspections') {
        // Fetch inspection data
        const { data: inspData, error: inspError } = await supabase
          .from('inspections')
          .select(`
            id, 
            date, 
            type,
            overall_result,
            ppe_id,
            inspector_id,
            profiles:inspector_id (full_name),
            ppe_items:ppe_id (type, serial_number)
          `);
        
        if (inspError) throw inspError;
        
        // Calculate date range for all inspections (last 30 days)
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 30);
        
        // Generate report - use proper function name
        await generateInspectionsDateReport(startDate, endDate);
        
      } else if (type === 'analytics') {
        // Generate analytics report with the counts - use proper function name
        await generateAnalyticsDataReport();
      }
      
      showNotification('Success', 'success', {
        description: 'Report generated and downloaded successfully',
      });
      
    } catch (error) {
      console.error('Error generating report:', error);
      showNotification('Error', 'error', {
        description: 'Failed to generate report',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  if (!isAdmin) {
    return null; // Prevent rendering if not admin
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Reports</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="ppe">PPE Inventory</TabsTrigger>
          <TabsTrigger value="inspections">Inspections</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="ppe">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="mr-2 h-5 w-5" />
                PPE Inventory Report
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Generate a comprehensive report of all PPE items in the system, including status, expiry dates, and last inspection details.
              </p>
              
              <div className="flex justify-between items-center p-4 bg-muted/30 rounded-md border mb-4">
                <div>
                  <p className="font-medium">Total PPE Items</p>
                  <p className="text-2xl font-bold">{ppeCount}</p>
                </div>
                <Button 
                  onClick={() => handleGenerateReport('ppe')}
                  disabled={isGenerating || ppeCount === 0}
                >
                  {isGenerating ? 'Generating...' : 'Generate Report'}
                  <Download className="ml-2 h-4 w-4" />
                </Button>
              </div>
              
              {ppeCount === 0 && (
                <Alert className="mt-4">
                  <AlertDescription>
                    No PPE items found in the system. Add PPE items to generate a report.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="inspections">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="mr-2 h-5 w-5" />
                Inspections Report
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Generate a detailed report of all inspections, including dates, inspectors, and results.
              </p>
              
              <div className="flex justify-between items-center p-4 bg-muted/30 rounded-md border mb-4">
                <div>
                  <p className="font-medium">Total Inspections</p>
                  <p className="text-2xl font-bold">{inspectionCount}</p>
                </div>
                <Button 
                  onClick={() => handleGenerateReport('inspections')}
                  disabled={isGenerating || inspectionCount === 0}
                >
                  {isGenerating ? 'Generating...' : 'Generate Report'}
                  <Download className="ml-2 h-4 w-4" />
                </Button>
              </div>
              
              {inspectionCount === 0 && (
                <Alert className="mt-4">
                  <AlertDescription>
                    No inspections found in the system. Complete inspections to generate a report.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="mr-2 h-5 w-5" />
                Analytics Report
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Generate a summary report with key statistics and analytics data.
              </p>
              
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="p-4 bg-muted/30 rounded-md border text-center">
                  <p className="font-medium text-muted-foreground">Total PPE Items</p>
                  <p className="text-2xl font-bold">{ppeCount}</p>
                </div>
                <div className="p-4 bg-muted/30 rounded-md border text-center">
                  <p className="font-medium text-muted-foreground">Total Inspections</p>
                  <p className="text-2xl font-bold">{inspectionCount}</p>
                </div>
                <div className="p-4 bg-muted/30 rounded-md border text-center">
                  <p className="font-medium text-muted-foreground">Flagged Items</p>
                  <p className="text-2xl font-bold text-destructive">{flaggedCount}</p>
                </div>
              </div>
              
              <div className="flex justify-center">
                <Button 
                  onClick={() => handleGenerateReport('analytics')}
                  disabled={isGenerating}
                  className="px-8"
                >
                  {isGenerating ? 'Generating...' : 'Generate Analytics Report'}
                  <Download className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ReportsPage;
