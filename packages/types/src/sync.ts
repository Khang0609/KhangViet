import { z } from "zod";

export const ChangeActionTypeSchema = z.enum([
  "UPDATE_PROJECT",
  "CREATE_PROJECT",
  "DELETE_PROJECT",
  "UPDATE_HERO",
  "UPDATE_LEGAL",
]);
export type ChangeActionType = z.infer<typeof ChangeActionTypeSchema>;

export const PendingChangeStatusSchema = z.enum([
  "PENDING",
  "APPLIED",
  "DISCARDED",
]);
export type PendingChangeStatus = z.infer<typeof PendingChangeStatusSchema>;

export const PendingChangeSchema = z.object({
  id: z.string(),
  action: ChangeActionTypeSchema,
  targetId: z.string().optional(),
  payload: z.unknown(),
  status: PendingChangeStatusSchema,
  createdAt: z.string(),
  appliedAt: z.string().optional(),
});
export type PendingChange = z.infer<typeof PendingChangeSchema>;

export const SyncStatusSchema = z.object({
  isMidnightWindow: z.boolean(),
  hasPendingChanges: z.boolean(),
  pendingCount: z.number(),
  serverTime: z.string(),
  currentHourVN: z.number(),
});
export type SyncStatus = z.infer<typeof SyncStatusSchema>;

export const ApplyPendingResultSchema = z.object({
  appliedCount: z.number(),
  success: z.boolean(),
});
export type ApplyPendingResult = z.infer<typeof ApplyPendingResultSchema>;
