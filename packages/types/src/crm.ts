import { z } from "zod";

export const LeadStatusSchema = z.enum([
  "NEW",
  "CONTACTED",
  "SURVEY_SCHEDULED",
  "QUOTED",
  "WON",
  "LOST",
]);
export type LeadStatus = z.infer<typeof LeadStatusSchema>;

export const ContactLeadSchema = z.object({
  id: z.string(),
  fullName: z.string(),
  phone: z.string(),
  email: z.string().optional(),
  serviceCategory: z.string().optional(),
  projectScale: z.string().optional(),
  message: z.string().optional(),
  status: LeadStatusSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
  notes: z.string().optional(),
});
export type ContactLead = z.infer<typeof ContactLeadSchema>;

export const CreateLeadDtoSchema = z.object({
  fullName: z.string().min(1, "Họ tên không được để trống"),
  phone: z.string().min(1, "Số điện thoại không được để trống"),
  email: z.string().optional(),
  serviceCategory: z.string().optional(),
  projectScale: z.string().optional(),
  message: z.string().optional(),
});
export type CreateLeadDto = z.infer<typeof CreateLeadDtoSchema>;

export const LeadFilterSchema = z.object({
  status: LeadStatusSchema.optional(),
  search: z.string().optional(),
});
export type LeadFilter = z.infer<typeof LeadFilterSchema>;

export const LeadActivityActionTypeSchema = z.enum([
  "NOTE",
  "CALL",
  "EMAIL",
  "SURVEY",
  "STATUS_CHANGE",
]);
export type LeadActivityActionType = z.infer<typeof LeadActivityActionTypeSchema>;

export const LeadActivitySchema = z.object({
  id: z.string(),
  leadId: z.string(),
  staffIdentityId: z.string().optional().nullable(),
  actionType: z.string(),
  content: z.string(),
  createdAt: z.string(),
});
export type LeadActivity = z.infer<typeof LeadActivitySchema>;
