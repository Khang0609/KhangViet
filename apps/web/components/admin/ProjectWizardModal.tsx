"use client";

import React, { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Check, X } from "lucide-react";
import type {
  CreateProjectDto,
  GalleryProject,
  Organization,
  PublishStatus,
  Service,
} from "@khangviet/types";
import { createAdminOrganization } from "@/lib/adminApi";
import { BaseModal } from "@/components/ui/BaseModal";
import { UniversalMediaUpload } from "@/components/ui/media-upload";
import {
  getProjectCoverUrl,
  getProjectRenderUrl,
  toGallerySlug,
} from "@/lib/galleryClusters";

interface ProjectWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingProject: GalleryProject | null;
  organizations: Organization[];
  services: Service[];
  onSubmitProject: (
    input: CreateProjectDto & {
      coverUrl?: string;
      renderUrl?: string;
      createdOrganization?: Organization;
    },
    editingId?: string
  ) => Promise<
    { success: true; project: GalleryProject } | { success: false; error: string }
  >;
}

type PartnerSourceMode = "none" | "existing" | "new";

interface WizardDraft {
  title: string;
  slug: string;
  summary: string;
  partnerMode: PartnerSourceMode;
  organizationId: string;
  newPartnerName: string;
  serviceIds: string[];
  year: string;
  publishStatus: PublishStatus;
  isFeatured: boolean;
  featuredOrder: number;
  coverUrl: string;
  renderUrl: string;
}

function createEmptyDraft(defaultServiceId?: string): WizardDraft {
  return {
    title: "",
    slug: "",
    summary: "",
    partnerMode: "none",
    organizationId: "",
    newPartnerName: "",
    serviceIds: defaultServiceId ? [defaultServiceId] : [],
    year: String(new Date().getFullYear()),
    publishStatus: "PUBLISHED",
    isFeatured: false,
    featuredOrder: 0,
    coverUrl: "",
    renderUrl: "",
  };
}

function projectToDraft(p: GalleryProject): WizardDraft {
  const cover = getProjectCoverUrl(p);
  return {
    title: p.title,
    slug: p.slug,
    summary: p.summary ?? "",
    partnerMode: p.organization ? "existing" : "none",
    organizationId: p.organization?.id ?? "",
    newPartnerName: "",
    serviceIds: p.services.map((s) => s.id),
    year: p.year ? String(p.year) : String(new Date().getFullYear()),
    publishStatus: p.publishStatus,
    isFeatured: p.isFeatured,
    featuredOrder: p.featuredOrder,
    coverUrl: cover.includes("placeholder") ? "" : cover,
    renderUrl: getProjectRenderUrl(p) ?? "",
  };
}

const STEP_LABELS = ["1. Hình ảnh & Tên dự án", "2. Đối tác, Dịch vụ & Xuất bản"];

export const ProjectWizardModal: React.FC<ProjectWizardModalProps> = ({
  isOpen,
  onClose,
  editingProject,
  organizations,
  services,
  onSubmitProject,
}) => {
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<WizardDraft>(() =>
    createEmptyDraft(services[0]?.id)
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setStep(0);
    setError(null);
    setDraft(
      editingProject
        ? projectToDraft(editingProject)
        : createEmptyDraft(services[0]?.id)
    );
  }, [isOpen, editingProject, services]);

  const toggleService = (serviceId: string) => {
    setDraft((prev) => {
      const exists = prev.serviceIds.includes(serviceId);
      return {
        ...prev,
        serviceIds: exists
          ? prev.serviceIds.filter((id) => id !== serviceId)
          : [...prev.serviceIds, serviceId],
      };
    });
  };

  const handleNext = () => {
    setError(null);
    if (!draft.title.trim()) {
      setError("Vui lòng nhập tên dự án.");
      return;
    }
    setStep(1);
  };

  const handleSave = async () => {
    setError(null);
    if (!draft.title.trim()) {
      setError("Vui lòng nhập tên dự án.");
      return;
    }
    if (draft.partnerMode === "new" && !draft.newPartnerName.trim()) {
      setError("Vui lòng nhập tên đối tác mới.");
      return;
    }

    setSaving(true);
    let resolvedOrgId: string | null = null;
    let createdOrganization: Organization | undefined;

    if (draft.partnerMode === "existing") {
      resolvedOrgId = draft.organizationId || null;
    } else if (draft.partnerMode === "new") {
      const orgRes = await createAdminOrganization({
        name: draft.newPartnerName.trim(),
        isFeatured: false,
        featuredOrder: 0,
      });
      if (!orgRes.success) {
        setSaving(false);
        setError(orgRes.error);
        return;
      }
      resolvedOrgId = orgRes.data.id;
      createdOrganization = orgRes.data;
    }

    const computedSlug =
      draft.slug.trim() || toGallerySlug(draft.title) || `du-an-${Date.now()}`;

    const res = await onSubmitProject(
      {
        title: draft.title.trim(),
        slug: computedSlug,
        summary: draft.summary.trim() || null,
        organizationId: resolvedOrgId,
        serviceIds: draft.serviceIds,
        year: Number(draft.year) || new Date().getFullYear(),
        publishStatus: draft.publishStatus,
        isFeatured: draft.isFeatured,
        featuredOrder: Number(draft.featuredOrder) || 0,
        coverUrl: draft.coverUrl.trim() || undefined,
        renderUrl: draft.renderUrl.trim() || undefined,
        createdOrganization,
      },
      editingProject?.id
    );
    setSaving(false);

    if (!res.success) {
      setError(res.error);
      return;
    }
    onClose();
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-4xl"
      ariaLabel={editingProject ? "Chỉnh sửa dự án" : "Thêm mới dự án"}
    >
      <div className="flex max-h-[90vh] flex-col bg-white text-[#1a1918]">
        <div className="flex items-center justify-between border-b border-black/10 px-6 py-4">
          <div>
            <h2 className="text-base font-semibold">
              {editingProject ? "Chỉnh sửa dự án" : "Thêm mới dự án"}
            </h2>
            <p className="text-xs text-[#625f5a]">{STEP_LABELS[step]}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            className="cursor-pointer rounded-full border border-black/10 p-1.5 text-[#625f5a] hover:bg-[#181715] hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto p-6">
          {step === 0 ? (
            <>
              <div>
                <label className="mb-1 block text-xs font-semibold">
                  Tên dự án *
                </label>
                <input
                  type="text"
                  value={draft.title}
                  onChange={(e) =>
                    setDraft((d) => ({
                      ...d,
                      title: e.target.value,
                      slug: editingProject
                        ? d.slug
                        : toGallerySlug(e.target.value),
                    }))
                  }
                  placeholder="Ví dụ: Showroom Khang Việt Quận 1"
                  className="w-full rounded-xl border border-black/15 px-3.5 py-2.5 text-sm outline-hidden focus:border-(--accent-bronze)"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold">
                  Đường dẫn (Slug)
                </label>
                <input
                  type="text"
                  value={draft.slug}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, slug: e.target.value }))
                  }
                  placeholder="showroom-khang-viet-quan-1"
                  className="w-full rounded-xl border border-black/15 px-3.5 py-2 font-mono text-xs outline-hidden focus:border-(--accent-bronze)"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-semibold">
                    Ảnh thực tế / Ảnh bìa
                  </label>
                  <UniversalMediaUpload
                    label="Ảnh thực tế / Ảnh bìa"
                    value={draft.coverUrl}
                    onChange={(url) =>
                      setDraft((d) => ({ ...d, coverUrl: url }))
                    }
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold">
                    Ảnh phối cảnh 2D/3D (tùy chọn)
                  </label>
                  <UniversalMediaUpload
                    label="Ảnh phối cảnh 2D/3D"
                    value={draft.renderUrl}
                    onChange={(url) =>
                      setDraft((d) => ({ ...d, renderUrl: url }))
                    }
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-3 rounded-2xl border border-black/10 bg-[#faf9f6] p-4">
                <label className="block text-xs font-semibold">
                  Thông tin Đối tác / Khách hàng
                </label>
                <div className="flex flex-wrap gap-2">
                  {(
                    [
                      { id: "none", label: "Khách lẻ / Không gắn đối tác" },
                      { id: "existing", label: "Chọn đối tác có sẵn" },
                      { id: "new", label: "Tạo đối tác mới nhanh" },
                    ] as const
                  ).map((mode) => (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() =>
                        setDraft((d) => ({ ...d, partnerMode: mode.id }))
                      }
                      className={`cursor-pointer rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                        draft.partnerMode === mode.id
                          ? "border-[#181715] bg-[#181715] text-white"
                          : "border-black/12 bg-white text-[#625f5a] hover:text-[#1a1918]"
                      }`}
                    >
                      {mode.label}
                    </button>
                  ))}
                </div>

                {draft.partnerMode === "existing" && (
                  <select
                    value={draft.organizationId}
                    onChange={(e) =>
                      setDraft((d) => ({
                        ...d,
                        organizationId: e.target.value,
                      }))
                    }
                    className="w-full rounded-xl border border-black/15 bg-white px-3 py-2.5 text-sm outline-hidden focus:border-(--accent-bronze)"
                  >
                    <option value="">-- Chọn đối tác --</option>
                    {organizations.map((org) => (
                      <option key={org.id} value={org.id}>
                        {org.name}
                      </option>
                    ))}
                  </select>
                )}

                {draft.partnerMode === "new" && (
                  <input
                    type="text"
                    value={draft.newPartnerName}
                    onChange={(e) =>
                      setDraft((d) => ({
                        ...d,
                        newPartnerName: e.target.value,
                      }))
                    }
                    placeholder="Nhập tên đối tác mới..."
                    className="w-full rounded-xl border border-black/15 bg-white px-3.5 py-2.5 text-sm outline-hidden focus:border-(--accent-bronze)"
                  />
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-semibold">
                    Năm hoàn thành
                  </label>
                  <input
                    type="number"
                    min={1990}
                    max={2100}
                    value={draft.year}
                    onChange={(e) =>
                      setDraft((d) => ({ ...d, year: e.target.value }))
                    }
                    className="w-full rounded-xl border border-black/15 px-3.5 py-2.5 text-sm outline-hidden focus:border-(--accent-bronze)"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold">
                    Trạng thái xuất bản
                  </label>
                  <select
                    value={draft.publishStatus}
                    onChange={(e) =>
                      setDraft((d) => ({
                        ...d,
                        publishStatus: e.target.value as PublishStatus,
                      }))
                    }
                    className="w-full rounded-xl border border-black/15 bg-white px-3 py-2.5 text-sm outline-hidden focus:border-(--accent-bronze)"
                  >
                    <option value="PUBLISHED">Công khai (Published)</option>
                    <option value="DRAFT">Bản nháp (Draft)</option>
                    <option value="ARCHIVED">Lưu trữ (Archived)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold">
                  Hạng mục dịch vụ
                </label>
                <div className="flex flex-wrap gap-2">
                  {services.map((svc) => {
                    const active = draft.serviceIds.includes(svc.id);
                    return (
                      <button
                        key={svc.id}
                        type="button"
                        onClick={() => toggleService(svc.id)}
                        className={`cursor-pointer rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                          active
                            ? "border-[#181715] bg-[#181715] text-white"
                            : "border-black/15 bg-[#faf9f6] text-[#625f5a] hover:border-black/30"
                        }`}
                      >
                        {svc.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold">
                  Mô tả tóm tắt
                </label>
                <textarea
                  rows={3}
                  value={draft.summary}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, summary: e.target.value }))
                  }
                  placeholder="Mô tả ngắn gọn về hạng mục thi công, vật liệu chính..."
                  className="w-full rounded-xl border border-black/15 px-3.5 py-2.5 text-sm outline-hidden focus:border-(--accent-bronze)"
                />
              </div>

              <label className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-black/12 px-3.5 py-2.5 text-sm">
                <input
                  type="checkbox"
                  checked={draft.isFeatured}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, isFeatured: e.target.checked }))
                  }
                  className="h-4 w-4 accent-[#181715]"
                />
                <span>Hiển thị nổi bật trên Trang chủ</span>
              </label>
            </>
          )}

          {error && (
            <div className="rounded-xl border border-red-500/25 bg-red-50 px-3.5 py-2 text-xs font-medium text-red-700">
              {error}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-black/10 px-6 py-4">
          {step === 0 ? (
            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer rounded-full border border-black/15 px-4 py-2 text-xs font-semibold text-[#625f5a] hover:text-[#1a1918]"
            >
              Hủy
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setStep(0)}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-black/15 px-4 py-2 text-xs font-semibold text-[#1a1918]"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Quay lại
            </button>
          )}

          {step === 0 ? (
            <button
              type="button"
              onClick={handleNext}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-[#181715] px-5 py-2 text-xs font-semibold text-white hover:bg-(--accent-bronze)"
            >
              Tiếp tục
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          ) : (
            <button
              type="button"
              disabled={saving}
              onClick={handleSave}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-[#181715] px-5 py-2 text-xs font-semibold text-white hover:bg-(--accent-bronze) disabled:opacity-60"
            >
              <Check className="h-3.5 w-3.5" />
              {saving ? "Đang lưu..." : "Lưu dự án"}
            </button>
          )}
        </div>
      </div>
    </BaseModal>
  );
};
