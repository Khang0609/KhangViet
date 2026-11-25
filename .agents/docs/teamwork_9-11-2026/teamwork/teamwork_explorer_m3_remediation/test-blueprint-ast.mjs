import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const ts = require(path.resolve(process.cwd(), "node_modules/.pnpm/typescript@5.9.3/node_modules/typescript"));

const proposedUseMediaUpload = `"use client";

import { useState, useCallback } from "react";
import type { UploadState, MediaUploadResult } from "./types";
import {
  uploadFileToWorker,
  fetchExternalUrlFromWorker,
  extractImageFromPaste,
} from "./mediaUploadService";

function useUploadState() {
  const [uploadState, setUploadState] = useState<UploadState>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [result, setResult] = useState<MediaUploadResult | null>(null);

  const runTask = useCallback(async (task: () => Promise<MediaUploadResult>) => {
    setUploadState("uploading");
    setErrorMessage("");
    try {
      const res = await task();
      setResult(res);
      setUploadState("success");
      return res;
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Thao tác thất bại");
      setUploadState("error");
      return null;
    }
  }, []);

  const fail = useCallback((msg: string) => { setErrorMessage(msg); setUploadState("error"); }, []);
  const reset = useCallback(() => { setUploadState("idle"); setErrorMessage(""); setResult(null); }, []);
  return { uploadState, errorMessage, result, runTask, fail, reset };
}

export function useMediaUpload() {
  const { uploadState, errorMessage, result, runTask, fail, reset } = useUploadState();

  const handleFileUpload = useCallback(async (file: File | Blob, folder = "projects") => {
    if (file.size > 10 * 1024 * 1024) { fail("Dung lượng vượt quá 10MB"); return null; }
    return runTask(() => uploadFileToWorker(file, folder));
  }, [runTask, fail]);

  const handleUrlFetch = useCallback(async (url: string, folder = "projects") => {
    if (!url.trim().startsWith("http")) { fail("Yêu cầu URL http hoặc https hợp lệ"); return null; }
    return runTask(() => fetchExternalUrlFromWorker(url, folder));
  }, [runTask, fail]);

  const handlePaste = useCallback((e: React.ClipboardEvent, folder = "projects") => {
    const p = extractImageFromPaste(e);
    if (!p) return;
    e.preventDefault();
    if (p.type === "file") handleFileUpload(p.file, folder);
    else handleUrlFetch(p.url, folder);
  }, [handleFileUpload, handleUrlFetch]);

  return { uploadState, errorMessage, result, handleFileUpload, handleUrlFetch, handlePaste, reset };
}
`;

const proposedMediaUploadService = `import { type MediaUploadResult, toMediaResult } from "./types";

export function getMediaWorkerUrl(): string {
  return process.env.NEXT_PUBLIC_MEDIA_WORKER_URL || "http://127.0.0.1:8788";
}

export async function uploadFileToWorker(
  file: File | Blob,
  folder = "projects"
): Promise<MediaUploadResult> {
  const fd = new FormData();
  fd.append("file", file);
  const endpoint = \`\${getMediaWorkerUrl()}/upload?folder=\${encodeURIComponent(folder)}\`;
  const res = await fetch(endpoint, { method: "POST", body: fd });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error?.message || "Tải ảnh thất bại");
  }
  return toMediaResult(json.data);
}

export async function fetchExternalUrlFromWorker(
  url: string,
  folder = "projects"
): Promise<MediaUploadResult> {
  const endpoint = \`\${getMediaWorkerUrl()}/fetch-external\`;
  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url: url.trim(), folder }),
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error?.message || "Nạp ảnh từ URL thất bại");
  }
  return toMediaResult(json.data);
}

export function extractImageFromPaste(
  e: React.ClipboardEvent
): { type: "file"; file: File } | { type: "url"; url: string } | null {
  const items = e.clipboardData?.items;
  if (items) {
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith("image/")) {
        const file = items[i].getAsFile();
        if (file) return { type: "file", file };
      }
    }
  }
  const text = e.clipboardData?.getData("text")?.trim();
  if (text && /^https?:\\/\\/.+/i.test(text)) {
    return { type: "url", url: text };
  }
  return null;
}
`;

const proposedMediaDropzoneView = `"use client";

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
      className={\`relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors focus:outline-hidden \${borderClass}\`}
    >
      <DropzoneFileInput ref={fileInputRef} onSelect={onFileSelected} />
      {isUploading ? <DropzoneUploading /> : <DropzoneIdle onBrowse={() => fileInputRef.current?.click()} />}
    </div>
  );
};
`;

const proposedMediaUrlFetchBar = `"use client";

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
`;

const proposedUniversalMediaUpload = `"use client";

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
    <div className={\`space-y-2 \${className || ""}\`}>
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
`;

const snippets = [
  { name: "mediaUploadService.ts", code: proposedMediaUploadService, isTsx: false },
  { name: "useMediaUpload.ts", code: proposedUseMediaUpload, isTsx: false },
  { name: "MediaDropzoneView.tsx", code: proposedMediaDropzoneView, isTsx: true },
  { name: "MediaUrlFetchBar.tsx", code: proposedMediaUrlFetchBar, isTsx: true },
  { name: "UniversalMediaUpload.tsx", code: proposedUniversalMediaUpload, isTsx: true },
];

let totalViolations = 0;

for (const { name, code, isTsx } of snippets) {
  const sf = ts.createSourceFile(name, code, ts.ScriptTarget.Latest, true, isTsx ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
  const totalLines = code.split(/\r?\n/).length;
  console.log(`\nChecking snippet: ${name} (${totalLines} lines, max <= 100: ${totalLines <= 100 ? "PASS" : "FAIL"})`);
  if (totalLines > 100) totalViolations++;

  function getFunctionName(node) {
    if (node.name && ts.isIdentifier(node.name)) return node.name.text;
    if (ts.isVariableDeclaration(node.parent) && ts.isIdentifier(node.parent.name)) return node.parent.name.text;
    if (ts.isPropertyAssignment(node.parent) && ts.isIdentifier(node.parent.name)) return node.parent.name.text;
    return "<anonymous>";
  }

  function visit(node) {
    if (ts.isFunctionDeclaration(node) || ts.isFunctionExpression(node) || ts.isArrowFunction(node) || ts.isMethodDeclaration(node)) {
      const start = sf.getLineAndCharacterOfPosition(node.getStart(sf));
      const end = sf.getLineAndCharacterOfPosition(node.getEnd());
      const startLine = start.line + 1;
      const endLine = end.line + 1;
      const lineSpan = endLine - startLine + 1;
      const funcName = getFunctionName(node);
      const pass = lineSpan <= 35;
      console.log(`  [${pass ? "PASS" : "FAIL"}] ${funcName} (L${startLine}-L${endLine}, ${lineSpan} lines, limit <= 35)`);
      if (!pass) totalViolations++;
    }
    ts.forEachChild(node, visit);
  }
  visit(sf);
}

console.log(`\nTotal Violations in Blueprint: ${totalViolations}`);
process.exit(totalViolations === 0 ? 0 : 1);
