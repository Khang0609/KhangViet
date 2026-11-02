"use client";

import React, { useState } from "react";
import type { AdminTab } from "./shared/types";
import { AdminSidebar } from "./AdminSidebar";
import { ProjectListView } from "./projects";
import { ContactLegalView } from "./contact-legal";
import { LeadListView } from "./leads";
import { HeroSlidesView } from "./hero";

/**
 * Container quản lý state tab điều hướng của Dashboard Admin phía Client.
 * Tách biệt hoàn toàn khỏi Server Component page.tsx để tối ưu SSR.
 */
export const AdminDashboardContainer: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AdminTab>("PROJECTS");

  const renderActiveView = () => {
    switch (activeTab) {
      case "PROJECTS":
        return <ProjectListView />;
      case "LEGAL":
        return <ContactLegalView />;
      case "LEADS":
        return <LeadListView />;
      case "HERO":
        return <HeroSlidesView />;
      default:
        return <ProjectListView />;
    }
  };

  return (
    <div className="flex flex-col gap-6 md:flex-row">
      <AdminSidebar activeTab={activeTab} onSelectTab={setActiveTab} />
      <main className="min-w-0 flex-1">{renderActiveView()}</main>
    </div>
  );
};

export default AdminDashboardContainer;

