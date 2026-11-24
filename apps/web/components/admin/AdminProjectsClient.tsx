"use client";

import React, { useMemo, useState } from "react";
import { Calendar, Pencil, Plus, Search, Trash2 } from "lucide-react";
import type {
  CreateProjectDto,
  GalleryProject,
  Project,
  ProjectGalleryResponse,
} from "@khangviet/types";
import {
  addAdminProjectMedia,
  createAdminProject,
  deleteAdminProject,
  updateAdminProject,
} from "@/lib/adminApi";
import { getProjectCoverUrl } from "@/lib/galleryClusters";
import { AdminShell } from "./AdminShell";
import { ProjectWizardModal } from "./ProjectWizardModal";

interface AdminProjectsClientProps {
  initialData: ProjectGalleryResponse;
}

function projectToGalleryProject(p: Project): GalleryProject {
  const media = p.media ?? [];
  return {
    id: p.id,
    slug: p.slug,
    title: p.title,
    summary: p.summary ?? null,
    year: p.year ?? null,
    publishStatus: p.publishStatus,
    isFeatured: p.isFeatured,
    featuredOrder: p.featuredOrder,
    organization: p.organization ?? null,
    services: p.services ?? [],
    coverMedia: media.find((m) => m.isCover) ?? media[0] ?? null,
    media,
    comparisons: p.comparisons ?? [],
  };
}

export const AdminProjectsClient: React.FC<AdminProjectsClientProps> = ({
  initialData,
}) => {
  const [projects, setProjects] = useState<GalleryProject[]>(
    initialData.projects
  );
  const [search, setSearch] = useState("");
  const [wizardOpen, setWizardOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<GalleryProject | null>(
    null
  );
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return projects;
    return projects.filter((p) =>
      [
        p.title,
        p.slug,
        p.organization?.name,
        ...p.services.map((s) => s.name),
      ]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q))
    );
  }, [projects, search]);

  const handleOpenCreate = () => {
    setEditingProject(null);
    setWizardOpen(true);
  };

  const handleOpenEdit = (project: GalleryProject) => {
    setEditingProject(project);
    setWizardOpen(true);
  };

  const handleSubmitProject = async (
    input: CreateProjectDto & { coverUrl?: string; renderUrl?: string },
    editingId?: string
  ): Promise<
    { success: true; project: GalleryProject } | { success: false; error: string }
  > => {
    const { coverUrl, renderUrl, ...dto } = input;

    if (editingId) {
      const res = await updateAdminProject(editingId, dto);
      if (!res.success) {
        return { success: false, error: res.error };
      }
      const updated = projectToGalleryProject(res.data);
      setProjects((prev) =>
        prev.map((p) => (p.id === editingId ? updated : p))
      );
      setFeedback({
        type: "success",
        text: `Đã cập nhật "${updated.title}"`,
      });
      return { success: true, project: updated };
    }

    const res = await createAdminProject(dto);
    if (!res.success) {
      return { success: false, error: res.error };
    }

    let created = res.data;
    if (coverUrl) {
      const mediaRes = await addAdminProjectMedia(created.id, {
        kind: "ACTUAL",
        storageKey: coverUrl,
        isCover: true,
        sortOrder: 0,
      });
      if (mediaRes.success) {
        created = { ...created, media: [...(created.media ?? []), mediaRes.data] };
      }
    }
    if (renderUrl) {
      const renderRes = await addAdminProjectMedia(created.id, {
        kind: "RENDER",
        storageKey: renderUrl,
        isCover: false,
        sortOrder: 1,
      });
      if (renderRes.success) {
        created = { ...created, media: [...(created.media ?? []), renderRes.data] };
      }
    }

    const createdGallery = projectToGalleryProject(created);
    setProjects((prev) => [createdGallery, ...prev]);
    setFeedback({
      type: "success",
      text: `Đã thêm mới dự án "${createdGallery.title}"`,
    });
    return { success: true, project: createdGallery };
  };

  const handleDelete = async (project: GalleryProject) => {
    if (!window.confirm(`Xóa dự án "${project.title}"?`)) return;
    const res = await deleteAdminProject(project.id);
    if (!res.success) {
      setFeedback({ type: "error", text: res.error });
      return;
    }
    setProjects((prev) => prev.filter((p) => p.id !== project.id));
    setFeedback({
      type: "success",
      text: `Đã xóa dự án "${project.title}"`,
    });
  };

  return (
    <AdminShell
      title="Quản lý Dự án"
      subtitle="Thêm, chỉnh sửa hồ sơ dự án và đồng bộ danh mục hiển thị."
    >
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1 sm:max-w-sm">
          <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-[#625f5a]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên dự án, đối tác, dịch vụ..."
            className="w-full rounded-full border border-black/12 bg-white py-2.5 pr-4 pl-10 text-sm outline-hidden focus:border-(--accent-bronze)"
          />
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full bg-[#181715] px-5 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-(--accent-bronze)"
        >
          <Plus className="h-4 w-4" />
          <span>Thêm dự án mới</span>
        </button>
      </div>

      {feedback && (
        <div
          className={`mb-5 rounded-xl border px-4 py-3 text-xs font-medium ${
            feedback.type === "success"
              ? "border-emerald-500/25 bg-emerald-50 text-emerald-700"
              : "border-red-500/25 bg-red-50 text-red-700"
          }`}
        >
          {feedback.text}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((project) => (
          <div
            key={project.id}
            className="flex flex-col overflow-hidden rounded-2xl border border-black/10 bg-white shadow-xs"
          >
            <div className="relative aspect-4/3 bg-[#eae5dc]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={getProjectCoverUrl(project)}
                alt={project.title}
                className="h-full w-full object-cover"
              />
              <span className="absolute top-3 left-3 rounded-full bg-[#181715]/85 px-2.5 py-0.5 text-[11px] font-medium text-white">
                {project.publishStatus}
              </span>
            </div>

            <div className="flex flex-1 flex-col p-4">
              <div className="text-xs font-medium text-(--accent-bronze)">
                {project.organization?.name || "Khách hàng Khang Việt"}
              </div>
              <h3 className="mt-1 line-clamp-2 text-sm font-semibold text-[#1a1918]">
                {project.title}
              </h3>
              <div className="mt-2 flex items-center gap-1.5 text-xs text-[#625f5a]">
                <Calendar className="h-3.5 w-3.5" />
                <span>{project.year || 2025}</span>
              </div>

              <div className="mt-4 flex items-center justify-end gap-2 border-t border-black/8 pt-3">
                <button
                  type="button"
                  onClick={() => handleOpenEdit(project)}
                  className="inline-flex cursor-pointer items-center gap-1 rounded-full border border-black/12 px-3 py-1.5 text-xs font-medium text-[#1a1918] hover:bg-[#faf9f6]"
                >
                  <Pencil className="h-3 w-3" />
                  Sửa
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(project)}
                  className="inline-flex cursor-pointer items-center gap-1 rounded-full border border-red-500/20 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-3 w-3" />
                  Xóa
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <ProjectWizardModal
        isOpen={wizardOpen}
        onClose={() => setWizardOpen(false)}
        editingProject={editingProject}
        organizations={initialData.organizations}
        services={initialData.services}
        onSubmitProject={handleSubmitProject}
      />
    </AdminShell>
  );
};

export default AdminProjectsClient;
