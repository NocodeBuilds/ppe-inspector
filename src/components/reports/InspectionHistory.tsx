
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
import { exportFilteredInspectionsToExcel } from '@/utils/exportUtils';
import { generateInspectionsDateReport } from '@/utils/reportGeneratorService';
import { Badge } from '@/components/ui/badge';
import { fetchCompleteInspectionData } from '@/utils/reportGenerator/reportDataFormatter';
import { generateInspectionDetailPDF } from '@/utils/reportGenerator/inspectionDetailPDF';
import { generateInspectionExcelReport } from '@/utils/reportGenerator/inspectionExcelReport';
import { SelectedExportFilters } from './ExportFilterModal';
import { safeGet, isNotEmpty } from '@/utils/safeGet';

const InspectionHistory = () => {
  const [inspections, setInspections] = useState<any[]>([]);
  const [filteredInspections, setFilteredInspections] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [timeframe, setTimeframe] = useState('all');
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
        inspector_name: safeGet(item.profiles, 'full_name', 'Unknown'),
        ppe_type: safeGet(item.ppe_items, 'type', 'Unknown'),
        ppe_serial: safeGet(item.ppe_items, 'serial_number', 'Unknown'),
        ppe_brand: safeGet(item.ppe_items, 'brand', 'Unknown'),
        ppe_model: safeGet(item.ppe_items, 'model_number', 'Unknown')
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
  
  const handleExport = (filters: SelectedExportFilters) => {
    console.log("Export requested with filters:", filters);
    toast({ title: "Exporting Inspections...", description: "Generating Excel file." });
    
    try {
      let dataToExport = inspections.filter(inspection => {
        if (filters.ppeType && inspection.ppe_type !== filters.ppeType) {
          return false;
        }
        
        if (filters.result && inspection.overall_result?.toLowerCase() !== filters.result.toLowerCase()) {
          return false;
        }
        
        return true;
      });
      
      const filterDesc = Object.entries(filters)
          .map(([key, value]) => `${key}=${value}`)
          .join('_');
      const filenamePrefix = filterDesc ? `InspectionHistory_${filterDesc}` : 'InspectionHistory_All';
      
      if (dataToExport.length > 0) {
        exportFilteredInspectionsToExcel(dataToExport, filenamePrefix);
        toast({ title: "Export Successful", description: `Exported ${dataToExport.length} inspections.` });
      } else {
        toast({ variant: "destructive", title: "No Data Found", description: "No inspections match the selected filter criteria." });
      }
    } catch (error) {
      console.error("Export failed:", error);
      toast({ variant: "destructive", title: "Export Error", description: "An unexpected error occurred during export." });
    }
  };
  
  const handleDownloadPDF = async (id: string) => {
    try {
      const inspectionData = await fetchCompleteInspectionData(supabase, id);
      if (!inspectionData) throw new Error('Inspection data not found.');
      
      await generateInspectionDetailPDF(inspectionData);
      toast({
        title: 'PDF Generated',
        description: 'Inspection report has been downloaded as PDF',
      });
    } catch (error: any) {
      console.error('Error generating single PDF report:', error);
      toast({
        title: 'PDF Generation Failed',
        description: error.message || 'Could not generate PDF report',
        variant: 'destructive',
      });
    }
  };
  
  const handleDownloadExcel = async (id: string) => {
    try {
      const inspectionData = await fetchCompleteInspectionData(supabase, id);
      if (!inspectionData) throw new Error('Inspection data not found.');

      await generateInspectionExcelReport(inspectionData);
      toast({
        title: 'Excel Generated',
        description: 'Inspection report has been downloaded as Excel',
      });
    } catch (error: any) {
      console.error('Error generating single Excel report:', error);
      toast({
        title: 'Excel Generation Failed',
        description: error.message || 'Could not generate Excel report',
        variant: 'destructive',
      });
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
            </div>
          </div>
          
          <InspectionHistoryTable 
            inspections={filteredInspections}
            isLoading={isLoading}
            onViewDetails={handleViewDetails}
            onDownloadPDF={handleDownloadPDF}
            onDownloadExcel={handleDownloadExcel}
            onFilterChange={handleFilterChange}
            onExport={handleExport}
            activeFilter={filter}
            activeTimeframe={timeframe}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default InspectionHistory;
