"use client";

import React, { useEffect, useState } from "react";
import { Phone, Search, Trash2, X } from "lucide-react";
import type {
  Lead,
  LeadActivity,
  LeadActivityAction,
  LeadStatus,
} from "@khangviet/types";
import {
  addAdminLeadActivity,
  deleteAdminLead,
  getAdminLeadById,
  getAdminLeads,
  updateAdminLeadStatus,
} from "@/lib/adminApi";
import { AdminShell } from "./AdminShell";

const STATUS_OPTIONS: { value: LeadStatus; label: string; tone: string }[] = [
  { value: "NEW", label: "Mới", tone: "bg-blue-50 text-blue-700" },
  {
    value: "CONTACTED",
    label: "Đã liên hệ",
    tone: "bg-amber-50 text-amber-700",
  },
  {
    value: "QUOTED",
    label: "Đã báo giá",
    tone: "bg-purple-50 text-purple-700",
  },
  { value: "WON", label: "Chốt hợp đồng", tone: "bg-emerald-50 text-emerald-700" },
  { value: "LOST", label: "Không chốt", tone: "bg-black/5 text-[#625f5a]" },
];

export const AdminLeadsClient: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<LeadStatus | "ALL">("ALL");
  const [search, setSearch] = useState("");
  const [selectedLead, setSelectedLead] = useState<
    (Lead & { activities?: LeadActivity[] }) | null
  >(null);
  const [noteInput, setNoteInput] = useState("");
  const [actionType, setActionType] = useState<LeadActivityAction>("NOTE");

  const loadLeads = async () => {
    setLoading(true);
    const res = await getAdminLeads({
      status: statusFilter === "ALL" ? undefined : statusFilter,
      search: search.trim() || undefined,
    });
    if (res.success) setLeads(res.data);
    setLoading(false);
  };

  useEffect(() => {
    void loadLeads();
  }, [statusFilter]);

  const openDetail = async (lead: Lead) => {
    const res = await getAdminLeadById(lead.id);
    if (res.success) {
      setSelectedLead(res.data);
    } else {
      setSelectedLead(lead);
    }
  };

  const handleStatusChange = async (leadId: string, status: LeadStatus) => {
    const res = await updateAdminLeadStatus(leadId, status);
    if (!res.success) return;
    setLeads((prev) => prev.map((l) => (l.id === leadId ? res.data : l)));
    if (selectedLead?.id === leadId) {
      await openDetail(res.data);
    }
  };

  const handleAddActivity = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedLead || !noteInput.trim()) return;
    const res = await addAdminLeadActivity(selectedLead.id, {
      action: actionType,
      note: noteInput.trim(),
    });
    if (res.success) {
      setNoteInput("");
      await openDetail(selectedLead);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Xóa khách hàng tiềm năng này?")) return;
    const res = await deleteAdminLead(id);
    if (res.success) {
      setLeads((prev) => prev.filter((l) => l.id !== id));
      if (selectedLead?.id === id) setSelectedLead(null);
    }
  };

  return (
    <AdminShell
      title="Khách hàng & Yêu cầu tư vấn"
      subtitle="Quản lý thông tin liên hệ từ website và lịch sử chăm sóc."
    >
      <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative sm:w-64">
            <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-[#625f5a]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") void loadLeads();
              }}
              placeholder="Tìm tên, SĐT, công ty..."
              className="w-full rounded-full border border-black/12 bg-white py-2 pr-4 pl-9 text-xs outline-hidden focus:border-(--accent-bronze)"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as LeadStatus | "ALL")
            }
            className="rounded-full border border-black/12 bg-white px-3.5 py-2 text-xs font-medium outline-hidden focus:border-(--accent-bronze)"
          >
            <option value="ALL">Tất cả trạng thái</option>
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-black/10 bg-white shadow-xs">
        {loading ? (
          <div className="p-8 text-center text-xs text-[#625f5a]">
            Đang tải danh sách khách hàng...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-black/8 bg-[#faf9f6] text-[11px] font-semibold tracking-wider text-[#625f5a] uppercase">
                  <th className="px-4 py-3">Khách hàng</th>
                  <th className="px-4 py-3">Số điện thoại</th>
                  <th className="px-4 py-3">Nội dung</th>
                  <th className="px-4 py-3">Trạng thái</th>
                  <th className="px-4 py-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/8">
                {leads.map((lead) => {
                  const statusMeta =
                    STATUS_OPTIONS.find((s) => s.value === lead.status) ??
                    STATUS_OPTIONS[0];
                  return (
                    <tr
                      key={lead.id}
                      onClick={() => void openDetail(lead)}
                      className="cursor-pointer transition-colors hover:bg-[#faf9f6]"
                    >
                      <td className="px-4 py-3">
                        <div className="font-semibold text-[#1a1918]">
                          {lead.name}
                        </div>
                        {lead.companyName && (
                          <div className="text-xs text-[#625f5a]">
                            {lead.companyName}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs font-medium text-[#1a1918]">
                        <span className="inline-flex items-center gap-1">
                          <Phone className="h-3 w-3 text-(--accent-bronze)" />
                          {lead.phone}
                        </span>
                      </td>
                      <td className="max-w-xs truncate px-4 py-3 text-xs text-[#625f5a]">
                        {lead.message || "—"}
                      </td>
                      <td
                        className="px-4 py-3"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <select
                          value={lead.status}
                          onChange={(e) =>
                            void handleStatusChange(
                              lead.id,
                              e.target.value as LeadStatus
                            )
                          }
                          className={`rounded-full px-2.5 py-1 text-[11px] font-semibold outline-hidden ${statusMeta.tone}`}
                        >
                          {STATUS_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td
                        className="px-4 py-3 text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          onClick={() => void handleDelete(lead.id)}
                          className="cursor-pointer rounded-lg p-1.5 text-[#625f5a] hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {leads.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-10 text-center text-xs text-[#625f5a]"
                    >
                      Chưa có yêu cầu tư vấn nào.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedLead && (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs"
          onClick={() => setSelectedLead(null)}
        >
          <aside
            className="flex h-full w-full max-w-lg flex-col bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-black/10 pb-4">
              <div>
                <h3 className="text-lg font-semibold text-[#1a1918]">
                  {selectedLead.name}
                </h3>
                <p className="text-xs text-[#625f5a]">
                  {selectedLead.phone}
                  {selectedLead.email ? ` • ${selectedLead.email}` : ""}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedLead(null)}
                className="cursor-pointer rounded-full p-1 text-[#625f5a] hover:bg-black/5"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 flex-1 space-y-5 overflow-y-auto">
              {selectedLead.message && (
                <div className="rounded-xl bg-[#faf9f6] p-3.5 text-xs leading-relaxed text-[#1a1918]">
                  {selectedLead.message}
                </div>
              )}

              <form onSubmit={handleAddActivity} className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold">
                    Thêm ghi chú chăm sóc
                  </span>
                  <select
                    value={actionType}
                    onChange={(e) =>
                      setActionType(e.target.value as LeadActivityAction)
                    }
                    className="rounded-lg border border-black/12 px-2 py-1 text-xs"
                  >
                    <option value="NOTE">Ghi chú</option>
                    <option value="CALL">Cuộc gọi</option>
                    <option value="EMAIL">Email</option>
                  </select>
                </div>
                <textarea
                  rows={2}
                  value={noteInput}
                  onChange={(e) => setNoteInput(e.target.value)}
                  placeholder="Nhập nội dung trao đổi với khách hàng..."
                  className="w-full rounded-xl border border-black/15 px-3 py-2 text-xs outline-hidden focus:border-(--accent-bronze)"
                />
                <button
                  type="submit"
                  className="cursor-pointer rounded-full bg-[#181715] px-4 py-1.5 text-xs font-semibold text-white hover:bg-(--accent-bronze)"
                >
                  Lưu ghi chú
                </button>
              </form>

              <div className="space-y-2 border-t border-black/8 pt-4">
                <div className="text-xs font-semibold text-[#625f5a]">
                  Lịch sử chăm sóc ({selectedLead.activities?.length ?? 0})
                </div>
                {(selectedLead.activities ?? []).map((act) => (
                  <div
                    key={act.id}
                    className="rounded-xl border border-black/8 bg-[#faf9f6] p-3 text-xs"
                  >
                    <span className="font-semibold text-(--accent-bronze)">
                      [{act.action}]
                    </span>{" "}
                    <span className="text-[#1a1918]">{act.note}</span>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      )}
    </AdminShell>
  );
};

export default AdminLeadsClient;
