import type { User } from "@khangviet/types";
import type { UserRecord } from "../schema";

export function mapUserRecordToDomain(row: UserRecord): User {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    role: row.role,
    isActive: row.isActive === 1,
    createdAt: row.createdAt,
  };
}
