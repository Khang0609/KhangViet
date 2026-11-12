import { eq, and, gt, sql } from "drizzle-orm";
import type { SafeUser } from "@khangviet/types";
import type { ISessionRepository } from "../../interfaces/ISessionRepository";
import type { D1Client } from "../client";
import { sessionsTable } from "../schema/sessions.schema";
import { userAccountsTable } from "../schema/user-accounts.schema";
import { identitiesTable } from "../schema/identities.schema";
import { mapToSafeUser } from "./user-mapper";

export class D1SessionRepository implements ISessionRepository {
  private readonly client: D1Client;

  constructor(client: D1Client) {
    this.client = client;
  }

  async createSession(
    userId: string,
    ttlSeconds: number = 7 * 24 * 60 * 60
  ): Promise<{ sessionId: string; expiresAt: number }> {
    const sessionId = crypto.randomUUID().replace(/-/g, "") + crypto.randomUUID().replace(/-/g, "");
    const now = Math.floor(Date.now() / 1000);
    const expiresAt = now + ttlSeconds;

    await this.client.insert(sessionsTable).values({
      id: sessionId,
      userId,
      expiresAt,
      createdAt: now,
    });

    return { sessionId, expiresAt };
  }

  async findUserBySessionId(sessionId: string): Promise<SafeUser | null> {
    const now = Math.floor(Date.now() / 1000);

    const records = await this.client
      .select({
        id: userAccountsTable.id,
        email: userAccountsTable.email,
        role: userAccountsTable.role,
        passwordHash: userAccountsTable.passwordHash,
        createdAt: userAccountsTable.createdAt,
        updatedAt: userAccountsTable.updatedAt,
        fullName: identitiesTable.fullName,
        phone: identitiesTable.phone,
      })
      .from(sessionsTable)
      .innerJoin(userAccountsTable, eq(sessionsTable.userId, userAccountsTable.id))
      .innerJoin(identitiesTable, eq(userAccountsTable.identityId, identitiesTable.id))
      .where(and(eq(sessionsTable.id, sessionId), gt(sessionsTable.expiresAt, now)))
      .limit(1);

    return records[0] ? mapToSafeUser(records[0]) : null;
  }

  async deleteSession(sessionId: string): Promise<boolean> {
    await this.client.delete(sessionsTable).where(eq(sessionsTable.id, sessionId));
    return true;
  }

  async deleteExpiredSessions(): Promise<number> {
    const now = Math.floor(Date.now() / 1000);
    await this.client.delete(sessionsTable).where(sql`${sessionsTable.expiresAt} <= ${now}`);
    return 1;
  }
}
