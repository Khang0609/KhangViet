import React from "react";
import { Building2, Calendar, Layers } from "lucide-react";
import type { Project } from "@/types/landing";
import TechBadge from "../../ui/TechBadge";
import PhoneCallButton from "../../ui/PhoneCallButton";

export interface ProjectDossierInfoProps {
  project: Project;
  onClose: () => void;
}

export const ProjectDossierInfo: React.FC<ProjectDossierInfoProps> = ({
  project,
  onClose,
}) => {
  const servicesLabel =
    project.services?.map((s) => s.name).join(" • ") || "Thiết kế & Thi công";

  return (
    <div className="space-y-6 overflow-y-auto bg-(--bg-surface) p-6 sm:p-8 lg:w-5/12">
      <div>
        <TechBadge variant="line" className="mb-2">
          {servicesLabel}
        </TechBadge>
        <h3 className="font-syne mt-2 text-xl leading-snug font-bold text-(--text-primary) sm:text-2xl">
          {project.title}
        </h3>
        {project.summary && (
          <p className="mt-2 text-xs leading-relaxed text-(--text-secondary) sm:text-sm">
            {project.summary}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 rounded-xl border border-black/8 bg-(--bg-obsidian) p-4">
        <div>
          <div className="font-mono-tech flex items-center gap-1.5 text-[11px] text-(--text-secondary) uppercase">
            <Building2 className="h-3.5 w-3.5 text-(--accent-bronze)" /> Đối tác
          </div>
          <div className="mt-1 text-xs font-medium text-(--text-primary)">
            {project.organization?.name || "Khách hàng Khang Việt"}
          </div>
        </div>
        <div>
          <div className="font-mono-tech flex items-center gap-1.5 text-[11px] text-(--text-secondary) uppercase">
            <Calendar className="h-3.5 w-3.5 text-(--accent-bronze)" /> Năm hoàn thành
          </div>
          <div className="mt-1 text-xs font-semibold text-(--accent-bronze)">
            {project.year || 2025}
          </div>
        </div>
      </div>

      {project.services && project.services.length > 0 && (
        <div>
          <h4 className="font-mono-tech mb-3 flex items-center gap-2 text-xs tracking-widest text-(--text-primary) uppercase">
            <Layers className="h-4 w-4 text-(--accent-bronze)" />
            Hạng Mục Triển Khai
          </h4>
          <ul className="space-y-2">
            {project.services.map((svc, i) => (
              <li
                key={svc.id}
                className="flex items-start gap-2.5 border-b border-black/6 py-1.5 text-xs text-(--text-secondary)"
              >
                <span className="font-mono-tech mt-0.5 text-[11px] text-(--accent-bronze)">
                  0{i + 1}.
                </span>
                <span className="text-(--text-primary)/90">{svc.name}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex flex-col gap-3 border-t border-black/8 pt-3 sm:flex-row">
        <a
          href="#contact-gate"
          onClick={onClose}
          className="flex-1 rounded-full bg-[#1a1918] px-5 py-3 text-center text-xs font-medium text-white transition-colors hover:bg-(--accent-bronze)"
        >
          Yêu Cầu Báo Giá Hạng Mục Tương Tự
        </a>
        <PhoneCallButton className="justify-center" />
      </div>
    </div>
  );
};

export default ProjectDossierInfo;
