"use client";

import React, { useState } from "react";
import type { UniversalMediaUploadProps, MediaUploadResult } from "./types";
import { useMediaUpload } from "./useMediaUpload";
import { MediaDropzoneView } from "./MediaDropzoneView";
import { MediaPreviewCard } from "./MediaPreviewCard";
import { MediaUrlFetchBar } from "./MediaUrlFetchBar";

const UploadHeader: React.FC<{ label: string; allowManualInput?: boolean }> = ({ label, allowManualInput }) => (
  <div className="flex items-center justify-between">
    <label className="block font-mono-tech text-xs tracking-wider text-(--text-secondary) uppercase">{label}</label>
    {allowManualInput && <span className="font-mono-tech text-[10px] text-(--accent-bronze)">[File Path Bypass: ON]</span>}
  </div>
);

const ErrorBanner: React.FC<{ message: string; onRetry: () => void }> = ({ message, onRetry }) => (
  <div className="flex items-center justify-between rounded border border-red-500/30 bg-red-500/10 p-2 font-mono-tech text-xs text-red-400">
    <span>{message || "Lỗi tải ảnh"}</span>
    <button type="button" onClick={onRetry} className="underline focus:outline-hidden">Thử lại</button>
  </div>
);

const DropzoneContainer: React.FC<{
  folder: string; isUploading: boolean; allowManualInput?: boolean;
  onPaste: (e: React.ClipboardEvent, folder: string) => void;
  onSelectFile: (file: File) => void; onFetch: (url: string) => void; onDirectApply: (url: string) => void;
}> = ({ folder, isUploading, allowManualInput, onPaste, onSelectFile, onFetch, onDirectApply }) => (
  <div tabIndex={0} onPaste={(e) => { if ((e.target as HTMLElement)?.tagName !== "INPUT") onPaste(e, folder); }} className="space-y-2 focus:outline-hidden">
    <MediaDropzoneView isUploading={isUploading} onFileSelected={onSelectFile} />
    <MediaUrlFetchBar onFetch={onFetch} isLoading={isUploading} allowManualInput={allowManualInput} onDirectApply={onDirectApply} />
  </div>
);

function useUniversalHandlers(
  folder: string,
  onChange: (url: string, metadata?: MediaUploadResult) => void
) {
  const upload = useMediaUpload();
  const [isReplacing, setIsReplacing] = useState(false);

  const handleSelectFile = async (file: File) => {
    const res = await upload.handleFileUpload(file, folder);
    if (res) { onChange(res.url, res); setIsReplacing(false); }
  };
  const handleFetch = async (url: string) => {
    const res = await upload.handleUrlFetch(url, folder);
    if (res) { onChange(res.url, res); setIsReplacing(false); }
  };
  const handleRemove = () => { onChange(""); upload.reset(); setIsReplacing(false); };
  const handleDirectApply = (u: string) => { onChange(u); setIsReplacing(false); };

  return { ...upload, isReplacing, setIsReplacing, handleSelectFile, handleFetch, handleRemove, handleDirectApply };
}

export const UniversalMediaUpload: React.FC<UniversalMediaUploadProps> = ({
  label,
  value,
  onChange,
  helperText,
  allowManualInput,
  folder = "projects",
  className,
}) => {
  const h = useUniversalHandlers(folder, onChange);
  const showPreview = Boolean(value) && !h.isReplacing && h.uploadState !== "uploading";

  return (
    <div className={`space-y-2 ${className || ""}`}>
      <UploadHeader label={label} allowManualInput={allowManualInput} />
      {h.uploadState === "error" && <ErrorBanner message={h.errorMessage} onRetry={h.reset} />}
      {showPreview ? (
        <MediaPreviewCard url={value} metadata={h.result} onReplace={() => h.setIsReplacing(true)} onRemove={h.handleRemove} />
      ) : (
        <DropzoneContainer folder={folder} isUploading={h.uploadState === "uploading"} allowManualInput={allowManualInput} onPaste={h.handlePaste} onSelectFile={h.handleSelectFile} onFetch={h.handleFetch} onDirectApply={h.handleDirectApply} />
      )}
      {helperText && <p className="font-sans text-[11px] text-white/40">{helperText}</p>}
    </div>
  );
};

export default UniversalMediaUpload;
