'use client';

import { useState, useRef, useCallback } from 'react';
import { Upload, X, ImageIcon, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';

interface ImageUploadProps {
  value?: string;
  onChange: (url: string, key: string) => void;
  onRemove?: () => void;
  folder?: string;
  className?: string;
}

export default function ImageUpload({
  value,
  onChange,
  onRemove,
  folder = 'blogs',
  className = '',
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const uploadFile = useCallback(
    async (file: File) => {
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image must be smaller than 5MB');
        return;
      }

      setIsUploading(true);

      try {
        // Strategy 1: Get pre-signed URL for direct browser-to-S3 upload
        const presignRes = await axios.get(
          `/api/upload?fileName=${encodeURIComponent(file.name)}&mimeType=${encodeURIComponent(file.type)}&folder=${folder}`
        );

        const { presignedUrl, key, publicUrl } = presignRes.data.data;

        // Upload directly to S3 via pre-signed URL
        await axios.put(presignedUrl, file, {
          headers: { 'Content-Type': file.type },
          onUploadProgress: (e) => {
            const pct = Math.round(((e.loaded ?? 0) / (e.total ?? 1)) * 100);
            // Could show progress here
          },
        });

        onChange(publicUrl, key);
        toast.success('Image uploaded to AWS S3 ✓');
      } catch (err) {
        // Fallback: upload via server-side API
        try {
          const formData = new FormData();
          formData.append('image', file);
          formData.append('folder', folder);

          const res = await axios.post('/api/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });

          const { url, key } = res.data.data;
          onChange(url, key);
          toast.success('Image uploaded ✓');
        } catch (fallbackErr) {
          toast.error('Upload failed. Please try again.');
        }
      } finally {
        setIsUploading(false);
      }
    },
    [folder, onChange]
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) uploadFile(file);
  };

  if (value) {
    return (
      <div className={`relative rounded-xl overflow-hidden bg-muted group ${className}`}>
        <img src={value} alt="Cover" className="w-full h-48 object-cover" />
        {/* CDN badge */}
        <div className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full backdrop-blur-sm">
          ☁️ CloudFront CDN
        </div>
        {onRemove && (
          <button
            onClick={onRemove}
            className="absolute top-2 right-2 bg-black/60 text-white p-1.5 rounded-full hover:bg-black/80 transition-colors opacity-0 group-hover:opacity-100"
            type="button"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      className={`relative border-2 border-dashed rounded-xl transition-all cursor-pointer
        ${dragOver ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-muted/50'}
        ${className}`}
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      onClick={() => !isUploading && inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      <div className="flex flex-col items-center justify-center py-10 gap-3">
        {isUploading ? (
          <>
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <p className="text-sm text-muted-foreground">Uploading to AWS S3...</p>
          </>
        ) : (
          <>
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
              <ImageIcon className="w-6 h-6 text-muted-foreground" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-foreground">
                Drop image or <span className="text-primary">browse</span>
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                PNG, JPG, WebP up to 5MB · Stored on AWS S3 · Served via CloudFront
              </p>
            </div>
            <Upload className="w-4 h-4 text-muted-foreground" />
          </>
        )}
      </div>
    </div>
  );
}
