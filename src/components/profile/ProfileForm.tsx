
import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface ProfileFormProps {
  fullName: string;
  employeeId: string;
  location: string;
  department: string;
  bio: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

const ProfileForm = ({ fullName, employeeId, location, department, bio, onChange }: ProfileFormProps) => {
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
        <label htmlFor="location" className="text-sm font-medium block mb-1">Location (Optional)</label>
        <Input
          id="location"
          value={location}
          onChange={onChange}
          placeholder="Your location or site"
        />
      </div>
      
      <div>
        <label htmlFor="department" className="text-sm font-medium block mb-1">Department (Optional)</label>
        <Input
          id="department"
          value={department}
          onChange={onChange}
          placeholder="Your department"
        />
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
