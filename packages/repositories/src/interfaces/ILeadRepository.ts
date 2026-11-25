import type {
  CreateLeadActivityDto,
  CreateLeadDto,
  Lead,
  LeadActivity,
  LeadFilter,
  LeadStatus,
} from "@khangviet/types";

export interface ILeadRepository {
  createLead(data: CreateLeadDto): Promise<Lead>;
  getLeads(filter?: LeadFilter): Promise<Lead[]>;
  getLeadById(id: string): Promise<(Lead & { activities: LeadActivity[] }) | null>;
  updateLeadStatus(
    id: string,
    status: LeadStatus,
    note?: string,
    userId?: string
  ): Promise<Lead | null>;
  addLeadActivity(
    leadId: string,
    data: CreateLeadActivityDto,
    userId?: string
  ): Promise<LeadActivity | null>;
  deleteLead(id: string): Promise<boolean>;
}
