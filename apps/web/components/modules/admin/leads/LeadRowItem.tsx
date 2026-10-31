import React, { useState } from "react";
import { Phone, Mail, Trash2 } from "lucide-react";
import type { ContactLead, LeadStatus } from "@khangviet/types";
import { LeadStatusBadge } from "./LeadStatusBadge";
import { LeadNotesEditor } from "./LeadNotesEditor";

interface Props {
  lead: ContactLead;
  onUpdateStatus: (id: string, status: LeadStatus, notes?: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export const LeadRowItem: React.FC<Props> = ({ lead, onUpdateStatus, onDelete }) => {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusChange = async (newStatus: LeadStatus) => {
    setIsUpdating(true);
    await onUpdateStatus(lead.id, newStatus, lead.notes);
    setIsUpdating(false);
  };

  return (
    <div className="rounded-lg border border-white/8 bg-white/2 p-4 transition-colors hover:border-white/15">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/6 pb-3">
        <div className="flex items-center gap-3">
          <span className="font-syne text-sm font-bold text-white">{lead.fullName}</span>
          <LeadStatusBadge status={lead.status} />
        </div>
        <div className="flex items-center gap-3">
          <select
            value={lead.status}
            onChange={(e) => handleStatusChange(e.target.value as LeadStatus)}
            disabled={isUpdating}
            className="rounded border border-white/10 bg-[#1a1c20] px-2.5 py-1 font-mono-tech text-xs text-white"
          >
            <option value="NEW">MỚI (NEW)</option>
            <option value="CONTACTED">ĐÃ LIÊN HỆ</option>
            <option value="SURVEY_SCHEDULED">HẸN KHẢO SÁT</option>
            <option value="QUOTED">ĐÃ BÁO GIÁ</option>
            <option value="WON">THẮNG DEAL</option>
            <option value="LOST">HỦY / THẤT BẠI</option>
          </select>
          <button
            onClick={() => onDelete(lead.id)}
            className="rounded border border-red-500/20 p-1 text-red-400 hover:bg-red-500/10"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-2 text-xs text-white/70 sm:grid-cols-2">
        <div className="flex items-center gap-2">
          <Phone className="h-3.5 w-3.5 text-(--accent-bronze)" />
          <a href={`tel:${lead.phone}`} className="font-mono-tech hover:underline">{lead.phone}</a>
        </div>
        {lead.email && (
          <div className="flex items-center gap-2">
            <Mail className="h-3.5 w-3.5 text-(--accent-bronze)" />
            <span>{lead.email}</span>
          </div>
        )}
      </div>

      {(lead.serviceCategory || lead.projectScale || lead.message) && (
        <div className="mt-3 rounded border border-white/6 bg-white/1 p-2.5 text-xs text-white/60">
          <div className="font-mono-tech text-[10px] text-white/40 uppercase">Nhu cầu dự án:</div>
          <p className="mt-0.5">{lead.message || `${lead.serviceCategory || ""} - ${lead.projectScale || ""}`}</p>
        </div>
      )}

      <LeadNotesEditor
        initialNotes={lead.notes || ""}
        onSave={(notes) => onUpdateStatus(lead.id, lead.status, notes)}
      />
    </div>
  );
};

export default LeadRowItem;
