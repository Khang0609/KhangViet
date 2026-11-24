import type {
  CreateLeadActivityDto,
  CreateLeadDto,
  Lead,
  LeadActivity,
  LeadFilter,
  LeadStatus,
} from "@khangviet/types";
import type { ILeadRepository } from "../interfaces/ILeadRepository";
import { generateUuidV7 } from "../d1/uuid-v7";
import { getStore } from "./store";

export class JsonLeadRepository implements ILeadRepository {
  async createLead(data: CreateLeadDto): Promise<Lead> {
    const now = Math.floor(Date.now() / 1000);
    const lead: Lead = {
      id: generateUuidV7(),
      name: data.name.trim(),
      email: data.email ? data.email.trim().toLowerCase() : null,
      phone: data.phone.trim(),
      companyName: data.companyName?.trim() || null,
      serviceId: data.serviceId ?? null,
      message: data.message?.trim() || null,
      budgetRange: data.budgetRange?.trim() || null,
      source: data.source?.trim() || "website",
      status: "NEW",
      createdAt: now,
      updatedAt: now,
    };
    getStore().leads.unshift(lead);
    return lead;
  }

  async getLeads(filter?: LeadFilter): Promise<Lead[]> {
    let items = [...getStore().leads];
    if (filter?.status) {
      items = items.filter((l) => l.status === filter.status);
    }
    if (filter?.search?.trim()) {
      const term = filter.search.trim().toLowerCase();
      items = items.filter(
        (l) =>
          l.name.toLowerCase().includes(term) ||
          l.phone.includes(term) ||
          (l.email?.toLowerCase().includes(term) ?? false) ||
          (l.companyName?.toLowerCase().includes(term) ?? false)
      );
    }
    return items.sort((a, b) => b.createdAt - a.createdAt);
  }

  async getLeadById(
    id: string
  ): Promise<(Lead & { activities: LeadActivity[] }) | null> {
    const store = getStore();
    const lead = store.leads.find((l) => l.id === id);
    if (!lead) return null;
    const activities = store.leadActivities
      .filter((a) => a.leadId === id)
      .sort((a, b) => b.createdAt - a.createdAt);
    return { ...lead, activities };
  }

  async updateLeadStatus(
    id: string,
    status: LeadStatus,
    note?: string,
    userId?: string
  ): Promise<Lead | null> {
    const store = getStore();
    const lead = store.leads.find((l) => l.id === id);
    if (!lead) return null;

    const now = Math.floor(Date.now() / 1000);
    lead.status = status;
    lead.updatedAt = now;

    store.leadActivities.unshift({
      id: generateUuidV7(),
      leadId: id,
      userId: userId ?? null,
      action: "STATUS_CHANGE",
      note: note?.trim() || `Chuyển trạng thái sang ${status}`,
      createdAt: now,
    });

    return lead;
  }

  async addLeadActivity(
    leadId: string,
    data: CreateLeadActivityDto,
    userId?: string
  ): Promise<LeadActivity | null> {
    const store = getStore();
    const lead = store.leads.find((l) => l.id === leadId);
    if (!lead) return null;

    const activity: LeadActivity = {
      id: generateUuidV7(),
      leadId,
      userId: userId ?? null,
      action: data.action,
      note: data.note.trim(),
      createdAt: Math.floor(Date.now() / 1000),
    };
    store.leadActivities.unshift(activity);
    return activity;
  }

  async deleteLead(id: string): Promise<boolean> {
    const store = getStore();
    const idx = store.leads.findIndex((l) => l.id === id);
    if (idx === -1) return false;
    store.leads.splice(idx, 1);
    store.leadActivities = store.leadActivities.filter(
      (a) => a.leadId !== id
    );
    return true;
  }
}
