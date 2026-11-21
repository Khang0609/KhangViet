import type { SafeUser } from "@khangviet/types";

export interface ISessionRepository {
  createSession(userId: string, ttlSeconds?: number): Promise<{ sessionId: string; expiresAt: number }>;
  findUserBySessionId(sessionId: string): Promise<SafeUser | null>;
  deleteSession(sessionId: string): Promise<boolean>;
  deleteExpiredSessions(): Promise<number>;
}
