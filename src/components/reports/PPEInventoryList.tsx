import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Eye, ArrowUpDown, Search, ChevronDown, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { PPEItem } from '@/types/ppe';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { exportFilteredPPEToExcel } from '@/utils/exportUtils';
import ExportFilterModal, { ExportFilterOptions, SelectedExportFilters } from './ExportFilterModal';

const ppeExportFilters: ExportFilterOptions = {
  status: true,
  ppeType: true,
  brand: true,
  dateRange: false,
  serialNumber: false,
};

const PPEInventoryList = () => {
  const [ppeItems, setPpeItems] = useState<PPEItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<keyof PPEItem | string>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [selectedItem, setSelectedItem] = useState<PPEItem | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchPPEItems();
  }, []);

  const fetchPPEItems = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('ppe_items')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        setPpeItems(data as PPEItem[]);
      }
    } catch (error: any) {
      console.error('Error fetching PPE items:', error);
      toast({
        title: 'Error',
        description: 'Failed to load PPE inventory.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSort = (field: keyof PPEItem | string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const processedItems = ppeItems
    .filter(item => {
      const statusMatch = statusFilter === 'all' || item.status?.toLowerCase() === statusFilter;

      if (!searchTerm) return true;
      const searchLower = searchTerm.toLowerCase();
      const searchMatch = (
        item.serial_number?.toLowerCase().includes(searchLower) ||
        item.type?.toLowerCase().includes(searchLower) ||
        item.brand?.toLowerCase().includes(searchLower) ||
        item.status?.toLowerCase().includes(searchLower) ||
        item.model_number?.toLowerCase().includes(searchLower)
      );

      return statusMatch && searchMatch; 
    })
    .sort((a, b) => {
      const fieldA = a[sortField as keyof PPEItem];
      const fieldB = b[sortField as keyof PPEItem];

      if (sortField === 'next_inspection' || sortField === 'created_at' || sortField === 'updated_at' || sortField === 'manufacturing_date' || sortField === 'expiry_date') {
        const dateA = fieldA ? new Date(fieldA as string).getTime() : 0;
        const dateB = fieldB ? new Date(fieldB as string).getTime() : 0;
        if (!dateA && !dateB) return 0;
        if (!dateA) return sortDirection === 'asc' ? 1 : -1;
        if (!dateB) return sortDirection === 'asc' ? -1 : 1;
        return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
      }

      if (fieldA === null || fieldA === undefined) return sortDirection === 'asc' ? 1 : -1;
      if (fieldB === null || fieldB === undefined) return sortDirection === 'asc' ? -1 : 1;
      
      const comparison = String(fieldA).localeCompare(String(fieldB), undefined, { numeric: true });
      return sortDirection === 'asc' ? comparison : -comparison;
    });

  const handleShowDetails = (item: PPEItem) => {
    setSelectedItem(item);
  };

  const handleExport = (filters: SelectedExportFilters) => {
    console.log("Export requested (PPE) with filters:", filters);
    toast({ title: "Exporting PPE Inventory...", description: "Generating Excel file." });

    try {
      let dataToExport = ppeItems.filter(item => {
        if (filters.status && item.status?.toLowerCase() !== filters.status.toLowerCase()) {
          return false;
        }

        if (filters.ppeType && item.type?.toLowerCase() !== filters.ppeType.toLowerCase()) {
          return false;
        }

        if (filters.brand && item.brand?.toLowerCase() !== filters.brand.toLowerCase()) {
          return false;
        }

        return true;
      });

      const filterDesc = Object.entries(filters)
          .map(([key, value]) => `${key}=${value instanceof Date ? value.toISOString().split('T')[0] : value}`)
          .join('_');
      const filenamePrefix = filterDesc ? `PPEInventory_${filterDesc}` : 'PPEInventory_All';

      if (dataToExport.length > 0) {
        exportFilteredPPEToExcel(dataToExport, filenamePrefix);
        toast({ title: "Export Successful", description: `Exported ${dataToExport.length} PPE items.` });
      } else {
        toast({ variant: "destructive", title: "No Data Found", description: "No PPE items match the selected filter criteria." });
      }
    } catch (error) {
      console.error("PPE Export failed:", error);
      toast({ variant: "destructive", title: "Export Failed", description: "Failed to generate Excel file." });
    }
  };

  if (isLoading) {
    return (
      <div className="border rounded-md p-4 space-y-2">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    );
  }

  if (ppeItems.length === 0 && !isLoading) {
    return (
      <div className="text-center p-8 border rounded-md">
        <p className="text-muted-foreground">No PPE items found in inventory.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2 justify-between">
        <div className="flex flex-grow max-w-sm items-center space-x-2">
          <Input
            placeholder="Search inventory..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-9 flex-grow"
          />
          <Button variant="secondary" size="sm" className="h-9">
            <Search className="h-4 w-4" />
            <span className="sr-only">Search</span>
          </Button>
        </div>

        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="h-9"
            onClick={() => setIsExportModalOpen(true)} 
            disabled={isLoading || ppeItems.length === 0} 
          >
            <Download className="h-4 w-4 mr-1" />
            Export
          </Button>
        </div>
      </div>

      <div className="rounded-md border overflow-auto max-h-[calc(100vh-300px)]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead onClick={() => handleSort('serial_number')} className="cursor-pointer whitespace-nowrap">
                Serial #
                <ArrowUpDown className={`ml-1 h-3 w-3 inline transition-transform ${sortField === 'serial_number' ? 'opacity-100' : 'opacity-30'} ${sortDirection === 'desc' ? '' : 'rotate-180'}`} />
              </TableHead>
              <TableHead onClick={() => handleSort('type')} className="cursor-pointer">
                Type
                <ArrowUpDown className={`ml-1 h-3 w-3 inline transition-transform ${sortField === 'type' ? 'opacity-100' : 'opacity-30'} ${sortDirection === 'desc' ? '' : 'rotate-180'}`} />
              </TableHead>
              <TableHead onClick={() => handleSort('brand')} className="cursor-pointer">
                Brand
                <ArrowUpDown className={`ml-1 h-3 w-3 inline transition-transform ${sortField === 'brand' ? 'opacity-100' : 'opacity-30'} ${sortDirection === 'desc' ? '' : 'rotate-180'}`} />
              </TableHead>
              <TableHead onClick={() => handleSort('status')} className="cursor-pointer">
                Status
                <ArrowUpDown className={`ml-1 h-3 w-3 inline transition-transform ${sortField === 'status' ? 'opacity-100' : 'opacity-30'} ${sortDirection === 'desc' ? '' : 'rotate-180'}`} />
              </TableHead>
              <TableHead onClick={() => handleSort('next_inspection')} className="cursor-pointer whitespace-nowrap">
                Next Insp.
                <ArrowUpDown className={`ml-1 h-3 w-3 inline transition-transform ${sortField === 'next_inspection' ? 'opacity-100' : 'opacity-30'} ${sortDirection === 'desc' ? '' : 'rotate-180'}`} />
              </TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {processedItems.map((item) => (
              <TableRow 
                key={item.id} 
                className="group hover:bg-muted/50 cursor-pointer" 
              >
                <TableCell className="font-medium whitespace-nowrap" onClick={() => handleShowDetails(item)}>{item.serial_number || 'N/A'}</TableCell>
                <TableCell onClick={() => handleShowDetails(item)}>{item.type}</TableCell>
                <TableCell onClick={() => handleShowDetails(item)}>{item.brand || 'N/A'}</TableCell>
                <TableCell onClick={() => handleShowDetails(item)}>{item.status}</TableCell>
                <TableCell onClick={() => handleShowDetails(item)} className="whitespace-nowrap">
                  {item.next_inspection ? format(new Date(item.next_inspection), 'MMM d, yyyy') : 'N/A'}
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleShowDetails(item)}>
                    <Eye className="h-4 w-4" />
                    <span className="sr-only">View Item Details</span>
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
        onExport={handleExport} 
        availableFilters={ppeExportFilters} 
        data={ppeItems} 
        dataType="ppe"
      />

      <Dialog open={!!selectedItem} onOpenChange={(isOpen) => !isOpen && setSelectedItem(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>PPE Item Details</DialogTitle>
            <DialogDescription>
              Detailed information for {selectedItem?.type || 'Item'} ({selectedItem?.serial_number || 'N/A'})
            </DialogDescription>
          </DialogHeader>
          {selectedItem && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <span className="text-right font-semibold col-span-1">Serial #:</span>
                <span className="col-span-3">{selectedItem.serial_number || 'N/A'}</span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                 <span className="text-right font-semibold col-span-1">Type:</span>
                 <span className="col-span-3">{selectedItem.type}</span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                 <span className="text-right font-semibold col-span-1">Brand:</span>
                 <span className="col-span-3">{selectedItem.brand || 'N/A'}</span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                 <span className="text-right font-semibold col-span-1">Model:</span>
                 <span className="col-span-3">{selectedItem.model_number || 'N/A'}</span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                 <span className="text-right font-semibold col-span-1">Status:</span>
                 <span className="col-span-3">{selectedItem.status}</span>
              </div>
               <div className="grid grid-cols-4 items-center gap-4">
                 <span className="text-right font-semibold col-span-1">Mfg Date:</span>
                 <span className="col-span-3">
                  {selectedItem.manufacturing_date ? format(new Date(selectedItem.manufacturing_date), 'MMM d, yyyy') : 'N/A'}
                 </span>
              </div>
               <div className="grid grid-cols-4 items-center gap-4">
                 <span className="text-right font-semibold col-span-1">Expiry:</span>
                 <span className="col-span-3">
                   {selectedItem.expiry_date ? format(new Date(selectedItem.expiry_date), 'MMM d, yyyy') : 'N/A'}
                 </span>
              </div>
               <div className="grid grid-cols-4 items-center gap-4">
                 <span className="text-right font-semibold col-span-1">Next Insp:</span>
                 <span className="col-span-3">
                   {selectedItem.next_inspection ? format(new Date(selectedItem.next_inspection), 'MMM d, yyyy') : 'N/A'}
                 </span>
              </div>
               <div className="grid grid-cols-4 items-center gap-4">
                 <span className="text-right font-semibold col-span-1">Added:</span>
                 <span className="col-span-3">
                   {selectedItem.created_at ? format(new Date(selectedItem.created_at), 'MMM d, yyyy') : 'N/A'}
                 </span>
              </div>
              {/* Add more details as needed */}
            </div>
          )}
          {/* Optional: Add DialogFooter with actions like Close */}
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default PPEInventoryList;
