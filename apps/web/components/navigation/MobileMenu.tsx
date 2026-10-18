import React from "react";
import { ArrowRight, FileText } from "lucide-react";
import { NavItem } from "./types";

interface MobileMenuProps {
  isOpen: boolean;
  items: NavItem[];
  onItemClick: () => void;
  onOpenProfile?: () => void;
}

export const MobileMenu: React.FC<MobileMenuProps> = ({
  isOpen,
  items,
  onItemClick,
  onOpenProfile,
}) => {
  if (!isOpen) return null;

  return (
    <div className="animate-in fade-in border-t border-white/8 bg-(--bg-obsidian) px-5 py-5 duration-150 lg:hidden">
      <nav
        className="mx-auto grid max-w-360 gap-1"
        aria-label="Điều hướng di động"
      >
        {items.map((item) => (
          <a
            key={item.href}
            href={item.href}
            onClick={onItemClick}
            className="flex items-center justify-between border-b border-white/6 py-3 text-sm"
          >
            <span>
              {item.number && (
                <span className="font-mono-tech mr-3 text-(--accent-bronze)">
                  {item.number}
                </span>
              )}
              {item.label}
            </span>
            <ArrowRight className="h-4 w-4 text-(--text-secondary)" />
          </a>
        ))}

        {onOpenProfile && (
          <button
            type="button"
            onClick={onOpenProfile}
            className="mt-4 flex items-center justify-center gap-2 bg-(--accent-bronze) px-4 py-3 text-xs font-bold tracking-wider text-(--bg-obsidian) uppercase"
          >
            <FileText className="h-4 w-4" />
            Xem hồ sơ năng lực
          </button>
        )}
      </nav>
    </div>
  );
};
