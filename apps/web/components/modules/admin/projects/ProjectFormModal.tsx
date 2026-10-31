"use client";

import React, { useState } from "react";
import type { FeaturedProject } from "@khangviet/types";
import { BaseModal } from "@/components/ui/BaseModal";
import { ProjectFormFields } from "./ProjectFormFields";
import { ProjectGalleryField } from "./ProjectGalleryField";

interface Props {
  isOpen: boolean;
  project: FeaturedProject;
  onClose: () => void;
  onSave: (p: FeaturedProject) => Promise<void>;
}

export const ProjectFormModal: React.FC<Props> = ({
  isOpen,
  project,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState<FeaturedProject>(project);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (field: keyof FeaturedProject, val: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: val }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    await onSave(formData);
    setSubmitting(false);
  };

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} maxWidth="max-w-4xl">
      <div className="max-h-[85vh] overflow-y-auto rounded-lg border border-white/10 bg-(--bg-surface) p-6">
        <div className="mb-4 flex items-center justify-between border-b border-white/8 pb-3">
          <h3 className="font-syne text-base font-bold text-white">
            {project.id ? "Chỉnh Sửa Dự Án" : "Tạo Mới Dự Án"}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-white/40 hover:text-white font-mono-tech text-xs"
          >
            [Đóng]
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6 pt-2">
          <ProjectFormFields data={formData} onChange={handleChange} />
          <ProjectGalleryField
            items={formData.gallery || []}
            onChange={(items) => handleChange("gallery", items)}
          />

          <div className="flex items-center justify-end gap-3 border-t border-white/8 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded border border-white/10 px-4 py-2 font-mono-tech text-xs text-white/70 hover:text-white"
            >
              Hủy Bỏ
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded bg-brand px-5 py-2 font-mono-tech text-xs font-semibold text-black hover:brightness-110 disabled:opacity-50"
            >
              {submitting ? "Đang lưu..." : "Lưu Dự Án"}
            </button>
          </div>
        </form>
      </div>
    </BaseModal>
  );
};

export default ProjectFormModal;

