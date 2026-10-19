import type {
  ContactLead,
  CreateLeadDto,
  LeadFilter,
  LeadStatus,
} from "@khangviet/types";

export interface ILeadRepository {
  createLead(data: CreateLeadDto): Promise<ContactLead>;
  getLeads(filter?: LeadFilter): Promise<ContactLead[]>;
  getLeadById(id: string): Promise<ContactLead | null>;
  updateLeadStatus(
    id: string,
    status: LeadStatus,
    notes?: string
  ): Promise<ContactLead>;
  deleteLead(id: string): Promise<boolean>;
}

