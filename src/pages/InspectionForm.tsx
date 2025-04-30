import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'; // Keep TableHeader
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Eye, Download, Search, ArrowUpDown } from 'lucide-react'; // Removed unused icons
import { useToast } from "@/components/ui/use-toast";
// Removed unused DropdownMenu imports
import { format, parseISO, differenceInDays } from 'date-fns';
import { exportFilteredPPEToExcel } from '@/utils/exportUtils';
import ExportFilterModal, { ExportFilterOptions, SelectedExportFilters } from './ExportFilterModal';
import { PPEItem } from '@/types/ppe'; // Corrected potential import path issue

// Define which filters the modal should show for PPE Inventory
const ppeExportFilters: ExportFilterOptions = {
  status: true,
  ppeType: true,
  brand: true,
  serialNumber: true, // Enable Serial Number
  location: true, // Enable Location
  dateRange: true, // Enable Date Range (using placeholder for now)
};

// Interface removed as component logic is simplified below

const PPEInventoryList: React.FC = () => { // Simplified props
  const [allPpeItems, setAllPpeItems] = useState<PPEItem[]>([]); // Store all fetched items
  const [filteredItems, setFilteredItems] = useState<PPEItem[]>([]); // Items filtered by search
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<string | null>('serial_number'); // Default sort
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<PPEItem | null>(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  const navigate = useNavigate();
  const { toast } = useToast();

  // --- Data Fetching ---
  useEffect(() => {
    const fetchPPEItems = async () => {
      setIsLoading(true);
      try {
        // Select specific columns and potentially related data if needed (e.g., location name)
        const { data, error } = await supabase
          .from('ppe')
          .select(`
            id,
            serial_number,
            type,
            brand,
            manufacturer,
            manufacturer_date,
            purchase_date,
            lifespan_months,
            status,
            last_inspection_date,
            next_inspection_date,
            location_id,
            assignee_id,
            notes,
            created_at,
            updated_at
            // If location is a separate table:
            // locations ( name ) 
          `)
          .order('serial_number', { ascending: true }); // Default sort fetch

        if (error) throw error;
        
        // Perform basic validation/cleaning if necessary
        const validData = data?.map(item => ({
          ...item,
          // Example: ensure dates are Date objects if needed immediately
          manufacturer_date: item.manufacturer_date ? parseISO(item.manufacturer_date) : null,
          purchase_date: item.purchase_date ? parseISO(item.purchase_date) : null,
          last_inspection_date: item.last_inspection_date ? parseISO(item.last_inspection_date) : null,
          next_inspection_date: item.next_inspection_date ? parseISO(item.next_inspection_date) : null,
        })) || [];

        setAllPpeItems(validData as PPEItem[]);
        setFilteredItems(validData as PPEItem[]); // Initialize filtered list

      } catch (error: any) {
        console.error('Error fetching PPE items:', error);
        toast({
          variant: "destructive",
          title: "Fetch Error",
          description: `Could not fetch PPE inventory: ${error.message}`,
        });
        setAllPpeItems([]);
        setFilteredItems([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPPEItems();
  }, [toast]); // Dependency array - fetch once on mount

  // --- Search & Sort Logic ---
  useEffect(() => {
    let items = [...allPpeItems];

    // Apply Search Term
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      items = items.filter(item =>
        item.serial_number?.toLowerCase().includes(lowerSearchTerm) ||
        item.type?.toLowerCase().includes(lowerSearchTerm) ||
        item.brand?.toLowerCase().includes(lowerSearchTerm) ||
        item.status?.toLowerCase().includes(lowerSearchTerm) ||
        item.manufacturer?.toLowerCase().includes(lowerSearchTerm)
        // Add other searchable fields like location name if fetched
      );
    }

    // Apply Sorting
    if (sortField) {
      items.sort((a, b) => {
        const valA = (a as any)[sortField];
        const valB = (b as any)[sortField];

        if (valA === null || valA === undefined) return sortDirection === 'asc' ? 1 : -1;
        if (valB === null || valB === undefined) return sortDirection === 'asc' ? -1 : 1;
        
        // Basic comparison, might need refinement for dates/numbers
        if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
        if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    setFilteredItems(items);
  }, [searchTerm, sortField, sortDirection, allPpeItems]); // Re-filter/sort when these change


  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleViewItem = (item: PPEItem) => {
    setSelectedItem(item);
    setIsDialogOpen(true);
  };

  // --- Updated Export Handler ---
  const handleExport = (filters: SelectedExportFilters) => {
    console.log("Export requested (PPE) with filters:", filters);
    toast({ title: "Exporting PPE Inventory...", description: "Generating Excel file." });

    try {
      let dataToExport = [...allPpeItems]; // Start with all items

      // Apply filters from the modal
      dataToExport = dataToExport.filter(item => {
        // Status Filter
        if (filters.status && item.status?.toLowerCase() !== filters.status.toLowerCase()) return false;
        // PPE Type Filter
        if (filters.ppeType && item.type?.toLowerCase() !== filters.ppeType.toLowerCase()) return false;
        // Brand Filter
        if (filters.brand && item.brand?.toLowerCase() !== filters.brand.toLowerCase()) return false;
        // Serial Number Filter (Partial Match)
        if (filters.serialNumber && !item.serial_number?.toLowerCase().includes(filters.serialNumber.toLowerCase())) return false;
        // Location Filter (Needs actual location data property)
        // if (filters.location && item.location?.toLowerCase() !== filters.location.toLowerCase()) return false; // Assuming item.location exists
        // Date Range Filter (using next_inspection_date as an example)
        if (filters.startDate && item.next_inspection_date && item.next_inspection_date < filters.startDate) return false;
        if (filters.endDate && item.next_inspection_date && item.next_inspection_date > filters.endDate) {
             // Adjust end date to include the whole day
             const endOfDay = new Date(filters.endDate);
             endOfDay.setHours(23, 59, 59, 999);
             if (item.next_inspection_date > endOfDay) return false;
        }

        return true; // Include item if it passes all checks
      });

      // Generate dynamic filename
      const filterParts = Object.entries(filters)
        .filter(([, value]) => value !== undefined) // Only include active filters
        .map(([key, value]) => `${key}=${value instanceof Date ? format(value, 'yyyy-MM-dd') : value}`);
      const filenamePrefix = filterParts.length > 0 ? `PPEInventory_${filterParts.join('_')}` : 'PPEInventory_All';


      if (dataToExport.length > 0) {
        exportFilteredPPEToExcel(dataToExport, filenamePrefix);
        toast({ title: "Export Successful", description: `Exported ${dataToExport.length} PPE items.` });
      } else {
        toast({ variant: "destructive", title: "No Data Found", description: "No PPE items match the selected filter criteria." });
      }
    } catch (error) {
      console.error("PPE Export failed:", error);
      toast({ variant: "destructive", title: "Export Failed", description: "Failed to generate Excel file." });
    } finally {
        setIsExportModalOpen(false); // Close modal after export attempt
    }
  };

  // Helper function to render table cells, handling null/undefined and formatting
  const renderCell = (value: any, formatType?: 'date' | 'badge') => {
    if (value === null || value === undefined || value === '') {
      return <span className="text-muted-foreground">N/A</span>;
    }
    if (formatType === 'date') {
      // Check if it's already a Date object or a valid date string
      const date = value instanceof Date ? value : parseISO(value.toString());
      return !isNaN(date.getTime()) ? format(date, 'PP') : <span className="text-muted-foreground">Invalid Date</span>;
    }
     if (formatType === 'badge') {
       const statusLower = value.toString().toLowerCase();
       let variant: "default" | "secondary" | "destructive" | "outline" | "success" | "warning" = "secondary";
       if (statusLower === 'active') variant = 'success';
       else if (statusLower === 'inactive' || statusLower === 'retired') variant = 'destructive';
       else if (statusLower === 'maintenance') variant = 'warning';
       return <Badge variant={variant}>{value}</Badge>;
    }
    return value.toString();
  };

  // --- Render ---
  return (
    <div className="space-y-4">
      {/* Header: Search and Export */}
      <div className="flex justify-between items-center gap-4">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search by Serial No, Type, Brand..."
            className="pl-8 h-9 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            disabled={isLoading}
          />
        </div>
        {/* Export Button - Opens Modal */}
        <Button
          variant="outline"
          size="sm"
          className="h-9"
          onClick={() => setIsExportModalOpen(true)}
          disabled={isLoading || allPpeItems.length === 0}
        >
          <Download className="h-4 w-4 mr-1" />
          Export
        </Button>
      </div>

      {/* Table */}
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              {/* Define Columns - Adjust based on `ppe` table structure */}
              <TableHead onClick={() => handleSort('serial_number')} className="cursor-pointer">
                Serial No. <ArrowUpDown className="h-4 w-4 inline ml-1" />
              </TableHead>
              <TableHead onClick={() => handleSort('type')} className="cursor-pointer">
                Type <ArrowUpDown className="h-4 w-4 inline ml-1" />
              </TableHead>
              <TableHead onClick={() => handleSort('brand')} className="cursor-pointer">
                Brand <ArrowUpDown className="h-4 w-4 inline ml-1" />
              </TableHead>
               <TableHead onClick={() => handleSort('status')} className="cursor-pointer">
                Status <ArrowUpDown className="h-4 w-4 inline ml-1" />
              </TableHead>
              {/* Add location if available */}
              {/* <TableHead onClick={() => handleSort('location.name')} className="cursor-pointer"> 
                 Location <ArrowUpDown className="h-4 w-4 inline ml-1" />
               </TableHead> */}
              <TableHead onClick={() => handleSort('last_inspection_date')} className="cursor-pointer">
                Last Insp. <ArrowUpDown className="h-4 w-4 inline ml-1" />
              </TableHead>
              <TableHead onClick={() => handleSort('next_inspection_date')} className="cursor-pointer">
                Next Insp. <ArrowUpDown className="h-4 w-4 inline ml-1" />
              </TableHead>
               <TableHead>View</TableHead> {/* View Details Button */}
              {/* Removed Actions Column */}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              // Skeleton Loading Rows
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell colSpan={7}> {/* Adjust colSpan based on final number of columns */}
                    <Skeleton className="h-8 w-full" />
                  </TableCell>
                </TableRow>
              ))
            ) : filteredItems.length > 0 ? (
              filteredItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{renderCell(item.serial_number)}</TableCell>
                  <TableCell>{renderCell(item.type)}</TableCell>
                  <TableCell>{renderCell(item.brand)}</TableCell>
                  <TableCell>{renderCell(item.status, 'badge')}</TableCell>
                  {/* <TableCell>{renderCell(item.location?.name)}</TableCell> */}
                  <TableCell>{renderCell(item.last_inspection_date, 'date')}</TableCell>
                  <TableCell>{renderCell(item.next_inspection_date, 'date')}</TableCell>
                  <TableCell>
                     <Button variant="ghost" size="icon" onClick={() => handleViewItem(item)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                  {/* Removed Actions Cell */}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center"> {/* Adjust colSpan */}
                  No PPE items found {searchTerm ? 'matching your search' : ''}.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Export Filter Modal */}
      <ExportFilterModal
         isOpen={isExportModalOpen}
         onClose={() => setIsExportModalOpen(false)}
         onExport={handleExport}
         availableFilters={ppeExportFilters} // Use the defined filters
         data={allPpeItems} // Pass the full, unfetched dataset for filter options
         dataType="ppe"
      />

      {/* Dialog for Viewing Item Details */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
         <DialogContent className="sm:max-w-md"> {/* Wider dialog */}
           <DialogHeader>
             <DialogTitle>PPE Details: {selectedItem?.serial_number || 'N/A'}</DialogTitle>
             <DialogDescription>
                Type: {renderCell(selectedItem?.type)} | Status: {renderCell(selectedItem?.status, 'badge')}
             </DialogDescription>
           </DialogHeader>
           <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 items-center gap-4">
                    <span className="font-medium text-sm">Brand:</span>
                    <span>{renderCell(selectedItem?.brand)}</span>
                </div>
                 <div className="grid grid-cols-2 items-center gap-4">
                    <span className="font-medium text-sm">Manufacturer:</span>
                    <span>{renderCell(selectedItem?.manufacturer)}</span>
                 </div>
                 <div className="grid grid-cols-2 items-center gap-4">
                    <span className="font-medium text-sm">Manuf. Date:</span>
                    <span>{renderCell(selectedItem?.manufacturer_date, 'date')}</span>
                 </div>
                 <div className="grid grid-cols-2 items-center gap-4">
                    <span className="font-medium text-sm">Purchase Date:</span>
                    <span>{renderCell(selectedItem?.purchase_date, 'date')}</span>
                 </div>
                  <div className="grid grid-cols-2 items-center gap-4">
                    <span className="font-medium text-sm">Lifespan (Months):</span>
                    <span>{renderCell(selectedItem?.lifespan_months)}</span>
                 </div>
                 {/* <div className="grid grid-cols-2 items-center gap-4">
                    <span className="font-medium text-sm">Location:</span>
                    <span>{renderCell(selectedItem?.location?.name)}</span>
                 </div> */}
                  <div className="grid grid-cols-2 items-center gap-4">
                    <span className="font-medium text-sm">Last Inspection:</span>
                    <span>{renderCell(selectedItem?.last_inspection_date, 'date')}</span>
                 </div>
                 <div className="grid grid-cols-2 items-center gap-4">
                    <span className="font-medium text-sm">Next Inspection:</span>
                    <span>{renderCell(selectedItem?.next_inspection_date, 'date')}</span>
                 </div>
                 <div className="grid grid-cols-1 gap-2">
                     <span className="font-medium text-sm">Notes:</span>
                     <p className="text-sm text-muted-foreground bg-muted p-2 rounded-md">
                         {renderCell(selectedItem?.notes) === 'N/A' ? 'No notes.' : renderCell(selectedItem?.notes)}
                     </p>
                 </div>
           </div>
           <DialogFooter>
             <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Close</Button>
             <Button onClick={() => selectedItem?.id && navigate(`/inspection/${selectedItem.id}`)}>
                 Go to Inspection Form
             </Button>
           </DialogFooter>
         </DialogContent>
       </Dialog>

    </div>
  );
};

export default PPEInventoryList;
import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from "@/components/ui/use-toast";
import InspectionHistoryTable from './InspectionHistoryTable'; // Assuming this path is correct
import { Inspection, PPE } from '@/types/inspection'; // Adjust path if needed
import { exportFilteredInspectionsToExcel } from '@/utils/exportUtils';
import { ExportFilterOptions, SelectedExportFilters } from './ExportFilterModal'; // Import modal types
import { format, parseISO } from 'date-fns'; // For filename formatting

// Define which filters the modal should show for Inspection History
const inspectionExportFilters: ExportFilterOptions = {
  ppeType: true,
  result: true,
  inspectionType: true,
  inspectorName: true,
  location: true, // Assuming location data is available on inspections or related PPE
  dateRange: true, // Enable Date Range
};


const InspectionHistory: React.FC = () => {
  const [allInspections, setAllInspections] = useState<Inspection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchInspections = async () => {
      setIsLoading(true);
      try {
        // Fetch inspections and related PPE data (type, serial) + Location?
        // Adjust the select query based on your actual table relationships
        const { data, error } = await supabase
          .from('inspections')
          .select(`
            *, 
            ppe:ppe_id (
              id,
              serial_number,
              type,
              brand
              // location_id, // If location is linked to PPE
              // locations ( name ) // Join location if needed
            ) 
          `)
          .order('inspection_date', { ascending: false }); // Fetch newest first

        if (error) throw error;
        
        // Perform basic validation/cleaning if necessary
         const validData = data?.map(item => ({
          ...item,
          // Ensure dates are Date objects if needed immediately
          inspection_date: item.inspection_date ? parseISO(item.inspection_date) : null,
          ppe: item.ppe ? { // Ensure nested dates are parsed too if directly used
            ...item.ppe,
            // example: item.ppe.manufacturer_date ? parseISO(item.ppe.manufacturer_date) : null
          } : null
        })) || [];


        setAllInspections(validData as Inspection[]);
      } catch (error: any) {
        console.error('Error fetching inspection history:', error);
        toast({
          variant: "destructive",
          title: "Fetch Error",
          description: `Could not fetch inspection history: ${error.message}`,
        });
        setAllInspections([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInspections();
  }, [toast]); // Fetch once on mount

  // Updated Export Handler
  const handleExport = (filters: SelectedExportFilters) => {
    console.log("Export requested (Inspections) with filters:", filters);
    toast({ title: "Exporting Inspections...", description: "Generating Excel file." });

    try {
      let dataToExport = [...allInspections]; // Start with all inspections

      // Apply filters from the modal
      dataToExport = dataToExport.filter(item => {
        // PPE Type Filter (from related PPE)
        if (filters.ppeType && item.ppe?.type?.toLowerCase() !== filters.ppeType.toLowerCase()) return false;
        // Result Filter
        if (filters.result && item.overall_result?.toLowerCase() !== filters.result.toLowerCase()) return false;
        // Inspection Type Filter
        if (filters.inspectionType && item.inspection_type?.toLowerCase() !== filters.inspectionType.toLowerCase()) return false;
        // Inspector Name Filter
        if (filters.inspectorName && item.inspector_name?.toLowerCase() !== filters.inspectorName.toLowerCase()) return false;
        // Location Filter (Needs actual location data - Example assumes it's on item.ppe.location.name)
        // if (filters.location && item.ppe?.location?.name?.toLowerCase() !== filters.location.toLowerCase()) return false;
        // Date Range Filter (using inspection_date)
        if (filters.startDate && item.inspection_date && item.inspection_date < filters.startDate) return false;
        if (filters.endDate && item.inspection_date && item.inspection_date > filters.endDate) {
             const endOfDay = new Date(filters.endDate);
             endOfDay.setHours(23, 59, 59, 999);
             if (item.inspection_date > endOfDay) return false;
        }

        return true; // Include item if it passes all checks
      });

      // Generate dynamic filename
      const filterParts = Object.entries(filters)
        .filter(([, value]) => value !== undefined)
        .map(([key, value]) => `${key}=${value instanceof Date ? format(value, 'yyyy-MM-dd') : value}`);
      const filenamePrefix = filterParts.length > 0 ? `InspectionHistory_${filterParts.join('_')}` : 'InspectionHistory_All';


      if (dataToExport.length > 0) {
        // Ensure the export function expects the correct data structure
        exportFilteredInspectionsToExcel(dataToExport, filenamePrefix); 
        toast({ title: "Export Successful", description: `Exported ${dataToExport.length} inspections.` });
      } else {
        toast({ variant: "destructive", title: "No Data Found", description: "No inspections match the selected filter criteria." });
      }
    } catch (error) {
      console.error("Inspection Export failed:", error);
      toast({ variant: "destructive", title: "Export Failed", description: "Failed to generate Excel file." });
    } 
    // We might not want to close the modal here automatically, let the user do it.
  };


  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Inspection History</h2>
        <p className="text-sm text-muted-foreground">
          View and manage past inspection records.
        </p>
      </div>
      <InspectionHistoryTable
        inspections={allInspections} // Pass all inspections to the table
        isLoading={isLoading}
        onExport={handleExport} // Pass the updated export handler
        availableFilters={inspectionExportFilters} // Pass defined filters for the modal
      />
    </div>
  );
};

export default InspectionHistory;import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Check, ChevronLeft, ChevronRight, Delete, Info, Loader2, X, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { InspectionCheckpoint } from '@/types';
import CheckpointItem from '@/components/inspection/CheckpointItem';
import SignatureCanvas from '@/components/inspection/SignatureCanvas';
import InspectionSuccessDialog from '@/components/inspection/InspectionSuccessDialog';
import { generateInspectionDetailPDF } from '@/utils/reportGenerator/inspectionDetailPDF';
import { generateInspectionExcelReport } from '@/utils/reportGenerator/inspectionExcelReport';
import { cn } from '@/lib/utils';
import { getStandardCheckpoints } from '@/services/checkpointService';
import { StandardInspectionData } from '@/utils/reportGenerator/reportDataFormatter';

const toPPEType = (typeString: string) => {
  const validTypes = [
    'Full Body Harness',
    'Fall Arrester',
    'Double Lanyard',
    'Safety Helmet',
    'Safety Boots',
    'Safety Gloves',
    'Safety Goggles',
    'Ear Protection'
  ];
  
  if (validTypes.includes(typeString)) {
    return typeString;
  }
  
  return 'Safety Helmet';
};

const mapDbCheckpointToAppCheckpoint = (dbCheckpoint: any): InspectionCheckpoint => {
  return {
    id: dbCheckpoint.id,
    description: dbCheckpoint.description,
    ppeType: dbCheckpoint.ppe_type,
    required: true,
  };
};

const InspectionForm = () => {
  const { ppeId } = useParams<{ ppeId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  const [ppeItem, setPpeItem] = useState<{
    id: string;
    serialNumber: string;
    type: string;
    brand: string;
    modelNumber: string;
    batch_number?: string;
    manufacturing_date?: string;
    expiry_date?: string;
  } | null>(null);
  
  const [inspectionType, setInspectionType] = useState<'pre-use' | 'monthly' | 'quarterly'>('pre-use');
  const [checkpoints, setCheckpoints] = useState<InspectionCheckpoint[]>([]);
  const [results, setResults] = useState<Record<string, { passed: boolean | null | undefined; notes: string; photoUrl?: string }>>({});
  const [notes, setNotes] = useState('');
  const [signature, setSignature] = useState<string | null>(null);
  const [overallResult, setOverallResult] = useState<'pass' | 'fail' | null>(null);
  
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [hasNetworkError, setHasNetworkError] = useState(false);
  
  const [isLoading, setIsLoading] = useState(true);
  const [ppeError, setPpeError] = useState<string | null>(null);
  const [checkpointsError, setCheckpointsError] = useState<string | null>(null);
  const [resultsError, setResultsError] = useState<string | null>(null);
  
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [submittedInspectionId, setSubmittedInspectionId] = useState<string | null>(null);
  const [submittedInspectionData, setSubmittedInspectionData] = useState<any | null>(null);
  
  useEffect(() => {
    if (ppeId) {
      fetchPPEItem(ppeId);
    } else {
      setPpeError('No PPE ID provided');
      setIsLoading(false);
    }
  }, [ppeId]);
  
  const fetchPPEItem = async (id: string) => {
    try {
      setIsLoading(true);
      setPpeError(null);
      
      const { data, error } = await supabase
        .from('ppe_items')
        .select(`
          id,
          serial_number,
          type,
          brand,
          model_number,
          batch_number,
          manufacturing_date,
          expiry_date
        `)
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      if (data) {
        console.log('PPE Item data:', data); // Debug log
        setPpeItem({
          id: data.id,
          serialNumber: data.serial_number,
          type: toPPEType(data.type),
          brand: data.brand,
          modelNumber: data.model_number,
          batch_number: data.batch_number ? String(data.batch_number) : '',
          manufacturing_date: data.manufacturing_date,
          expiry_date: data.expiry_date
        });
        
        await fetchCheckpoints(data.type);
      } else {
        throw new Error('PPE item not found');
      }
    } catch (error: any) {
      console.error('Error fetching PPE item:', error);
      setPpeError(error.message || 'Failed to load PPE item');
      setIsLoading(false);
    }
  };
  
  const fetchCheckpoints = async (ppeType: string) => {
    try {
      const { data: existingCheckpoints, error } = await supabase
        .from('inspection_checkpoints')
        .select('*')
        .eq('ppe_type', ppeType);
        
      if (error) {
        console.error('Error fetching checkpoints:', error);
        throw error;
      }
      
      if (existingCheckpoints && existingCheckpoints.length > 0) {
        console.log('Using checkpoints from database:', existingCheckpoints);
        const appCheckpoints = existingCheckpoints.map(mapDbCheckpointToAppCheckpoint);
        setCheckpoints(appCheckpoints);
        
        const initialResults: Record<string, { passed: boolean | null | undefined; notes: string; photoUrl?: string }> = {};
        existingCheckpoints.forEach(checkpoint => {
          initialResults[checkpoint.id] = { passed: undefined, notes: '' };
        });
        setResults(initialResults);
      } else {
        const standardCheckpoints = getStandardCheckpoints(ppeType);
        
        if (standardCheckpoints.length === 0) {
          setCheckpointsError('No checkpoints defined for this PPE type');
          setIsLoading(false);
          return;
        }
        
        const checkpointsToInsert = standardCheckpoints.map(cp => ({
          description: cp.description,
          ppe_type: ppeType
        }));
        
        const { data: insertedCheckpoints, error: insertError } = await supabase
          .from('inspection_checkpoints')
          .insert(checkpointsToInsert)
          .select();
          
        if (insertError) {
          console.error('Error inserting checkpoints:', insertError);
          throw insertError;
        }
        
        if (insertedCheckpoints) {
          console.log('Inserted new checkpoints:', insertedCheckpoints);
          const appCheckpoints = insertedCheckpoints.map(mapDbCheckpointToAppCheckpoint);
          setCheckpoints(appCheckpoints);
          
          const initialResults: Record<string, { passed: boolean | null | undefined; notes: string; photoUrl?: string }> = {};
          insertedCheckpoints.forEach(checkpoint => {
            initialResults[checkpoint.id] = { passed: undefined, notes: '' };
          });
          setResults(initialResults);
        }
      }
      
      setIsLoading(false);
    } catch (error: any) {
      console.error('Error with checkpoints:', error);
      
      const standardCheckpoints = getStandardCheckpoints(ppeType);
      if (standardCheckpoints.length > 0) {
        const tempCheckpoints = standardCheckpoints.map(cp => ({
          id: crypto.randomUUID(),
          description: cp.description,
          ppeType: ppeType,
          required: true
        }));
        
        setCheckpoints(tempCheckpoints);
        
        const initialResults: Record<string, { passed: boolean | null | undefined; notes: string; photoUrl?: string }> = {};
        tempCheckpoints.forEach(checkpoint => {
          initialResults[checkpoint.id] = { passed: undefined, notes: '' };
        });
        setResults(initialResults);
        
        setCheckpointsError('Using local checkpoints - database connection error');
      } else {
        setCheckpointsError('No checkpoints defined for this PPE type');
      }
      
      setIsLoading(false);
    }
  };
  
  const handleResultChange = (checkpointId: string, value: boolean | null) => {
    // Update the results state immediately with the new value
    setResults(prev => ({
      ...prev,
      [checkpointId]: { 
        ...prev[checkpointId], 
        passed: value,
        // Keep existing notes if any
        notes: prev[checkpointId]?.notes || ''
      }
    }));
    
    // Calculate overall result
    const allResults = Object.entries({
      ...results,
      [checkpointId]: { ...results[checkpointId], passed: value }
    });
    
    // Consider all required checkpoints that are not NA
    const requiredResults = allResults.filter(([id]) => {
      const checkpoint = checkpoints.find(cp => cp.id === id);
      const result = results[id];
      // Include required checkpoints that have any selection (OK, NOT OK, or NA)
      return checkpoint?.required && result?.passed !== undefined;
    });
    
    if (requiredResults.length === 0) {
      setOverallResult(null);
      return;
    }

    // Calculate pass/fail based on required checkpoints that are not NA
    const nonNAResults = requiredResults.filter(([_, result]) => result.passed !== null);
    const hasFailedRequired = nonNAResults.some(([_, result]) => result.passed === false);
    
    // Only set a pass/fail result if there are non-NA required checkpoints
    if (nonNAResults.length > 0) {
      setOverallResult(hasFailedRequired ? 'fail' : 'pass');
    } else {
      setOverallResult(null);
    }
  };

  const getResultLabel = (result: string | null) => {
    switch (result) {
      case 'pass':
        return 'PASS';
      case 'fail':
        return 'FAIL';
      default:
        return 'Pending';
    }
  };

  const handleNotesChange = (checkpointId: string, value: string) => {
    setResults(prev => ({
      ...prev,
      [checkpointId]: { ...prev[checkpointId], notes: value }
    }));
  };
  
  const handlePhotoCapture = (checkpointId: string, photoUrl: string) => {
    setResults(prev => ({
      ...prev,
      [checkpointId]: { ...prev[checkpointId], photoUrl }
    }));
  };
  
  const handlePhotoDelete = (checkpointId: string) => {
    setResults(prev => {
      const newResults = { ...prev };
      delete newResults[checkpointId].photoUrl;
      return newResults;
    });
  };
  
  const handleNextStep = () => {
    if (step === 2) {
      if (!validateForm()) {
        return;
      }
    }
    
    if (step < 3) {
      setStep(prev => prev + 1);
    }
  };
  
  const handlePrevStep = () => {
    if (step > 1) {
      setStep(prev => prev - 1);
    }
  };
  
  const validateForm = () => {
    // Get required checkpoints that have no selection at all
    const unselectedRequired = checkpoints
      .filter(cp => cp.required)
      .filter(cp => {
        const result = results[cp.id];
        return result?.passed === undefined || (result?.passed !== true && result?.passed !== false && result?.passed !== null);
      });
      
    if (unselectedRequired.length > 0) {
      setResultsError('Please select OK, NOT OK, or N/A for all required checkpoints');
      toast({
        title: 'Incomplete Form',
        description: 'Please select OK, NOT OK, or N/A for all required checkpoints',
        variant: 'destructive',
      });
      return false;
    }

    return true;
  };
  
  const saveFormToLocalStorage = () => {
    try {
      const formData = {
        ppeItem,
        inspectionType,
        results,
        notes,
        signature,
        overallResult,
        timestamp: new Date().toISOString()
      };
      
      const formKey = `inspection_form_${ppeId || 'new'}_${Date.now()}`;
      localStorage.setItem(formKey, JSON.stringify(formData));
      
      return formKey;
    } catch (error) {
      console.error('Error saving form to local storage:', error);
      return null;
    }
  };
  
  const handleRetry = async () => {
    setIsRetrying(true);
    const formKey = saveFormToLocalStorage();
    
    try {
      const online = navigator.onLine;
      if (!online) {
        throw new Error('You are currently offline. Please check your connection and try again.');
      }
      
      const pingResponse = await fetch(`https://oapfjmyyfuopajayrxzw.supabase.co/rest/v1/`, {
        method: 'HEAD',
        headers: {
          'Content-Type': 'application/json',
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9hcGZqbXl5ZnVvcGFqYXlyeHp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA3NjEzOTcsImV4cCI6MjA1NjMzNzM5N30.ln7r0soXRMrjmOSY69za1GQkq4H-aW9tGvBI0O81T1U'
        }
      });
      
      if (!pingResponse.ok) {
        throw new Error('Server connection error. Please try again later.');
      }
      
      setHasNetworkError(false);
      await handleSubmit();
      
      if (formKey) {
        localStorage.removeItem(formKey);
      }
    } catch (error: any) {
      console.error('Retry failed:', error);
      toast({
        title: 'Retry Failed',
        description: error.message || 'Connection still unavailable',
        variant: 'destructive',
      });
    } finally {
      setIsRetrying(false);
    }
  };
  
  const handleSubmit = async () => {
    if (!validateForm()) return;
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'You must be logged in to submit inspections',
        variant: 'destructive',
      });
      return;
    }
    
    setIsSubmitting(true);
    setHasNetworkError(false);
    
    try {
      const inspectionTypeEnum = inspectionType as "pre-use" | "monthly" | "quarterly";
      
      saveFormToLocalStorage();
      
      console.log('Submitting inspection with data:', {
        ppe_id: ppeItem?.id,
        type: inspectionTypeEnum,
        overall_result: overallResult,
        checkpoint_ids: Object.keys(results),
      });
      
      const { data: inspection, error: inspectionError } = await supabase
        .from('inspections')
        .insert({
          ppe_id: ppeItem?.id,
          type: inspectionTypeEnum,
          date: new Date().toISOString(),
          overall_result: overallResult || 'pass',
          notes: notes,
          signature_url: signature,
          inspector_id: user.id,
        })
        .select('id')
        .single();
      
      if (inspectionError) {
        console.error("Inspection insert error:", inspectionError);
        throw inspectionError;
      }
      
      console.log('Inspection created with ID:', inspection.id);
      
      const resultsToInsert = Object.entries(results).map(([checkpointId, result]) => ({
        inspection_id: inspection.id,
        checkpoint_id: checkpointId,
        passed: result.passed,
        notes: result.notes,
        photo_url: result.photoUrl,
      }));
      
      console.log('Inserting inspection results:', resultsToInsert);
      
      const { error: resultsError } = await supabase
        .from('inspection_results')
        .insert(resultsToInsert);
      
      if (resultsError) {
        console.error("Results insert error:", resultsError);
        throw resultsError;
      }
      
      const now = new Date();
      let nextInspectionDate: Date;
      
      switch (inspectionType) {
        case 'monthly':
          nextInspectionDate = new Date(now);
          nextInspectionDate.setMonth(now.getMonth() + 1);
          break;
        case 'quarterly':
          nextInspectionDate = new Date(now);
          nextInspectionDate.setMonth(now.getMonth() + 3);
          break;
        case 'pre-use':
        default:
          nextInspectionDate = new Date(now);
          nextInspectionDate.setDate(now.getDate() + 7);
          break;
      }
      
      const newStatus = overallResult === 'pass' ? 'active' : 'flagged';
      
      const { error: ppeUpdateError } = await supabase
        .from('ppe_items')
        .update({
          last_inspection: now.toISOString(),
          next_inspection: nextInspectionDate.toISOString(),
          status: newStatus,
        })
        .eq('id', ppeItem?.id);
      
      if (ppeUpdateError) throw ppeUpdateError;
      
      const checkpointDetails = checkpoints.map(cp => ({
        id: cp.id,
        description: cp.description,
        passed: results[cp.id]?.passed,
        notes: results[cp.id]?.notes,
        photo_url: results[cp.id]?.photoUrl,
      }));
      
      const submittedData = {
        id: inspection.id,
        date: now.toISOString(),
        type: inspectionType,
        overall_result: overallResult || 'pass',
        notes: notes,
        signature_url: signature,
        inspector_name: user.user_metadata?.full_name || 'Unknown Inspector',
        ppe_type: ppeItem?.type || 'Unknown',
        ppe_serial: ppeItem?.serialNumber || 'Unknown',
        ppe_brand: ppeItem?.brand || 'Unknown',
        ppe_model: ppeItem?.modelNumber || 'Unknown',
        checkpoints: checkpointDetails
      };
      
      console.log('Setting submitted inspection data:', submittedData);
      setSubmittedInspectionData(submittedData);
      setSubmittedInspectionId(inspection.id);
      
      queryClient.invalidateQueries({ queryKey: ['ppe-items'] });
      queryClient.invalidateQueries({ queryKey: ['upcoming-inspections'] });
      
      toast({
        title: 'Inspection Completed',
        description: 'The inspection has been successfully recorded',
      });
      
      setShowSuccessDialog(true);
    } catch (error: any) {
      console.error('Error submitting inspection:', error);
      
      if (
        error.message?.includes('fetch') || 
        error.message?.includes('network') ||
        error.message?.includes('connection') ||
        !navigator.onLine
      ) {
        setHasNetworkError(true);
        toast({
          title: 'Network Error',
          description: 'Could not connect to server. Your form has been saved. You can retry when connection is available.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Submission Failed',
          description: error.message || 'Failed to submit inspection',
          variant: 'destructive',
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handlePDFDownload = async (data: StandardInspectionData): Promise<void> => {
    try {
      await generateInspectionDetailPDF(data);
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
    }
  };
  
  const handleExcelDownload = async (data: StandardInspectionData): Promise<void> => {
    try {
      await generateInspectionExcelReport(data);
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
    }
  };
  
  const handleWhatsAppShare = async (): Promise<void> => {
    try {
      const message = 
        `Inspection Report\n` +
        `PPE: ${ppeItem?.type} (${ppeItem?.serialNumber})\n` +
        `Date: ${new Date().toLocaleDateString()}\n` +
        `Result: ${getResultLabel(overallResult)}\n` +
        `Inspector: ${user?.user_metadata?.full_name || 'Unknown Inspector'}\n`;
      
      const encodedMessage = encodeURIComponent(message);
      
      window.open(`https://wa.me/?text=${encodedMessage}`, '_blank');
      
      toast({
        title: 'Share via WhatsApp',
        description: 'WhatsApp opened with inspection details',
      });
    } catch (error) {
      console.error('WhatsApp share error:', error);
      toast({
        title: 'Share Failed',
        description: 'Could not share via WhatsApp',
        variant: 'destructive',
      });
    }
  };
  
  const handleEmailShare = async (): Promise<void> => {
    try {
      const subject = `Inspection Report - ${ppeItem?.type} (${ppeItem?.serialNumber})`;
      
      const body = 
        `Inspection Report\n\n` +
        `PPE: ${ppeItem?.type} (${ppeItem?.serialNumber})\n` +
        `Date: ${new Date().toLocaleDateString()}\n` +
        `Result: ${getResultLabel(overallResult)}\n` +
        `Inspector: ${user?.user_metadata?.full_name || 'Unknown Inspector'}\n`;
      
      const mailtoLink = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      
      window.location.href = mailtoLink;
      
      toast({
        title: 'Share via Email',
        description: 'Email client opened with inspection details',
      });
    } catch (error) {
      console.error('Email share error:', error);
      toast({
        title: 'Share Failed',
        description: 'Could not share via email',
        variant: 'destructive',
      });
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center my-12">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (ppeError) {
    return (
      <div className="text-center my-12">
        <p className="text-destructive mb-4">{ppeError}</p>
        <Button onClick={() => navigate(-1)}>Go Back</Button>
      </div>
    );
  }
  
  // Add console log to check the results state
  console.log("InspectionForm Results State:", results); 

  return (
    <div className="pb-20">
      <div className="flex items-center mb-6">
        <Button 
          variant="ghost" 
          size="sm"
          className="mr-2"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={18} />
        </Button>
        <h1 className="text-2xl font-bold">Inspection Form</h1>
      </div>
      
      <Card className="p-4 mb-4 border border-border/40 shadow-sm bg-slate-950">
        <h2 className="text-2xl font-semibold mb-3 text-white">{ppeItem?.type}</h2>
        
        {/* First row: Serial, Batch, Brand */}
        <div className="grid grid-cols-3 gap-x-4 md:gap-x-6 gap-y-2 mb-3">
          <div>
            <p className="text-xs text-slate-400 font-medium truncate">Serial Number</p>
            <p className="text-sm text-white truncate">{ppeItem?.serialNumber}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium truncate">Batch Number</p>
            <p className="text-sm text-white truncate">{ppeItem?.batch_number || '-'}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium truncate">Brand</p>
            <p className="text-sm text-white truncate">{ppeItem?.brand}</p>
          </div>
        </div>
        
        {/* Second row: Model, Manufacturing Date, Expiry Date */}
        <div className="grid grid-cols-3 gap-x-4 md:gap-x-6">
          <div>
            <p className="text-xs text-slate-400 font-medium truncate">Model</p>
            <p className="text-sm text-white truncate">{ppeItem?.modelNumber}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium truncate">Manufacturing Date</p>
            <p className="text-sm text-white truncate">{ppeItem?.manufacturing_date ? new Date(ppeItem.manufacturing_date).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' }) : '-'}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium truncate">Expiry Date</p>
            <p className="text-sm text-white truncate">{ppeItem?.expiry_date ? new Date(ppeItem.expiry_date).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' }) : '-'}</p>
          </div>
        </div>
      </Card>
      
      <div className="relative mb-6">
        <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-muted">
          <div 
            className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary" 
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>
        <div className="flex justify-between">
          <div className={`text-xs ${step >= 1 ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
            Inspection Type
          </div>
          <div className={`text-xs ${step >= 2 ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
            Checkpoints
          </div>
          <div className={`text-xs ${step >= 3 ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
            Sign Off
          </div>
        </div>
      </div>
      
      {step === 1 && (
        <div className="fade-in">
          <h2 className="text-lg font-medium mb-4">Select Inspection Type</h2>
          
          <div className="grid grid-cols-1 gap-3 mb-8">
            <Card 
              className={`p-4 cursor-pointer border-2 ${inspectionType === 'pre-use' ? 'border-primary' : 'border-transparent'}`}
              onClick={() => setInspectionType('pre-use')}
            >
              <div className="flex items-center">
                <div className={`w-5 h-5 rounded-full mr-3 flex items-center justify-center ${inspectionType === 'pre-use' ? 'bg-primary text-white' : 'border border-muted-foreground'}`}>
                  {inspectionType === 'pre-use' && <Check size={12} />}
                </div>
                <div>
                  <h3 className="font-medium">Pre-Use Inspection</h3>
                  <p className="text-sm text-muted-foreground">Basic inspection before each use</p>
                </div>
              </div>
            </Card>
            
            <Card 
              className={`p-4 cursor-pointer border-2 ${inspectionType === 'monthly' ? 'border-primary' : 'border-transparent'}`}
              onClick={() => setInspectionType('monthly')}
            >
              <div className="flex items-center">
                <div className={`w-5 h-5 rounded-full mr-3 flex items-center justify-center ${inspectionType === 'monthly' ? 'bg-primary text-white' : 'border border-muted-foreground'}`}>
                  {inspectionType === 'monthly' && <Check size={12} />}
                </div>
                <div>
                  <h3 className="font-medium">Monthly Inspection</h3>
                  <p className="text-sm text-muted-foreground">Detailed inspection on a monthly basis</p>
                </div>
              </div>
            </Card>
            
            <Card 
              className={`p-4 cursor-pointer border-2 ${inspectionType === 'quarterly' ? 'border-primary' : 'border-transparent'}`}
              onClick={() => setInspectionType('quarterly')}
            >
              <div className="flex items-center">
                <div className={`w-5 h-5 rounded-full mr-3 flex items-center justify-center ${inspectionType === 'quarterly' ? 'bg-primary text-white' : 'border border-muted-foreground'}`}>
                  {inspectionType === 'quarterly' && <Check size={12} />}
                </div>
                <div>
                  <h3 className="font-medium">Quarterly Inspection</h3>
                  <p className="text-sm text-muted-foreground">Comprehensive inspection every 3 months</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}
      
      {step === 2 && (
        <div className="fade-in">
          <h2 className="text-lg font-medium mb-4">Inspection Checkpoints</h2>
          
          {checkpointsError ? (
            <div className="text-center my-8">
              <p className="text-destructive mb-4">{checkpointsError}</p>
            </div>
          ) : checkpoints.length === 0 ? (
            <div className="text-center my-8">
              <p className="text-muted-foreground mb-4">No checkpoints defined for this equipment type</p>
            </div>
          ) : (
            <div className="space-y-4 mb-6">
              {checkpoints.map((checkpoint) => (
                <CheckpointItem
                  key={checkpoint.id}
                  id={checkpoint.id}
                  description={checkpoint.description}
                  passed={results[checkpoint.id]?.passed}
                  notes={results[checkpoint.id]?.notes ?? ''}
                  photoUrl={results[checkpoint.id]?.photoUrl}
                  onPassedChange={(value) => handleResultChange(checkpoint.id, value)}
                  onNotesChange={(value) => handleNotesChange(checkpoint.id, value)}
                  onPhotoCapture={(url) => handlePhotoCapture(checkpoint.id, url)}
                  onPhotoDelete={() => handlePhotoDelete(checkpoint.id)}
                />
              ))}
            </div>
          )}
          
          {resultsError && (
            <div className="p-3 mb-4 bg-destructive/10 text-destructive rounded-md text-sm">
              <p>{resultsError}</p>
            </div>
          )}
          
          <div className="mt-8">
            <h3 className="text-sm font-medium mb-2">Overall Result</h3>
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                className={cn(
                  "border transition-colors duration-200",
                  overallResult === 'pass' 
                    ? "!bg-green-500 hover:!bg-green-600 !border-green-600 text-white ring-green-400" 
                    : "hover:bg-green-50 hover:text-green-600 hover:border-green-400"
                )}
                onClick={() => setOverallResult('pass')}
              >
                <Check size={16} className="mr-2" />
                PASS
              </Button>
              
              <Button
                type="button"
                variant="outline"
                className={cn(
                  "border transition-colors duration-200",
                  overallResult === 'fail' 
                    ? "!bg-red-500 hover:!bg-red-600 !border-red-600 text-white ring-red-400" 
                    : "hover:bg-red-50 hover:text-red-600 hover:border-red-400"
                )}
                onClick={() => setOverallResult('fail')}
              >
                <X size={16} className="mr-2" />
                FAIL
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {step === 3 && (
        <div className="fade-in">
          <h2 className="text-lg font-medium mb-4">Sign Off</h2>
          
          <div className="space-y-6">
            <div>
              <label className="text-sm font-medium block mb-2">Additional Notes (Optional)</label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any general notes about the inspection..."
                rows={4}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium block mb-2">Inspector Signature</label>
              <div className="border rounded-md p-2 bg-muted/30 mb-2">
                <SignatureCanvas 
                  onSave={setSignature}
                  existingSignature={signature}
                  onSignatureEnd={(signatureData) => setSignature(signatureData)} 
                />
              </div>
              
              {signature && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setSignature(null)}
                  className="text-xs"
                >
                  <Delete size={14} className="mr-1" />
                  Clear Signature
                </Button>
              )}
            </div>
            
            <div className="p-4 bg-muted rounded-md mt-4">
              <div className="flex items-start gap-3">
                <Info size={20} className="text-muted-foreground mt-0.5" />
                <div>
                  <h4 className="font-medium text-sm">Inspection Summary</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    By submitting this form, you confirm that you have inspected {ppeItem?.type} (Serial: {ppeItem?.serialNumber}) 
                    and the overall result is {getResultLabel(overallResult)}.
                  </p>
                </div>
              </div>
            </div>
            
            {hasNetworkError && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md my-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle size={20} className="text-yellow-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-sm">Network Connection Issue</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      There was a problem connecting to the server. Your form data has been saved locally.
                    </p>
                    <Button 
                      onClick={handleRetry} 
                      className="mt-2" 
                      variant="outline"
                      disabled={isRetrying}
                    >
                      {isRetrying ? (
                        <>
                          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                          Retrying...
                        </>
                      ) : (
                        <>Retry Submission</>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      
      <Separator className="my-6" />
      
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={handlePrevStep}
          disabled={step === 1}
        >
          <ChevronLeft size={16} className="mr-2" />
          Previous
        </Button>
        
        {step < 3 ? (
          <Button onClick={handleNextStep}>
            Next
            <ChevronRight size={16} className="ml-2" />
          </Button>
        ) : (
          <Button 
            onClick={handleSubmit}
            disabled={isSubmitting || isRetrying}
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Check size={16} className="mr-2" />
                Submit Inspection
              </>
            )}
          </Button>
        )}
      </div>
      
      <InspectionSuccessDialog
        isOpen={showSuccessDialog}
        onClose={() => {
          setShowSuccessDialog(false);
          navigate(`/equipment/${ppeItem?.id}`);
        }}
        inspectionId={submittedInspectionId || ''}
        ppeId={ppeItem?.id || ''}
        onPDFDownload={handlePDFDownload}
        onExcelDownload={handleExcelDownload}
        onWhatsAppShare={handleWhatsAppShare}
        onEmailShare={handleEmailShare}
      />
    </div>
  );
};

export default InspectionForm;
