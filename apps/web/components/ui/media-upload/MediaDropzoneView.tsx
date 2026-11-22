"use client";

import React, { useState, useRef } from "react";
import { UploadCloud, Loader2 } from "lucide-react";

interface MediaDropzoneViewProps {
  isUploading: boolean;
  onFileSelected: (file: File) => void;
  onPaste?: (e: React.ClipboardEvent) => void;
}

const DropzoneUploading: React.FC = () => (
  <div className="flex flex-col items-center py-2">
    <Loader2 className="h-8 w-8 animate-spin text-(--accent-bronze)" />
    <p className="mt-2 font-mono-tech text-xs text-[#625f5a]">Đang nén WebP & lưu trữ R2...</p>
  </div>
);

const DropzoneIdle: React.FC = () => (
  <div className="flex flex-col items-center text-center">
    <UploadCloud className="h-8 w-8 text-(--accent-bronze)" />
    <p className="mt-2 font-sans text-xs font-medium text-[#1a1918]">
      Kéo &amp; thả ảnh vào đây, hoặc bấm để chọn tệp
    </p>
    <span className="mt-1.5 inline-block rounded border border-black/10 bg-white px-3 py-1 font-mono-tech text-[11px] font-medium text-[#1a1918] shadow-2xs">
      Chọn tệp từ máy...
    </span>
    <span className="mt-2 font-mono-tech text-[10px] text-[#625f5a]">
      Hỗ trợ JPG, PNG, WebP (Tối đa 10MB) • Phím tắt: Ctrl + V
    </span>
  </div>
);

const DropzoneFileInput = React.forwardRef<
  HTMLInputElement,
  { onSelect: (file: File) => void }
>(({ onSelect }, ref) => (
  <input
    ref={ref}
    type="file"
    accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
    className="hidden"
    onChange={(e) => { const f = e.target.files?.[0]; if (f) onSelect(f); }}
  />
));
DropzoneFileInput.displayName = "DropzoneFileInput";

function useDropzoneDrag(onFileSelected: (file: File) => void) {
  const [isDragging, setIsDragging] = useState(false);
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) onFileSelected(file);
  };
  return { isDragging, setIsDragging, handleDrop };
}

export const MediaDropzoneView: React.FC<MediaDropzoneViewProps> = ({
  isUploading,
  onFileSelected,
  onPaste,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isDragging, setIsDragging, handleDrop } = useDropzoneDrag(onFileSelected);

  const borderClass = isDragging
    ? "border-(--accent-bronze) bg-(--accent-bronze)/10"
    : "border-black/15 bg-[#faf9f6] hover:border-(--accent-bronze)/60 hover:bg-[#f4f1ea]";

  return (
    <div
      tabIndex={0}
      role="button"
      onClick={() => {
        if (!isUploading) fileInputRef.current?.click();
      }}
      onKeyDown={(e) => {
        if ((e.key === "Enter" || e.key === " ") && !isUploading) {
          e.preventDefault();
          fileInputRef.current?.click();
        }
      }}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
      onDrop={handleDrop}
      onPaste={onPaste}
      className={`relative flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors focus:outline-hidden ${borderClass}`}
    >
      <DropzoneFileInput ref={fileInputRef} onSelect={onFileSelected} />
      {isUploading ? <DropzoneUploading /> : <DropzoneIdle />}
    </div>
  );
};
