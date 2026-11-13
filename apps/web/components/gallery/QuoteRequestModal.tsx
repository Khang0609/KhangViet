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
      <div className="p-6">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <span className="font-mono-tech text-[10px] tracking-widest text-(--accent-bronze) uppercase">
              Khang Việt Design • Báo giá nhanh
            </span>
            <h3 className="mt-1 text-lg font-extrabold text-white">
              Yêu Cầu Khảo Sát &amp; Báo Giá
            </h3>
            <p className="mt-1 text-xs text-zinc-400">
              Tham chiếu:{" "}
              <span className="font-semibold text-brand">{project.title}</span>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng hộp thoại báo giá"
            className="cursor-pointer rounded-lg bg-zinc-800 p-1.5 text-zinc-400 transition-colors hover:bg-zinc-700 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <QuickQuoteForm
          key={project.id}
          serviceCategory={`Báo giá mẫu (${project.segment}) - ${project.category}`}
          defaultRequestText={`Tư vấn & báo giá hạng mục tương tự dự án: ${project.title}`}
          submitLabel="Gửi yêu cầu báo giá"
          className="space-y-3"
        />
      </div>
    </BaseModal>
  );
};

export default QuoteRequestModal;
