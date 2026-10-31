"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Search } from "lucide-react";
import type { ContactLead, LeadStatus } from "@khangviet/types";
import { AdminCard } from "../shared";
import { LeadRowItem } from "./LeadRowItem";
import { leadFilterTabs } from "./leadConstants";
import { getLeads, updateLeadStatus, deleteLead } from "./leadService";

export const LeadListView: React.FC = () => {
  const [leads, setLeads] = useState<ContactLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState<LeadStatus | "ALL">("ALL");
  const [search, setSearch] = useState("");

  const reloadLeads = useCallback(async () => {
    const res = await getLeads(currentTab, search);
    if (res.success) setLeads(res.data);
    setLoading(false);
  }, [currentTab, search]);

  useEffect(() => {
    let active = true;
    getLeads(currentTab, search).then((res) => {
      if (active && res.success) setLeads(res.data);
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, [currentTab, search]);

  const handleUpdate = async (id: string, status: LeadStatus, notes?: string) => {
    const res = await updateLeadStatus(id, status, notes);
    if (res.success) reloadLeads();
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa khách hàng này?")) return;
    const res = await deleteLead(id);
    if (res.success) reloadLeads();
  };

  return (
    <AdminCard
      title="Quản Lý Khách Hàng Tiềm Năng (CRM Leads)"
      subtitle="Danh sách khách hàng yêu cầu tư vấn và đăng ký gửi từ Contact Dual Gates."
    >
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {leadFilterTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setCurrentTab(tab.id)}
              className={`rounded px-3 py-1.5 font-mono-tech text-xs transition-colors ${currentTab === tab.id ? "bg-brand font-bold text-black" : "border border-white/10 bg-white/4 text-white/70 hover:text-white"}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative flex items-center">
          <Search className="absolute left-3 h-3.5 w-3.5 text-white/40" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên hoặc SĐT..."
            className="rounded border border-white/10 bg-white/5 py-1.5 pr-3 pl-9 font-mono-tech text-xs text-white placeholder:text-white/30 focus:border-(--accent-bronze) focus:outline-hidden"
          />
        </div>
      </div>

      {loading ? (
        <div className="py-8 text-center font-mono-tech text-xs text-white/40">Đang tải danh sách...</div>
      ) : leads.length === 0 ? (
        <div className="py-8 text-center font-mono-tech text-xs text-white/30">Không tìm thấy yêu cầu nào.</div>
      ) : (
        <div className="space-y-3">
          {leads.map((lead) => (
            <LeadRowItem key={lead.id} lead={lead} onUpdateStatus={handleUpdate} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </AdminCard>
  );
};

export default LeadListView;
