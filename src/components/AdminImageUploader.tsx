import React, { useState, useRef } from 'react';
import { Upload, Link as LinkIcon, Image as ImageIcon, CheckCircle, Cloud, AlertCircle, Loader2, X } from 'lucide-react';
import { apiRequest } from '../services/api';

interface AdminImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  folder?: string;
  fallbackImage?: string;
}

export const AdminImageUploader: React.FC<AdminImageUploaderProps> = ({
  value,
  onChange,
  label = 'Product Image',
  folder = 'hound_and_harbor/admin',
  fallbackImage = 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=800&q=80',
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'link'>('upload');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isSavingUrlToCloudinary, setIsSavingUrlToCloudinary] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const isCloudinaryUrl = value?.includes('cloudinary.com');

  const uploadFileToCloudinary = async (file: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setUploadError('Please choose a valid image file (PNG, JPG, WEBP, GIF, SVG).');
      return;
    }
    if (file.size > 25 * 1024 * 1024) {
      setUploadError('Image size exceeds 25MB. Please choose a smaller image.');
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64Data = reader.result as string;
          const res = await apiRequest<{ success: boolean; url: string; publicId?: string; error?: string }>('/upload', {
            method: 'POST',
            body: JSON.stringify({
              image: base64Data,
              folder,
            }),
          });

          if (res.success && res.url) {
            onChange(res.url);
          } else {
            throw new Error(res.error || 'Failed to upload image to Cloudinary.');
          }
        } catch (err: any) {
          setUploadError(err.message || 'Cloudinary upload failed.');
        } finally {
          setIsUploading(false);
        }
      };
      reader.onerror = () => {
        setUploadError('Failed to read image file from your device.');
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      setUploadError(err.message || 'Upload initialization error.');
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadFileToCloudinary(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      uploadFileToCloudinary(file);
    }
  };

  const handleSaveUrlToCloudinary = async () => {
    if (!value.trim()) return;
    setIsSavingUrlToCloudinary(true);
    setUploadError(null);
    try {
      const res = await apiRequest<{ success: boolean; url: string; error?: string }>('/upload', {
        method: 'POST',
        body: JSON.stringify({
          image: value.trim(),
          folder,
        }),
      });
      if (res.success && res.url) {
        onChange(res.url);
      } else {
        throw new Error(res.error || 'Cloudinary failed to import this URL.');
      }
    } catch (err: any) {
      setUploadError(err.message || 'Could not mirror URL to Cloudinary.');
    } finally {
      setIsSavingUrlToCloudinary(false);
    }
  };

  return (
    <div className="space-y-2">
      {/* Header with Mode Toggle */}
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold text-gray-700">
          {label} *
        </label>
        <div className="flex items-center bg-gray-100 p-0.5 rounded-lg text-[11px] font-medium">
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
              activeTab === 'upload' ? 'bg-white text-[#0E5E58] shadow-xs font-bold' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Upload size={12} />
            Direct File Upload
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('link')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
              activeTab === 'link' ? 'bg-white text-[#0E5E58] shadow-xs font-bold' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <LinkIcon size={12} />
            Image Link / URL
          </button>
        </div>
      </div>

      {/* Tab 1: Direct File Upload to Cloudinary */}
      {activeTab === 'upload' && (
        <div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />

          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
              isDragOver
                ? 'border-[#0E5E58] bg-[#F4F8F7]'
                : 'border-gray-300 hover:border-[#0E5E58] bg-gray-50/50 hover:bg-gray-50'
            }`}
          >
            {isUploading ? (
              <div className="flex flex-col items-center justify-center py-2 space-y-2">
                <Loader2 size={24} className="animate-spin text-[#0E5E58]" />
                <span className="text-xs font-bold text-[#0E5E58]">Uploading directly to Cloudinary...</span>
                <span className="text-[10px] text-gray-500">Optimizing format and generating CDN assets</span>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-1 space-y-1.5">
                <div className="w-10 h-10 rounded-full bg-[#E8F3F1] flex items-center justify-center text-[#0E5E58]">
                  <Upload size={18} />
                </div>
                <div className="text-xs font-semibold text-gray-800">
                  Click to browse or drag and drop image file
                </div>
                <div className="text-[10px] text-gray-500 flex items-center gap-1">
                  <Cloud size={12} className="text-sky-600" />
                  <span>Automatically saved and optimized on <strong>Cloudinary CDN</strong></span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Link / URL Input */}
      {activeTab === 'link' && (
        <div className="space-y-1.5">
          <div className="flex gap-2">
            <input
              type="url"
              placeholder="https://images.unsplash.com/... or any image link"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="flex-1 px-3 py-2 text-xs border border-gray-200 focus:border-[#0E5E58] rounded-xl outline-none font-mono"
            />
            {value && !isCloudinaryUrl && (
              <button
                type="button"
                onClick={handleSaveUrlToCloudinary}
                disabled={isSavingUrlToCloudinary}
                title="Save this external image to Cloudinary for permanent high-speed CDN delivery"
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold bg-[#0E5E58] hover:bg-[#0B4A45] text-white rounded-xl transition-colors cursor-pointer shrink-0 disabled:opacity-50"
              >
                {isSavingUrlToCloudinary ? (
                  <>
                    <Loader2 size={12} className="animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Cloud size={13} />
                    <span>Save to Cloudinary</span>
                  </>
                )}
              </button>
            )}
          </div>
          <p className="text-[10px] text-gray-500">
            Paste an image link directly, or click &ldquo;Save to Cloudinary&rdquo; to store it permanently on Cloudinary.
          </p>
        </div>
      )}

      {/* Error message */}
      {uploadError && (
        <div className="flex items-center gap-1.5 p-2 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs">
          <AlertCircle size={14} className="shrink-0" />
          <span>{uploadError}</span>
        </div>
      )}

      {/* Image Preview & Cloudinary Storage Status */}
      {value && (
        <div className="flex items-center justify-between p-2.5 bg-white border border-[#E8E6DF] rounded-xl shadow-xs">
          <div className="flex items-center gap-3 min-w-0">
            <img
              src={value}
              alt="Preview"
              referrerPolicy="no-referrer"
              className="w-14 h-14 object-cover rounded-lg border border-gray-200 bg-gray-50 shrink-0"
              onError={(e: any) => {
                e.target.src = fallbackImage;
              }}
            />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 mb-1">
                {isCloudinaryUrl ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-800 border border-sky-200">
                    <Cloud size={10} className="text-sky-600" />
                    Saved on Cloudinary
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                    <LinkIcon size={10} className="text-amber-600" />
                    Direct Link Image
                  </span>
                )}
                <span className="text-[10px] text-emerald-600 font-medium flex items-center gap-0.5">
                  <CheckCircle size={10} /> Active
                </span>
              </div>
              <p className="text-[11px] font-mono text-gray-500 truncate max-w-[240px] sm:max-w-xs">
                {value}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onChange('')}
            className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
            title="Remove image"
          >
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
};
