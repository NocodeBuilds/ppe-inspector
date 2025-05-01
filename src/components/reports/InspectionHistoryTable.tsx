
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DataTable, Formatters } from '@/components/ui/data-table';
import { StandardCard } from '@/components/ui/standard-card';
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

const inspectionExportFilters: ExportFilterOptions = {
  ppeType: true,
  result: true,
  inspectionType: true,
  dateRange: true
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
  
  const handleSort = (field: string, direction: 'asc' | 'desc') => {
    setSortField(field);
    setSortDirection(direction);
  };

  const sortedInspections = [...inspections].sort((a, b) => {
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

  const handleViewInspection = (inspectionId: string) => {
    navigate(`/inspection/${inspectionId}`);
  }

  const columns = [
    {
      key: 'date',
      header: 'Date',
      sortable: true,
      formatter: (value: string) => Formatters.date(value)
    },
    {
      key: 'ppe_serial',
      header: 'Serial #',
      sortable: true
    },
    {
      key: 'ppe_type',
      header: 'Equipment Type',
      sortable: true
    },
    {
      key: 'overall_result',
      header: 'Result',
      sortable: true,
      formatter: (value: string) => Formatters.badge(value)
    },
    {
      key: 'inspector_name',
      header: 'Inspector',
      sortable: true
    }
  ];

  const renderActions = (inspection: any) => (
    <Button variant="ghost" size="icon" onClick={() => handleViewInspection(inspection.id)}>
      <Eye className="h-4 w-4" />
    </Button>
  );

  return (
    <StandardCard>
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
      
        <DataTable
          data={sortedInspections}
          columns={columns}
          isLoading={isLoading}
          actions={renderActions}
          onSort={handleSort}
          className="max-h-[calc(100vh-300px)]"
          emptyMessage="No inspection records found."
        />
      </div>
      
      <ExportFilterModal 
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        onExport={onExport} 
        availableFilters={inspectionExportFilters} 
        data={inspections} 
        dataType="inspections"
      />
    </StandardCard>
  );
};

export default InspectionHistoryTable;
