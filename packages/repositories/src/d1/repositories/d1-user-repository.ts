import { eq } from "drizzle-orm";
import type { User, SafeUser } from "@khangviet/types";
import { IUserRepository } from "../../interfaces/IUserRepository";
import { type D1Client } from "../client";
import { usersTable, type UserRecord } from "../schema/users.schema";

function mapToUser(r: UserRecord): User {
  return {
    id: r.id,
    email: r.email,
    role: r.role,
    password: r.password,
    info: { name: r.name, phone: r.phone },
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  };
}

function mapToSafeUser(r: UserRecord): SafeUser {
  return {
    id: r.id,
    email: r.email,
    role: r.role,
    info: { name: r.name, phone: r.phone },
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  };
}

export class D1UserRepository implements IUserRepository {
  constructor(private readonly client: D1Client) {}

  async findByEmail(email: string): Promise<User | null> {
    const records = await this.client
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email))
      .limit(1);

    return records[0] ? mapToUser(records[0]) : null;
  }

  async findById(id: string): Promise<User | null> {
    const records = await this.client
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, id))
      .limit(1);

    return records[0] ? mapToUser(records[0]) : null;
  }

  async findSafeById(id: string): Promise<SafeUser | null> {
    const records = await this.client
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, id))
      .limit(1);

    return records[0] ? mapToSafeUser(records[0]) : null;
  }

  async getAllUsers(): Promise<SafeUser[]> {
    const records = await this.client.select().from(usersTable);
    return records.map(mapToSafeUser);
  }
}
