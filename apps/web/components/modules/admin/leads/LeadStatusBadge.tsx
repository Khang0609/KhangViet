import React from "react";
import type { LeadStatus } from "@khangviet/types";

interface Props {
  status: LeadStatus;
}

const statusMap: Record<LeadStatus, { label: string; className: string }> = {
  NEW: { label: "MỚI", className: "border-amber-500/30 bg-amber-500/10 text-amber-400" },
  CONTACTED: { label: "ĐÃ LIÊN HỆ", className: "border-blue-500/30 bg-blue-500/10 text-blue-400" },
  SURVEY_SCHEDULED: { label: "HẸN KHẢO SÁT", className: "border-purple-500/30 bg-purple-500/10 text-purple-400" },
  QUOTED: { label: "ĐÃ BÁO GIÁ", className: "border-cyan-500/30 bg-cyan-500/10 text-cyan-400" },
  WON: { label: "THẮNG DEAL", className: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400" },
  LOST: { label: "HỦY / THẤT BẠI", className: "border-white/20 bg-white/5 text-white/50" },
};

export const LeadStatusBadge: React.FC<Props> = ({ status }) => {
  const conf = statusMap[status] || { label: status, className: "text-white" };

  return (
    <span
      className={`inline-flex items-center rounded border px-2 py-0.5 font-mono-tech text-[10px] tracking-wider uppercase ${conf.className}`}
    >
      {conf.label}
    </span>
  );
};

export default LeadStatusBadge;

