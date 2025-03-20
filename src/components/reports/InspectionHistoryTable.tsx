
import React, { useState } from 'react';
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
  FileText, 
  Eye,
  Filter,
  ArrowUpDown,
  Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface InspectionHistoryTableProps {
  inspections: any[];
  isLoading: boolean;
  onViewDetails: (id: string) => void;
  onFilterChange?: (filter: string) => void;
}

const InspectionHistoryTable: React.FC<InspectionHistoryTableProps> = ({
  inspections,
  isLoading,
  onViewDetails,
  onFilterChange
}) => {
  const [searchTerm, setSearchTerm] = useState('');
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
    .filter(inspection => {
      if (!searchTerm) return true;
      
      const searchLower = searchTerm.toLowerCase();
      return (
        inspection.ppe_type?.toLowerCase().includes(searchLower) ||
        inspection.ppe_serial?.toLowerCase().includes(searchLower) ||
        inspection.overall_result?.toLowerCase().includes(searchLower) ||
        inspection.inspector_name?.toLowerCase().includes(searchLower)
      );
    })
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
      <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2 justify-between">
        <div className="flex w-full max-w-sm items-center space-x-2">
          <Input
            placeholder="Search inspections..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-9"
          />
          <Button variant="secondary" size="sm" className="h-9">
            <Search className="h-4 w-4 mr-1" />
            <span className="sr-only sm:not-sr-only sm:inline">Search</span>
          </Button>
        </div>
        
        {onFilterChange && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-9">
                <Filter className="h-4 w-4 mr-1" />
                Filter
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onFilterChange('all')}>
                All Inspections
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onFilterChange('pass')}>
                Passed Inspections
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onFilterChange('fail')}>
                Failed Inspections
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onFilterChange('pre-use')}>
                Pre-use Inspections
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onFilterChange('monthly')}>
                Monthly Inspections
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onFilterChange('quarterly')}>
                Quarterly Inspections
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
      
      <div className="rounded-md border overflow-auto max-h-[calc(100vh-300px)]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead onClick={() => handleSort('date')} className="cursor-pointer whitespace-nowrap">
                Date
                <ArrowUpDown className="ml-1 h-3 w-3 inline" />
              </TableHead>
              <TableHead onClick={() => handleSort('ppe_type')} className="cursor-pointer">
                Equipment Type
                <ArrowUpDown className="ml-1 h-3 w-3 inline" />
              </TableHead>
              <TableHead onClick={() => handleSort('ppe_serial')} className="cursor-pointer">
                Serial #
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
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredInspections.map((inspection) => (
              <TableRow key={inspection.id} className="group">
                <TableCell className="whitespace-nowrap font-medium">
                  {format(new Date(inspection.date), 'MMM d, yyyy')}
                </TableCell>
                <TableCell>{inspection.ppe_type || 'Unknown'}</TableCell>
                <TableCell>{inspection.ppe_serial || 'Unknown'}</TableCell>
                <TableCell>
                  <Badge className={getStatusColor(inspection.overall_result)}>
                    {inspection.overall_result?.toUpperCase() || 'UNKNOWN'}
                  </Badge>
                </TableCell>
                <TableCell>{inspection.inspector_name || 'Unknown'}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onViewDetails(inspection.id)}
                    className="h-8 w-8 p-0"
                  >
                    <Eye className="h-4 w-4" />
                    <span className="sr-only">View</span>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default InspectionHistoryTable;
