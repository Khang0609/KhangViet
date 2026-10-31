"use client";

import React, { useState } from "react";
import type { AdminTab } from "@/components/modules/admin/shared/types";
import { AdminSidebar } from "@/components/modules/admin/AdminSidebar";
import { ProjectListView } from "@/components/modules/admin/projects";
import { ContactLegalView } from "@/components/modules/admin/contact-legal";
import { LeadListView } from "@/components/modules/admin/leads";
import { HeroSlidesView } from "@/components/modules/admin/hero";

export default function AdminPage() {
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
}

