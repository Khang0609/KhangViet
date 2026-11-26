"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowDown, ArrowRight, ArrowUp, Check, Save } from "lucide-react";
import type {
  GalleryClusterConfig,
  ProjectGalleryResponse,
} from "@khangviet/types";
import { updateAdminGalleryClusters } from "@/lib/adminApi";
import { resolveGalleryClusters } from "@/lib/galleryClusters";
import { AdminShell } from "./AdminShell";

interface AdminGalleryOverviewClientProps {
  initialData: ProjectGalleryResponse;
}

export const AdminGalleryOverviewClient: React.FC<
  AdminGalleryOverviewClientProps
> = ({ initialData }) => {
  const initialResolved = useMemo(
    () => resolveGalleryClusters(initialData),
    [initialData]
  );

  const [clusters, setClusters] = useState<GalleryClusterConfig[]>(() =>
    initialData.clusters.length > 0
      ? [...initialData.clusters].sort((a, b) => a.sortOrder - b.sortOrder)
      : initialResolved.solutionClusters.map((c, i) => ({
          id: c.config.id,
          serviceSlug: c.config.serviceSlug,
          title: c.config.title,
          subtitle: c.config.subtitle,
          sortOrder: i,
          maxItems: c.config.maxItems,
        }))
  );

  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const moveCluster = (index: number, direction: -1 | 1) => {
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= clusters.length) return;
    const next = [...clusters];
    const tmp = next[index];
    next[index] = next[targetIdx];
    next[targetIdx] = tmp;
    setClusters(next.map((c, idx) => ({ ...c, sortOrder: idx })));
  };

  const handleSave = async () => {
    setSaving(true);
    setSavedMsg(null);
    setErrorMsg(null);
    const res = await updateAdminGalleryClusters(clusters);
    setSaving(false);
    if (!res.success) {
      setErrorMsg(res.error);
      return;
    }
    setSavedMsg("Đã lưu thứ tự các cụm Gallery.");
  };

  return (
    <AdminShell
      title="Bố cục Trang Gallery"
      subtitle="Sắp xếp thứ tự các nhóm dịch vụ và xem danh sách dự án theo từng cụm."
    >
      <div className="mb-6 flex items-center justify-between gap-4">
        <p className="text-xs text-[#625f5a]">
          Tổng số {clusters.length} cụm giải pháp &amp;{" "}
          {initialResolved.partnerClusters.length} đối tác có dự án.
        </p>
        <button
          type="button"
          disabled={saving}
          onClick={handleSave}
          className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-[#181715] px-5 py-2.5 text-xs font-semibold text-white hover:bg-(--accent-bronze) disabled:opacity-60"
        >
          <Save className="h-3.5 w-3.5" />
          <span>{saving ? "Đang lưu..." : "Lưu thứ tự"}</span>
        </button>
      </div>

      {savedMsg && (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-emerald-500/25 bg-emerald-50 px-4 py-3 text-xs font-medium text-emerald-700">
          <Check className="h-4 w-4" />
          {savedMsg}
        </div>
      )}
      {errorMsg && (
        <div className="mb-4 rounded-xl border border-red-500/25 bg-red-50 px-4 py-3 text-xs font-medium text-red-700">
          {errorMsg}
        </div>
      )}

      <div className="space-y-3">
        {clusters.map((cluster, idx) => (
          <div
            key={cluster.id}
            className="flex items-center justify-between gap-4 rounded-2xl border border-black/10 bg-white p-4"
          >
            <div>
              <div className="text-sm font-semibold text-[#1a1918]">
                {idx + 1}. {cluster.title}
              </div>
              <div className="text-xs text-[#625f5a]">
                Slug: {cluster.serviceSlug} • Tối đa {cluster.maxItems} dự án
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => moveCluster(idx, -1)}
                disabled={idx === 0}
                className="cursor-pointer rounded-full border border-black/12 p-2 text-[#1a1918] disabled:opacity-30"
                aria-label="Lên"
              >
                <ArrowUp className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => moveCluster(idx, 1)}
                disabled={idx === clusters.length - 1}
                className="cursor-pointer rounded-full border border-black/12 p-2 text-[#1a1918] disabled:opacity-30"
                aria-label="Xuống"
              >
                <ArrowDown className="h-3.5 w-3.5" />
              </button>
              <Link
                href={`/admin/gallery/${cluster.serviceSlug}`}
                className="inline-flex items-center gap-1 rounded-full bg-[#faf9f6] px-3.5 py-2 text-xs font-semibold text-[#1a1918] hover:bg-[#181715] hover:text-white"
              >
                <span>Chi tiết</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </AdminShell>
  );
};

export default AdminGalleryOverviewClient;
