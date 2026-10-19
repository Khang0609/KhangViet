export type ChangeActionType =
  | "UPDATE_PROJECT"
  | "CREATE_PROJECT"
  | "DELETE_PROJECT"
  | "UPDATE_HERO"
  | "UPDATE_LEGAL";

export interface PendingChange {
  id: string;
  action: ChangeActionType;
  targetId?: string;
  payload: unknown;
  status: "PENDING" | "APPLIED" | "DISCARDED";
  createdAt: string;
  appliedAt?: string;
}

export interface SyncStatus {
  isMidnightWindow: boolean;
  hasPendingChanges: boolean;
  pendingCount: number;
  serverTime: string;
  currentHourVN: number;
}

