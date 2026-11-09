import type { ContactLead } from "@khangviet/types";

export interface LeadJoinedRow {
  id: string;
  identityId: string;
  serviceCategory: string | null;
  projectScale: string | null;
  initialMessage: string | null;
  status: ContactLead["status"];
  createdAt: string;
  updatedAt: string;
  fullName: string;
  phone: string;
  email: string | null;
  notes: string | null;
}

export function mapToContactLead(r: LeadJoinedRow): ContactLead {
  return {
    id: r.id,
    fullName: r.fullName,
    phone: r.phone,
    email: r.email ?? undefined,
    serviceCategory: r.serviceCategory ?? undefined,
    projectScale: r.projectScale ?? undefined,
    message: r.initialMessage ?? undefined,
    status: r.status,
    notes: r.notes ?? undefined,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  };
}
