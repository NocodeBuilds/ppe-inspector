
import React, { useState } from 'react';
import { useInspectionHistory } from '@/hooks/useInspectionHistory';
import { InspectionType } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { AlertCircle, FileText, Download, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import PageHeader from '@/components/common/PageHeader';
import InspectionsSkeleton from './InspectionsSkeleton';
import InspectionList from './InspectionList';

type FilterType = {
  type: InspectionType | 'all';
  result: string;
  dateFrom: string | null;
  dateTo: string | null;
};

const InspectionHistoryView: React.FC = () => {
  const [filters, setFilters] = useState<FilterType>({
    type: 'all',
    result: '',
    dateFrom: null,
    dateTo: null,
  });

  const { inspections, isLoading, error, refetch } = useInspectionHistory({
    type: filters.type,
    result: filters.result || undefined,
    dateFrom: filters.dateFrom || undefined,
    dateTo: filters.dateTo || undefined,
  });

  const handleFilterChange = (key: keyof FilterType, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const formatDate = (date: Date): string => {
    return format(date, 'yyyy-MM-dd');
  };

  const validInspectionTypes: (InspectionType | 'all')[] = ['all', 'pre-use', 'monthly', 'quarterly'];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8">
      <PageHeader 
        title="Inspection History" 
        icon={<FileText className="h-6 w-6" />}
      />

      <div className="mb-6 flex flex-wrap gap-4">
        <div className="w-full sm:w-auto">
          <Select 
            value={filters.type} 
            onValueChange={(value) => handleFilterChange('type', value as InspectionType | 'all')}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Inspection Type" />
            </SelectTrigger>
            <SelectContent>
              {validInspectionTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type === 'all' ? 'All Types' : type.charAt(0).toUpperCase() + type.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="w-full sm:w-auto">
          <Select 
            value={filters.result} 
            onValueChange={(value) => handleFilterChange('result', value)}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Result" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Results</SelectItem>
              <SelectItem value="pass">Pass</SelectItem>
              <SelectItem value="fail">Fail</SelectItem>
              <SelectItem value="flagged">Flagged</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="w-full sm:w-auto">
          <DatePicker 
            placeholder="From Date"
            date={filters.dateFrom ? new Date(filters.dateFrom) : undefined}
            setDate={(date) => handleFilterChange('dateFrom', date ? formatDate(date) : null)}
          />
        </div>

        <div className="w-full sm:w-auto">
          <DatePicker 
            placeholder="To Date"
            date={filters.dateTo ? new Date(filters.dateTo) : undefined}
            setDate={(date) => handleFilterChange('dateTo', date ? formatDate(date) : null)}
          />
        </div>

        <div className="w-full sm:w-auto ml-auto">
          <Button variant="outline" onClick={() => refetch()} className="gap-2">
            <RefreshCw size={18} />
            Refresh
          </Button>
        </div>
        
        <div className="w-full sm:w-auto">
          <Button variant="outline" className="gap-2">
            <Download size={18} />
            Export
          </Button>
        </div>
      </div>

      {error && (
        <Card className="mb-6 p-4 border-red-300 bg-red-50 text-red-800">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
            <div>
              <h3 className="font-medium">Error Loading Inspections</h3>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        </Card>
      )}

      {isLoading ? (
        <InspectionsSkeleton />
      ) : (
        <>
          {inspections && inspections.length > 0 ? (
            <InspectionList inspections={inspections} />
          ) : (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium mb-2">No inspections found</h3>
              <p className="text-gray-500">Try adjusting your filters or adding new inspections</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default InspectionHistoryView;
