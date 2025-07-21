import React, { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';

// Define structure for filter options passed to the modal
export interface ExportFilterOptions {
  status?: boolean;        // For PPE Status
  ppe_type?: boolean;       // For PPE Type (both Inspections and PPE)
  result?: boolean;        // For Inspection Result
  inspectionType?: boolean; // For Inspection Type
  date_range?: boolean;      // For date filtering
  serial_number?: boolean;   // For PPE Serial Number
  brand?: boolean;         // For PPE Brand
  inspectorName?: boolean; // For Inspector Name (Inspections)
  location?: boolean;      // For Location (Both, assumed property)
}

// Define structure for selected filter values
export interface SelectedExportFilters {
  status?: string;         // e.g., 'active', 'all'
  ppe_type?: string;        // e.g., 'Helmet', 'all'
  result?: string;         // e.g., 'pass', 'fail', 'all'
  inspectionType?: string; // e.g., 'pre-use', 'all'
  startDate?: Date | null;
  endDate?: Date | null;
  serial_number?: string;   // e.g., 'SN123', could be partial match
  brand?: string;          // e.g., 'BrandX', 'all'
  inspectorName?: string;  // e.g., 'John Doe', 'all'
  location?: string;       // e.g., 'Site A', 'all'
}

interface ExportFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (filters: SelectedExportFilters) => void;
  availableFilters: ExportFilterOptions;
  data: any[]; // The raw data (inspections or PPE items) to derive filter options from
  dataType: 'inspections' | 'ppe'; // To customize labels and data extraction
}

const ExportFilterModal: React.FC<ExportFilterModalProps> = ({
  isOpen,
  onClose,
  onExport,
  availableFilters,
  data,
  dataType,
}) => {
  const [selectedFilters, setSelectedFilters] = useState<SelectedExportFilters>({});

  // Reset filters when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedFilters({}); // Reset to default when opening
    }
  }, [isOpen]);

  // --- Derive unique options for dropdowns from data --- 
  const uniquePropTypes = useMemo(() => 
    Array.from(new Set(data.map(item => dataType === 'inspections' ? item.ppe?.type : item.type).filter(Boolean) as string[])).sort()
  , [data, dataType]);

  const uniqueStatuses = useMemo(() => 
    dataType === 'ppe' ? Array.from(new Set(data.map(item => item.status).filter(Boolean) as string[])).sort() : []
  , [data, dataType]);

  const uniqueResults = useMemo(() => 
    dataType === 'inspections' ? Array.from(new Set(data.map(item => item.overall_result).filter(Boolean) as string[])).sort() : []
  , [data, dataType]);
  
  const uniqueBrands = useMemo(() => 
     dataType === 'ppe' ? Array.from(new Set(data.map(item => item.brand).filter(Boolean) as string[])).sort() : []
  , [data, dataType]);

  const uniqueInspectionTypes = useMemo(() => 
    dataType === 'inspections' ? Array.from(new Set(data.map(item => item.inspection_type).filter(Boolean) as string[])).sort() : []
  , [data, dataType]);

  const uniqueInspectorNames = useMemo(() => 
    dataType === 'inspections' ? Array.from(new Set(data.map(item => item.inspector_name).filter(Boolean) as string[])).sort() : []
  , [data, dataType]);

  const uniqueLocations = useMemo(() => 
    // Assuming location is stored as `item.location` in both data types
    Array.from(new Set(data.map(item => item.location).filter(Boolean) as string[])).sort()
  , [data]);

  // Fix the type issue by separating the event handling logic
  const handleFilterChange = (filterKey: keyof SelectedExportFilters, value: string | Date | null | React.ChangeEvent<HTMLInputElement>) => {
    if (value !== null && typeof value === 'object' && 'target' in value) {
      // Handle Input element change (e.g., Serial Number)
      const inputValue = value.target.value;
      setSelectedFilters(prev => ({ ...prev, [filterKey]: inputValue || undefined }));
    } else {
      // Handle Select or direct value change (e.g., Dropdowns, Date placeholders)
      const processedValue = value;

      // Special handling for date keys from our placeholder input type="date"
      if ((filterKey === 'startDate' || filterKey === 'endDate') && typeof value === 'string') {
        const dateValue = value ? new Date(value) : null; // Parse string date, null if empty
        setSelectedFilters(prev => ({ ...prev, [filterKey]: dateValue }));
        return;
      } 

      // Treat 'all' or null/empty strings as undefined for filtering purposes
      const finalValue = processedValue === 'all' || processedValue === null || processedValue === '' ? undefined : processedValue;
      setSelectedFilters(prev => ({ ...prev, [filterKey]: finalValue }));
    }
  };

  const handleExportClick = () => {
    // Pass the cleaned filters (excluding undefined)
    const filtersToExport = Object.entries(selectedFilters).reduce((acc, [key, value]) => {
        if (value !== undefined) {
            acc[key as keyof SelectedExportFilters] = value;
        }
        return acc;
    }, {} as SelectedExportFilters);
    
    onExport(filtersToExport);
    onClose(); // Close modal after triggering export
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}> 
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Export {dataType === 'inspections' ? 'Inspection History' : 'PPE Inventory'}</DialogTitle>
          <DialogDescription>
            Select filters below to refine the data exported to Excel.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          {/* Conditionally render filter controls based on availableFilters */}
          
          {availableFilters.ppe_type && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="ppe_typeFilter" className="text-right">PPE Type</Label>
              <Select 
                value={selectedFilters.ppe_type || 'all'} 
                onValueChange={(value) => handleFilterChange('ppe_type', value)}
              >
                <SelectTrigger id="ppe_typeFilter" className="col-span-3">
                  <SelectValue placeholder="Select PPE Type..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {uniquePropTypes.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {dataType === 'inspections' && availableFilters.result && (
             <div className="grid grid-cols-4 items-center gap-4">
               <Label htmlFor="resultFilter" className="text-right">Result</Label>
               <Select 
                 value={selectedFilters.result || 'all'} 
                 onValueChange={(value) => handleFilterChange('result', value)}
               >
                 <SelectTrigger id="resultFilter" className="col-span-3">
                   <SelectValue placeholder="Select Result..." />
                 </SelectTrigger>
                 <SelectContent>
                   <SelectItem value="all">All Results</SelectItem>
                   {uniqueResults.map(res => (
                     <SelectItem key={res} value={res.toLowerCase()}>{res.charAt(0).toUpperCase() + res.slice(1)}</SelectItem> 
                   ))}
                 </SelectContent>
               </Select>
             </div>
          )}

          {dataType === 'ppe' && availableFilters.status && (
             <div className="grid grid-cols-4 items-center gap-4">
               <Label htmlFor="statusFilter" className="text-right">Status</Label>
               <Select 
                 value={selectedFilters.status || 'all'} 
                 onValueChange={(value) => handleFilterChange('status', value)}
               >
                 <SelectTrigger id="statusFilter" className="col-span-3">
                   <SelectValue placeholder="Select Status..." />
                 </SelectTrigger>
                 <SelectContent>
                   <SelectItem value="all">All Statuses</SelectItem>
                   {uniqueStatuses.map(stat => (
                     <SelectItem key={stat} value={stat.toLowerCase()}>{stat.charAt(0).toUpperCase() + stat.slice(1)}</SelectItem>
                   ))}
                 </SelectContent>
               </Select>
             </div>
          )}
          
          {dataType === 'ppe' && availableFilters.brand && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="brandFilter" className="text-right">Brand</Label>
              <Select 
                value={selectedFilters.brand || 'all'} 
                onValueChange={(value) => handleFilterChange('brand', value)}
              >
                <SelectTrigger id="brandFilter" className="col-span-3">
                  <SelectValue placeholder="Select Brand..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Brands</SelectItem>
                  {uniqueBrands.map(brand => (
                    <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* --- INSPECTION SPECIFIC FILTERS --- */}
          
          {dataType === 'inspections' && availableFilters.inspectionType && (
             <div className="grid grid-cols-4 items-center gap-4">
               <Label htmlFor="inspTypeFilter" className="text-right">Insp. Type</Label>
               <Select 
                 value={selectedFilters.inspectionType || 'all'} 
                 onValueChange={(value) => handleFilterChange('inspectionType', value)}
               >
                 <SelectTrigger id="inspTypeFilter" className="col-span-3">
                   <SelectValue placeholder="Select Insp. Type..." />
                 </SelectTrigger>
                 <SelectContent>
                   <SelectItem value="all">All Types</SelectItem>
                   {uniqueInspectionTypes.map(type => (
                     <SelectItem key={type} value={type.toLowerCase()}>{type.charAt(0).toUpperCase() + type.slice(1)}</SelectItem>
                   ))}
                 </SelectContent>
               </Select>
             </div>
          )}

          {dataType === 'inspections' && availableFilters.inspectorName && (
             <div className="grid grid-cols-4 items-center gap-4">
               <Label htmlFor="inspectorFilter" className="text-right">Inspector</Label>
               <Select 
                 value={selectedFilters.inspectorName || 'all'} 
                 onValueChange={(value) => handleFilterChange('inspectorName', value)}
               >
                 <SelectTrigger id="inspectorFilter" className="col-span-3">
                   <SelectValue placeholder="Select Inspector..." />
                 </SelectTrigger>
                 <SelectContent>
                   <SelectItem value="all">All Inspectors</SelectItem>
                   {uniqueInspectorNames.map(name => (
                     <SelectItem key={name} value={name}>{name}</SelectItem>
                   ))}
                 </SelectContent>
               </Select>
             </div>
           )}

          {/* --- PPE SPECIFIC FILTERS --- */}
          
          {dataType === 'ppe' && availableFilters.serial_number && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="serialFilter" className="text-right">Serial No.</Label>
              <Input 
                id="serialFilter" 
                className="col-span-3"
                placeholder="Enter Serial Number (or part)"
                value={selectedFilters.serial_number || ''}
                onChange={(e) => handleFilterChange('serial_number', e)}
              />
            </div>
          )}

          {/* --- COMMON FILTERS --- */}
          
          {availableFilters.location && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="locationFilter" className="text-right">Location</Label>
              <Select 
                value={selectedFilters.location || 'all'} 
                onValueChange={(value) => handleFilterChange('location', value)}
              >
                <SelectTrigger id="locationFilter" className="col-span-3">
                  <SelectValue placeholder="Select Location..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  {uniqueLocations.map(loc => (
                    <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {availableFilters.date_range && (
             <>
               <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">Start Date</Label>
                  {/* Replace with actual DatePicker */} 
                  <Input 
                     type="date" 
                     className="col-span-3"
                     value={selectedFilters.startDate ? selectedFilters.startDate.toISOString().split('T')[0] : ''}
                     onChange={(e) => handleFilterChange('startDate', e.target.value)} // Pass string directly
                   /> 
               </div>
               <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">End Date</Label>
                  {/* Replace with actual DatePicker */} 
                   <Input 
                     type="date" 
                     className="col-span-3"
                     value={selectedFilters.endDate ? selectedFilters.endDate.toISOString().split('T')[0] : ''}
                     onChange={(e) => handleFilterChange('endDate', e.target.value)} // Pass string directly
                   /> 
               </div>
             </>
           )} */ 
           
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">Cancel</Button>
          </DialogClose>
          <Button type="button" onClick={handleExportClick}>Export Data</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ExportFilterModal;
