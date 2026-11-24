import { eq } from "drizzle-orm";
import type { CreateUserDto, User } from "@khangviet/types";
import type { IUserRepository } from "../../interfaces/IUserRepository";
import type { D1Client } from "../client";
import { usersTable } from "../schema";
import { generateUuidV7 } from "../uuid-v7";
import { mapUserRecordToDomain } from "./user-mapper";

export class D1UserRepository implements IUserRepository {
  constructor(private readonly db: D1Client) {}

  async findByEmail(email: string): Promise<User | null> {
    const normalized = email.trim().toLowerCase();
    const rows = await this.db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, normalized))
      .limit(1);

    return rows[0] ? mapUserRecordToDomain(rows[0]) : null;
  }

  async findById(id: string): Promise<User | null> {
    const rows = await this.db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, id))
      .limit(1);

    return rows[0] ? mapUserRecordToDomain(rows[0]) : null;
  }

  async getAllUsers(): Promise<User[]> {
    const rows = await this.db.select().from(usersTable);
    return rows.map(mapUserRecordToDomain);
  }

  async createUser(input: CreateUserDto): Promise<User> {
    const now = Math.floor(Date.now() / 1000);
    const id = generateUuidV7();
    const email = input.email.trim().toLowerCase();

    await this.db.insert(usersTable).values({
      id,
      email,
      name: input.name.trim(),
      role: input.role,
      isActive: input.isActive ? 1 : 0,
      createdAt: now,
    });

    return {
      id,
      email,
      name: input.name.trim(),
      role: input.role,
      isActive: input.isActive,
      createdAt: now,
    };
  }
}
