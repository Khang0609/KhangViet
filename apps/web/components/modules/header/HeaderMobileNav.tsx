import React from "react";
import Link from "next/link";
import { ArrowRight, FileText } from "lucide-react";
import { SITE_NAV_ITEMS } from "../../shared/SiteHeader";

export interface HeaderMobileNavProps {
  pathname?: string | null;
  showProfileAction?: boolean;
  onClose: () => void;
  onOpenProfile: () => void;
}

export const HeaderMobileNav: React.FC<HeaderMobileNavProps> = ({
  pathname,
  showProfileAction = true,
  onClose,
  onOpenProfile,
}) => {
  return (
    <div className="border-t border-white/8 bg-(--bg-obsidian) px-5 py-5 lg:hidden">
      <nav
        className="mx-auto grid max-w-360 gap-1"
        aria-label="Điều hướng di động"
      >
        {SITE_NAV_ITEMS.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname?.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`flex items-center justify-between border-b border-white/6 py-3 text-sm ${
                isActive ? "font-semibold text-(--text-primary)" : ""
              }`}
            >
              <span>
                <span className="font-mono-tech mr-3 text-(--accent-bronze)">
                  {item.number}
                </span>
                {item.label}
              </span>
              <ArrowRight className="h-4 w-4 text-(--text-secondary)" />
            </Link>
          );
        })}

        {showProfileAction && (
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenProfile();
            }}
            className="mt-4 flex cursor-pointer items-center justify-center gap-2 bg-(--accent-bronze) px-4 py-3 text-xs font-bold tracking-wider text-(--bg-obsidian) uppercase"
          >
            <FileText className="h-4 w-4" />
            Xem hồ sơ năng lực
          </button>
        )}
      </nav>
    </div>
  );
};

export default HeaderMobileNav;
