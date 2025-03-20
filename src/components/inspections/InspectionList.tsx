
import React, { useState } from 'react';
import { format } from 'date-fns';
import { Check, AlertTriangle, Download, FileText, Search, FileSpreadsheet } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useNavigate } from 'react-router-dom';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { generateInspectionDetailPDF } from '@/utils/reportGenerator/inspectionDetailPDF';
import { generateInspectionExcelReport } from '@/utils/reportGenerator/inspectionExcelReport';
import { toast } from '@/hooks/use-toast';

interface InspectionDetails {
  id: string;
  date: string;
  type: string;
  overall_result: string;
  inspector_name: string;
  ppe_type: string;
  ppe_serial: string;
  site_name?: string;
}

interface InspectionListProps {
  inspections: InspectionDetails[] | null;
  isLoading: boolean;
  title?: string;
  showFilters?: boolean;
  onFilterChange?: (filters: any) => void;
  onPageChange?: (page: number) => void;
  currentPage?: number;
  totalPages?: number;
  emptyMessage?: string;
}

const InspectionList: React.FC<InspectionListProps> = ({
  inspections,
  isLoading,
  title = 'Inspection History',
  showFilters = true,
  onFilterChange,
  onPageChange,
  currentPage = 1,
  totalPages = 1,
  emptyMessage = 'No inspection records found'
}) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterResult, setFilterResult] = useState('all');
  const [isExporting, setIsExporting] = useState(false);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    if (onFilterChange) {
      onFilterChange({
        searchTerm: e.target.value,
        type: filterType,
        result: filterResult
      });
    }
  };

  const handleTypeChange = (value: string) => {
    setFilterType(value);
    if (onFilterChange) {
      onFilterChange({
        searchTerm,
        type: value,
        result: filterResult
      });
    }
  };

  const handleResultChange = (value: string) => {
    setFilterResult(value);
    if (onFilterChange) {
      onFilterChange({
        searchTerm,
        type: filterType,
        result: value
      });
    }
  };

  const handleViewDetails = (inspectionId: string) => {
    navigate(`/inspection/${inspectionId}`);
  };

  const handleExportPDF = async (inspection: InspectionDetails) => {
    try {
      setIsExporting(true);
      
      // Get complete inspection details for PDF generation
      const response = await fetch(`/api/inspections/${inspection.id}`);
      if (!response.ok) throw new Error('Failed to fetch inspection details');
      
      const inspectionData = await response.json();
      await generateInspectionDetailPDF(inspectionData);
      
      toast({
        title: 'PDF Generated',
        description: 'Inspection report has been downloaded as PDF',
      });
    } catch (error) {
      console.error('PDF generation error:', error);
      toast({
        title: 'PDF Generation Failed',
        description: 'Could not generate PDF report',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportExcel = async (inspection: InspectionDetails) => {
    try {
      setIsExporting(true);
      
      // Get complete inspection details for Excel generation
      const response = await fetch(`/api/inspections/${inspection.id}`);
      if (!response.ok) throw new Error('Failed to fetch inspection details');
      
      const inspectionData = await response.json();
      await generateInspectionExcelReport(inspectionData);
      
      toast({
        title: 'Excel Generated',
        description: 'Inspection report has been downloaded as Excel',
      });
    } catch (error) {
      console.error('Excel generation error:', error);
      toast({
        title: 'Excel Generation Failed',
        description: 'Could not generate Excel report',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  const renderPaginationLinks = () => {
    const links = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    if (startPage > 1) {
      links.push(
        <PaginationItem key="start">
          <PaginationLink onClick={() => onPageChange && onPageChange(1)}>1</PaginationLink>
        </PaginationItem>
      );
      if (startPage > 2) {
        links.push(
          <PaginationItem key="start-ellipsis">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }
    }
    
    for (let i = startPage; i <= endPage; i++) {
      links.push(
        <PaginationItem key={i}>
          <PaginationLink
            isActive={i === currentPage}
            onClick={() => onPageChange && onPageChange(i)}
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }
    
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        links.push(
          <PaginationItem key="end-ellipsis">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }
      links.push(
        <PaginationItem key="end">
          <PaginationLink onClick={() => onPageChange && onPageChange(totalPages)}>
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      );
    }
    
    return links;
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-12 w-full" />
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">{title}</h2>
      
      {showFilters && (
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="flex-1">
            <Input
              placeholder="Search by PPE serial or type..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full"
              icon={<Search className="h-4 w-4" />}
            />
          </div>
          <div className="flex gap-2">
            <Select value={filterType} onValueChange={handleTypeChange}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Inspection Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="pre-use">Pre-Use</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="quarterly">Quarterly</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={filterResult} onValueChange={handleResultChange}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Result" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Results</SelectItem>
                <SelectItem value="pass">Pass</SelectItem>
                <SelectItem value="fail">Fail</SelectItem>
                <SelectItem value="maintenance-required">Maintenance</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
      
      {!inspections || inspections.length === 0 ? (
        <Card>
          <CardContent className="flex items-center justify-center py-6">
            <p className="text-muted-foreground text-center">{emptyMessage}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {inspections.map((inspection) => (
            <Card 
              key={inspection.id} 
              className="hover:shadow-md transition-shadow"
            >
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3">
                  <div className="flex items-center gap-3 mb-2 sm:mb-0">
                    <div>
                      <Badge 
                        variant={inspection.overall_result.toLowerCase() === 'pass' ? 'default' : 'destructive'}
                        className="uppercase"
                      >
                        {inspection.overall_result}
                      </Badge>
                    </div>
                    <div className="text-sm">
                      {format(new Date(inspection.date), 'MMM d, yyyy')}
                    </div>
                    <div className="text-sm uppercase text-muted-foreground">
                      {inspection.type}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleExportExcel(inspection)}
                      disabled={isExporting}
                    >
                      <FileSpreadsheet className="h-4 w-4 mr-1" />
                      Excel
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleExportPDF(inspection)}
                      disabled={isExporting}
                    >
                      <FileText className="h-4 w-4 mr-1" />
                      PDF
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleViewDetails(inspection.id)}
                    >
                      View Details
                    </Button>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-1">
                  <div>
                    <p className="text-xs text-muted-foreground">PPE Type</p>
                    <p className="font-medium">{inspection.ppe_type}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Serial Number</p>
                    <p className="font-medium">{inspection.ppe_serial}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Inspector</p>
                    <p className="font-medium">{inspection.inspector_name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Site</p>
                    <p className="font-medium">{inspection.site_name || 'N/A'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      {totalPages > 1 && (
        <Pagination className="mt-4">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                onClick={() => onPageChange && onPageChange(Math.max(1, currentPage - 1))}
                aria-disabled={currentPage === 1}
                className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
              />
            </PaginationItem>
            
            {renderPaginationLinks()}
            
            <PaginationItem>
              <PaginationNext 
                onClick={() => onPageChange && onPageChange(Math.min(totalPages, currentPage + 1))}
                aria-disabled={currentPage === totalPages}
                className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
};

export default InspectionList;
