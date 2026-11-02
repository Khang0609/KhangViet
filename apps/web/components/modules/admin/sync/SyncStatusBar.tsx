"use client";

import React, { useState, useEffect } from "react";
import { RefreshCw } from "lucide-react";
import type { SyncStatus } from "@khangviet/types";
import { getSyncStatus, applyPendingChanges } from "./syncService";

export const SyncStatusBar: React.FC = () => {
  const [status, setStatus] = useState<SyncStatus | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getSyncStatus().then((res) => {
      if (active && res.success) setStatus(res.data);
    });

    const timer = setInterval(() => {
      getSyncStatus().then((res) => {
        if (active && res.success) setStatus(res.data);
      });
    }, 30000);

    return () => {
      active = false;
      clearInterval(timer);
    };
  }, []);

  const handlePublish = async () => {
    setIsPublishing(true);
    setMessage(null);
    const res = await applyPendingChanges();
    if (res.success) {
      const msg =
        res.data.appliedCount > 0
          ? `Đã xuất bản ${res.data.appliedCount} thay đổi chờ duyệt!`
          : "Đã làm mới cache (Mọi thay đổi đã lưu trực tiếp)!";
      setMessage(msg);
      const refresh = await getSyncStatus();
      if (refresh.success) setStatus(refresh.data);
    } else {
      setMessage(`Thao tác thất bại: ${res.error}`);
    }
    setIsPublishing(false);
  };

  const pendingCount = status?.pendingCount ?? 0;

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-white/8 bg-(--bg-surface) px-5 py-3">
      <div className="flex items-center gap-3">
        <div
          className={`h-2.5 w-2.5 rounded-full ${pendingCount > 0 ? "bg-brand animate-pulse" : "bg-emerald-500"}`}
        />
        <span className="font-mono-tech text-xs tracking-wider text-white/70 uppercase">
          On-demand ISR:
        </span>
        <span className="font-mono-tech text-xs text-(--text-secondary)">
          {pendingCount > 0
            ? `${pendingCount} thay đổi chờ duyệt`
            : "Hệ thống đồng bộ trực tiếp"}
        </span>
        {message && (
          <span className="ml-2 font-sans text-xs text-(--accent-bronze)">
            {message}
          </span>
        )}
      </div>

      <button
        onClick={handlePublish}
        disabled={isPublishing}
        className="flex items-center gap-2 rounded border border-white/10 bg-white/4 px-3 py-1.5 font-mono-tech text-xs text-(--text-primary) transition-all hover:border-(--accent-bronze) hover:bg-white/8 disabled:opacity-50"
      >
        <RefreshCw
          className={`h-3.5 w-3.5 ${isPublishing ? "animate-spin" : ""}`}
        />
        <span>
          {isPublishing ? "Đang đồng bộ..." : "Xuất Bản Ngay (Revalidate)"}
        </span>
      </button>
    </div>
  );
};

export default SyncStatusBar;
