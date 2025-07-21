import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Download, 
  ChevronDown, 
  Eye,
  Filter,
  ArrowUpDown,
  Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import ExportFilterModal, { ExportFilterOptions, SelectedExportFilters } from './ExportFilterModal';

interface InspectionHistoryTableProps {
  inspections: any[];
  isLoading: boolean;
  onViewDetails: (id: string) => void;
  onDownloadPDF: (id: string) => void;
  onDownloadExcel: (id: string) => void;
  onFilterChange?: (filter: string) => void;
  onTimeframeChange?: (newTimeframe: string) => void;
  onExport: (filters: SelectedExportFilters) => void;
  activeFilter: string;
  activeTimeframe: string;
}

const exportFilterOptions: ExportFilterOptions = {
  inspector: true,
  dateRange: true,
  result: true,
  ppe_type: true,
  includePhotos: true,
  includeNotes: true,
};

const InspectionHistoryTable: React.FC<InspectionHistoryTableProps> = ({
  inspections,
  isLoading,
  onViewDetails,
  onDownloadPDF,
  onDownloadExcel,
  onFilterChange,
  onTimeframeChange,
  onExport,
  activeFilter,
  activeTimeframe
}) => {
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [sortField, setSortField] = useState<string>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  
  const navigate = useNavigate();
  
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filteredInspections = inspections
    .sort((a, b) => {
      if (sortField === 'date') {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
      }
      
      if (!a[sortField]) return sortDirection === 'asc' ? 1 : -1;
      if (!b[sortField]) return sortDirection === 'asc' ? -1 : 1;
      
      const comparison = a[sortField].localeCompare(b[sortField]);
      return sortDirection === 'asc' ? comparison : -comparison;
    });

  const getStatusColor = (result: string) => {
    const resultLower = result?.toLowerCase() || '';
    if (resultLower === 'pass') return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
    if (resultLower === 'fail') return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
    return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
  };

  const renderCell = (value: any, formatType?: 'date' | 'badge' | 'ppeType' | 'ppeSerial', inspection?: any) => {
    if (formatType === 'ppeType') {
      value = inspection?.ppe_type;
    }
    if (formatType === 'ppeSerial') {
      value = inspection?.ppe_serial;
    }

    if (value === null || value === undefined || value === '') {
      return <span className="text-muted-foreground">N/A</span>;
    }
    if (formatType === 'date' && value) {
      const date = value instanceof Date ? value : new Date(value);
      return !isNaN(date.getTime()) ? format(date, 'MMM d, yyyy') : <span className="text-muted-foreground">Invalid Date</span>;
    }
    if (formatType === 'badge' && value) {
      const resultLower = value.toString().toLowerCase();
      let variant: "default" | "secondary" | "destructive" | "outline" | "success" | "warning" = "secondary";
      if (resultLower === 'pass') variant = 'success';
      else if (resultLower === 'fail') variant = 'destructive';
      return <Badge variant={variant}>{value}</Badge>;
    }
    return value.toString();
  };

  const handleViewInspection = (inspectionId: string) => {
    navigate(`/inspection/${inspectionId}`);
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100"></div>
      </div>
    );
  }

  if (inspections.length === 0) {
    return (
      <div className="text-center p-8 border rounded-md">
        <p className="text-muted-foreground">No inspection records found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end items-center gap-4">
        <Button 
          variant="outline" 
          size="sm" 
          className="h-9"
          onClick={() => setIsExportModalOpen(true)} 
          disabled={isLoading || inspections.length === 0} 
        >
          <Download className="h-4 w-4 mr-1" />
          Export
        </Button>
      </div>
      <div className="rounded-md border overflow-auto max-h-[calc(100vh-300px)]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead onClick={() => handleSort('date')} className="cursor-pointer whitespace-nowrap">
                Date
                <ArrowUpDown className="ml-1 h-3 w-3 inline" />
              </TableHead>
              <TableHead onClick={() => handleSort('ppe_serial')} className="cursor-pointer">
                Serial #
                <ArrowUpDown className="ml-1 h-3 w-3 inline" />
              </TableHead>
              <TableHead onClick={() => handleSort('ppe_type')} className="cursor-pointer">
                Equipment Type
                <ArrowUpDown className="ml-1 h-3 w-3 inline" />
              </TableHead>
              <TableHead onClick={() => handleSort('overall_result')} className="cursor-pointer">
                Result
                <ArrowUpDown className="ml-1 h-3 w-3 inline" />
              </TableHead>
              <TableHead onClick={() => handleSort('inspector_name')} className="cursor-pointer">
                Inspector
                <ArrowUpDown className="ml-1 h-3 w-3 inline" />
              </TableHead>
              <TableHead className="text-right">View</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredInspections.map((inspection) => (
              <TableRow key={inspection.id}>
                <TableCell>{renderCell(inspection.date, 'date')}</TableCell>
                <TableCell>{renderCell(null, 'ppeSerial', inspection)}</TableCell>
                <TableCell>{renderCell(null, 'ppeType', inspection)}</TableCell>
                <TableCell>{renderCell(inspection.overall_result, 'badge')}</TableCell>
                <TableCell>{renderCell(inspection.inspector_name)}</TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon" onClick={() => handleViewInspection(inspection.id)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <ExportFilterModal 
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        onExport={onExport} 
        availableFilters={exportFilterOptions} 
        data={inspections} 
        dataType="inspections"
      />
    </div>
  );
};

export default InspectionHistoryTable;
