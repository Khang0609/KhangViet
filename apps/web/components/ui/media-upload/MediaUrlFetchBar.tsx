"use client";

import React, { useState } from "react";
import { Link as LinkIcon, Download, Loader2 } from "lucide-react";

interface MediaUrlFetchBarProps {
  onFetch: (url: string) => void;
  isLoading: boolean;
  allowManualInput?: boolean;
  onDirectApply?: (url: string) => void;
}

const UrlSubmitBtn: React.FC<{ isLoading: boolean; disabled: boolean; isLocal: boolean }> = ({
  isLoading,
  disabled,
  isLocal,
}) => (
  <button
    type="submit"
    disabled={disabled}
    className="flex shrink-0 items-center gap-1.5 rounded border border-(--accent-bronze)/40 bg-(--accent-bronze)/15 px-3 py-1.5 font-mono-tech text-xs text-(--accent-bronze) transition-colors hover:bg-(--accent-bronze)/25 disabled:opacity-40 focus:outline-hidden"
  >
    {isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
    <span>{isLocal ? "Áp dụng" : "Nạp về R2"}</span>
  </button>
);

const UrlInputField: React.FC<{
  value: string;
  onChange: (val: string) => void;
  allowManualInput?: boolean;
}> = ({ value, onChange, allowManualInput }) => (
  <div className="relative flex-1">
    <LinkIcon className="absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-white/40" />
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={allowManualInput ? "https://... hoặc /image/..." : "https://..."}
      className="w-full rounded border border-white/10 bg-white/4 py-1.5 pr-3 pl-8.5 font-mono-tech text-xs text-white placeholder:text-white/20 focus:border-(--accent-bronze) focus:outline-hidden"
    />
  </div>
);

export const MediaUrlFetchBar: React.FC<MediaUrlFetchBarProps> = ({
  onFetch,
  isLoading,
  allowManualInput,
  onDirectApply,
}) => {
  const [inputUrl, setInputUrl] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inputUrl.trim();
    if (!trimmed) return;
    if (allowManualInput && trimmed.startsWith("/")) {
      onDirectApply?.(trimmed);
      setInputUrl("");
    } else {
      onFetch(trimmed);
    }
  };

  const isLocal = Boolean(allowManualInput && inputUrl.trim().startsWith("/"));

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <UrlInputField value={inputUrl} onChange={setInputUrl} allowManualInput={allowManualInput} />
      <UrlSubmitBtn isLoading={isLoading} disabled={isLoading || !inputUrl.trim()} isLocal={isLocal} />
    </form>
  );
};
