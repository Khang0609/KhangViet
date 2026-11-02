"use client";

import React from "react";
import { UploadCloud, Link as LinkIcon, Image as ImageIcon, FolderOpen } from "lucide-react";

export interface ImageUrlInputProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  placeholder?: string;
  helperText?: string;
  allowFilePath?: boolean;
}

export const ImageUrlInput: React.FC<ImageUrlInputProps> = ({
  label,
  value,
  onChange,
  placeholder,
  helperText,
  allowFilePath = true,
}) => {
  const defaultPlaceholder = allowFilePath
    ? "/image/projects/... hoặc https://..."
    : "https://images.unsplash.com/...";

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block font-mono-tech text-xs tracking-wider text-(--text-secondary) uppercase">
          {label}
        </label>
        {allowFilePath && (
          <span className="font-mono-tech text-[10px] text-(--accent-bronze)">
            [File Path Bypass: ON]
          </span>
        )}
      </div>

      <div className="relative flex items-center">
        {allowFilePath ? (
          <FolderOpen className="absolute left-3.5 h-4 w-4 text-(--accent-bronze)" />
        ) : (
          <LinkIcon className="absolute left-3.5 h-4 w-4 text-white/40" />
        )}
        <input
          type={allowFilePath ? "text" : "url"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || defaultPlaceholder}
          className="w-full rounded border border-white/10 bg-white/5 py-2.5 pr-4 pl-10 font-mono-tech text-xs text-(--text-primary) transition-colors placeholder:text-white/20 focus:border-(--accent-bronze) focus:outline-hidden"
        />
      </div>

      {helperText && <p className="font-sans text-[11px] text-white/40">{helperText}</p>}

      <div className="flex items-center gap-3 rounded border border-dashed border-white/15 bg-white/2 px-3.5 py-2">
        <UploadCloud className="h-4 w-4 shrink-0 text-(--accent-bronze)" />
        <div className="min-w-0 flex-1">
          <p className="font-sans text-xs text-white/70">
            Tính năng gắn tệp ảnh từ máy tính (Cloud Storage) sẽ được kích hoạt ở giai đoạn tiếp theo.
          </p>
        </div>
      </div>

      {value && (
        <div className="flex items-center gap-3 rounded border border-white/10 bg-black/40 p-2">
          <div className="relative h-10 w-14 shrink-0 overflow-hidden rounded border border-white/10 bg-white/5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={value}
              alt="Preview"
              className="h-full w-full object-cover"
              onError={(e) => { (e.currentTarget as HTMLElement).style.display = "none"; }}
            />
            <div className="absolute inset-0 -z-10 flex items-center justify-center">
              <ImageIcon className="h-3.5 w-3.5 text-white/20" />
            </div>
          </div>
          <p className="truncate font-mono-tech text-[11px] text-white/50">{value}</p>
        </div>
      )}
    </div>
  );
};

export default ImageUrlInput;
