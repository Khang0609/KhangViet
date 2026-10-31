"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Plus } from "lucide-react";
import type { FeaturedProject } from "@khangviet/types";
import { AdminCard } from "../shared";
import { ProjectCardItem } from "./ProjectCardItem";
import { ProjectFormModal } from "./ProjectFormModal";
import { defaultEmptyProject } from "./projectConstants";
import { getProjects, createProject, updateProject, deleteProject } from "./projectService";

export const ProjectListView: React.FC = () => {
  const [projects, setProjects] = useState<FeaturedProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<FeaturedProject | null>(null);

  const reloadProjects = useCallback(async () => {
    const res = await getProjects();
    if (res.success) setProjects(res.data);
    setLoading(false);
  }, []);

  useEffect(() => {
    let active = true;
    getProjects().then((res) => {
      if (active && res.success) setProjects(res.data);
      if (active) setLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  const handleSave = async (p: FeaturedProject) => {
    const isEdit = Boolean(p.id);
    const res = isEdit ? await updateProject(p.id, p) : await createProject(p);
    if (res.success) {
      setSelectedProject(null);
      reloadProjects();
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa dự án này không?")) return;
    const res = await deleteProject(id);
    if (res.success) reloadProjects();
  };

  return (
    <AdminCard
      title="Danh Mục Dự Án Tiêu Biểu"
      subtitle="Quản lý các công trình xuất hiện trên Project Showcase tại trang chủ."
      action={
        <button
          onClick={() => setSelectedProject({ ...defaultEmptyProject, id: "" })}
          className="flex items-center gap-2 rounded bg-(--color-brand) px-4 py-2 font-mono-tech text-xs font-semibold text-black hover:brightness-110"
        >
          <Plus className="h-4 w-4" />
          <span>Thêm Dự Án Mới</span>
        </button>
      }
    >
      {loading ? (
        <div className="py-12 text-center font-mono-tech text-xs text-white/40">Đang tải danh sách...</div>
      ) : projects.length === 0 ? (
        <div className="py-12 text-center font-mono-tech text-xs text-white/30">Chưa có dự án nào.</div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => (
            <ProjectCardItem key={p.id} project={p} onEdit={setSelectedProject} onDelete={handleDelete} />
          ))}
        </div>
      )}

      {selectedProject && (
        <ProjectFormModal
          isOpen={Boolean(selectedProject)}
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
          onSave={handleSave}
        />
      )}
    </AdminCard>
  );
};

export default ProjectListView;

