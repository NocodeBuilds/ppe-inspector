
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Download, FileText, Filter, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';

const Reports = () => {
  const [inspections, setInspections] = useState<any[]>([]);
  const [filteredInspections, setFilteredInspections] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    ppeType: '',
    inspector: '',
    dateFrom: undefined as Date | undefined,
    dateTo: undefined as Date | undefined,
    result: ''
  });
  const [inspectors, setInspectors] = useState<{id: string, name: string}[]>([]);
  const [ppeTypes, setPpeTypes] = useState<string[]>([]);
  
  useEffect(() => {
    fetchInspections();
    fetchInspectors();
    fetchPPETypes();
  }, []);
  
  useEffect(() => {
    applyFilters();
  }, [filters, inspections]);
  
  const fetchInspections = async () => {
    try {
      const { data, error } = await supabase
        .from('inspections')
        .select(`
          id,
          date,
          type,
          overall_result,
          inspector_id,
          ppe_id,
          profiles!inspections_inspector_id_fkey(full_name),
          ppe_items!inspections_ppe_id_fkey(type, serial_number)
        `)
        .order('date', { ascending: false });
        
      if (error) throw error;
      
      setInspections(data || []);
      setFilteredInspections(data || []);
    } catch (error: any) {
      console.error('Error fetching inspections:', error);
      toast({
        title: 'Error',
        description: 'Failed to load inspection reports',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const fetchInspectors = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name')
        .not('full_name', 'is', null);
        
      if (error) throw error;
      
      setInspectors(data || []);
    } catch (error: any) {
      console.error('Error fetching inspectors:', error);
    }
  };
  
  const fetchPPETypes = async () => {
    try {
      const { data, error } = await supabase
        .from('ppe_items')
        .select('type')
        .limit(100);
        
      if (error) throw error;
      
      // Extract unique PPE types
      const types = [...new Set(data?.map(item => item.type))];
      setPpeTypes(types);
    } catch (error: any) {
      console.error('Error fetching PPE types:', error);
    }
  };
  
  const applyFilters = () => {
    let filtered = [...inspections];
    
    if (filters.ppeType) {
      filtered = filtered.filter(inspection => 
        inspection.ppe_items?.type === filters.ppeType
      );
    }
    
    if (filters.inspector) {
      filtered = filtered.filter(inspection => 
        inspection.inspector_id === filters.inspector
      );
    }
    
    if (filters.dateFrom) {
      filtered = filtered.filter(inspection => 
        new Date(inspection.date) >= new Date(filters.dateFrom!)
      );
    }
    
    if (filters.dateTo) {
      filtered = filtered.filter(inspection => 
        new Date(inspection.date) <= new Date(filters.dateTo!)
      );
    }
    
    if (filters.result) {
      filtered = filtered.filter(inspection => 
        inspection.overall_result === filters.result
      );
    }
    
    setFilteredInspections(filtered);
  };
  
  const handleFilterChange = (field: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const resetFilters = () => {
    setFilters({
      ppeType: '',
      inspector: '',
      dateFrom: undefined,
      dateTo: undefined,
      result: ''
    });
  };
  
  const handleExportPDF = (inspectionId: string) => {
    toast({
      title: 'Export PDF',
      description: 'PDF export functionality is coming soon',
    });
  };
  
  const handleExportExcel = () => {
    toast({
      title: 'Export Excel',
      description: 'Excel export functionality is coming soon',
    });
  };
  
  const getInspectionTypeLabel = (type: string) => {
    switch(type) {
      case 'pre-use': return 'Pre-use';
      case 'monthly': return 'Monthly';
      case 'quarterly': return 'Quarterly';
      default: return type;
    }
  };
  
  return (
    <div className="fade-in pb-20">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => window.history.back()}
            className="mr-2"
          >
            <ArrowLeft size={20} />
          </Button>
          <h1 className="text-2xl font-bold">Inspection Reports</h1>
        </div>
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-1"
        >
          <Filter size={16} />
          {showFilters ? 'Hide Filters' : 'Filter'}
        </Button>
      </div>
      
      {showFilters && (
        <div className="glass-card rounded-lg p-4 mb-4">
          <h2 className="font-semibold mb-2">Filters</h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">PPE Type</label>
              <Select
                value={filters.ppeType}
                onValueChange={(value) => handleFilterChange('ppeType', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Types</SelectItem>
                  {ppeTypes.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Inspector</label>
              <Select
                value={filters.inspector}
                onValueChange={(value) => handleFilterChange('inspector', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Inspectors" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Inspectors</SelectItem>
                  {inspectors.map(inspector => (
                    <SelectItem key={inspector.id} value={inspector.id}>{inspector.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Date From</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !filters.dateFrom && "text-muted-foreground"
                    )}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {filters.dateFrom ? format(filters.dateFrom, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={filters.dateFrom}
                    onSelect={(date) => handleFilterChange('dateFrom', date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Date To</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !filters.dateTo && "text-muted-foreground"
                    )}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {filters.dateTo ? format(filters.dateTo, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={filters.dateTo}
                    onSelect={(date) => handleFilterChange('dateTo', date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Result</label>
              <Select
                value={filters.result}
                onValueChange={(value) => handleFilterChange('result', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Results" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Results</SelectItem>
                  <SelectItem value="pass">Pass</SelectItem>
                  <SelectItem value="fail">Fail</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-end">
              <Button 
                variant="outline" 
                onClick={resetFilters}
                className="w-full"
              >
                Reset Filters
              </Button>
            </div>
          </div>
          
          <div className="mt-4">
            <Button 
              variant="outline" 
              onClick={handleExportExcel}
              className="w-full flex items-center gap-2"
            >
              <FileText size={16} />
              Export Filtered Results to Excel
            </Button>
          </div>
        </div>
      )}
      
      {isLoading ? (
        <div className="flex justify-center my-12">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : filteredInspections.length === 0 ? (
        <div className="text-center my-12">
          <p className="text-muted-foreground">No inspection reports found</p>
          {Object.values(filters).some(v => v !== '' && v !== undefined) && (
            <Button 
              variant="outline" 
              onClick={resetFilters}
              className="mt-4"
            >
              Clear Filters
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredInspections.map(inspection => (
            <div key={inspection.id} className="glass-card rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-semibold">{inspection.ppe_items?.type}</h3>
                  <p className="text-sm text-muted-foreground">Serial: {inspection.ppe_items?.serial_number}</p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleExportPDF(inspection.id)}
                  className="flex items-center gap-1"
                >
                  <Download size={14} />
                  PDF
                </Button>
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-muted-foreground">Date</p>
                  <p>{format(new Date(inspection.date), "PPP")}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Type</p>
                  <p>{getInspectionTypeLabel(inspection.type)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Inspector</p>
                  <p>{inspection.profiles?.full_name || 'Unknown'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Result</p>
                  <p className={cn(
                    "font-medium",
                    inspection.overall_result === 'pass' ? "text-success" : "text-destructive"
                  )}>
                    {inspection.overall_result === 'pass' ? 'Pass' : 'Fail'}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Reports;
