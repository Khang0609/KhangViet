"use client";

import React, { useMemo, useState } from "react";
import { MapPin, Pencil, Plus, Search, Trash2 } from "lucide-react";
import type {
  CreateGalleryProjectInput,
  GalleryProject,
  ProjectGalleryResponse,
} from "@khangviet/types";
import {
  createAdminProject,
  deleteAdminProject,
  updateAdminProject,
} from "@/lib/adminApi";
import { getProjectObjectPosition } from "@/lib/galleryClusters";
import { AdminShell } from "./AdminShell";
import { ProjectWizardModal } from "./ProjectWizardModal";

interface AdminProjectsClientProps {
  initialData: ProjectGalleryResponse;
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
      [p.title, p.code, p.client, p.category, p.location]
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
    input: CreateGalleryProjectInput,
    editingId?: string
  ): Promise<
    { success: true; project: GalleryProject } | { success: false; error: string }
  > => {
    if (editingId) {
      const res = await updateAdminProject(editingId, input);
      if (!res.success) {
        return { success: false, error: res.error };
      }
      const updatedProject: GalleryProject = {
        ...input,
        id: editingId,
        year: input.year ?? String(new Date().getFullYear()),
        featured: input.featured ?? false,
      };
      setProjects((prev) =>
        prev.map((p) => (p.id === editingId ? updatedProject : p))
      );
      setFeedback({
        type: "success",
        text: `Đã cập nhật "${updatedProject.title}"`,
      });
      return { success: true, project: updatedProject };
    }

    const res = await createAdminProject(input);
    if (!res.success) {
      return { success: false, error: res.error };
    }

    const createdProject: GalleryProject = {
      ...input,
      id: res.data.id,
      year: input.year ?? String(new Date().getFullYear()),
      featured: input.featured ?? false,
    };
    setProjects((prev) => [createdProject, ...prev]);
    setFeedback({
      type: "success",
      text: `Đã thêm mới dự án "${createdProject.title}"`,
    });
    return { success: true, project: createdProject };
  };

  const handleDelete = async (project: GalleryProject) => {
    if (
      !window.confirm(`Xác nhận xóa dự án "${project.title}" khỏi hệ thống?`)
    ) {
      return;
    }
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
      subtitle="Danh sách dự án — bấm vào từng dòng để xem & sửa nhanh, hoặc thêm hàng loạt qua Wizard 3 bước."
    >
      {/* Action Toolbar */}
      <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 sm:max-w-md">
          <Search className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-[#625f5a]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên, mã, đối tác, địa điểm..."
            className="w-full rounded-xl border border-black/12 bg-white py-2.5 pr-4 pl-10 text-sm outline-hidden focus:border-(--accent-bronze)"
          />
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#181715] px-5 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-(--accent-bronze)"
        >
          <Plus className="h-4 w-4" />
          <span>Thêm dự án (Hàng loạt)</span>
        </button>
      </div>

      {feedback && (
        <div
          className={`mb-4 rounded-xl border px-4 py-2.5 text-xs font-medium ${
            feedback.type === "success"
              ? "border-emerald-500/30 bg-emerald-50 text-emerald-800"
              : "border-red-500/30 bg-red-50 text-red-700"
          }`}
        >
          {feedback.text}
        </div>
      )}

      {/* YouTube Studio List */}
      <div className="overflow-hidden rounded-2xl border border-black/10 bg-white">
        <div className="hidden border-b border-black/8 bg-[#faf9f6] px-5 py-3 text-[11px] font-semibold tracking-wider text-[#625f5a] uppercase md:grid md:grid-cols-12 md:gap-4">
          <div className="col-span-6">Dự án (Thumbnail &amp; Tiêu đề)</div>
          <div className="col-span-2">Phân loại</div>
          <div className="col-span-2">Trạng thái</div>
          <div className="col-span-2 text-right">Thao tác</div>
        </div>

        <div className="divide-y divide-black/8">
          {filtered.map((project) => (
            <div
              key={project.id}
              onClick={() => handleOpenEdit(project)}
              className="group flex cursor-pointer flex-col gap-3 px-4 py-3.5 transition-colors hover:bg-[#faf9f6] md:grid md:grid-cols-12 md:items-center md:gap-4 md:px-5"
            >
              {/* Thumbnail + Title + Subtitle */}
              <div className="flex min-w-0 items-center gap-3.5 md:col-span-6">
                <div className="relative aspect-video w-28 shrink-0 overflow-hidden rounded-lg border border-black/10 bg-[#eae5dc]">
                  <img
                    src={project.imgActual}
                    alt={project.title}
                    style={{ objectPosition: getProjectObjectPosition(project) }}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold text-[#1a1918] group-hover:text-(--accent-bronze)">
                    {project.title}
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-[#625f5a]">
                    <span className="font-mono font-medium">
                      {project.code ?? project.id}
                    </span>
                    <span>•</span>
                    <span className="truncate">{project.client}</span>
                    <span>•</span>
                    <span className="inline-flex items-center gap-0.5 truncate">
                      <MapPin className="h-3 w-3 shrink-0" />
                      {project.location}
                    </span>
                  </div>
                </div>
              </div>

              {/* Category + Segment */}
              <div className="flex items-center gap-2 md:col-span-2 md:flex-col md:items-start md:gap-1">
                <span className="rounded-md border border-black/10 bg-[#faf9f6] px-2 py-0.5 text-[11px] font-medium">
                  {project.category}
                </span>
                <span className="text-[11px] text-[#625f5a]">
                  {project.segment === "B2B" ? "Đối tác B2B" : "Khách lẻ C2B"}
                </span>
              </div>

              {/* Stage */}
              <div className="md:col-span-2">
                <span
                  className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                    project.stage === "TENDER_3D"
                      ? "bg-amber-100 text-amber-800"
                      : "bg-emerald-100 text-emerald-800"
                  }`}
                >
                  {project.stage === "TENDER_3D"
                    ? "Phối cảnh 3D"
                    : "Nghiệm thu"}
                </span>
              </div>

              {/* Actions */}
              <div
                onClick={(e) => e.stopPropagation()}
                className="flex items-center justify-end gap-2 md:col-span-2"
              >
                <button
                  type="button"
                  onClick={() => handleOpenEdit(project)}
                  title="Chỉnh sửa"
                  className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-black/12 bg-white px-2.5 py-1.5 text-xs font-medium text-[#1a1918] hover:border-[#1a1918]"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  <span>Sửa</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(project)}
                  title="Xóa dự án"
                  className="inline-flex cursor-pointer items-center justify-center rounded-lg border border-black/12 bg-white p-1.5 text-[#625f5a] hover:border-red-500/40 hover:bg-red-50 hover:text-red-600"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="py-12 text-center text-sm text-[#625f5a]">
              Không tìm thấy dự án nào phù hợp.
            </div>
          )}
        </div>
      </div>

      <ProjectWizardModal
        isOpen={wizardOpen}
        onClose={() => setWizardOpen(false)}
        editingProject={editingProject}
        keyAccounts={initialData.keyAccounts}
        categories={initialData.categories}
        onSubmitProject={handleSubmitProject}
      />
    </AdminShell>
  );
};

export default AdminProjectsClient;
