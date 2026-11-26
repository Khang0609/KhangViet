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
    <div className="border-t border-black/8 bg-[#f4f1ea] px-5 py-5 lg:hidden">
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
              className={`flex items-center justify-between border-b border-black/8 py-3.5 text-sm ${
                isActive ? "font-semibold text-[#1a1918]" : "text-[#625f5a]"
              }`}
            >
              <span>{item.label}</span>
              <ArrowRight className="h-4 w-4 text-[#625f5a]" />
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
            className="mt-4 flex cursor-pointer items-center justify-center gap-2 rounded-full bg-[#1a1918] px-4 py-3 text-xs font-semibold text-white"
          >
            <FileText className="h-4 w-4 text-(--accent-bronze)" />
            Xem hồ sơ năng lực
          </button>
        )}
      </nav>
    </div>
  );
};

export default HeaderMobileNav;
