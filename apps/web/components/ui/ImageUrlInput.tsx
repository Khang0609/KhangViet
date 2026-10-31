"use client";

import React from "react";
import { UploadCloud, Link as LinkIcon, Image as ImageIcon } from "lucide-react";

export interface ImageUrlInputProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  placeholder?: string;
  helperText?: string;
}

/**
 * Global UI component nhập đường dẫn hình ảnh từ web kèm khu vực thông báo tính năng upload sắp tới.
 * Ràng buộc kiến trúc: Hỗ trợ preview tức thì khi nhập URL hợp lệ.
 */
export const ImageUrlInput: React.FC<ImageUrlInputProps> = ({
  label,
  value,
  onChange,
  placeholder = "https://images.unsplash.com/... hoặc /image/...",
  helperText,
}) => {
  return (
    <div className="space-y-2">
      <label className="block font-mono-tech text-xs tracking-wider text-(--text-secondary) uppercase">
        {label}
      </label>

      <div className="relative flex items-center">
        <LinkIcon className="absolute left-3.5 h-4 w-4 text-white/40" />
        <input
          type="url"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded border border-white/10 bg-white/5 py-2.5 pr-4 pl-10 font-mono-tech text-xs text-(--text-primary) transition-colors placeholder:text-white/20 focus:border-(--accent-bronze) focus:outline-hidden"
        />
      </div>

      {helperText && (
        <p className="font-sans text-[11px] text-white/40">{helperText}</p>
      )}

      {/* Div ghi nhớ tính năng upload file từ máy tính */}
      <div className="flex items-center gap-3 rounded border border-dashed border-white/15 bg-white/2 px-3.5 py-2.5">
        <UploadCloud className="h-4 w-4 shrink-0 text-(--accent-bronze)" />
        <div className="min-w-0 flex-1">
          <p className="font-sans text-xs text-white/70">
            Tính năng gắn tệp ảnh từ máy tính (Cloud Storage) sẽ được kích hoạt ở giai đoạn tiếp theo.
          </p>
          <span className="font-mono-tech text-[10px] text-white/30 uppercase tracking-widest">
            Pending Cloud Integration
          </span>
        </div>
      </div>

      {/* Mini Image Preview nếu có URL */}
      {value && (
        <div className="flex items-center gap-3 rounded border border-white/10 bg-black/40 p-2">
          <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded border border-white/10 bg-white/5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={value}
              alt="Preview"
              className="h-full w-full object-cover"
              onError={(e) => {
                (e.currentTarget as HTMLElement).style.display = "none";
              }}
            />
            <div className="absolute inset-0 -z-10 flex items-center justify-center">
              <ImageIcon className="h-4 w-4 text-white/20" />
            </div>
          </div>
          <p className="truncate font-mono-tech text-[11px] text-white/50">{value}</p>
        </div>
      )}
    </div>
  );
};

export default ImageUrlInput;

