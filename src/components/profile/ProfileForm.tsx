
import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
  siteName: string;  // Updated from location to siteName
  department: string;
  bio: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSelectChange: (field: string, value: string) => void;
}

const siteNames = [  // Updated variable name from locations to siteNames
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

const ProfileForm = ({ 
  fullName, 
  employeeId, 
  siteName,  // Updated from location to siteName
  department, 
  bio, 
  onChange,
  onSelectChange 
}: ProfileFormProps) => {
  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="fullName" className="text-sm font-medium block mb-1">Full Name</label>
        <Input
          id="fullName"
          value={fullName}
          onChange={onChange}
          placeholder="Your full name"
        />
      </div>
      
      <div>
        <label htmlFor="employeeId" className="text-sm font-medium block mb-1">Employee ID (Optional)</label>
        <Input
          id="employeeId"
          value={employeeId}
          onChange={onChange}
          placeholder="Your employee ID"
        />
      </div>
      
      <div>
        <label htmlFor="siteName" className="text-sm font-medium block mb-1">Site Name (Optional)</label>
        <Select
          value={siteName}
          onValueChange={(value) => onSelectChange('siteName', value)}
        >
          <SelectTrigger id="siteName" className="w-full">
            <SelectValue placeholder="Select your site" />
          </SelectTrigger>
          <SelectContent>
            <ScrollArea className="h-[200px]">
              {siteNames.map((site) => (
                <SelectItem key={site} value={site}>
                  {site}
                </SelectItem>
              ))}
            </ScrollArea>
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <label htmlFor="department" className="text-sm font-medium block mb-1">Department (Optional)</label>
        <Select
          value={department}
          onValueChange={(value) => onSelectChange('department', value)}
        >
          <SelectTrigger id="department" className="w-full">
            <SelectValue placeholder="Select your department" />
          </SelectTrigger>
          <SelectContent>
            <ScrollArea className="h-[200px]">
              {departments.map((dept) => (
                <SelectItem key={dept} value={dept}>
                  {dept}
                </SelectItem>
              ))}
            </ScrollArea>
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <label htmlFor="bio" className="text-sm font-medium block mb-1">Bio (Optional)</label>
        <Textarea
          id="bio"
          value={bio}
          onChange={onChange}
          placeholder="A short bio about yourself"
          rows={4}
        />
      </div>
    </div>
  );
};

export default ProfileForm;
