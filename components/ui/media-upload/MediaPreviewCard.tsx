"use client";

import React from "react";
import { RefreshCw, Trash2, ExternalLink } from "lucide-react";
import type { MediaUploadResult } from "./types";

interface Props {
  url: string;
  metadata?: MediaUploadResult | null;
  onReplace: () => void;
  onRemove: () => void;
}

function formatSize(bytes?: number): string {
  if (!bytes) return "";
  return bytes < 1048576 ? `${Math.round(bytes / 1024)} KB` : `${(bytes / 1048576).toFixed(1)} MB`;
}

const MediaMetaBadges: React.FC<{ metadata?: MediaUploadResult | null }> = ({ metadata }) => (
  <div className="flex flex-wrap items-center gap-1.5">
    {metadata?.width && metadata?.height && (
      <span className="rounded bg-white/8 px-1.5 py-0.5 font-mono-tech text-[10px] text-white/80">
        {metadata.width} × {metadata.height}
      </span>
    )}
    {metadata?.aspectRatio && (
      <span className="rounded bg-(--accent-bronze)/15 px-1.5 py-0.5 font-mono-tech text-[10px] text-(--accent-bronze)">
        {metadata.aspectRatio.toUpperCase()}
      </span>
    )}
    {metadata?.fileSize && (
      <span className="rounded bg-white/8 px-1.5 py-0.5 font-mono-tech text-[10px] text-white/60">
        {formatSize(metadata.fileSize)}
      </span>
    )}
    <span className="rounded bg-white/8 px-1.5 py-0.5 font-mono-tech text-[10px] text-white/50">
      {metadata ? "WebP • R2" : "Media"}
    </span>
  </div>
);

const MediaActionButtons: React.FC<Pick<Props, "url" | "onReplace" | "onRemove">> = ({
  url,
  onReplace,
  onRemove,
}) => (
  <div className="flex items-center gap-2">
    {url.startsWith("http") && (
      <a href={url} target="_blank" rel="noreferrer" className="text-white/40 hover:text-white">
        <ExternalLink className="h-3.5 w-3.5" />
      </a>
    )}
    <button type="button" onClick={onReplace} className="flex items-center gap-1 font-mono-tech text-[11px] text-(--accent-bronze) hover:underline focus:outline-hidden">
      <RefreshCw className="h-3 w-3" /> Thay đổi
    </button>
    <button type="button" onClick={onRemove} className="flex items-center gap-1 font-mono-tech text-[11px] text-red-400 hover:text-red-300 focus:outline-hidden">
      <Trash2 className="h-3 w-3" /> Xóa
    </button>
  </div>
);

export const MediaPreviewCard: React.FC<Props> = ({ url, metadata, onReplace, onRemove }) => (
  <div className="space-y-2 rounded-lg border border-white/10 bg-white/2 p-3">
    <div className="relative aspect-video max-h-48 w-full overflow-hidden rounded border border-white/10 bg-black/60">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={url}
        alt="Xem trước media"
        className="h-full w-full object-contain"
        onError={(e) => { (e.currentTarget as HTMLElement).style.display = "none"; }}
      />
    </div>
    <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
      <MediaMetaBadges metadata={metadata} />
      <MediaActionButtons url={url} onReplace={onReplace} onRemove={onRemove} />
    </div>
  </div>
);
