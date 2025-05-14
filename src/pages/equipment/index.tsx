import React from 'react';
import { Link } from '@tanstack/react-router';
import { 
  CheckCircle, 
  Filter, 
  Plus, 
  Search, 
  AlertTriangle, 
  ArrowUpDown,
  Trash2,
  Pencil
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge, StatusBadge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

// Mock equipment data
const equipmentData = [
  {
    id: 'equip-001',
    name: 'Harness #A1234',
    type: 'Full Body Harness',
    model: 'SafetyFirst Pro X3',
    serialNumber: 'SN-12345678',
    location: 'Building A',
    status: 'active',
    lastInspection: '2025-04-15',
    inspectionStatus: 'passed',
    nextInspection: '2025-07-15',
  },
  {
    id: 'equip-002',
    name: 'Helmet #H5678',
    type: 'Type II Safety Helmet',
    model: 'HardHead Elite',
    serialNumber: 'SN-87654321',
    location: 'Building B',
    status: 'active',
    lastInspection: '2025-04-10',
    inspectionStatus: 'passed',
    nextInspection: '2025-07-10',
  },
  {
    id: 'equip-003',
    name: 'Lanyard #L9012',
    type: 'Shock-Absorbing Lanyard',
    model: 'FallStop Dual',
    serialNumber: 'SN-90123456',
    location: 'Building A',
    status: 'under_repair',
    lastInspection: '2025-04-05',
    inspectionStatus: 'failed',
    nextInspection: '2025-05-20',
  },
  {
    id: 'equip-004',
    name: 'Harness #A2345',
    type: 'Full Body Harness',
    model: 'SafetyFirst Pro X3',
    serialNumber: 'SN-23456789',
    location: 'Building C',
    status: 'active',
    lastInspection: '2025-03-20',
    inspectionStatus: 'passed',
    nextInspection: '2025-06-20',
  },
  {
    id: 'equip-005',
    name: 'Safety Glasses #G3456',
    type: 'Safety Glasses',
    model: 'ClearView Pro',
    serialNumber: 'SN-34567890',
    location: 'Building B',
    status: 'inactive',
    lastInspection: '2025-02-15',
    inspectionStatus: 'passed',
    nextInspection: '2025-05-15',
  },
];

type EquipmentStatus = 'active' | 'inactive' | 'under_repair' | 'retired';
type InspectionStatus = 'passed' | 'failed' | 'pending' | 'overdue';

export function EquipmentListPage() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [typeFilter, setTypeFilter] = React.useState<string>('');
  const [statusFilter, setStatusFilter] = React.useState<EquipmentStatus | ''>('');
  const [inspectionStatusFilter, setInspectionStatusFilter] = React.useState<InspectionStatus | ''>('');
  const [locationFilter, setLocationFilter] = React.useState<string>('');
  
  // Get unique values for filter dropdowns
  const equipmentTypes = [...new Set(equipmentData.map(item => item.type))];
  const locations = [...new Set(equipmentData.map(item => item.location))];
  
  // Filter equipment items
  const filteredEquipment = equipmentData.filter(item => {
    const matchesSearch = !searchQuery || 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      item.serialNumber.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = !typeFilter || item.type === typeFilter;
    const matchesStatus = !statusFilter || item.status === statusFilter;
    const matchesInspectionStatus = !inspectionStatusFilter || item.inspectionStatus === inspectionStatusFilter;
    const matchesLocation = !locationFilter || item.location === locationFilter;
    
    return matchesSearch && matchesType && matchesStatus && matchesInspectionStatus && matchesLocation;
  });
  
  const handleDeleteItem = (id: string) => {
    // In a real app, we'd call an API to delete the item
    toast({
      title: "Equipment Removed",
      description: "The equipment has been removed from inventory",
      variant: "info",
    });
  };
  
  const handleInspectNow = (id: string) => {
    // Navigate to inspection form
    toast({
      title: "Starting Inspection",
      description: "Preparing inspection form...",
      variant: "info",
    });
  };
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };
  
  // Function to render appropriate status badge
  const renderStatusBadge = (status: EquipmentStatus) => {
    switch (status) {
      case 'active':
        return <Badge variant="success">Active</Badge>;
      case 'inactive':
        return <Badge variant="secondary">Inactive</Badge>;
      case 'under_repair':
        return <Badge variant="warning">Under Repair</Badge>;
      case 'retired':
        return <Badge variant="outline">Retired</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto p-6">
      <header className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Equipment Inventory</h1>
        <p className="text-body text-muted-foreground">
          Manage and track all your PPE equipment
        </p>
      </header>
      
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or serial number..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" />
            Filters
          </Button>
          
          <Button asChild className="gap-2">
            <Link to="/equipment/add">
              <Plus className="h-4 w-4" />
              Add Equipment
            </Link>
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Equipment Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Types</SelectItem>
            {equipmentTypes.map(type => (
              <SelectItem key={type} value={type}>{type}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select value={statusFilter} onValueChange={setStatusFilter as any}>
          <SelectTrigger>
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="under_repair">Under Repair</SelectItem>
            <SelectItem value="retired">Retired</SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={inspectionStatusFilter} onValueChange={setInspectionStatusFilter as any}>
          <SelectTrigger>
            <SelectValue placeholder="Inspection Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Inspection Statuses</SelectItem>
            <SelectItem value="passed">Passed</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={locationFilter} onValueChange={setLocationFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Location" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Locations</SelectItem>
            {locations.map(location => (
              <SelectItem key={location} value={location}>{location}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All Equipment</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="needsInspection">Needs Inspection</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Equipment List ({filteredEquipment.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-left bg-muted/50">
                    <tr>
                      <th className="whitespace-nowrap px-4 py-3 font-medium">
                        <div className="flex items-center gap-1">
                          Equipment
                          <ArrowUpDown className="h-3 w-3" />
                        </div>
                      </th>
                      <th className="whitespace-nowrap px-4 py-3 font-medium">Type</th>
                      <th className="whitespace-nowrap px-4 py-3 font-medium">Status</th>
                      <th className="whitespace-nowrap px-4 py-3 font-medium">Last Inspection</th>
                      <th className="whitespace-nowrap px-4 py-3 font-medium">Next Inspection</th>
                      <th className="whitespace-nowrap px-4 py-3 font-medium">Location</th>
                      <th className="whitespace-nowrap px-4 py-3 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEquipment.map((item) => (
                      <tr key={item.id} className="border-b hover:bg-muted/50">
                        <td className="px-4 py-3">
                          <div className="flex flex-col">
                            <span className="font-medium">{item.name}</span>
                            <span className="text-xs text-muted-foreground">{item.serialNumber}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">{item.type}</td>
                        <td className="px-4 py-3">
                          {renderStatusBadge(item.status as EquipmentStatus)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {formatDate(item.lastInspection)}
                            <StatusBadge status={item.inspectionStatus as any} />
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {formatDate(item.nextInspection)}
                          {new Date(item.nextInspection) <= new Date() && (
                            <Badge variant="destructive" className="ml-2">Overdue</Badge>
                          )}
                        </td>
                        <td className="px-4 py-3">{item.location}</td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleInspectNow(item.id)}
                            >
                              Inspect
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              asChild
                            >
                              <Link to={`/equipment/${item.id}`}>
                                Details
                              </Link>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              asChild
                            >
                              <Link to={`/equipment/${item.id}/edit`}>
                                <Pencil className="h-4 w-4" />
                              </Link>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteItem(item.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {filteredEquipment.length === 0 && (
                <div className="py-12 text-center">
                  <p className="text-muted-foreground">No equipment found matching your filters.</p>
                  <Button 
                    variant="outline" 
                    className="mt-2"
                    onClick={() => {
                      setSearchQuery('');
                      setTypeFilter('');
                      setStatusFilter('');
                      setInspectionStatusFilter('');
                      setLocationFilter('');
                    }}
                  >
                    Clear All Filters
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="active" className="mt-6">
          {/* Similar content to "all" tab but with pre-filtered data */}
        </TabsContent>
        
        <TabsContent value="needsInspection" className="mt-6">
          {/* Similar content to "all" tab but with pre-filtered data */}
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default EquipmentListPage;
