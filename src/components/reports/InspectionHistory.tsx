import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import InspectionHistoryTable from './InspectionHistoryTable';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Download, 
  FileSpreadsheet,
  AlertTriangle,
  CheckCircle,
  Calendar,
  Filter
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { exportInspectionsToExcel } from '@/utils/exportUtils';
import { generateInspectionsDateReport } from '@/utils/reportGeneratorService';
import { Badge } from '@/components/ui/badge';
import { fetchCompleteInspectionData } from '@/utils/reportGenerator/reportDataFormatter';
import { generateInspectionDetailPDF } from '@/utils/reportGenerator/inspectionDetailPDF';
import { generateInspectionExcelReport } from '@/utils/reportGenerator/inspectionExcelReport';

const InspectionHistory = () => {
  const [inspections, setInspections] = useState<any[]>([]);
  const [filteredInspections, setFilteredInspections] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [timeframe, setTimeframe] = useState('all');
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  useEffect(() => {
    fetchInspections();
  }, []);
  
  useEffect(() => {
    applyFilters();
  }, [filter, timeframe, inspections]);
  
  const fetchInspections = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('inspections')
        .select(`
          id, date, type, overall_result, notes,
          profiles:inspector_id(full_name),
          ppe_items:ppe_id(type, serial_number, brand, model_number)
        `)
        .order('date', { ascending: false });
      
      if (error) throw error;
      
      const formattedInspections = data.map(item => ({
        id: item.id,
        date: item.date,
        type: item.type,
        overall_result: item.overall_result,
        inspector_name: item.profiles?.full_name || 'Unknown',
        ppe_type: item.ppe_items?.type || 'Unknown',
        ppe_serial: item.ppe_items?.serial_number || 'Unknown',
        ppe_brand: item.ppe_items?.brand || 'Unknown',
        ppe_model: item.ppe_items?.model_number || 'Unknown'
      }));
      
      setInspections(formattedInspections);
    } catch (error: any) {
      console.error('Error fetching inspections:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to load inspection history',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const applyFilters = () => {
    let filtered = [...inspections];
    
    if (filter === 'pass' || filter === 'fail') {
      filtered = filtered.filter(i => 
        i.overall_result?.toLowerCase() === filter
      );
    } else if (filter === 'pre-use' || filter === 'monthly' || filter === 'quarterly') {
      filtered = filtered.filter(i => 
        i.type === filter
      );
    }
    
    if (timeframe !== 'all') {
      const now = new Date();
      let startDate = new Date();
      
      if (timeframe === 'week') {
        startDate.setDate(now.getDate() - 7);
      } else if (timeframe === 'month') {
        startDate.setMonth(now.getMonth() - 1);
      } else if (timeframe === 'year') {
        startDate.setFullYear(now.getFullYear() - 1);
      }
      
      filtered = filtered.filter(i => 
        new Date(i.date) >= startDate && new Date(i.date) <= now
      );
    }
    
    setFilteredInspections(filtered);
  };
  
  const handleExportPDF = async () => {
    try {
      setIsExporting(true);
      const endDate = new Date();
      let startDate = new Date();
      
      if (timeframe === 'week') {
        startDate.setDate(endDate.getDate() - 7);
      } else if (timeframe === 'month') {
        startDate.setMonth(endDate.getMonth() - 1);
      } else if (timeframe === 'year') {
        startDate.setFullYear(endDate.getFullYear() - 1);
      } else {
        startDate.setFullYear(endDate.getFullYear() - 10); // Default to 10 years
      }
      
      await generateInspectionsDateReport(startDate, endDate);
      
      toast({
        title: 'Report Generated',
        description: 'Inspection history has been exported to PDF',
      });
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      toast({
        title: 'Export Failed',
        description: 'Failed to export inspection history to PDF',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };
  
  const handleExportExcel = async () => {
    try {
      setIsExporting(true);
      const success = await exportInspectionsToExcel();
      
      if (success) {
        toast({
          title: 'Export Successful',
          description: 'Inspection history has been exported to Excel',
        });
      } else {
        throw new Error('Failed to export to Excel');
      }
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      toast({
        title: 'Export Failed',
        description: 'Failed to export inspection history to Excel',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };
  
  const handleViewDetails = async (id: string) => {
    try {
      const inspectionData = await fetchCompleteInspectionData(supabase, id);
      
      if (inspectionData) {
        const confirmDownload = window.confirm('Do you want to download this inspection report?');
        if (confirmDownload) {
          const format = window.confirm('Click OK for PDF or Cancel for Excel');
          if (format) {
            await generateInspectionDetailPDF(inspectionData);
            toast({
              title: 'PDF Generated',
              description: 'Inspection report has been downloaded as PDF',
            });
          } else {
            await generateInspectionExcelReport(inspectionData);
            toast({
              title: 'Excel Generated',
              description: 'Inspection report has been downloaded as Excel',
            });
          }
        }
      } else {
        navigate(`/inspection/${id}`);
      }
    } catch (error) {
      console.error('Error generating report from history:', error);
      navigate(`/inspection/${id}`);
    }
  };
  
  const handleFilterChange = (newFilter: string) => {
    setFilter(newFilter);
  };
  
  return (
    <Card className="backdrop-blur-sm bg-background/80 border-border/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center">
          <Calendar className="mr-2 h-5 w-5" />
          Inspection History
        </CardTitle>
        <CardDescription>
          View and filter all completed inspections
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="px-2 py-1">
                Total: {filteredInspections.length}
              </Badge>
              <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 px-2 py-1">
                Pass: {filteredInspections.filter(i => i.overall_result?.toLowerCase() === 'pass').length}
              </Badge>
              <Badge variant="outline" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300 px-2 py-1">
                Fail: {filteredInspections.filter(i => i.overall_result?.toLowerCase() === 'fail').length}
              </Badge>
            </div>
            
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Select value={timeframe} onValueChange={setTimeframe}>
                <SelectTrigger className="h-8 w-full sm:w-[130px]">
                  <SelectValue placeholder="Timeframe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="week">Past Week</SelectItem>
                  <SelectItem value="month">Past Month</SelectItem>
                  <SelectItem value="year">Past Year</SelectItem>
                </SelectContent>
              </Select>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleExportExcel}
                disabled={isExporting || filteredInspections.length === 0}
                className="h-8"
              >
                <FileSpreadsheet className="h-4 w-4 mr-1" />
                Excel
              </Button>
              
              <Button 
                size="sm" 
                onClick={handleExportPDF}
                disabled={isExporting || filteredInspections.length === 0}
                className="h-8"
              >
                <Download className="h-4 w-4 mr-1" />
                PDF
              </Button>
            </div>
          </div>
          
          <InspectionHistoryTable 
            inspections={filteredInspections}
            isLoading={isLoading}
            onViewDetails={handleViewDetails}
            onFilterChange={handleFilterChange}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default InspectionHistory;
