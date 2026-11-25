"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  ExternalLink,
  ImagePlus,
  Layers,
  Plus,
  Star,
  Trash2,
} from "lucide-react";
import type {
  GalleryProject,
  Project,
  ProjectMedia,
  ProjectMediaKind,
} from "@khangviet/types";
import {
  addAdminProjectMedia,
  deleteAdminProjectMedia,
  getAdminProjects,
  setAdminProjectComparison,
} from "@/lib/adminApi";
import { AdminShell } from "./AdminShell";

interface AdminProjectMediaClientProps {
  initialProjects: GalleryProject[];
  slug: string;
}

const KIND_LABELS: Record<ProjectMediaKind, string> = {
  GALLERY: "Thư viện (Gallery)",
  RENDER: "Thiết kế 3D (Render)",
  ACTUAL: "Thi công thực tế (Actual)",
  HERO: "Ảnh Hero",
};

const KIND_BADGE_CLASS: Record<ProjectMediaKind, string> = {
  GALLERY: "bg-black/5 text-[#1a1918]",
  RENDER: "bg-amber-50 text-amber-800 border border-amber-500/20",
  ACTUAL: "bg-emerald-50 text-emerald-800 border border-emerald-500/20",
  HERO: "bg-sky-50 text-sky-800 border border-sky-500/20",
};

function toEditableProject(p: Project | GalleryProject): Project {
  const media: ProjectMedia[] = (p.media ?? []).map((m) => ({
    ...m,
    projectId: p.id,
  }));
  return {
    id: p.id,
    slug: p.slug,
    title: p.title,
    summary: p.summary ?? null,
    organizationId: p.organization?.id ?? null,
    year: p.year ?? null,
    publishStatus: p.publishStatus,
    isFeatured: p.isFeatured,
    featuredOrder: p.featuredOrder,
    createdAt: "createdAt" in p ? p.createdAt : 0,
    updatedAt: "updatedAt" in p ? p.updatedAt : 0,
    organization: p.organization ?? null,
    services: p.services ?? [],
    media,
    comparisons: p.comparisons ?? [],
  };
}

export const AdminProjectMediaClient: React.FC<AdminProjectMediaClientProps> = ({
  initialProjects,
  slug: propSlug,
}) => {
  const params = useParams<{ slug?: string }>();
  const activeSlug = params?.slug || propSlug;

  const [projects, setProjects] = useState<Project[]>(() =>
    initialProjects.map(toEditableProject)
  );
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Add media form state
  const [storageKey, setStorageKey] = useState("");
  const [kind, setKind] = useState<ProjectMediaKind>("GALLERY");
  const [caption, setCaption] = useState("");
  const [isCover, setIsCover] = useState(false);
  const [submittingMedia, setSubmittingMedia] = useState(false);

  // Comparison state
  const [renderMediaId, setRenderMediaId] = useState("");
  const [actualMediaId, setActualMediaId] = useState("");
  const [savingComparison, setSavingComparison] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      const res = await getAdminProjects();
      if (!active) return;
      if (res.success) {
        setProjects(res.data.map(toEditableProject));
      }
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, []);

  const project = useMemo(
    () => projects.find((p) => p.slug === activeSlug) ?? null,
    [projects, activeSlug]
  );

  const mediaList = useMemo(() => {
    const items = project?.media ?? [];
    return [...items].sort((a, b) => a.sortOrder - b.sortOrder);
  }, [project]);

  useEffect(() => {
    if (!project) return;
    const existing = project.comparisons?.[0];
    if (existing) {
      setRenderMediaId(existing.renderMediaId);
      setActualMediaId(existing.actualMediaId);
      return;
    }
    const defaultRender = mediaList.find((m) => m.kind === "RENDER")?.id ?? "";
    const defaultActual =
      mediaList.find((m) => m.kind === "ACTUAL")?.id ??
      mediaList.find((m) => m.isCover)?.id ??
      "";
    setRenderMediaId(defaultRender);
    setActualMediaId(defaultActual);
  }, [project, mediaList]);

  const selectedRenderMedia = mediaList.find((m) => m.id === renderMediaId);
  const selectedActualMedia = mediaList.find((m) => m.id === actualMediaId);

  const handleAddMedia = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project || !storageKey.trim()) return;

    setSubmittingMedia(true);
    setFeedback(null);

    const res = await addAdminProjectMedia(project.id, {
      kind,
      storageKey: storageKey.trim(),
      caption: caption.trim() || null,
      altText: caption.trim() || project.title,
      sortOrder: mediaList.length,
      isCover,
    });

    setSubmittingMedia(false);

    if (!res.success) {
      setFeedback({ type: "error", text: res.error });
      return;
    }

    setProjects((prev) =>
      prev.map((p) => {
        if (p.id !== project.id) return p;
        const nextMedia = [...(p.media ?? []), res.data];
        return { ...p, media: nextMedia };
      })
    );
    setStorageKey("");
    setCaption("");
    setIsCover(false);
    setFeedback({ type: "success", text: "Đã thêm ảnh vào dự án." });
  };

  const handleDeleteMedia = async (mediaId: string) => {
    if (!project) return;
    if (!window.confirm("Xóa ảnh này khỏi dự án?")) return;

    setFeedback(null);
    const res = await deleteAdminProjectMedia(mediaId);
    if (!res.success) {
      setFeedback({ type: "error", text: res.error });
      return;
    }

    setProjects((prev) =>
      prev.map((p) => {
        if (p.id !== project.id) return p;
        return {
          ...p,
          media: (p.media ?? []).filter((m) => m.id !== mediaId),
          comparisons: (p.comparisons ?? []).filter(
            (c) => c.renderMediaId !== mediaId && c.actualMediaId !== mediaId
          ),
        };
      })
    );
    if (renderMediaId === mediaId) setRenderMediaId("");
    if (actualMediaId === mediaId) setActualMediaId("");
    setFeedback({ type: "success", text: "Đã xóa ảnh." });
  };

  const handleSaveComparison = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project) return;
    if (!renderMediaId || !actualMediaId) {
      setFeedback({
        type: "error",
        text: "Vui lòng chọn đủ cả ảnh 3D Render và ảnh Thực tế.",
      });
      return;
    }

    setSavingComparison(true);
    setFeedback(null);
    const res = await setAdminProjectComparison(
      project.id,
      renderMediaId,
      actualMediaId
    );
    setSavingComparison(false);

    if (!res.success) {
      setFeedback({ type: "error", text: res.error });
      return;
    }

    setProjects((prev) =>
      prev.map((p) =>
        p.id === project.id ? { ...p, comparisons: [res.data] } : p
      )
    );
    setFeedback({
      type: "success",
      text: "Đã lưu cặp ảnh so sánh 3D vs Thực tế.",
    });
  };

  return (
    <AdminShell
      title={project ? project.title : `Dự án /${activeSlug}`}
      subtitle="Quản lý thư viện ảnh và cặp so sánh 3D vs Thực tế của dự án."
    >
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/admin/projects"
          className="inline-flex items-center gap-2 rounded-full border border-black/12 bg-white px-4 py-2 text-xs font-semibold text-[#1a1918] transition-colors hover:bg-[#faf9f6]"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Quay lại danh sách dự án</span>
        </Link>

        {project && (
          <div className="flex flex-wrap items-center gap-2">
            {project.organization && (
              <span className="rounded-full bg-[#eae5dc] px-3 py-1 text-xs font-medium text-[#1a1918]">
                {project.organization.name}
              </span>
            )}
            <span
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                project.publishStatus === "PUBLISHED"
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-black/5 text-[#625f5a]"
              }`}
            >
              {project.publishStatus}
            </span>
            {project.publishStatus === "PUBLISHED" && (
              <Link
                href={`/projects/${project.slug}`}
                target="_blank"
                className="inline-flex items-center gap-1.5 rounded-full border border-black/12 bg-white px-3.5 py-1.5 text-xs font-semibold text-[#1a1918] transition-colors hover:border-(--accent-bronze)"
              >
                <span>Xem trang công khai</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </Link>
            )}
          </div>
        )}
      </div>

      {feedback && (
        <div
          className={`mb-5 rounded-xl border px-4 py-2.5 text-xs font-medium ${
            feedback.type === "success"
              ? "border-emerald-500/25 bg-emerald-50 text-emerald-700"
              : "border-red-500/25 bg-red-50 text-red-700"
          }`}
        >
          {feedback.text}
        </div>
      )}

      {!project ? (
        <div className="rounded-2xl border border-black/10 bg-white p-10 text-center text-sm text-[#625f5a]">
          {loading
            ? "Đang tải dữ liệu dự án..."
            : `Không tìm thấy dự án có đường dẫn "${activeSlug}".`}
        </div>
      ) : (
        <div className="space-y-8">
          {/* Section 1: Add Media & Gallery */}
          <section className="rounded-2xl border border-black/10 bg-white p-5 sm:p-6">
            <div className="mb-4 flex items-center gap-2">
              <ImagePlus className="h-4 w-4 text-(--accent-bronze)" />
              <h2 className="text-base font-semibold text-[#1a1918]">
                Thư viện ảnh dự án ({mediaList.length})
              </h2>
            </div>

            <form
              onSubmit={handleAddMedia}
              className="mb-6 grid gap-3 rounded-xl border border-black/8 bg-[#faf9f6] p-4 md:grid-cols-12 md:items-end"
            >
              <div className="md:col-span-5">
                <label className="mb-1 block text-xs font-medium text-[#625f5a]">
                  Đường dẫn ảnh (URL hoặc /images/projects/...)
                </label>
                <input
                  type="text"
                  required
                  value={storageKey}
                  onChange={(e) => setStorageKey(e.target.value)}
                  placeholder="/images/projects/bidv-mat-tien.jpg"
                  className="w-full rounded-xl border border-black/12 bg-white px-3.5 py-2 text-xs outline-hidden focus:border-(--accent-bronze)"
                />
              </div>

              <div className="md:col-span-3">
                <label className="mb-1 block text-xs font-medium text-[#625f5a]">
                  Phân loại ảnh
                </label>
                <select
                  value={kind}
                  onChange={(e) => setKind(e.target.value as ProjectMediaKind)}
                  className="w-full rounded-xl border border-black/12 bg-white px-3 py-2 text-xs outline-hidden focus:border-(--accent-bronze)"
                >
                  {(Object.keys(KIND_LABELS) as ProjectMediaKind[]).map((k) => (
                    <option key={k} value={k}>
                      {KIND_LABELS[k]}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="mb-1 block text-xs font-medium text-[#625f5a]">
                  Ghi chú (tuỳ chọn)
                </label>
                <input
                  type="text"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Mặt tiền chính..."
                  className="w-full rounded-xl border border-black/12 bg-white px-3 py-2 text-xs outline-hidden focus:border-(--accent-bronze)"
                />
              </div>

              <div className="flex items-center justify-between gap-2 md:col-span-2">
                <label className="inline-flex cursor-pointer items-center gap-1.5 text-xs font-medium text-[#1a1918]">
                  <input
                    type="checkbox"
                    checked={isCover}
                    onChange={(e) => setIsCover(e.target.checked)}
                    className="h-3.5 w-3.5 rounded accent-[#181715]"
                  />
                  <span>Ảnh bìa</span>
                </label>

                <button
                  type="submit"
                  disabled={submittingMedia}
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-[#181715] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-(--accent-bronze) disabled:opacity-50"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>{submittingMedia ? "Đang thêm..." : "Thêm"}</span>
                </button>
              </div>
            </form>

            {mediaList.length === 0 ? (
              <div className="rounded-xl border border-dashed border-black/15 py-10 text-center text-xs text-[#625f5a]">
                Chưa có ảnh nào cho dự án này. Hãy thêm ảnh ở biểu mẫu phía trên.
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {mediaList.map((item) => (
                  <div
                    key={item.id}
                    className="group overflow-hidden rounded-xl border border-black/10 bg-white"
                  >
                    <div className="relative aspect-4/3 bg-[#eae5dc]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.storageKey}
                        alt={item.altText || project.title}
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${KIND_BADGE_CLASS[item.kind]}`}
                        >
                          {item.kind}
                        </span>
                        {item.isCover && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-[#181715] px-2.5 py-0.5 text-[10px] font-semibold text-white">
                            <Star className="h-2.5 w-2.5 fill-current" />
                            <span>Ảnh bìa</span>
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-2 p-3">
                      <div className="min-w-0">
                        <div className="truncate text-xs font-medium text-[#1a1918]">
                          {item.caption || item.altText || "Không có ghi chú"}
                        </div>
                        <div className="truncate font-mono text-[10px] text-[#625f5a]">
                          {item.storageKey}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeleteMedia(item.id)}
                        title="Xóa ảnh"
                        className="shrink-0 cursor-pointer rounded-lg p-1.5 text-[#625f5a] transition-colors hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Section 2: 3D vs Actual Comparison */}
          <section className="rounded-2xl border border-black/10 bg-white p-5 sm:p-6">
            <div className="mb-4 flex items-center gap-2">
              <Layers className="h-4 w-4 text-(--accent-bronze)" />
              <h2 className="text-base font-semibold text-[#1a1918]">
                Cặp so sánh Thiết kế 3D vs Thi công thực tế
              </h2>
            </div>

            {mediaList.length < 2 ? (
              <p className="text-xs text-[#625f5a]">
                Cần ít nhất 2 ảnh trong thư viện dự án để ghép cặp so sánh 3D vs
                Thực tế.
              </p>
            ) : (
              <form onSubmit={handleSaveComparison} className="space-y-5">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-xl border border-black/10 bg-[#faf9f6] p-4">
                    <label className="mb-2 block text-xs font-semibold text-[#1a1918]">
                      1. Chọn ảnh Thiết kế 3D (Render)
                    </label>
                    <select
                      value={renderMediaId}
                      onChange={(e) => setRenderMediaId(e.target.value)}
                      className="mb-3 w-full rounded-xl border border-black/12 bg-white px-3 py-2 text-xs outline-hidden focus:border-(--accent-bronze)"
                    >
                      <option value="">-- Chọn ảnh 3D --</option>
                      {mediaList.map((m) => (
                        <option key={m.id} value={m.id}>
                          [{m.kind}] {m.caption || m.storageKey}
                        </option>
                      ))}
                    </select>
                    <div className="aspect-video overflow-hidden rounded-lg bg-[#eae5dc]">
                      {selectedRenderMedia ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={selectedRenderMedia.storageKey}
                          alt="3D Render preview"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-xs text-[#625f5a]">
                          Chưa chọn ảnh 3D
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="rounded-xl border border-black/10 bg-[#faf9f6] p-4">
                    <label className="mb-2 block text-xs font-semibold text-[#1a1918]">
                      2. Chọn ảnh Thi công thực tế (Actual)
                    </label>
                    <select
                      value={actualMediaId}
                      onChange={(e) => setActualMediaId(e.target.value)}
                      className="mb-3 w-full rounded-xl border border-black/12 bg-white px-3 py-2 text-xs outline-hidden focus:border-(--accent-bronze)"
                    >
                      <option value="">-- Chọn ảnh thực tế --</option>
                      {mediaList.map((m) => (
                        <option key={m.id} value={m.id}>
                          [{m.kind}] {m.caption || m.storageKey}
                        </option>
                      ))}
                    </select>
                    <div className="aspect-video overflow-hidden rounded-lg bg-[#eae5dc]">
                      {selectedActualMedia ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={selectedActualMedia.storageKey}
                          alt="Actual photo preview"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-xs text-[#625f5a]">
                          Chưa chọn ảnh thực tế
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={savingComparison}
                    className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-[#181715] px-5 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-(--accent-bronze) disabled:opacity-50"
                  >
                    {savingComparison
                      ? "Đang lưu cặp so sánh..."
                      : "Lưu cặp so sánh 3D vs Thực tế"}
                  </button>
                </div>
              </form>
            )}
          </section>
        </div>
      )}
    </AdminShell>
  );
};

export default AdminProjectMediaClient;
