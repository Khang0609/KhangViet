import React from 'react';
import { ArrowRight, FileText } from 'lucide-react';
import { NAV_ITEMS } from './Header';

export interface HeaderMobileNavProps {
  onClose: () => void;
  onOpenProfile: () => void;
}

export const HeaderMobileNav: React.FC<HeaderMobileNavProps> = ({
  onClose,
  onOpenProfile,
}) => {
  return (
    <div className="border-t border-white/8 bg-(--bg-obsidian) px-5 py-5 lg:hidden">
      <nav className="mx-auto grid max-w-360 gap-1" aria-label="Điều hướng di động">
        {NAV_ITEMS.map((item) => (
          <a
            key={item.href}
            href={item.href}
            onClick={onClose}
            className="flex items-center justify-between border-b border-white/6 py-3 text-sm"
          >
            <span>
              <span className="mr-3 font-mono-tech text-(--accent-bronze)">
                {item.number}
              </span>
              {item.label}
            </span>
            <ArrowRight className="h-4 w-4 text-(--text-secondary)" />
          </a>
        ))}
        <button
          type="button"
          onClick={() => {
            onClose();
            onOpenProfile();
          }}
          className="mt-4 flex items-center justify-center gap-2 bg-(--accent-bronze) px-4 py-3 text-xs font-bold uppercase tracking-wider text-(--bg-obsidian) cursor-pointer"
        >
          <FileText className="h-4 w-4" />
          Xem hồ sơ năng lực
        </button>
      </nav>
    </div>
  );
};

export default HeaderMobileNav;

