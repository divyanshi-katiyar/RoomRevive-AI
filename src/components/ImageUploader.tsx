import React, { useState, useRef } from 'react';
import { UploadCloud, Image as ImageIcon, RefreshCw, Trash2, Sparkles, Check } from 'lucide-react';

interface SampleItem {
  title: string;
  category?: string;
  type?: string;
  image: string;
  description?: string;
}

interface ImageUploaderProps {
  currentImage: string | null;
  onImageSelected: (base64: string) => void;
  onImageRemoved: () => void;
  label?: string;
  sublabel?: string;
  samples?: SampleItem[];
  sampleTitle?: string;
  aspectRatioClass?: string;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  currentImage,
  onImageSelected,
  onImageRemoved,
  label = 'Upload room photograph',
  sublabel = 'Drag and drop your image, or browse from your device',
  samples = [],
  sampleTitle = 'Or try a curated sample space',
  aspectRatioClass = 'aspect-[16/10]',
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    if (!file.type.match(/^image\/(jpeg|jpg|png|webp)$/)) {
      alert('Please upload a JPG, PNG, or WEBP image.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        onImageSelected(result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Zone */}
      {!currentImage ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center transition-all cursor-pointer flex flex-col items-center justify-center ${
            isDragging
              ? 'border-[#8C6849] bg-[#F7F2EC] scale-[0.99]'
              : 'border-[#DDD5C9] bg-[#FAF8F5] hover:border-[#8C6849] hover:bg-[#F9F5EF]'
          } ${aspectRatioClass}`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/jpg"
            onChange={handleFileInputChange}
            className="hidden"
          />

          <div className="w-16 h-16 rounded-2xl bg-[#F0EAE1] flex items-center justify-center text-[#8C6849] mb-4 shadow-sm">
            <UploadCloud className="w-8 h-8" />
          </div>

          <h3 className="font-serif-luxury text-xl font-semibold text-[#1F1E1D] mb-1">
            {label}
          </h3>
          <p className="text-sm text-stone-500 max-w-sm mb-4">
            {sublabel}
          </p>

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#242220] text-white text-xs font-medium hover:bg-[#383532] transition-colors shadow-sm">
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Select File from Device</span>
          </div>

          <span className="text-[11px] text-stone-400 mt-4 block">
            Supports JPG, JPEG, PNG, WEBP (Max 25MB)
          </span>
        </div>
      ) : (
        /* Image Preview with Replace and Remove */
        <div className="relative rounded-2xl overflow-hidden border border-[#DDD5C9] shadow-md bg-stone-900 group">
          <img
            src={currentImage}
            alt="Uploaded Preview"
            className="w-full object-cover max-h-[460px]"
          />

          {/* Overlay Controls */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/jpg"
              onChange={handleFileInputChange}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white/95 text-stone-900 text-xs font-semibold hover:bg-white transition-colors shadow-lg cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Replace Photo</span>
            </button>
            <button
              onClick={onImageRemoved}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-red-600/95 text-white text-xs font-semibold hover:bg-red-600 transition-colors shadow-lg cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Remove</span>
            </button>
          </div>

          <div className="absolute top-3 left-3 px-3 py-1 rounded-md bg-black/60 backdrop-blur-md text-white text-[11px] font-medium flex items-center gap-1.5">
            <Check className="w-3 h-3 text-emerald-400" />
            Image Ready for AI Analysis
          </div>
        </div>
      )}

      {/* Curated Sample Images for Immediate Testing */}
      {samples.length > 0 && !currentImage && (
        <div className="pt-2">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-[#8C6849]" />
            <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-600">
              {sampleTitle}
            </h4>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {samples.map((sample, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => onImageSelected(sample.image)}
                className="group relative rounded-xl overflow-hidden border border-[#E4DDD3] bg-white text-left hover:border-[#8C6849] hover:shadow-md transition-all cursor-pointer"
              >
                <div className="aspect-[4/3] w-full overflow-hidden bg-stone-100">
                  <img
                    src={sample.image}
                    alt={sample.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-2.5">
                  <span className="text-[10px] font-semibold text-[#8C6849] uppercase block mb-0.5">
                    {sample.category || sample.type || 'Preset'}
                  </span>
                  <p className="text-xs font-medium text-stone-800 line-clamp-1">
                    {sample.title}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
