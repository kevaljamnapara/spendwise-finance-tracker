import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, X } from 'lucide-react';
import api from '@/services/axios';

export default function ImageUpload({ 
  value, 
  onChange, 
  endpoint, 
  title = "Upload Image",
  className = ""
}) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    // determine field name based on endpoint (avatar vs receipt)
    const fieldName = endpoint.includes('avatar') ? 'image' : 'file';
    formData.append(fieldName, file);

    setIsUploading(true);
    setError('');

    try {
      const { data } = await api.post(endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      onChange(data.data.url);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload image');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = () => {
    onChange('');
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {error && <p className="text-sm text-red-500">{error}</p>}
      
      {value ? (
        <div className="relative inline-block">
          <img 
            src={value} 
            alt="Uploaded" 
            className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-sm dark:border-zinc-900"
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-sm hover:bg-red-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-4">
          <div className="w-24 h-24 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center border-2 border-dashed border-zinc-300 dark:border-zinc-700">
            <Upload className="w-6 h-6 text-zinc-400" />
          </div>
          <div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="rounded-lg"
            >
              {isUploading ? 'Uploading...' : title}
            </Button>
            <p className="text-xs text-zinc-500 mt-2">JPG, PNG or WEBP. Max 5MB.</p>
          </div>
        </div>
      )}
      
      <input 
        type="file" 
        accept="image/*"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
