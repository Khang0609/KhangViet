import type { Lead, LeadActivity } from "@khangviet/types";
import type { LeadActivityRecord, LeadRecord } from "../schema";

export function mapLeadRecordToDomain(row: LeadRecord): Lead {
  return {
    id: row.id,
    name: row.name,
    email: row.email ?? null,
    phone: row.phone,
    companyName: row.companyName ?? null,
    serviceId: row.serviceId ?? null,
    message: row.message ?? null,
    budgetRange: row.budgetRange ?? null,
    source: row.source ?? null,
    status: row.status,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export function mapLeadActivityRecordToDomain(
  row: LeadActivityRecord
): LeadActivity {
  return {
    id: row.id,
    leadId: row.leadId,
    userId: row.userId ?? null,
    action: row.action,
    note: row.note,
    createdAt: row.createdAt,
  };
}
