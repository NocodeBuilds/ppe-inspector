import React from 'react';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ProfileFormProps {
  fullName: string;
  employeeId: string;
  siteName: string;
  department: string;
  Employee_Role: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSelectChange: (field: string, value: string) => void;
}

const siteNames = [
  'Molagavalli 1 & 2', 
  'Molagavalli 3', 
  'Nimbagallu', 
  'Kalyandurga', 
  'Ralla South', 
  'Ralla North', 
  'Veerabdra', 
  'Ellutla'
];

const departments = [
  'Wind O&M', 
  'Solar O&M', 
  'Wind EPC', 
  'Solar EPC', 
  'Wind Asset Management', 
  'Solar Asset Management', 
  'Hydrogen', 
  'Transmission', 
  'Projects', 
  'Corporate Office', 
  'Area Office', 
  'Others'
];

const employeeRoles = [
  'DET',
  'GET',
  'Jr. Engineer',
  'Engineer',
  'Sr. Engineer',
  'Assistant Manager',
  'Deputy Manager',
  'Manager',
  'General Manager'
];

const ProfileForm = ({ 
  fullName, 
  employeeId, 
  siteName,
  department,
  Employee_Role,
  onChange,
  onSelectChange 
}: ProfileFormProps) => {
  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="fullName" className="text-body-sm block mb-1">Full Name</label>
        <Input
          id="fullName"
          value={fullName}
          onChange={onChange}
          placeholder="Your full name"
          className="text-body"
        />
      </div>
      
      <div>
        <label htmlFor="employeeId" className="text-body-sm block mb-1">Employee ID (Optional)</label>
        <Input
          id="employeeId"
          value={employeeId}
          onChange={onChange}
          placeholder="Your employee ID"
          className="text-body"
        />
      </div>
      
      <div>
        <label htmlFor="Employee_Role" className="text-body-sm block mb-1">Role (Optional)</label>
        <Select
          value={Employee_Role}
          onValueChange={(value) => onSelectChange('Employee_Role', value)}
        >
          <SelectTrigger id="Employee_Role" className="w-full text-body">
            <SelectValue placeholder="Select your role" />
          </SelectTrigger>
          <SelectContent>
            <ScrollArea className="h-[200px]">
              {employeeRoles.map((role) => (
                <SelectItem key={role} value={role} className="text-body">
                  {role}
                </SelectItem>
              ))}
            </ScrollArea>
          </SelectContent>
        </Select>
      </div>

      <div>
        <label htmlFor="department" className="text-body-sm block mb-1">Department (Optional)</label>
        <Select
          value={department}
          onValueChange={(value) => onSelectChange('department', value)}
        >
          <SelectTrigger id="department" className="w-full text-body">
            <SelectValue placeholder="Select your department" />
          </SelectTrigger>
          <SelectContent>
            <ScrollArea className="h-[200px]">
              {departments.map((dept) => (
                <SelectItem key={dept} value={dept} className="text-body">
                  {dept}
                </SelectItem>
              ))}
            </ScrollArea>
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <label htmlFor="siteName" className="text-body-sm block mb-1">Site Name (Optional)</label>
        <Select
          value={siteName}
          onValueChange={(value) => onSelectChange('siteName', value)}
        >
          <SelectTrigger id="siteName" className="w-full text-body">
            <SelectValue placeholder="Select your site" />
          </SelectTrigger>
          <SelectContent>
            <ScrollArea className="h-[200px]">
              {siteNames.map((site) => (
                <SelectItem key={site} value={site} className="text-body">
                  {site}
                </SelectItem>
              ))}
            </ScrollArea>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default ProfileForm;
