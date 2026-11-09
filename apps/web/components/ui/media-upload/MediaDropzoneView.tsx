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
    <p className="mt-2 font-mono-tech text-xs text-white/70">Đang nén WebP & lưu trữ R2...</p>
  </div>
);

const DropzoneIdle: React.FC<{ onBrowse: () => void }> = ({ onBrowse }) => (
  <div className="flex flex-col items-center text-center">
    <UploadCloud className="h-8 w-8 text-(--accent-bronze)" />
    <p className="mt-2 font-sans text-xs text-white/80">Kéo & thả ảnh vào đây, hoặc</p>
    <button
      type="button"
      onClick={onBrowse}
      className="mt-1.5 rounded bg-white/10 px-3 py-1 font-mono-tech text-[11px] text-white transition-colors hover:bg-white/15 focus:outline-hidden"
    >
      Chọn tệp từ máy...
    </button>
    <span className="mt-2 font-mono-tech text-[10px] text-white/40">
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
    : "border-white/15 bg-white/2 hover:border-white/25 hover:bg-white/4";

  return (
    <div
      tabIndex={0}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
      onDrop={handleDrop}
      onPaste={onPaste}
      className={`relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors focus:outline-hidden ${borderClass}`}
    >
      <DropzoneFileInput ref={fileInputRef} onSelect={onFileSelected} />
      {isUploading ? <DropzoneUploading /> : <DropzoneIdle onBrowse={() => fileInputRef.current?.click()} />}
    </div>
  );
};
