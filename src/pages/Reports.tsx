import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Download, FileText, BarChart3, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useRoleAccess } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '@/hooks/useNotifications';
import ReportCard from '@/components/reports/ReportCard';
import AnalyticsSummary from '@/components/reports/AnalyticsSummary';
import ReportSkeleton from '@/components/reports/ReportSkeleton';
import { 
  generatePPEItemReport, 
  generateInspectionsDateReport, 
  generateAnalyticsDataReport 
} from '@/utils/reportGeneratorService';

const ReportsPage = () => {
  const [activeTab, setActiveTab] = useState('ppe');
  const [isGenerating, setIsGenerating] = useState(false);
  const [inspectionCount, setInspectionCount] = useState(0);
  const [ppeCount, setPpeCount] = useState(0);
  const [flaggedCount, setFlaggedCount] = useState(0);
  const { isAdmin, isUser } = useRoleAccess();
  const navigate = useNavigate();
  const { showNotification } = useNotifications();
  
  useEffect(() => {
    if (!isAdmin && !isUser) {
      showNotification('Access Restricted', 'error', {
        description: 'You need to be logged in to access the reports page',
      });
      navigate('/');
      return;
    }
    
    fetchStatistics();
  }, [isAdmin, isUser, navigate]);
  
  const fetchStatistics = async () => {
    try {
      const { count: inspCount, error: inspError } = await supabase
        .from('inspections')
        .select('*', { count: 'exact', head: true });
      
      if (inspError) throw inspError;
      setInspectionCount(inspCount || 0);
      
      const { count: ppeCountResult, error: ppeError } = await supabase
        .from('ppe_items')
        .select('*', { count: 'exact', head: true });
      
      if (ppeError) throw ppeError;
      setPpeCount(ppeCountResult || 0);
      
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
        const { data: ppeData, error: ppeError } = await supabase
          .from('ppe_items')
          .select('*');
        
        if (ppeError) throw ppeError;
        
        await generatePPEItemReport('all');
        
      } else if (type === 'inspections') {
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
        
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 30);
        
        await generateInspectionsDateReport(startDate, endDate);
        
      } else if (type === 'analytics') {
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

  if (!isAdmin && !isUser) {
    return null;
  }

  const isLoading = !ppeCount && !inspectionCount && !flaggedCount;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Reports</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="ppe">PPE Inventory</TabsTrigger>
          <TabsTrigger value="inspections">Inspections</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        
        {isLoading ? (
          <div className="space-y-6">
            <ReportSkeleton />
          </div>
        ) : (
          <>
            <TabsContent value="ppe">
              <ReportCard
                title={<>
                  <FileText className="mr-2 h-5 w-5" />
                  PPE Inventory Report
                </>}
                description="Generate a comprehensive report of all PPE items in the system, including status, expiry dates, and last inspection details."
                count={ppeCount}
                isEmpty={ppeCount === 0}
                emptyMessage="No PPE items found in the system. Add PPE items to generate a report."
                onGenerate={() => handleGenerateReport('ppe')}
                isGenerating={isGenerating}
              />
            </TabsContent>
            
            <TabsContent value="inspections">
              <ReportCard
                title={<>
                  <Calendar className="mr-2 h-5 w-5" />
                  Inspections Report
                </>}
                description="Generate a detailed report of all inspections, including dates, inspectors, and results."
                count={inspectionCount}
                isEmpty={inspectionCount === 0}
                emptyMessage="No inspections found in the system. Complete inspections to generate a report."
                onGenerate={() => handleGenerateReport('inspections')}
                isGenerating={isGenerating}
              />
            </TabsContent>
            
            <TabsContent value="analytics">
              <ReportCard
                title={<>
                  <BarChart3 className="mr-2 h-5 w-5" />
                  Analytics Report
                </>}
                description="Generate a summary report with key statistics and analytics data."
                onGenerate={() => handleGenerateReport('analytics')}
                isGenerating={isGenerating}
              >
                <AnalyticsSummary
                  ppeCount={ppeCount}
                  inspectionCount={inspectionCount}
                  flaggedCount={flaggedCount}
                />
              </ReportCard>
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
};

export default ReportsPage;
