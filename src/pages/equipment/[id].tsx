import React from 'react';
import { Link, useParams, useNavigate } from '@tanstack/react-router';
import { 
  ArrowLeft, 
  Calendar, 
  Clipboard, 
  Edit, 
  History, 
  Printer, 
  QrCode
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge, StatusBadge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

// Mock equipment data
const equipmentDetail = {
  id: 'equip-001',
  name: 'Harness #A1234',
  type: 'Full Body Harness',
  model: 'SafetyFirst Pro X3',
  serialNumber: 'SN-12345678',
  manufacturer: 'Safety Equipment Co.',
  manufacturingDate: '2024-01-15',
  purchaseDate: '2024-02-01',
  location: 'Building A, Floor 3',
  assignedTo: 'Construction Team A',
  status: 'active',
  lastInspection: '2025-04-15',
  inspectionStatus: 'passed',
  nextInspection: '2025-07-15',
  notes: 'New harness assigned to the high-rise construction project.',
  specifications: [
    { name: 'Weight Capacity', value: '310 lbs (140 kg)' },
    { name: 'Material', value: 'Polyester webbing' },
    { name: 'D-rings', value: '4 (dorsal, chest, sides)' },
    { name: 'Leg Straps', value: 'Quick-connect buckles' },
    { name: 'Standards', value: 'ANSI Z359.11, OSHA 1910.66' }
  ]
};

// Mock inspection history
const inspectionHistory = [
  {
    id: 'insp-001',
    date: '2025-04-15',
    type: 'Regular Inspection',
    inspector: 'John Doe',
    result: 'passed',
    notes: 'All components in good condition. No signs of wear or damage.',
  },
  {
    id: 'insp-002',
    date: '2025-01-15',
    type: 'Regular Inspection',
    inspector: 'Sarah Smith',
    result: 'passed',
    notes: 'Slight fraying on shoulder strap - within acceptable limits. All other components good.',
  },
  {
    id: 'insp-003',
    date: '2024-10-15',
    type: 'Post-incident Inspection',
    inspector: 'Michael Brown',
    result: 'passed',
    notes: 'Inspection after minor fall incident. No visible damage or deformation to any components.',
  }
];

export function EquipmentDetailPage() {
  const { id } = useParams({ from: '/equipment/$id' });
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showQRDialog, setShowQRDialog] = React.useState(false);
  
  // In a real app, we'd fetch the equipment details based on the ID
  const equipment = equipmentDetail;
  
  const handlePrintDetails = () => {
    // In a real app, this would trigger printing functionality
    toast({
      title: "Printing Equipment Details",
      description: "Sending to printer...",
      variant: "info",
    });
  };
  
  const handleStartInspection = () => {
    navigate({ 
      to: '/inspections/form',
      search: {
        templateId: 'template-harness',
        equipmentId: equipment.id
      }
    });
    
    toast({
      title: "Starting Inspection",
      description: "Loading inspection form...",
      variant: "info",
    });
  };
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };
  
  // Function to render equipment status
  const renderStatusBadge = (status: string) => {
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
  
  // Calculate days until next inspection
  const daysUntilNextInspection = () => {
    const today = new Date();
    const next = new Date(equipment.nextInspection);
    const diffTime = next.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };
  
  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center gap-2 mb-6">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/equipment">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Equipment
          </Link>
        </Button>
      </div>
      
      <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-6">
        <div>
          <h1 className="text-3xl font-bold">{equipment.name}</h1>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-body text-muted-foreground">{equipment.type}</p>
            <span className="text-muted-foreground">•</span>
            <p className="text-body text-muted-foreground">{equipment.serialNumber}</p>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => setShowQRDialog(true)}>
            <QrCode className="h-4 w-4 mr-2" />
            QR Code
          </Button>
          <Button variant="outline" onClick={handlePrintDetails}>
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          <Button variant="outline" asChild>
            <Link to={`/equipment/${equipment.id}/edit`}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Link>
          </Button>
          <Button onClick={handleStartInspection}>
            <Clipboard className="h-4 w-4 mr-2" />
            Inspect Now
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Equipment Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-body-sm text-muted-foreground">Model</p>
                  <p className="text-body font-medium">{equipment.model}</p>
                </div>
                
                <div className="space-y-1">
                  <p className="text-body-sm text-muted-foreground">Manufacturer</p>
                  <p className="text-body font-medium">{equipment.manufacturer}</p>
                </div>
                
                <div className="space-y-1">
                  <p className="text-body-sm text-muted-foreground">Serial Number</p>
                  <p className="text-body font-medium">{equipment.serialNumber}</p>
                </div>
                
                <div className="space-y-1">
                  <p className="text-body-sm text-muted-foreground">Manufacturing Date</p>
                  <p className="text-body font-medium">{formatDate(equipment.manufacturingDate)}</p>
                </div>
                
                <div className="space-y-1">
                  <p className="text-body-sm text-muted-foreground">Purchase Date</p>
                  <p className="text-body font-medium">{formatDate(equipment.purchaseDate)}</p>
                </div>
                
                <div className="space-y-1">
                  <p className="text-body-sm text-muted-foreground">Location</p>
                  <p className="text-body font-medium">{equipment.location}</p>
                </div>
                
                <div className="space-y-1">
                  <p className="text-body-sm text-muted-foreground">Assigned To</p>
                  <p className="text-body font-medium">{equipment.assignedTo}</p>
                </div>
                
                <div className="space-y-1">
                  <p className="text-body-sm text-muted-foreground">Status</p>
                  <div className="flex items-center gap-2">
                    {renderStatusBadge(equipment.status)}
                  </div>
                </div>
              </div>
              
              {equipment.notes && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-body-sm text-muted-foreground mb-1">Notes</p>
                  <p className="text-body">{equipment.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Technical Specifications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {equipment.specifications.map((spec, index) => (
                  <div key={index} className="space-y-1">
                    <p className="text-body-sm text-muted-foreground">{spec.name}</p>
                    <p className="text-body font-medium">{spec.value}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Inspection History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {inspectionHistory.map((inspection) => (
                  <div 
                    key={inspection.id} 
                    className="flex flex-col sm:flex-row sm:items-start justify-between border-b pb-4 last:border-0 last:pb-0"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <p className="text-body font-medium">
                          {formatDate(inspection.date)}
                        </p>
                        <StatusBadge status={inspection.result as any} />
                      </div>
                      <p className="text-body-sm">{inspection.type}</p>
                      <p className="text-body-sm text-muted-foreground">
                        Inspector: {inspection.inspector}
                      </p>
                      {inspection.notes && (
                        <p className="text-body-sm mt-1">{inspection.notes}</p>
                      )}
                    </div>
                    
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="mt-2 sm:mt-0"
                      asChild
                    >
                      <Link to={`/inspections/${inspection.id}`}>
                        View Details
                      </Link>
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" asChild>
                <Link to={`/equipment/${equipment.id}/history`}>
                  <History className="h-4 w-4 mr-2" />
                  View Complete History
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Inspection Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-1">
                  <p className="text-body-sm text-muted-foreground">Last Inspection</p>
                  <div className="flex items-center gap-2">
                    <p className="text-body font-medium">
                      {formatDate(equipment.lastInspection)}
                    </p>
                    <StatusBadge status={equipment.inspectionStatus as any} />
                  </div>
                </div>
                
                <div className="space-y-1">
                  <p className="text-body-sm text-muted-foreground">Next Inspection</p>
                  <p className="text-body font-medium">
                    {formatDate(equipment.nextInspection)}
                  </p>
                  <div className="mt-1">
                    {daysUntilNextInspection() <= 0 ? (
                      <Badge variant="destructive">Overdue</Badge>
                    ) : daysUntilNextInspection() <= 7 ? (
                      <Badge variant="warning">Due Soon ({daysUntilNextInspection()} days)</Badge>
                    ) : (
                      <Badge variant="outline">{daysUntilNextInspection()} days remaining</Badge>
                    )}
                  </div>
                </div>
                
                <Button className="w-full" onClick={handleStartInspection}>
                  <Clipboard className="h-4 w-4 mr-2" />
                  Inspect Now
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Related Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start" asChild>
                  <a href="#" download>
                    User Manual
                  </a>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <a href="#" download>
                    Inspection Procedure
                  </a>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <a href="#" download>
                    Warranty Information
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* QR Code Dialog */}
      <Dialog open={showQRDialog} onOpenChange={setShowQRDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Equipment QR Code</DialogTitle>
            <DialogDescription>
              Scan this code to access equipment details and inspection history on a mobile device.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex justify-center py-4">
            {/* Placeholder for QR code image - in a real app, this would be generated */}
            <div className="w-64 h-64 bg-muted flex items-center justify-center border">
              <QrCode className="h-24 w-24 text-muted-foreground" />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowQRDialog(false)}>
              Close
            </Button>
            <Button onClick={handlePrintDetails}>
              <Printer className="h-4 w-4 mr-2" />
              Print QR Code
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default EquipmentDetailPage;
