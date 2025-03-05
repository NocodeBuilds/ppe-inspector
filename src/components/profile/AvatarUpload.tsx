
import React from 'react';
import { User } from 'lucide-react';

interface AvatarUploadProps {
  avatarUrl: string | null;
  avatarPreview: string | null;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const AvatarUpload = ({ avatarUrl, avatarPreview, onChange }: AvatarUploadProps) => {
  return (
    <div className="flex flex-col items-center mb-8">
      <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4 overflow-hidden relative group">
        {avatarPreview ? (
          <img src={avatarPreview} alt="Avatar Preview" className="w-full h-full object-cover" />
        ) : avatarUrl ? (
          <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
        ) : (
          <User size={40} className="text-muted-foreground" />
        )}
        
        <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <label htmlFor="avatar-upload" className="text-white cursor-pointer text-xs font-medium">
            Change
          </label>
          <input 
            id="avatar-upload" 
            type="file" 
            accept="image/*" 
            className="hidden" 
            onChange={onChange}
          />
        </div>
      </div>
    </div>
  );
};

export default AvatarUpload;
