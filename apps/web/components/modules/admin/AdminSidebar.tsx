"use client";

import React from "react";
import { Briefcase, PhoneCall, Users, Sliders } from "lucide-react";
import type { AdminTab } from "./shared/types";

interface Props {
  activeTab: AdminTab;
  onSelectTab: (tab: AdminTab) => void;
}

const navItems: Array<{ id: AdminTab; label: string; icon: React.ElementType }> = [
  { id: "PROJECTS", label: "Dự Án Tiêu Biểu", icon: Briefcase },
  { id: "LEGAL", label: "Liên Lạc & Pháp Lý", icon: PhoneCall },
  { id: "LEADS", label: "Khách Hàng (CRM)", icon: Users },
  { id: "HERO", label: "Hero Slides", icon: Sliders },
];

export const AdminSidebar: React.FC<Props> = ({ activeTab, onSelectTab }) => {
  return (
    <aside className="w-full shrink-0 md:w-64">
      <div className="rounded-lg border border-white/8 bg-(--bg-surface) p-3">
        <div className="mb-2 px-3 py-1.5 font-mono-tech text-[10px] tracking-widest text-white/40 uppercase">
          Quản Trị Nội Dung
        </div>
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`flex w-full items-center gap-3 rounded-md px-3.5 py-2.5 font-mono-tech text-xs transition-colors ${
                  isActive
                    ? "bg-(--color-brand) font-bold text-black shadow-sm"
                    : "text-white/70 hover:bg-white/4 hover:text-white"
                }`}
              >
                <Icon className={`h-4 w-4 shrink-0 ${isActive ? "text-black" : "text-(--accent-bronze)"}`} />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </aside>
  );
};

export default AdminSidebar;

