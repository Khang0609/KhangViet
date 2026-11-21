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
  fullName: z.string().trim().min(1, "Họ tên không được để trống").max(120),
  phone: z
    .string()
    .trim()
    .regex(/^[0-9+\-\s()]{8,20}$/, "Số điện thoại không hợp lệ"),
  email: z.string().trim().email("Email không hợp lệ").max(160).optional().or(z.literal("")),
  serviceCategory: z.string().trim().max(120).optional(),
  projectScale: z.string().trim().max(120).optional(),
  message: z.string().trim().max(2000).optional(),
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
