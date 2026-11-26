"use client";

import React from "react";
import { X } from "lucide-react";
import type { GalleryProject } from "@khangviet/types";
import { BaseModal } from "../ui/BaseModal";
import { QuickQuoteForm } from "../shared/QuickQuoteForm";

interface QuoteRequestModalProps {
  project: GalleryProject | null;
  onClose: () => void;
}

export const QuoteRequestModal: React.FC<QuoteRequestModalProps> = ({
  project,
  onClose,
}) => {
  if (!project) return null;

  return (
    <BaseModal
      isOpen={Boolean(project)}
      onClose={onClose}
      maxWidth="max-w-lg"
      ariaLabel={`Yêu cầu báo giá tham chiếu ${project.title}`}
    >
      <div className="bg-white p-6 text-[#1a1918]">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <span className="text-xs font-medium tracking-wider text-(--accent-bronze) uppercase">
              Khang Việt Design • Báo giá nhanh
            </span>
            <h3 className="mt-1 text-lg font-semibold text-[#1a1918]">
              Yêu Cầu Khảo Sát &amp; Báo Giá
            </h3>
            <p className="mt-1 text-xs text-[#625f5a]">
              Tham chiếu:{" "}
              <span className="font-semibold text-[#1a1918]">{project.title}</span>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng hộp thoại báo giá"
            className="cursor-pointer rounded-full border border-black/10 bg-[#f4f1ea] p-1.5 text-[#625f5a] transition-colors hover:bg-[#1a1918] hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <QuickQuoteForm
          key={project.id}
          serviceCategory={`Báo giá mẫu - ${project.services[0]?.name || "Thi công"}`}
          defaultRequestText={`Tư vấn & báo giá hạng mục tương tự dự án: ${project.title}`}
          submitLabel="Gửi yêu cầu báo giá"
          className="space-y-3"
        />
      </div>
    </BaseModal>
  );
};

export default QuoteRequestModal;
