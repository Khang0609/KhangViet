"use client";

import type React from "react";
import { useState, useCallback } from "react";
import type { UploadState, MediaUploadResult } from "./types";
import {
  uploadFileToWorker,
  fetchExternalUrlFromWorker,
  extractImageFromPaste,
} from "./mediaUploadService";

/**
 * Media upload hook - delegates network operations to mediaUploadService:
 * - /upload?folder= via new FormData() and await fetch()
 * - /fetch-external and throw new Error
 */
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
