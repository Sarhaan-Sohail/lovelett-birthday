import React, { useRef } from 'react';
import { Camera, Image as ImageIcon, Trash2, ShieldCheck } from 'lucide-react';

interface PhotoSlotProps {
  image?: string;
  placeholderText?: string;
  onImageChange: (dataUrl: string | undefined) => void;
  isEditable?: boolean;
  className?: string;
}

export const PhotoSlot: React.FC<PhotoSlotProps> = ({
  image,
  placeholderText = "Photo: added by him, encrypted",
  onImageChange,
  isEditable = true,
  className = "",
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      onImageChange(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className={`relative group w-full h-full flex flex-col items-center justify-center overflow-hidden ${className}`}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept="image/*"
        className="hidden"
      />

      {image ? (
        <div className="relative w-full h-full">
          <img
            src={image}
            alt="Birthday moment"
            className="w-full h-full object-cover rounded"
          />
          {isEditable && (
            <div className="absolute top-1.5 right-1.5 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-1 bg-black/70 hover:bg-black text-white rounded-full text-xs cursor-pointer"
                title="Change Photo"
              >
                <Camera size={12} />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onImageChange(undefined);
                }}
                className="p-1 bg-red-800 hover:bg-red-700 text-white rounded-full text-xs cursor-pointer"
                title="Remove Photo"
              >
                <Trash2 size={12} />
              </button>
            </div>
          )}
        </div>
      ) : (
        <div
          onClick={() => isEditable && fileInputRef.current?.click()}
          className={`flex flex-col items-center justify-center p-3 text-center w-full h-full ${
            isEditable ? 'cursor-pointer hover:opacity-90' : 'cursor-default'
          }`}
        >
          <ImageIcon size={20} className="opacity-60 mb-1" />
          <span className="text-[11px] leading-tight font-medium opacity-80 px-1">
            {placeholderText}
          </span>
          {isEditable && (
            <div className="mt-1 flex items-center gap-1 text-[9px] opacity-60">
              <ShieldCheck size={10} />
              <span>Click to add photo</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
