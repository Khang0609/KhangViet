import React from "react";
import { NavItem } from "./types";

interface DesktopNavProps {
  items: NavItem[];
}

export const DesktopNav: React.FC<DesktopNavProps> = ({ items }) => (
  <nav
    className="hidden items-center gap-7 lg:flex xl:gap-9"
    aria-label="Điều hướng chính"
  >
    {items.map((item) => (
      <a
        key={item.href}
        href={item.href}
        className="group text-xs font-medium text-(--text-secondary) transition-colors hover:text-(--text-primary)"
      >
        {item.number && (
          <span className="font-mono-tech mr-1.5 text-[10px] text-(--accent-bronze)">
            {item.number}
          </span>
        )}
        {item.label}
      </a>
    ))}
  </nav>
);
