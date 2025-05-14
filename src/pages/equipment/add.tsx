import React from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { ArrowLeft, Save } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue,
  SelectField
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

// Equipment types for dropdown selection
const equipmentTypes = [
  { value: 'full_body_harness', label: 'Full Body Harness' },
  { value: 'lanyard', label: 'Lanyard' },
  { value: 'safety_helmet', label: 'Safety Helmet' },
  { value: 'safety_glasses', label: 'Safety Glasses' },
  { value: 'gloves', label: 'Safety Gloves' },
  { value: 'safety_boots', label: 'Safety Boots' },
  { value: 'respirator', label: 'Respirator' },
  { value: 'ear_protection', label: 'Ear Protection' },
  { value: 'fall_arrester', label: 'Fall Arrester' },
  { value: 'other', label: 'Other' },
];

// Locations for dropdown selection
const locations = [
  { value: 'building_a', label: 'Building A' },
  { value: 'building_b', label: 'Building B' },
  { value: 'building_c', label: 'Building C' },
  { value: 'warehouse', label: 'Warehouse' },
  { value: 'site_1', label: 'Construction Site 1' },
  { value: 'site_2', label: 'Construction Site 2' },
];

// Teams for dropdown selection
const teams = [
  { value: 'team_a', label: 'Construction Team A' },
  { value: 'team_b', label: 'Construction Team B' },
  { value: 'team_c', label: 'Maintenance Team' },
  { value: 'team_d', label: 'Electrical Team' },
  { value: 'unassigned', label: 'Unassigned' },
];

// Equipment status options
const statusOptions = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'under_repair', label: 'Under Repair' },
  { value: 'retired', label: 'Retired' },
];

export function AddEquipmentPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Form state
  const [formData, setFormData] = React.useState({
    name: '',
    type: '',
    model: '',
    serialNumber: '',
    manufacturer: '',
    manufacturingDate: '',
    purchaseDate: '',
    location: '',
    assignedTo: '',
    status: 'active',
    notes: '',
  });
  
  // Form errors
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  
  // Update form fields
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing in a field
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  
  // Handle select changes
  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear error when user makes a selection
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  
  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    // Required fields
    if (!formData.name.trim()) {
      newErrors.name = 'Equipment name is required';
    }
    
    if (!formData.type) {
      newErrors.type = 'Equipment type is required';
    }
    
    if (!formData.serialNumber.trim()) {
      newErrors.serialNumber = 'Serial number is required';
    }
    
    if (!formData.manufacturer.trim()) {
      newErrors.manufacturer = 'Manufacturer is required';
    }
    
    if (!formData.manufacturingDate) {
      newErrors.manufacturingDate = 'Manufacturing date is required';
    }
    
    if (!formData.location) {
      newErrors.location = 'Location is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Submit form
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: 'Validation Error',
        description: 'Please check the form for errors',
        variant: 'destructive',
      });
      return;
    }
    
    // In a real app, this would make an API call to create the equipment
    console.log('Submitting equipment data:', formData);
    
    toast({
      title: 'Equipment Added',
      description: `${formData.name} has been added to inventory`,
      variant: 'success',
    });
    
    // Navigate back to equipment list
    navigate({ to: '/equipment' });
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="flex items-center gap-2 mb-6">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/equipment">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Equipment
          </Link>
        </Button>
      </div>
      
      <h1 className="text-3xl font-bold mb-6">Add New Equipment</h1>
      
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Equipment Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Equipment Name */}
              <div className="space-y-2">
                <Label htmlFor="name" required>Equipment Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Harness #A1234"
                  className={errors.name ? "border-destructive" : ""}
                />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name}</p>
                )}
              </div>
              
              {/* Equipment Type */}
              <SelectField
                label="Equipment Type"
                error={errors.type}
                triggerVariant={errors.type ? "error" : "default"}
                value={formData.type}
                onValueChange={(value) => handleSelectChange('type', value)}
                placeholder="Select equipment type"
                required
              >
                {equipmentTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectField>
              
              {/* Model */}
              <div className="space-y-2">
                <Label htmlFor="model">Model</Label>
                <Input
                  id="model"
                  name="model"
                  value={formData.model}
                  onChange={handleChange}
                  placeholder="e.g. SafetyFirst Pro X3"
                />
              </div>
              
              {/* Serial Number */}
              <div className="space-y-2">
                <Label htmlFor="serialNumber" required>Serial Number</Label>
                <Input
                  id="serialNumber"
                  name="serialNumber"
                  value={formData.serialNumber}
                  onChange={handleChange}
                  placeholder="e.g. SN-12345678"
                  className={errors.serialNumber ? "border-destructive" : ""}
                />
                {errors.serialNumber && (
                  <p className="text-sm text-destructive">{errors.serialNumber}</p>
                )}
              </div>
              
              {/* Manufacturer */}
              <div className="space-y-2">
                <Label htmlFor="manufacturer" required>Manufacturer</Label>
                <Input
                  id="manufacturer"
                  name="manufacturer"
                  value={formData.manufacturer}
                  onChange={handleChange}
                  placeholder="e.g. Safety Equipment Co."
                  className={errors.manufacturer ? "border-destructive" : ""}
                />
                {errors.manufacturer && (
                  <p className="text-sm text-destructive">{errors.manufacturer}</p>
                )}
              </div>
              
              {/* Manufacturing Date */}
              <div className="space-y-2">
                <Label htmlFor="manufacturingDate" required>Manufacturing Date</Label>
                <Input
                  id="manufacturingDate"
                  name="manufacturingDate"
                  type="date"
                  value={formData.manufacturingDate}
                  onChange={handleChange}
                  className={errors.manufacturingDate ? "border-destructive" : ""}
                />
                {errors.manufacturingDate && (
                  <p className="text-sm text-destructive">{errors.manufacturingDate}</p>
                )}
              </div>
              
              {/* Purchase Date */}
              <div className="space-y-2">
                <Label htmlFor="purchaseDate">Purchase Date</Label>
                <Input
                  id="purchaseDate"
                  name="purchaseDate"
                  type="date"
                  value={formData.purchaseDate}
                  onChange={handleChange}
                />
              </div>
              
              {/* Location */}
              <SelectField
                label="Location"
                error={errors.location}
                triggerVariant={errors.location ? "error" : "default"}
                value={formData.location}
                onValueChange={(value) => handleSelectChange('location', value)}
                placeholder="Select location"
                required
              >
                {locations.map((location) => (
                  <SelectItem key={location.value} value={location.value}>
                    {location.label}
                  </SelectItem>
                ))}
              </SelectField>
              
              {/* Assigned To */}
              <SelectField
                label="Assigned To"
                value={formData.assignedTo}
                onValueChange={(value) => handleSelectChange('assignedTo', value)}
                placeholder="Select team or leave unassigned"
              >
                {teams.map((team) => (
                  <SelectItem key={team.value} value={team.value}>
                    {team.label}
                  </SelectItem>
                ))}
              </SelectField>
              
              {/* Status */}
              <SelectField
                label="Status"
                value={formData.status}
                onValueChange={(value) => handleSelectChange('status', value)}
              >
                {statusOptions.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectField>
            </div>
            
            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Add any additional information about this equipment"
                rows={4}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" type="button" asChild>
              <Link to="/equipment">Cancel</Link>
            </Button>
            <Button type="submit">
              <Save className="h-4 w-4 mr-2" />
              Save Equipment
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}

export default AddEquipmentPage;
