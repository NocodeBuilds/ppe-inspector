
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Download, 
  FileText, 
  Calendar,
  FileSpreadsheet,
  ClipboardList
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useRoleAccess } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '@/hooks/useNotifications';
import ReportCard from '@/components/reports/ReportCard';
import ReportSkeleton from '@/components/reports/ReportSkeleton';
import InspectionHistory from '@/components/reports/InspectionHistory';
import { 
  generatePPEItemReport, 
  generateInspectionsDateReport
} from '@/utils/reportGeneratorService';
import {
  exportPPEItemsToExcel,
  exportInspectionsToExcel
} from '@/utils/exportUtils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import EquipmentLifecycleTracker from '@/components/reports/EquipmentLifecycleTracker';
import PageHeader from '@/components/common/PageHeader';

const ReportsPage = () => {
  const [activeTab, setActiveTab] = useState('inspections');
  const [isGenerating, setIsGenerating] = useState(false);
  const [inspectionCount, setInspectionCount] = useState(0);
  const [ppeCount, setPpeCount] = useState(0);
  const [flaggedCount, setFlaggedCount] = useState(0);
  const [recentItems, setRecentItems] = useState<any[]>([]);
  const [timeframe, setTimeframe] = useState('month');
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
    fetchRecentItems();
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

  const fetchRecentItems = async () => {
    try {
      const { data, error } = await supabase
        .from('ppe_items')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(4);
      
      if (error) throw error;
      
      if (data) {
        setRecentItems(data);
      }
    } catch (error) {
      console.error('Error fetching recent PPE items:', error);
    }
  };

  const handleGenerateReport = async (type: 'ppe' | 'inspections') => {
    try {
      setIsGenerating(true);
      
      if (type === 'ppe') {
        await generatePPEItemReport('all');
      } else if (type === 'inspections') {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 30);
        
        await generateInspectionsDateReport(startDate, endDate);
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

  const handleExportExcel = async (type: 'ppe' | 'inspections') => {
    try {
      setIsGenerating(true);
      let success = false;
      
      if (type === 'ppe') {
        success = await exportPPEItemsToExcel();
      } else if (type === 'inspections') {
        success = await exportInspectionsToExcel();
      }
      
      if (success) {
        showNotification('Success', 'success', {
          description: 'Excel report generated and downloaded successfully',
        });
      } else {
        throw new Error('No data available for export');
      }
      
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      showNotification('Error', 'error', {
        description: 'Failed to generate Excel report',
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
      <PageHeader title="Reports" />
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="inspections">Inspections</TabsTrigger>
          <TabsTrigger value="ppe">PPE Inventory</TabsTrigger>
          <TabsTrigger value="history">Inspection History</TabsTrigger>
        </TabsList>
        
        {isLoading ? (
          <div className="space-y-6">
            <ReportSkeleton />
          </div>
        ) : (
          <>
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
                onGenerateExcel={() => handleExportExcel('inspections')}
                isGenerating={isGenerating}
              />
            </TabsContent>
            
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
                onGenerateExcel={() => handleExportExcel('ppe')}
                isGenerating={isGenerating}
                visualizations={
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {recentItems.map(item => (
                      <EquipmentLifecycleTracker key={item.id} item={item} />
                    ))}
                  </div>
                }
              />
            </TabsContent>
            
            <TabsContent value="history">
              <InspectionHistory />
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
};

export default ReportsPage;
