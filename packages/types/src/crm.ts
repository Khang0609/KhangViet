export type LeadStatus =
  | "NEW"
  | "CONTACTED"
  | "SURVEY_SCHEDULED"
  | "QUOTED"
  | "WON"
  | "LOST";

export interface ContactLead {
  id: string;
  fullName: string;
  phone: string;
  email?: string;
  serviceCategory?: string;
  projectScale?: string;
  message?: string;
  status: LeadStatus;
  createdAt: string;
  updatedAt: string;
  notes?: string;
}

export interface CreateLeadDto {
  fullName: string;
  phone: string;
  email?: string;
  serviceCategory?: string;
  projectScale?: string;
  message?: string;
}

export interface LeadFilter {
  status?: LeadStatus;
  search?: string;
}

