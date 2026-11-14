import type { SafeUser } from "@khangviet/types";
import { ISessionRepository } from "../interfaces/ISessionRepository";
import { mockStore } from "./store";

interface SessionEntry {
  userId: string;
  expiresAt: number;
}

export class JsonSessionRepository implements ISessionRepository {
  private readonly sessions = new Map<string, SessionEntry>();

  async createSession(
    userId: string,
    ttlSeconds: number = 7 * 24 * 60 * 60
  ): Promise<{ sessionId: string; expiresAt: number }> {
    const sessionId = `json-sess-${crypto.randomUUID()}`;
    const expiresAt = Date.now() + ttlSeconds * 1000;
    this.sessions.set(sessionId, { userId, expiresAt });
    return { sessionId, expiresAt };
  }

  async findUserBySessionId(sessionId: string): Promise<SafeUser | null> {
    const entry = this.sessions.get(sessionId);
    if (!entry) return null;
    if (entry.expiresAt <= Date.now()) {
      this.sessions.delete(sessionId);
      return null;
    }

    const user = mockStore.users.find((u) => u.id === entry.userId);
    if (!user) return null;

    const { password: _, ...safeUser } = user;
    return safeUser;
  }

  async deleteSession(sessionId: string): Promise<boolean> {
    return this.sessions.delete(sessionId);
  }

  async deleteExpiredSessions(): Promise<number> {
    const now = Date.now();
    let count = 0;
    for (const [id, entry] of this.sessions.entries()) {
      if (entry.expiresAt <= now) {
        this.sessions.delete(id);
        count++;
      }
    }
    return count;
  }
}
