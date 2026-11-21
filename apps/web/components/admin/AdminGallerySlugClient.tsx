"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  ChevronDown,
  ChevronRight,
  Crosshair,
  GripVertical,
  LayoutGrid,
  MapPin,
  Save,
  Search,
  Trash2,
} from "lucide-react";
import type {
  BentoLayoutPreset,
  GalleryClusterConfig,
  GalleryFocalPoint,
  GalleryProject,
  ProjectGalleryResponse,
} from "@khangviet/types";
import {
  updateAdminGalleryClusters,
  updateAdminProject,
} from "@/lib/adminApi";
import {
  getProjectObjectPosition,
  resolveGalleryClusters,
} from "@/lib/galleryClusters";
import { BaseModal } from "@/components/ui/BaseModal";
import { AdminShell } from "./AdminShell";
import { FocalPointPicker } from "./FocalPointPicker";

interface AdminGallerySlugClientProps {
  initialData: ProjectGalleryResponse;
  slug: string;
}

const PRESET_OPTIONS: { id: BentoLayoutPreset; label: string; hint: string }[] = [
  { id: "hero-left", label: "1 Lớn trái + 2 Nhỏ", hint: "Ô #1 nổi bật bên trái" },
  {
    id: "asymmetric-mosaic",
    label: "Khảm bất đối xứng",
    hint: "2 ô trên + 2 ô dưới",
  },
  { id: "panoramic-trio", label: "3 Cột ngang", hint: "Trải đều 3 cột 5-4-3" },
  {
    id: "editorial-split",
    label: "Chia đôi Editorial",
    hint: "Ảnh lớn bên phải",
  },
];

type DragPayload =
  | { source: "panel"; projectId: string }
  | { source: "slot"; slotIndex: number; projectId: string };

export const AdminGallerySlugClient: React.FC<AdminGallerySlugClientProps> = ({
  initialData,
  slug,
}) => {
  const initialResolved = useMemo(
    () => resolveGalleryClusters(initialData),
    [initialData]
  );

  const [allClusters, setAllClusters] = useState<GalleryClusterConfig[]>(() => [
    ...initialResolved.partnerClusters.map((c, i) => ({
      ...c.config,
      sortOrder: i,
    })),
    ...initialResolved.solutionClusters.map((c, i) => ({
      ...c.config,
      sortOrder: i,
    })),
  ]);

  const [projects, setProjects] = useState<GalleryProject[]>(
    initialData.projects
  );
  const [search, setSearch] = useState("");
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});
  const [dragData, setDragData] = useState<DragPayload | null>(null);
  const [dragOverSlot, setDragOverSlot] = useState<number | null>(null);
  const [isTrashHover, setIsTrashHover] = useState(false);

  const [focalTarget, setFocalTarget] = useState<GalleryProject | null>(null);
  const [focalDraft, setFocalDraft] = useState<GalleryFocalPoint>({
    x: 50,
    y: 50,
  });

  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const currentCluster = useMemo(
    () => allClusters.find((c) => c.slug === slug) ?? allClusters[0],
    [allClusters, slug]
  );

  const projectMap = useMemo(
    () => new Map(projects.map((p) => [p.id, p])),
    [projects]
  );

  const filteredProjects = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return projects;
    return projects.filter((p) =>
      [p.title, p.location, p.code, p.client]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q))
    );
  }, [projects, search]);

  const slotCount =
    currentCluster?.layoutPreset === "panoramic-trio" ? 3 : 4;
  const slots: (GalleryProject | null)[] = Array.from(
    { length: slotCount },
    (_, idx) => {
      const pid = currentCluster?.slotProjectIds[idx];
      return pid ? projectMap.get(pid) ?? null : null;
    }
  );

  const updateCurrentCluster = (
    updater: (prev: GalleryClusterConfig) => GalleryClusterConfig
  ) => {
    if (!currentCluster) return;
    setAllClusters((prev) =>
      prev.map((c) => (c.id === currentCluster.id ? updater(c) : c))
    );
    setStatusMsg(null);
  };

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleDropOnSlot = (targetSlotIdx: number, e: React.DragEvent) => {
    e.preventDefault();
    setDragOverSlot(null);
    if (!currentCluster) return;

    let payload = dragData;
    if (!payload) {
      try {
        payload = JSON.parse(e.dataTransfer.getData("application/json"));
      } catch {
        return;
      }
    }
    if (!payload) return;

    updateCurrentCluster((prev) => {
      const nextIds = [...prev.slotProjectIds];
      while (nextIds.length <= targetSlotIdx) nextIds.push("");

      if (payload!.source === "panel") {
        const existingIdx = nextIds.indexOf(payload!.projectId);
        if (existingIdx !== -1 && existingIdx !== targetSlotIdx) {
          // Swap nếu dự án đã nằm ở ô khác trong cùng cụm
          const prevTarget = nextIds[targetSlotIdx];
          nextIds[targetSlotIdx] = payload!.projectId;
          nextIds[existingIdx] = prevTarget ?? "";
        } else {
          nextIds[targetSlotIdx] = payload!.projectId;
        }
      } else if (payload!.source === "slot") {
        const fromIdx = payload!.slotIndex;
        if (fromIdx !== targetSlotIdx) {
          const temp = nextIds[targetSlotIdx] ?? "";
          nextIds[targetSlotIdx] = nextIds[fromIdx] ?? "";
          nextIds[fromIdx] = temp;
        }
      }

      return {
        ...prev,
        slotProjectIds: nextIds.filter(Boolean),
      };
    });

    setDragData(null);
  };

  const handleDropOnTrash = (e: React.DragEvent) => {
    e.preventDefault();
    setIsTrashHover(false);
    if (!dragData || dragData.source !== "slot") {
      setDragData(null);
      return;
    }

    const removeIdx = dragData.slotIndex;
    updateCurrentCluster((prev) => ({
      ...prev,
      slotProjectIds: prev.slotProjectIds.filter((_, idx) => idx !== removeIdx),
    }));
    setDragData(null);
  };

  const handleSaveCluster = async () => {
    setSaving(true);
    setStatusMsg(null);
    const res = await updateAdminGalleryClusters(allClusters);
    setSaving(false);
    if (!res.success) {
      setStatusMsg({ type: "error", text: res.error });
      return;
    }
    setStatusMsg({
      type: "success",
      text: `Đã lưu bố cục cụm "${currentCluster?.title}" thành công!`,
    });
  };

  const handleSaveFocalPoint = async () => {
    if (!focalTarget) return;
    const updated: GalleryProject = { ...focalTarget, focalPoint: focalDraft };
    setProjects((prev) =>
      prev.map((p) => (p.id === focalTarget.id ? updated : p))
    );
    setFocalTarget(null);

    const res = await updateAdminProject(updated.id, {
      ...updated,
      focalPoint: focalDraft,
    });
    if (!res.success) {
      setStatusMsg({
        type: "error",
        text: `Đã cập nhật giao diện nhưng lưu API lỗi: ${res.error}`,
      });
    } else {
      setStatusMsg({
        type: "success",
        text: `Đã cập nhật điểm lấy nét cho "${updated.title}"`,
      });
    }
  };

  const getSlotSpanClass = (idx: number): string => {
    const preset = currentCluster?.layoutPreset ?? "hero-left";
    if (preset === "hero-left") {
      return idx === 0
        ? "md:col-span-7 md:row-span-2 min-h-80"
        : "md:col-span-5 min-h-44";
    }
    if (preset === "asymmetric-mosaic") {
      if (idx === 0) return "md:col-span-8 min-h-60";
      if (idx === 1) return "md:col-span-4 min-h-60";
      return "md:col-span-6 min-h-48";
    }
    if (preset === "panoramic-trio") {
      if (idx === 0) return "md:col-span-5 min-h-64";
      if (idx === 1) return "md:col-span-4 min-h-64";
      return "md:col-span-3 min-h-64";
    }
    // editorial-split
    return idx === 0
      ? "md:col-span-7 md:row-span-2 min-h-80 md:order-2"
      : "md:col-span-5 min-h-44 md:order-1";
  };

  if (!currentCluster) {
    return (
      <AdminShell title="Không tìm thấy cụm">
        <Link
          href="/admin/gallery"
          className="inline-flex items-center gap-2 text-sm font-semibold underline"
        >
          <ArrowLeft className="h-4 w-4" /> Quay lại danh sách cụm
        </Link>
      </AdminShell>
    );
  }

  return (
    <AdminShell>
      {/* Top Breadcrumb & Save Bar */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/gallery"
            className="inline-flex items-center gap-1.5 rounded-full border border-black/12 bg-white px-3.5 py-1.5 text-xs font-semibold text-[#1a1918] hover:border-[#1a1918]"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Tất cả cụm</span>
          </Link>
          <div>
            <h1 className="text-lg font-semibold text-[#1a1918]">
              {currentCluster.title}
            </h1>
            <p className="text-xs text-[#625f5a]">
              Kéo dự án từ danh sách trái vào ô Bento để đặt mới hoặc hoán đổi
              vị trí.
            </p>
          </div>
        </div>

        <button
          type="button"
          disabled={saving}
          onClick={handleSaveCluster}
          className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[#181715] px-5 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-(--accent-bronze) disabled:opacity-50"
        >
          <Save className="h-3.5 w-3.5" />
          <span>{saving ? "Đang lưu..." : "Lưu bố cục cụm"}</span>
        </button>
      </div>

      {statusMsg && (
        <div
          className={`mb-4 flex items-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-medium ${
            statusMsg.type === "success"
              ? "border-emerald-500/30 bg-emerald-50 text-emerald-800"
              : "border-red-500/30 bg-red-50 text-red-700"
          }`}
        >
          {statusMsg.type === "success" && <Check className="h-4 w-4 shrink-0" />}
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* Workspace Split: Left Project Panel + Right Bento Canvas */}
      <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-12">
        {/* Panel Trái: Danh sách toàn bộ dự án (Tên + Địa chỉ ngắn gọn, click để expand ảnh) */}
        <aside className="overflow-hidden rounded-2xl border border-black/10 bg-white lg:sticky lg:top-20 lg:col-span-4">
          <div className="border-b border-black/8 p-3.5">
            <div className="mb-2 text-xs font-semibold text-[#1a1918]">
              Kho dự án công ty ({filteredProjects.length})
            </div>
            <div className="relative">
              <Search className="absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-[#625f5a]" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm tên hoặc địa chỉ..."
                className="w-full rounded-xl border border-black/12 bg-[#faf9f6] py-2 pr-3 pl-8 text-xs outline-hidden focus:border-(--accent-bronze)"
              />
            </div>
          </div>

          <div className="max-h-[65vh] divide-y divide-black/8 overflow-y-auto">
            {filteredProjects.map((project) => {
              const isExpanded = Boolean(expandedIds[project.id]);
              const isInCluster = currentCluster.slotProjectIds.includes(
                project.id
              );

              return (
                <div
                  key={project.id}
                  draggable
                  onDragStart={(e) => {
                    const payload: DragPayload = {
                      source: "panel",
                      projectId: project.id,
                    };
                    setDragData(payload);
                    e.dataTransfer.setData(
                      "application/json",
                      JSON.stringify(payload)
                    );
                    e.dataTransfer.effectAllowed = "copyMove";
                  }}
                  onDragEnd={() => {
                    setDragData(null);
                    setDragOverSlot(null);
                  }}
                  className="cursor-grab bg-white transition-colors hover:bg-[#faf9f6] active:cursor-grabbing"
                >
                  <button
                    type="button"
                    onClick={() => toggleExpand(project.id)}
                    className="flex w-full cursor-pointer items-start gap-2.5 p-3 text-left"
                  >
                    <GripVertical className="mt-0.5 h-4 w-4 shrink-0 text-[#625f5a]/60" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="truncate text-xs font-semibold text-[#1a1918]">
                          {project.title}
                        </span>
                        {isInCluster && (
                          <span className="shrink-0 rounded-full bg-emerald-100 px-1.5 py-0.5 text-[9px] font-semibold text-emerald-700">
                            Đang dùng
                          </span>
                        )}
                      </div>
                      <div className="mt-0.5 flex items-center gap-1 text-[11px] text-[#625f5a]">
                        <MapPin className="h-3 w-3 shrink-0" />
                        <span className="truncate">{project.location}</span>
                      </div>
                    </div>
                    {isExpanded ? (
                      <ChevronDown className="mt-0.5 h-4 w-4 shrink-0 text-[#625f5a]" />
                    ) : (
                      <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-[#625f5a]" />
                    )}
                  </button>

                  {isExpanded && (
                    <div className="border-t border-black/6 bg-[#faf9f6] px-3 pt-2 pb-3">
                      <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-black/10 bg-[#eae5dc]">
                        <img
                          src={project.imgActual}
                          alt={project.title}
                          style={{
                            objectPosition: getProjectObjectPosition(project),
                          }}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="mt-1.5 flex items-center justify-between text-[10px] text-[#625f5a]">
                        <span className="font-mono">
                          {project.code ?? project.id}
                        </span>
                        <span>{project.category}</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </aside>

        {/* Canvas Chính Bên Phải */}
        <section className="rounded-2xl border border-black/10 bg-white p-4 sm:p-6 lg:col-span-8">
          {/* Góc trên trái Canvas: Nút đổi Layout Preset */}
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-black/8 pb-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1a1918]">
                <LayoutGrid className="h-4 w-4 text-(--accent-bronze)" />
                Kiểu bố cục:
              </span>
              <select
                value={currentCluster.layoutPreset}
                onChange={(e) =>
                  updateCurrentCluster((prev) => ({
                    ...prev,
                    layoutPreset: e.target.value as BentoLayoutPreset,
                  }))
                }
                className="cursor-pointer rounded-xl border border-black/15 bg-[#faf9f6] px-3 py-1.5 text-xs font-semibold text-[#1a1918] outline-hidden focus:border-(--accent-bronze)"
              >
                {PRESET_OPTIONS.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label} — {opt.hint}
                  </option>
                ))}
              </select>
            </div>

            <span className="text-[11px] text-[#625f5a]">
              Kéo ô ra ngoài xuống đáy để xóa
            </span>
          </div>

          {/* Bento Slots Grid */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
            {slots.map((project, idx) => {
              const isOver = dragOverSlot === idx;
              return (
                <div
                  key={idx}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOverSlot(idx);
                  }}
                  onDragLeave={() => setDragOverSlot(null)}
                  onDrop={(e) => handleDropOnSlot(idx, e)}
                  className={`relative flex flex-col justify-end overflow-hidden rounded-2xl border-2 transition-all ${getSlotSpanClass(
                    idx
                  )} ${
                    isOver
                      ? "border-(--accent-bronze) bg-(--accent-bronze)/10"
                      : project
                      ? "border-black/10 bg-[#181715]"
                      : "border-dashed border-black/20 bg-[#faf9f6]"
                  }`}
                >
                  {project ? (
                    <div
                      draggable
                      onDragStart={(e) => {
                        const payload: DragPayload = {
                          source: "slot",
                          slotIndex: idx,
                          projectId: project.id,
                        };
                        setDragData(payload);
                        e.dataTransfer.setData(
                          "application/json",
                          JSON.stringify(payload)
                        );
                        e.dataTransfer.effectAllowed = "move";
                      }}
                      onDragEnd={() => {
                        setDragData(null);
                        setDragOverSlot(null);
                        setIsTrashHover(false);
                      }}
                      className="group relative flex h-full w-full cursor-grab flex-col justify-end active:cursor-grabbing"
                    >
                      <img
                        src={project.imgActual}
                        alt={project.title}
                        style={{
                          objectPosition: getProjectObjectPosition(project),
                        }}
                        className="absolute inset-0 h-full w-full object-cover"
                      />
                      <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/25 to-black/15" />

                      <div className="relative z-10 flex items-center justify-between p-3.5">
                        <span className="rounded-full bg-black/65 px-2.5 py-0.5 font-mono text-[11px] font-semibold text-white backdrop-blur-xs">
                          Ô #{idx + 1}
                        </span>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setFocalTarget(project);
                            setFocalDraft(
                              project.focalPoint ?? { x: 50, y: 50 }
                            );
                          }}
                          title="Chỉnh điểm lấy nét ảnh"
                          className="inline-flex cursor-pointer items-center gap-1 rounded-full border border-white/25 bg-black/55 px-2.5 py-1 text-[10px] font-medium text-white backdrop-blur-xs hover:bg-(--accent-bronze)"
                        >
                          <Crosshair className="h-3 w-3" />
                          <span>Lấy nét</span>
                        </button>
                      </div>

                      <div className="relative z-10 mt-auto p-4 pt-8">
                        <div className="line-clamp-2 text-sm font-semibold text-white">
                          {project.title}
                        </div>
                        <div className="mt-1 truncate text-[11px] text-white/75">
                          {project.location}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex h-full flex-col items-center justify-center p-6 text-center">
                      <span className="rounded-full bg-black/5 px-2.5 py-0.5 font-mono text-[11px] font-semibold text-[#625f5a]">
                        Ô #{idx + 1} trống
                      </span>
                      <p className="mt-2 text-xs text-[#625f5a]">
                        Kéo dự án từ danh sách bên trái thả vào đây
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* Bottom Trash Dropzone (tự hiện khi đang kéo ô từ trong Canvas) */}
      {dragData?.source === "slot" && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsTrashHover(true);
          }}
          onDragLeave={() => setIsTrashHover(false)}
          onDrop={handleDropOnTrash}
          className={`fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-2xl border-2 px-7 py-4 shadow-2xl transition-all ${
            isTrashHover
              ? "scale-105 border-red-500 bg-red-600 text-white"
              : "border-red-500/60 bg-[#181715]/95 text-white backdrop-blur-md"
          }`}
        >
          <Trash2 className="h-5 w-5" />
          <span className="text-sm font-semibold">
            Thả vào đây để gỡ dự án khỏi bố cục cụm
          </span>
        </div>
      )}

      {/* Modal chỉnh Focal Point nhanh ngay trên Canvas */}
      <BaseModal
        isOpen={Boolean(focalTarget)}
        onClose={() => setFocalTarget(null)}
        maxWidth="max-w-lg"
        ariaLabel="Chỉnh điểm lấy nét ảnh"
      >
        {focalTarget && (
          <div className="space-y-4 bg-white p-6 text-[#1a1918]">
            <h3 className="text-base font-semibold">
              Điểm lấy nét — {focalTarget.title}
            </h3>
            <FocalPointPicker
              imageUrl={focalTarget.imgActual}
              value={focalDraft}
              onChange={setFocalDraft}
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setFocalTarget(null)}
                className="cursor-pointer rounded-xl border border-black/15 px-4 py-2 text-xs font-semibold text-[#625f5a]"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleSaveFocalPoint}
                className="cursor-pointer rounded-xl bg-[#181715] px-5 py-2 text-xs font-semibold text-white hover:bg-(--accent-bronze)"
              >
                Áp dụng điểm lấy nét
              </button>
            </div>
          </div>
        )}
      </BaseModal>
    </AdminShell>
  );
};

export default AdminGallerySlugClient;
