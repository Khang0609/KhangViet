import { z } from "zod";

export const LeadStatusSchema = z.enum([
  "NEW",
  "CONTACTED",
  "QUOTED",
  "WON",
  "LOST",
]);
export type LeadStatus = z.infer<typeof LeadStatusSchema>;

export const LeadSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().nullable().optional(),
  phone: z.string(),
  companyName: z.string().nullable().optional(),
  serviceId: z.string().nullable().optional(),
  message: z.string().nullable().optional(),
  budgetRange: z.string().nullable().optional(),
  source: z.string().nullable().optional(),
  status: LeadStatusSchema,
  createdAt: z.number().int(),
  updatedAt: z.number().int(),
});
export type Lead = z.infer<typeof LeadSchema>;

export const CreateLeadDtoSchema = z.object({
  name: z.string().trim().min(1, "Họ tên không được để trống").max(120),
  phone: z
    .string()
    .trim()
    .regex(/^[0-9+\-\s()]{8,20}$/, "Số điện thoại không hợp lệ"),
  email: z
    .string()
    .trim()
    .email("Email không hợp lệ")
    .max(160)
    .nullable()
    .optional()
    .or(z.literal("")),
  companyName: z.string().trim().max(160).nullable().optional(),
  serviceId: z.string().nullable().optional(),
  message: z.string().trim().max(2000).nullable().optional(),
  budgetRange: z.string().trim().max(120).nullable().optional(),
  source: z.string().trim().max(80).nullable().optional(),
});
export type CreateLeadDto = z.infer<typeof CreateLeadDtoSchema>;

export const UpdateLeadStatusDtoSchema = z.object({
  status: LeadStatusSchema,
  note: z.string().trim().max(1000).optional(),
});
export type UpdateLeadStatusDto = z.infer<typeof UpdateLeadStatusDtoSchema>;

export const LeadFilterSchema = z.object({
  status: LeadStatusSchema.optional(),
  search: z.string().optional(),
});
export type LeadFilter = z.infer<typeof LeadFilterSchema>;

export const LeadActivityActionSchema = z.enum([
  "NOTE",
  "CALL",
  "EMAIL",
  "STATUS_CHANGE",
]);
export type LeadActivityAction = z.infer<typeof LeadActivityActionSchema>;

export const LeadActivitySchema = z.object({
  id: z.string(),
  leadId: z.string(),
  userId: z.string().nullable().optional(),
  action: LeadActivityActionSchema,
  note: z.string(),
  createdAt: z.number().int(),
});
export type LeadActivity = z.infer<typeof LeadActivitySchema>;

export const CreateLeadActivityDtoSchema = z.object({
  action: LeadActivityActionSchema,
  note: z.string().trim().min(1, "Nội dung ghi chú không được trống").max(1000),
});
export type CreateLeadActivityDto = z.infer<typeof CreateLeadActivityDtoSchema>;
