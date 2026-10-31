import type {
  ContactLead,
  CreateLeadDto,
  LeadFilter,
  LeadStatus,
} from "@khangviet/types";
import { ILeadRepository } from "../interfaces/ILeadRepository";
import { mockStore } from "./store";

export class JsonLeadRepository implements ILeadRepository {
  async createLead(data: CreateLeadDto): Promise<ContactLead> {
    const now = new Date().toISOString();
    const newLead: ContactLead = {
      ...data,
      id: `lead-${Date.now()}`,
      status: "NEW",
      createdAt: now,
      updatedAt: now,
    };
    mockStore.leads.unshift(newLead);
    return newLead;
  }

  async getLeads(filter?: LeadFilter): Promise<ContactLead[]> {
    let result = [...mockStore.leads];
    if (filter?.status) {
      result = result.filter((l) => l.status === filter.status);
    }
    if (filter?.search) {
      const q = filter.search.toLowerCase();
      result = result.filter(
        (l) =>
          l.fullName.toLowerCase().includes(q) ||
          l.phone.includes(q) ||
          (l.email && l.email.toLowerCase().includes(q))
      );
    }
    return result;
  }

  async getLeadById(id: string): Promise<ContactLead | null> {
    const lead = mockStore.leads.find((l) => l.id === id);
    return lead ? { ...lead } : null;
  }

  async updateLeadStatus(
    id: string,
    status: LeadStatus,
    notes?: string
  ): Promise<ContactLead | null> {
    const lead = mockStore.leads.find((l) => l.id === id);
    if (!lead) {
      return null;
    }
    lead.status = status;
    lead.updatedAt = new Date().toISOString();
    if (notes !== undefined) {
      lead.notes = notes;
    }
    return { ...lead };
  }

  async deleteLead(id: string): Promise<boolean> {
    const prevLen = mockStore.leads.length;
    mockStore.leads = mockStore.leads.filter((l) => l.id !== id);
    return mockStore.leads.length < prevLen;
  }
}

