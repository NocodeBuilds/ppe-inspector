
import React, { useState, useEffect } from 'react';
import { CalendarIcon, Download, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { DatePicker } from '@/components/ui/date-picker';
import { format, subDays } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

const ReportsPage = () => {
  const { profile } = useAuth();
  const [reportType, setReportType] = useState('inspections');
  const [startDate, setStartDate] = useState<Date>(subDays(new Date(), 30));
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [ppeTypes, setPpeTypes] = useState<string[]>([]);
  const [selectedPpeType, setSelectedPpeType] = useState<string>('all');
  const [inspectors, setInspectors] = useState<{id: string, name: string}[]>([]);
  const [selectedInspector, setSelectedInspector] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [reportData, setReportData] = useState([]);

  useEffect(() => {
    fetchFilters();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      fetchReportData();
    }
  }, [reportType, startDate, endDate, selectedPpeType, selectedInspector, isLoading]);

  const fetchFilters = async () => {
    try {
      // Fetch PPE types
      const { data: typesData, error: typesError } = await supabase
        .from('ppe_items')
        .select('type')
        .order('type');

      if (typesError) throw typesError;

      const uniqueTypes = [...new Set(typesData.map(item => item.type))];
      setPpeTypes(uniqueTypes);

      // Fetch inspectors
      const { data: inspectorsData, error: inspectorsError } = await supabase
        .from('profiles')
        .select('id, full_name')
        .order('full_name');

      if (inspectorsError) throw inspectorsError;

      setInspectors(inspectorsData.map(user => ({
        id: user.id,
        name: user.full_name || 'Unknown'
      })));

      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching filters:', error);
      toast({
        title: 'Error',
        description: 'Failed to load report filters',
        variant: 'destructive',
      });
      setIsLoading(false);
    }
  };

  const fetchReportData = async () => {
    setIsLoading(true);

    try {
      if (reportType === 'inspections') {
        let query = supabase
          .from('inspections')
          .select(`
            id,
            date,
            type,
            overall_result,
            ppe_items(id, type, serial_number),
            profiles(id, full_name)
          `)
          .gte('date', format(startDate, 'yyyy-MM-dd'))
          .lte('date', format(endDate, 'yyyy-MM-dd'));

        if (selectedInspector !== 'all') {
          query = query.eq('inspector_id', selectedInspector);
        }

        const { data, error } = await query;

        if (error) throw error;

        // Filter by PPE type if needed
        let filteredData = data;
        if (selectedPpeType !== 'all') {
          filteredData = data.filter(record => 
            record.ppe_items && record.ppe_items.type === selectedPpeType
          );
        }

        setReportData(filteredData);
      } else if (reportType === 'equipment') {
        let query = supabase
          .from('ppe_items')
          .select('*');

        if (selectedPpeType !== 'all') {
          query = query.eq('type', selectedPpeType);
        }

        const { data, error } = await query;

        if (error) throw error;

        setReportData(data);
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

  const downloadReport = () => {
    toast({
      title: 'Download Started',
      description: 'Your report is being prepared for download',
    });
    
    // This is a mock implementation
    setTimeout(() => {
      toast({
        title: 'Download Complete',
        description: 'Your report has been downloaded',
      });
    }, 2000);
  };

  return (
    <div className="container mx-auto p-4 pb-20">
      <h1 className="text-2xl font-bold mb-6">Reports & Analytics</h1>
      
      <Card className="mb-6">
        <div className="p-4">
          <h2 className="text-lg font-semibold mb-4">Generate Report</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Report Type</label>
              <Select
                value={reportType}
                onValueChange={setReportType}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select report type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="inspections">Inspection Report</SelectItem>
                  <SelectItem value="equipment">Equipment Status</SelectItem>
                  <SelectItem value="expiring">Expiring PPE</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Start Date</label>
              <DatePicker date={startDate} setDate={setStartDate} />
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">End Date</label>
              <DatePicker date={endDate} setDate={setEndDate} />
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">PPE Type</label>
              <Select
                value={selectedPpeType}
                onValueChange={setSelectedPpeType}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select PPE type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {ppeTypes.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {reportType === 'inspections' && (
              <div>
                <label className="text-sm font-medium mb-2 block">Inspector</label>
                <Select
                  value={selectedInspector}
                  onValueChange={setSelectedInspector}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select inspector" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Inspectors</SelectItem>
                    {inspectors.map(inspector => (
                      <SelectItem key={inspector.id} value={inspector.id}>
                        {inspector.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          
          <Separator className="my-4" />
          
          <div className="flex justify-between items-center">
            <div className="text-sm text-muted-foreground">
              {reportData.length} records found
            </div>
            
            <Button onClick={downloadReport}>
              <Download size={16} className="mr-2" />
              Download Report
            </Button>
          </div>
        </div>
      </Card>
      
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-lg font-semibold">Report Preview</h2>
        <Button variant="outline" size="sm">
          <Filter size={16} className="mr-2" />
          More Filters
        </Button>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center my-12">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : reportData.length > 0 ? (
        <div className="grid gap-4">
          {reportType === 'inspections' ? (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-muted">
                    <th className="p-2 text-left">Date</th>
                    <th className="p-2 text-left">PPE Type</th>
                    <th className="p-2 text-left">Serial Number</th>
                    <th className="p-2 text-left">Inspector</th>
                    <th className="p-2 text-left">Type</th>
                    <th className="p-2 text-left">Result</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.map((record: any) => (
                    <tr key={record.id} className="border-b border-gray-200">
                      <td className="p-2">{format(new Date(record.date), 'MMM d, yyyy')}</td>
                      <td className="p-2">{record.ppe_items?.type || 'Unknown'}</td>
                      <td className="p-2">{record.ppe_items?.serial_number || 'Unknown'}</td>
                      <td className="p-2">{record.profiles?.full_name || 'Unknown'}</td>
                      <td className="p-2 capitalize">{record.type}</td>
                      <td className="p-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          record.overall_result === 'pass' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {record.overall_result}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-muted">
                    <th className="p-2 text-left">Type</th>
                    <th className="p-2 text-left">Serial Number</th>
                    <th className="p-2 text-left">Brand</th>
                    <th className="p-2 text-left">Expiry Date</th>
                    <th className="p-2 text-left">Last Inspection</th>
                    <th className="p-2 text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.map((item: any) => (
                    <tr key={item.id} className="border-b border-gray-200">
                      <td className="p-2">{item.type}</td>
                      <td className="p-2">{item.serial_number}</td>
                      <td className="p-2">{item.brand}</td>
                      <td className="p-2">{format(new Date(item.expiry_date), 'MMM d, yyyy')}</td>
                      <td className="p-2">{item.last_inspection ? format(new Date(item.last_inspection), 'MMM d, yyyy') : 'Never'}</td>
                      <td className="p-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          item.status === 'active' ? 'bg-green-100 text-green-800' : 
                          item.status === 'expired' ? 'bg-red-100 text-red-800' :
                          item.status === 'maintenance' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-orange-100 text-orange-800'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center p-8 bg-muted rounded-lg">
          <CalendarIcon size={48} className="mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium mb-2">No data available</h3>
          <p className="text-muted-foreground">
            Try adjusting your filters to see more results
          </p>
        </div>
      )}
    </div>
  );
};

export default ReportsPage;
