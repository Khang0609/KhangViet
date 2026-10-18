import React from "react";
import { FileText } from "lucide-react";

interface NavActionsProps {
  phoneNumber: string;
  phoneTel: string;
  onOpenProfile?: () => void;
}

export const NavActions: React.FC<NavActionsProps> = ({
  phoneNumber,
  phoneTel,
  onOpenProfile,
}) => (
  <div className="hidden items-center gap-2 sm:flex">
    {onOpenProfile && (
      <button
        type="button"
        onClick={onOpenProfile}
        className="hidden items-center gap-2 border border-(--border-bronze-subtle) px-4 py-2.5 text-[10px] font-semibold tracking-[0.12em] text-(--accent-bronze) uppercase transition-colors hover:bg-(--accent-bronze) hover:text-(--bg-obsidian) xl:flex"
      >
        <FileText className="h-3.5 w-3.5" />
        Hồ sơ năng lực
      </button>
    )}
    <a
      href={`tel:${phoneTel}`}
      className="font-mono-tech flex items-center gap-2 border border-white/10 bg-white/3 px-3.5 py-2.5 text-[11px] transition-colors hover:border-(--accent-bronze)"
    >
      <span className="h-1.5 w-1.5 bg-(--accent-bronze) shadow-[0_0_10px_var(--accent-bronze)]" />
      {phoneNumber}
    </a>
  </div>
);
