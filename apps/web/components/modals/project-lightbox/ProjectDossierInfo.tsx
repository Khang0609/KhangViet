import React from 'react';
import { Calendar, CheckCircle2, Layers, MapPin } from 'lucide-react';
import { FeaturedProject } from '@/data/khangVietData';
import TechBadge from '../../ui/TechBadge';
import PhoneCallButton from '../../ui/PhoneCallButton';

export interface ProjectDossierInfoProps {
  project: FeaturedProject;
  onClose: () => void;
}

export const ProjectDossierInfo: React.FC<ProjectDossierInfoProps> = ({
  project,
  onClose,
}) => {
  return (
    <div className="lg:w-5/12 p-6 sm:p-8 overflow-y-auto space-y-6 bg-(--bg-surface)">
      <div>
        <TechBadge variant="line" className="mb-2">
          {project.code} • {project.categoryTag}
        </TechBadge>
        <h3 className="font-syne text-xl sm:text-2xl font-bold text-(--text-primary) mt-2 leading-snug">
          {project.title}
        </h3>
        <p className="text-xs sm:text-sm text-(--text-secondary) mt-2 leading-relaxed">
          {project.summary}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 p-4 bg-(--bg-obsidian) border border-white/8">
        <div>
          <div className="text-[11px] font-mono-tech text-(--text-secondary) uppercase flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-(--accent-bronze)" /> Địa điểm triển khai
          </div>
          <div className="text-xs text-(--text-primary) font-medium mt-1">
            {project.locations.join(' • ')}
          </div>
        </div>
        <div>
          <div className="text-[11px] font-mono-tech text-(--text-secondary) uppercase flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-(--accent-bronze)" /> Quy mô & Giai đoạn
          </div>
          <div className="text-xs text-(--accent-bronze) font-semibold mt-1">
            {project.scaleMetric} ({project.year})
          </div>
        </div>
      </div>

      <div>
        <h4 className="font-mono-tech text-xs uppercase tracking-widest text-(--text-primary) flex items-center gap-2 mb-3">
          <Layers className="w-4 h-4 text-(--accent-bronze)" />
          Cấu Hình Vật Liệu & Quy Cách Kỹ Thuật
        </h4>
        <ul className="space-y-2">
          {project.materials.map((mat: string, i: number) => (
            <li
              key={i}
              className="text-xs text-(--text-secondary) flex items-start gap-2.5 py-1.5 border-b border-white/5"
            >
              <span className="font-mono-tech text-(--accent-bronze) text-[11px] mt-0.5">
                0{i + 1}.
              </span>
              <span className="text-(--text-primary)/90">{mat}</span>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h4 className="font-mono-tech text-xs uppercase tracking-widest text-(--text-primary) mb-3">
          Tiêu Chuẩn Thi Công & Nghiệm Thu
        </h4>
        <div className="space-y-2">
          {project.engineeringNotes.map((note: string, i: number) => (
            <div key={i} className="flex items-start gap-2 text-xs text-(--text-secondary)">
              <CheckCircle2 className="w-4 h-4 text-(--accent-bronze) shrink-0 mt-0.5" />
              <span>{note}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-3 border-t border-white/8 flex flex-col sm:flex-row gap-3">
        <a
          href="#contact-gate"
          onClick={onClose}
          className="flex-1 py-3 px-4 bg-(--accent-bronze) hover:bg-(--accent-bronze-light) text-(--bg-obsidian) font-semibold text-xs uppercase tracking-wider text-center transition-colors"
        >
          Yêu Cầu Báo Giá Hạng Mục Tương Tự
        </a>
        <PhoneCallButton variant="outline" className="py-3 px-4" />
      </div>
    </div>
  );
};

export default ProjectDossierInfo;

