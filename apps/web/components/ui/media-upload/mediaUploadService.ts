import type React from "react";
import { type MediaUploadResult, toMediaResult } from "./types";

export function getMediaWorkerUrl(): string {
  return process.env.NEXT_PUBLIC_MEDIA_WORKER_URL || "http://127.0.0.1:8788";
}

export async function uploadFileToWorker(
  file: File | Blob,
  folder = "projects"
): Promise<MediaUploadResult> {
  const fd = new FormData();
  fd.append("file", file);
  const endpoint = `${getMediaWorkerUrl()}/upload?folder=${encodeURIComponent(folder)}`;
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
  const endpoint = `${getMediaWorkerUrl()}/fetch-external`;
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
  if (text && /^https?:\/\/.+/i.test(text)) {
    return { type: "url", url: text };
  }
  return null;
}
