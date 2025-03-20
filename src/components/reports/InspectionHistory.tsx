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
      
      // Format inspections data
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
    
    // Apply result/type filter
    if (filter === 'pass' || filter === 'fail') {
      filtered = filtered.filter(i => 
        i.overall_result?.toLowerCase() === filter
      );
    } else if (filter === 'pre-use' || filter === 'monthly' || filter === 'quarterly') {
      filtered = filtered.filter(i => 
        i.type === filter
      );
    }
    
    // Apply timeframe filter
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
  
  const handleViewDetails = (id: string) => {
    navigate(`/inspection/${id}`);
  };
  
  const handleFilterChange = (newFilter: string) => {
    setFilter(newFilter);
  };
  
  return (
    <div className="space-y-6 px-4 md:px-0">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Inspection History</h2>
        <Button variant="outline" size="sm" onClick={handleExportExcel} className="flex items-center">
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          Export to Excel
        </Button>
      </div>
      
      <Select value={filter} onValueChange={setFilter} className="w-full md:w-auto">
        <SelectTrigger aria-label="Filter inspections">
          <Filter className="mr-2" />
          <SelectValue placeholder="Filter by result" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All</SelectItem>
          <SelectItem value="pass">Pass</SelectItem>
          <SelectItem value="fail">Fail</SelectItem>
        </SelectContent>
      </Select>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredInspections.map((inspection) => (
          <Card key={inspection.id} className="p-4">
            <CardHeader>
              <CardTitle className="text-lg font-medium">{inspection.ppe_items.type}</CardTitle>
              <CardDescription className="text-sm text-muted-foreground">Serial: {inspection.ppe_items.serial_number}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between items-center">
                <p className="text-sm">{inspection.date}</p>
                <Badge variant={inspection.overall_result === 'pass' ? 'success' : 'error'}>
                  {inspection.overall_result.toUpperCase()}
                </Badge>
              </div>
              <div className="text-sm">
                <p>Inspector: {inspection.profiles.full_name}</p>
                <p>Notes: {inspection.notes || 'No notes provided'}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default InspectionHistory;
