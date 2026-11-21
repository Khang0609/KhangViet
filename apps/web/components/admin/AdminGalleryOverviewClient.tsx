"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  Check,
  LayoutGrid,
  Save,
} from "lucide-react";
import type {
  ClusterSurfaceTone,
  GalleryClusterConfig,
  ProjectGalleryResponse,
} from "@khangviet/types";
import { updateAdminGalleryClusters } from "@/lib/adminApi";
import {
  getProjectObjectPosition,
  resolveGalleryClusters,
  type ResolvedGalleryCluster,
} from "@/lib/galleryClusters";
import { AdminShell } from "./AdminShell";

interface AdminGalleryOverviewClientProps {
  initialData: ProjectGalleryResponse;
}

const TONE_OPTIONS: { id: ClusterSurfaceTone; label: string; dot: string }[] = [
  { id: "ivory", label: "Sáng ngà", dot: "bg-[#faf9f6] border border-black/25" },
  { id: "stone", label: "Đá nhạt", dot: "bg-[#eae5dc] border border-black/25" },
  { id: "charcoal", label: "Than tối", dot: "bg-[#181715]" },
];

const PRESET_LABELS: Record<string, string> = {
  "hero-left": "1 Lớn trái + 2 Nhỏ",
  "asymmetric-mosaic": "Khảm bất đối xứng",
  "panoramic-trio": "3 Cột ngang",
  "editorial-split": "Chia đôi Editorial",
};

export const AdminGalleryOverviewClient: React.FC<
  AdminGalleryOverviewClientProps
> = ({ initialData }) => {
  const initialResolved = useMemo(
    () => resolveGalleryClusters(initialData),
    [initialData]
  );

  const [clusters, setClusters] = useState<GalleryClusterConfig[]>(() => [
    ...initialResolved.partnerClusters.map((c, i) => ({
      ...c.config,
      sortOrder: i,
    })),
    ...initialResolved.solutionClusters.map((c, i) => ({
      ...c.config,
      sortOrder: i,
    })),
  ]);

  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const projectMap = useMemo(
    () => new Map(initialData.projects.map((p) => [p.id, p])),
    [initialData.projects]
  );

  const partnerConfigs = useMemo(
    () =>
      clusters
        .filter((c) => c.groupType === "partner")
        .sort((a, b) => a.sortOrder - b.sortOrder),
    [clusters]
  );

  const solutionConfigs = useMemo(
    () =>
      clusters
        .filter((c) => c.groupType === "solution")
        .sort((a, b) => a.sortOrder - b.sortOrder),
    [clusters]
  );

  const moveCluster = (
    groupType: "partner" | "solution",
    index: number,
    direction: -1 | 1
  ) => {
    const list = groupType === "partner" ? [...partnerConfigs] : [...solutionConfigs];
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= list.length) return;

    const temp = list[index];
    list[index] = list[targetIdx];
    list[targetIdx] = temp;

    const reindexed = list.map((item, idx) => ({ ...item, sortOrder: idx }));
    setClusters((prev) => [
      ...prev.filter((c) => c.groupType !== groupType),
      ...reindexed,
    ]);
    setSavedMsg(null);
  };

  const changeTone = (clusterId: string, surfaceTone: ClusterSurfaceTone) => {
    setClusters((prev) =>
      prev.map((c) => (c.id === clusterId ? { ...c, surfaceTone } : c))
    );
    setSavedMsg(null);
  };

  const handleSaveAll = async () => {
    setSaving(true);
    setErrorMsg(null);
    setSavedMsg(null);
    const res = await updateAdminGalleryClusters(clusters);
    setSaving(false);
    if (!res.success) {
      setErrorMsg(res.error);
      return;
    }
    setSavedMsg("Đã lưu thứ tự & tông nền cho toàn bộ cụm Gallery!");
  };

  const renderSection = (
    heading: string,
    groupType: "partner" | "solution",
    items: GalleryClusterConfig[]
  ) => (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold tracking-wider text-[#625f5a] uppercase">
          {heading} ({items.length} cụm)
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((cfg, idx) => {
          const leadProjectId = cfg.slotProjectIds[0];
          const leadProject = leadProjectId
            ? projectMap.get(leadProjectId)
            : initialData.projects.find((p) =>
                groupType === "partner"
                  ? p.keyAccount === cfg.groupKey
                  : p.category === cfg.groupKey
              );

          return (
            <div
              key={cfg.id}
              className="flex flex-col overflow-hidden rounded-2xl border border-black/10 bg-white shadow-xs transition-shadow hover:shadow-md"
            >
              {/* YouTube-style Cluster Thumbnail */}
              <Link
                href={`/admin/gallery/${cfg.slug}`}
                className="group relative aspect-video w-full overflow-hidden bg-[#eae5dc]"
              >
                {leadProject ? (
                  <img
                    src={leadProject.imgActual}
                    alt={cfg.title}
                    style={{
                      objectPosition: getProjectObjectPosition(leadProject),
                    }}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-[#625f5a]">
                    Chưa có ảnh đại diện
                  </div>
                )}

                <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-linear-to-t from-black/80 to-transparent px-3.5 py-2.5 text-white">
                  <span className="inline-flex items-center gap-1 rounded-md bg-black/55 px-2 py-0.5 text-[11px] font-medium backdrop-blur-xs">
                    <LayoutGrid className="h-3 w-3" />
                    {PRESET_LABELS[cfg.layoutPreset] ?? cfg.layoutPreset}
                  </span>
                  <span className="font-mono text-[11px] font-semibold">
                    {cfg.slotProjectIds.length} ô
                  </span>
                </div>
              </Link>

              {/* Card Body */}
              <div className="flex flex-1 flex-col justify-between p-4">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-sm font-semibold text-[#1a1918]">
                        {cfg.title}
                      </h3>
                      {cfg.subtitle && (
                        <p className="mt-0.5 line-clamp-1 text-xs text-[#625f5a]">
                          {cfg.subtitle}
                        </p>
                      )}
                    </div>

                    {/* Reorder Up/Down */}
                    <div className="flex shrink-0 items-center gap-1">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => moveCluster(groupType, idx, -1)}
                        title="Đưa lên"
                        className="cursor-pointer rounded-lg border border-black/10 p-1 text-[#625f5a] hover:border-[#1a1918] hover:text-[#1a1918] disabled:opacity-30"
                      >
                        <ArrowUp className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={idx === items.length - 1}
                        onClick={() => moveCluster(groupType, idx, 1)}
                        title="Đưa xuống"
                        className="cursor-pointer rounded-lg border border-black/10 p-1 text-[#625f5a] hover:border-[#1a1918] hover:text-[#1a1918] disabled:opacity-30"
                      >
                        <ArrowDown className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Surface Tone Picker */}
                  <div className="mt-3.5 flex items-center gap-1.5">
                    {TONE_OPTIONS.map((tone) => {
                      const active = cfg.surfaceTone === tone.id;
                      return (
                        <button
                          key={tone.id}
                          type="button"
                          onClick={() => changeTone(cfg.id, tone.id)}
                          className={`inline-flex cursor-pointer items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors ${
                            active
                              ? "border-[#181715] bg-[#181715] text-white"
                              : "border-black/10 bg-[#faf9f6] text-[#625f5a] hover:text-[#1a1918]"
                          }`}
                        >
                          <span className={`h-2 w-2 rounded-full ${tone.dot}`} />
                          <span>{tone.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <Link
                  href={`/admin/gallery/${cfg.slug}`}
                  className="mt-4 inline-flex items-center justify-between rounded-xl border border-black/12 bg-[#faf9f6] px-3.5 py-2 text-xs font-semibold text-[#1a1918] transition-colors hover:border-[#181715] hover:bg-[#181715] hover:text-white"
                >
                  <span>Sắp xếp bố cục Bento</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );

  return (
    <AdminShell
      title="Quản lý Bố cục Gallery"
      subtitle="Tổng quan các cụm hiển thị trên trang /projects — sắp xếp thứ tự cụm, chọn tông nền hoặc bấm vào từng cụm để kéo-thả dự án."
    >
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="text-xs text-[#625f5a]">
          Thay đổi thứ tự cụm hoặc tông nền sẽ có hiệu lực ngay sau khi nhấn{" "}
          <span className="font-semibold text-[#1a1918]">Lưu thứ tự</span>.
        </div>

        <button
          type="button"
          disabled={saving}
          onClick={handleSaveAll}
          className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[#181715] px-5 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-(--accent-bronze) disabled:opacity-50"
        >
          <Save className="h-3.5 w-3.5" />
          <span>{saving ? "Đang lưu..." : "Lưu thứ tự & tông nền"}</span>
        </button>
      </div>

      {savedMsg && (
        <div className="mb-5 flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-50 px-4 py-2.5 text-xs font-medium text-emerald-800">
          <Check className="h-4 w-4 shrink-0" />
          <span>{savedMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="mb-5 rounded-xl border border-red-500/30 bg-red-50 px-4 py-2.5 text-xs font-medium text-red-700">
          {errorMsg}
        </div>
      )}

      <div className="space-y-10">
        {renderSection("Phần 01 · Đối tác chiến lược", "partner", partnerConfigs)}
        {renderSection("Phần 02 · Giải pháp kỹ thuật", "solution", solutionConfigs)}
      </div>
    </AdminShell>
  );
};

export default AdminGalleryOverviewClient;
