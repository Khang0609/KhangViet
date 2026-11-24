"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, Settings, Trash2 } from "lucide-react";
import type {
  CreateProjectDto,
  GalleryProject,
  Organization,
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
  const router = useRouter();
  const [projects, setProjects] = useState<GalleryProject[]>(
    initialData.projects
  );
  const [organizations, setOrganizations] = useState<Organization[]>(
    initialData.organizations
  );
  const [search, setSearch] = useState("");
  const [partnerFilter, setPartnerFilter] = useState<"ALL" | "WITH_PARTNER">(
    "ALL"
  );
  const [serviceFilter, setServiceFilter] = useState<string>("ALL");
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
    return projects.filter((p) => {
      if (partnerFilter === "WITH_PARTNER" && !p.organization) return false;
      if (
        serviceFilter !== "ALL" &&
        !p.services.some((s) => s.id === serviceFilter)
      ) {
        return false;
      }
      if (!q) return true;
      return [
        p.title,
        p.slug,
        p.organization?.name,
        ...p.services.map((s) => s.name),
      ]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q));
    });
  }, [projects, search, partnerFilter, serviceFilter]);

  const handleOpenCreate = () => {
    setEditingProject(null);
    setWizardOpen(true);
  };

  const handleOpenEdit = (project: GalleryProject) => {
    setEditingProject(project);
    setWizardOpen(true);
  };

  const handleRowNavigate = (project: GalleryProject) => {
    const targetSlug =
      project.organization?.slug ||
      project.services[0]?.slug ||
      initialData.services[0]?.slug ||
      "khang-viet";
    router.push(`/admin/projects/${targetSlug}`);
  };

  const handleSubmitProject = async (
    input: CreateProjectDto & {
      coverUrl?: string;
      renderUrl?: string;
      createdOrganization?: Organization;
    },
    editingId?: string
  ): Promise<
    { success: true; project: GalleryProject } | { success: false; error: string }
  > => {
    const { coverUrl, renderUrl, createdOrganization, ...dto } = input;

    if (createdOrganization) {
      setOrganizations((prev) =>
        prev.some((o) => o.id === createdOrganization.id)
          ? prev
          : [...prev, createdOrganization]
      );
    }

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
        created = {
          ...created,
          media: [...(created.media ?? []), mediaRes.data],
        };
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
        created = {
          ...created,
          media: [...(created.media ?? []), renderRes.data],
        };
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
    <AdminShell>
      <div className="mb-5 flex flex-col justify-between gap-3 lg:flex-row lg:items-center">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative min-w-56 flex-1 sm:flex-initial">
            <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-[#625f5a]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm dự án, đối tác..."
              className="w-full rounded-full border border-black/12 bg-white py-2 pr-4 pl-9 text-xs outline-hidden focus:border-(--accent-bronze)"
            />
          </div>

          <div className="inline-flex rounded-full border border-black/10 bg-white p-0.5">
            <button
              type="button"
              onClick={() => setPartnerFilter("ALL")}
              className={`cursor-pointer rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                partnerFilter === "ALL"
                  ? "bg-[#181715] text-white"
                  : "text-[#625f5a] hover:text-[#1a1918]"
              }`}
            >
              Tất cả
            </button>
            <button
              type="button"
              onClick={() => setPartnerFilter("WITH_PARTNER")}
              className={`cursor-pointer rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                partnerFilter === "WITH_PARTNER"
                  ? "bg-[#181715] text-white"
                  : "text-[#625f5a] hover:text-[#1a1918]"
              }`}
            >
              Đối tác
            </button>
          </div>

          <select
            value={serviceFilter}
            onChange={(e) => setServiceFilter(e.target.value)}
            className="rounded-full border border-black/12 bg-white px-3.5 py-1.5 text-xs font-medium text-[#1a1918] outline-hidden focus:border-(--accent-bronze)"
          >
            <option value="ALL">Tất cả dịch vụ</option>
            {initialData.services.map((svc) => (
              <option key={svc.id} value={svc.id}>
                {svc.name}
              </option>
            ))}
          </select>
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
          className={`mb-4 rounded-xl border px-4 py-2.5 text-xs font-medium ${
            feedback.type === "success"
              ? "border-emerald-500/25 bg-emerald-50 text-emerald-700"
              : "border-red-500/25 bg-red-50 text-red-700"
          }`}
        >
          {feedback.text}
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-black/10 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-black/8 bg-[#faf9f6] text-[11px] font-semibold tracking-wider text-[#625f5a] uppercase">
                <th className="px-4 py-3">Dự án</th>
                <th className="px-4 py-3">Đối tác</th>
                <th className="px-4 py-3">Hạng mục</th>
                <th className="px-4 py-3">Năm</th>
                <th className="px-4 py-3">Trạng thái</th>
                <th className="px-4 py-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/8">
              {filtered.map((project) => (
                <tr
                  key={project.id}
                  onClick={() => handleRowNavigate(project)}
                  className="cursor-pointer transition-colors hover:bg-[#faf9f6]"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-11 w-16 shrink-0 overflow-hidden rounded-lg bg-[#eae5dc]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={getProjectCoverUrl(project)}
                          alt={project.title}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="truncate font-semibold text-[#1a1918]">
                          {project.title}
                        </div>
                        <div className="truncate font-mono text-[11px] text-[#625f5a]">
                          /{project.slug}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs font-medium text-(--accent-bronze)">
                    {project.organization?.name || "Khách lẻ"}
                  </td>
                  <td className="px-4 py-3 text-xs text-[#625f5a]">
                    {project.services.map((s) => s.name).join(" • ") || "—"}
                  </td>
                  <td className="px-4 py-3 text-xs text-[#625f5a] tabular-nums">
                    {project.year || "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                        project.publishStatus === "PUBLISHED"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-black/5 text-[#625f5a]"
                      }`}
                    >
                      {project.publishStatus}
                    </span>
                  </td>
                  <td
                    className="px-4 py-3 text-right"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="inline-flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(project)}
                        title="Chỉnh sửa thông tin dự án"
                        className="cursor-pointer rounded-lg p-1.5 text-[#625f5a] transition-colors hover:bg-black/5 hover:text-[#1a1918]"
                      >
                        <Settings className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(project)}
                        title="Xóa dự án"
                        className="cursor-pointer rounded-lg p-1.5 text-[#625f5a] transition-colors hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-10 text-center text-xs text-[#625f5a]"
                  >
                    Không có dự án nào phù hợp bộ lọc.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ProjectWizardModal
        isOpen={wizardOpen}
        onClose={() => setWizardOpen(false)}
        editingProject={editingProject}
        organizations={organizations}
        services={initialData.services}
        onSubmitProject={handleSubmitProject}
      />
    </AdminShell>
  );
};

export default AdminProjectsClient;
