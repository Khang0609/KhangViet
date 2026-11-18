"use client";

import React, { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Check, Plus, X } from "lucide-react";
import type {
  CreateGalleryProjectInput,
  GalleryFocalPoint,
  GalleryKeyAccount,
  GalleryProject,
} from "@khangviet/types";
import { BaseModal } from "@/components/ui/BaseModal";
import { UniversalMediaUpload } from "@/components/ui/media-upload";
import { FocalPointPicker } from "./FocalPointPicker";

interface ProjectWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingProject: GalleryProject | null;
  keyAccounts: GalleryKeyAccount[];
  categories: string[];
  onSubmitProject: (
    input: CreateGalleryProjectInput,
    editingId?: string
  ) => Promise<{ success: true; project: GalleryProject } | { success: false; error: string }>;
}

interface WizardDraft {
  code: string;
  title: string;
  client: string;
  keyAccount: string;
  segment: "B2B" | "C2B";
  stage: "COMPLETED" | "TENDER_3D";
  category: string;
  location: string;
  material: string;
  team: string;
  imgActual: string;
  img3D: string;
  focalPoint: GalleryFocalPoint;
  desc: string;
  year: string;
}

function createEmptyDraft(defaultCategory: string): WizardDraft {
  return {
    code: `KV-${String(Date.now()).slice(-4)}`,
    title: "",
    client: "",
    keyAccount: "",
    segment: "B2B",
    stage: "COMPLETED",
    category: defaultCategory,
    location: "TP. Hồ Chí Minh",
    material: "",
    team: "Đội ngũ Khang Việt",
    imgActual: "",
    img3D: "",
    focalPoint: { x: 50, y: 50 },
    desc: "",
    year: String(new Date().getFullYear()),
  };
}

function projectToDraft(p: GalleryProject): WizardDraft {
  return {
    code: p.code ?? p.id,
    title: p.title,
    client: p.client,
    keyAccount: p.keyAccount ?? "",
    segment: p.segment,
    stage: p.stage,
    category: p.category,
    location: p.location,
    material: p.material,
    team: p.team,
    imgActual: p.imgActual,
    img3D: p.img3D ?? "",
    focalPoint: p.focalPoint ?? { x: 50, y: 50 },
    desc: p.desc,
    year: p.year ?? String(new Date().getFullYear()),
  };
}

const STEP_LABELS = [
  "1. Ảnh & Tên dự án",
  "2. Đối tác & Hạng mục",
  "3. Thông số & Lưu",
];

export const ProjectWizardModal: React.FC<ProjectWizardModalProps> = ({
  isOpen,
  onClose,
  editingProject,
  keyAccounts,
  categories,
  onSubmitProject,
}) => {
  const defaultCat = categories[0] ?? "Bảng hiệu & Mặt dựng";
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<WizardDraft>(() =>
    createEmptyDraft(defaultCat)
  );
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [batchCount, setBatchCount] = useState(0);

  useEffect(() => {
    if (!isOpen) return;
    setStep(0);
    setError(null);
    setBatchCount(0);
    setDraft(
      editingProject
        ? projectToDraft(editingProject)
        : createEmptyDraft(defaultCat)
    );
  }, [isOpen, editingProject, defaultCat]);

  if (!isOpen) return null;

  const validateCurrentStep = (): boolean => {
    setError(null);
    if (step === 0) {
      if (!draft.title.trim()) {
        setError("Vui lòng nhập tên dự án.");
        return false;
      }
      if (!draft.imgActual.trim()) {
        setError("Vui lòng tải lên hoặc dán link ảnh thực tế dự án.");
        return false;
      }
    }
    if (step === 1) {
      if (!draft.client.trim() && !draft.keyAccount) {
        setError("Vui lòng nhập tên khách hàng hoặc chọn đối tác chuỗi.");
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      setStep((prev) => Math.min(2, prev + 1));
    }
  };

  const handleSave = async (keepOpenForNext: boolean) => {
    if (!validateCurrentStep()) return;

    const selectedAccount = keyAccounts.find((k) => k.id === draft.keyAccount);
    const resolvedClient =
      draft.client.trim() || selectedAccount?.name || "Khách hàng Khang Việt";

    setSaving(true);
    setError(null);

    const payload: CreateGalleryProjectInput = {
      code: draft.code.trim() || `KV-${String(Date.now()).slice(-4)}`,
      title: draft.title.trim(),
      client: resolvedClient,
      keyAccount: draft.keyAccount || null,
      segment: draft.segment,
      stage: draft.stage,
      category: draft.category,
      location: draft.location.trim() || "TP. Hồ Chí Minh",
      material: draft.material.trim() || "Vật liệu tiêu chuẩn Khang Việt",
      team: draft.team.trim() || "Đội ngũ Khang Việt",
      imgActual: draft.imgActual.trim(),
      img3D: draft.img3D.trim() || null,
      focalPoint: draft.focalPoint,
      desc: draft.desc.trim() || draft.title.trim(),
      year: draft.year.trim() || String(new Date().getFullYear()),
      featured: false,
    };

    const res = await onSubmitProject(payload, editingProject?.id);
    setSaving(false);

    if (!res.success) {
      setError(res.error);
      return;
    }

    if (keepOpenForNext && !editingProject) {
      setBatchCount((c) => c + 1);
      setStep(0);
      setDraft({
        ...createEmptyDraft(draft.category),
        keyAccount: draft.keyAccount,
        client: draft.client,
        segment: draft.segment,
      });
    } else {
      onClose();
    }
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-4xl"
      ariaLabel={editingProject ? "Chỉnh sửa dự án" : "Thêm dự án mới"}
    >
      <div className="flex max-h-[90vh] flex-col bg-white text-[#1a1918]">
        {/* Wizard Header */}
        <div className="flex items-center justify-between border-b border-black/8 px-6 py-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold">
                {editingProject ? "Chỉnh sửa dự án" : "Thêm dự án mới"}
              </h2>
              {batchCount > 0 && (
                <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700">
                  Đã lưu {batchCount} dự án
                </span>
              )}
            </div>
            {/* Step Progress */}
            <div className="mt-2 flex items-center gap-2">
              {STEP_LABELS.map((label, idx) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => {
                    if (idx < step || validateCurrentStep()) setStep(idx);
                  }}
                  className={`cursor-pointer rounded-full px-2.5 py-0.5 text-[11px] font-medium transition-colors ${
                    idx === step
                      ? "bg-[#181715] text-white"
                      : idx < step
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-[#f4f1ea] text-[#625f5a]"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
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

        {/* Wizard Body */}
        <div className="flex-1 space-y-5 overflow-y-auto p-6">
          {step === 0 && (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-xs font-semibold">
                    Tên dự án *
                  </label>
                  <input
                    type="text"
                    value={draft.title}
                    onChange={(e) =>
                      setDraft((d) => ({ ...d, title: e.target.value }))
                    }
                    placeholder="VD: Bảng hiệu mặt tiền BIDV CN Sài Gòn"
                    className="w-full rounded-xl border border-black/15 bg-[#faf9f6] px-3.5 py-2.5 text-sm outline-hidden focus:border-(--accent-bronze)"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold">
                    Mã dự án
                  </label>
                  <input
                    type="text"
                    value={draft.code}
                    onChange={(e) =>
                      setDraft((d) => ({ ...d, code: e.target.value }))
                    }
                    placeholder="KV-015"
                    className="w-full rounded-xl border border-black/15 bg-[#faf9f6] px-3.5 py-2.5 font-mono text-sm outline-hidden focus:border-(--accent-bronze)"
                  />
                </div>
              </div>

              <div className="rounded-2xl border border-black/10 bg-[#faf9f6] p-4">
                <UniversalMediaUpload
                  label="Ảnh thực tế công trình *"
                  folder="projects"
                  value={draft.imgActual}
                  allowManualInput
                  onChange={(url) =>
                    setDraft((d) => ({ ...d, imgActual: url }))
                  }
                />
              </div>

              {draft.imgActual && (
                <FocalPointPicker
                  imageUrl={draft.imgActual}
                  value={draft.focalPoint}
                  onChange={(focalPoint) =>
                    setDraft((d) => ({ ...d, focalPoint }))
                  }
                />
              )}
            </>
          )}

          {step === 1 && (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold">
                    Phân khúc khách hàng
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {(["B2B", "C2B"] as const).map((seg) => (
                      <button
                        key={seg}
                        type="button"
                        onClick={() =>
                          setDraft((d) => ({ ...d, segment: seg }))
                        }
                        className={`cursor-pointer rounded-xl border px-3 py-2.5 text-xs font-semibold transition-colors ${
                          draft.segment === seg
                            ? "border-[#181715] bg-[#181715] text-white"
                            : "border-black/12 bg-[#faf9f6] text-[#1a1918]"
                        }`}
                      >
                        {seg === "B2B" ? "Chuỗi đối tác B2B" : "Khách lẻ C2B"}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold">
                    Trạng thái hồ sơ
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {(
                      [
                        { id: "COMPLETED", label: "Nghiệm thu thực tế" },
                        { id: "TENDER_3D", label: "Phối cảnh 2D/3D" },
                      ] as const
                    ).map((st) => (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() =>
                          setDraft((d) => ({ ...d, stage: st.id }))
                        }
                        className={`cursor-pointer rounded-xl border px-3 py-2.5 text-xs font-semibold transition-colors ${
                          draft.stage === st.id
                            ? "border-(--accent-bronze) bg-(--accent-bronze) text-white"
                            : "border-black/12 bg-[#faf9f6] text-[#1a1918]"
                        }`}
                      >
                        {st.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold">
                    Thuộc đối tác chiến lược (nếu có)
                  </label>
                  <select
                    value={draft.keyAccount}
                    onChange={(e) => {
                      const val = e.target.value;
                      const found = keyAccounts.find((k) => k.id === val);
                      setDraft((d) => ({
                        ...d,
                        keyAccount: val,
                        client: found ? found.name : d.client,
                      }));
                    }}
                    className="w-full rounded-xl border border-black/15 bg-[#faf9f6] px-3.5 py-2.5 text-sm outline-hidden focus:border-(--accent-bronze)"
                  >
                    <option value="">-- Khách hàng độc lập --</option>
                    {keyAccounts.map((acc) => (
                      <option key={acc.id} value={acc.id}>
                        {acc.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold">
                    Hạng mục giải pháp
                  </label>
                  <select
                    value={draft.category}
                    onChange={(e) =>
                      setDraft((d) => ({ ...d, category: e.target.value }))
                    }
                    className="w-full rounded-xl border border-black/15 bg-[#faf9f6] px-3.5 py-2.5 text-sm outline-hidden focus:border-(--accent-bronze)"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold">
                  Tên khách hàng / Chủ đầu tư *
                </label>
                <input
                  type="text"
                  value={draft.client}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, client: e.target.value }))
                  }
                  placeholder="VD: Ngân hàng TMCP ĐT&PT Việt Nam (BIDV)"
                  className="w-full rounded-xl border border-black/15 bg-[#faf9f6] px-3.5 py-2.5 text-sm outline-hidden focus:border-(--accent-bronze)"
                />
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-xs font-semibold">
                    Địa điểm thi công
                  </label>
                  <input
                    type="text"
                    value={draft.location}
                    onChange={(e) =>
                      setDraft((d) => ({ ...d, location: e.target.value }))
                    }
                    placeholder="Quận 1, TP. Hồ Chí Minh"
                    className="w-full rounded-xl border border-black/15 bg-[#faf9f6] px-3.5 py-2.5 text-sm outline-hidden focus:border-(--accent-bronze)"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold">
                    Năm hoàn thành
                  </label>
                  <input
                    type="text"
                    value={draft.year}
                    onChange={(e) =>
                      setDraft((d) => ({ ...d, year: e.target.value }))
                    }
                    placeholder="2026"
                    className="w-full rounded-xl border border-black/15 bg-[#faf9f6] px-3.5 py-2.5 text-sm outline-hidden focus:border-(--accent-bronze)"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold">
                    Vật liệu chính (cách nhau dấu phẩy)
                  </label>
                  <input
                    type="text"
                    value={draft.material}
                    onChange={(e) =>
                      setDraft((d) => ({ ...d, material: e.target.value }))
                    }
                    placeholder="Alu ngoài trời, Chữ nổi Inox, LED Samsung"
                    className="w-full rounded-xl border border-black/15 bg-[#faf9f6] px-3.5 py-2.5 text-sm outline-hidden focus:border-(--accent-bronze)"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold">
                    Tổ đội & Tiến độ
                  </label>
                  <input
                    type="text"
                    value={draft.team}
                    onChange={(e) =>
                      setDraft((d) => ({ ...d, team: e.target.value }))
                    }
                    placeholder="Tổ Quảng cáo • Hoàn thành 10 ngày"
                    className="w-full rounded-xl border border-black/15 bg-[#faf9f6] px-3.5 py-2.5 text-sm outline-hidden focus:border-(--accent-bronze)"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold">
                  Link ảnh Phối cảnh 3D (tùy chọn)
                </label>
                <input
                  type="text"
                  value={draft.img3D}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, img3D: e.target.value }))
                  }
                  placeholder="https://... hoặc /image/projects/..."
                  className="w-full rounded-xl border border-black/15 bg-[#faf9f6] px-3.5 py-2.5 text-sm outline-hidden focus:border-(--accent-bronze)"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold">
                  Mô tả ngắn
                </label>
                <textarea
                  rows={3}
                  value={draft.desc}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, desc: e.target.value }))
                  }
                  placeholder="Tóm tắt phạm vi thi công, điểm nhấn kỹ thuật..."
                  className="w-full rounded-xl border border-black/15 bg-[#faf9f6] px-3.5 py-2.5 text-sm outline-hidden focus:border-(--accent-bronze)"
                />
              </div>
            </>
          )}

          {error && (
            <div className="rounded-xl border border-red-500/25 bg-red-50 px-4 py-2.5 text-xs font-medium text-red-700">
              {error}
            </div>
          )}
        </div>

        {/* Wizard Footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-black/8 bg-[#faf9f6] px-6 py-4">
          {step > 0 ? (
            <button
              type="button"
              onClick={() => setStep((s) => s - 1)}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-black/15 bg-white px-4 py-2 text-xs font-semibold text-[#1a1918] hover:border-[#1a1918]"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Quay lại
            </button>
          ) : (
            <span className="text-xs text-[#625f5a]">
              Bước {step + 1} / 3
            </span>
          )}

          <div className="flex flex-wrap items-center gap-2">
            {step < 2 ? (
              <button
                type="button"
                onClick={handleNext}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-[#181715] px-5 py-2.5 text-xs font-semibold text-white hover:bg-(--accent-bronze)"
              >
                Tiếp tục
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            ) : (
              <>
                {!editingProject && (
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => handleSave(true)}
                    className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-[#181715] bg-white px-4 py-2.5 text-xs font-semibold text-[#181715] hover:bg-[#181715] hover:text-white disabled:opacity-50"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    {saving ? "Đang lưu..." : "Lưu & Thêm dự án tiếp"}
                  </button>
                )}
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => handleSave(false)}
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-[#181715] px-5 py-2.5 text-xs font-semibold text-white hover:bg-(--accent-bronze) disabled:opacity-50"
                >
                  <Check className="h-3.5 w-3.5" />
                  {saving
                    ? "Đang lưu..."
                    : editingProject
                    ? "Cập nhật dự án"
                    : "Lưu & Đóng"}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </BaseModal>
  );
};

export default ProjectWizardModal;
