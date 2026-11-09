import { eq, sql } from "drizzle-orm";
import type { User, SafeUser } from "@khangviet/types";
import type { IUserRepository } from "../../interfaces/IUserRepository";
import type { D1Client } from "../client";
import { userAccountsTable } from "../schema/user-accounts.schema";
import { identitiesTable } from "../schema/identities.schema";
import { mapToUser, mapToSafeUser } from "./user-mapper";

export class D1UserRepository implements IUserRepository {
  private readonly client: D1Client;

  constructor(client: D1Client) {
    this.client = client;
  }

  private selectUserQuery() {
    return this.client
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
      .from(userAccountsTable)
      .innerJoin(
        identitiesTable,
        eq(userAccountsTable.identityId, identitiesTable.id)
      );
  }

  async findByEmail(email: string): Promise<User | null> {
    const normalized = email.trim().toLowerCase();
    const records = await this.selectUserQuery()
      .where(sql`lower(${userAccountsTable.email}) = ${normalized}`)
      .limit(1);

    return records[0] ? mapToUser(records[0]) : null;
  }

  async findById(id: string): Promise<User | null> {
    const records = await this.selectUserQuery()
      .where(eq(userAccountsTable.id, id))
      .limit(1);

    return records[0] ? mapToUser(records[0]) : null;
  }

  async findSafeById(id: string): Promise<SafeUser | null> {
    const records = await this.selectUserQuery()
      .where(eq(userAccountsTable.id, id))
      .limit(1);

    return records[0] ? mapToSafeUser(records[0]) : null;
  }

  async getAllUsers(): Promise<SafeUser[]> {
    const records = await this.selectUserQuery();
    return records.map(mapToSafeUser);
  }
}
