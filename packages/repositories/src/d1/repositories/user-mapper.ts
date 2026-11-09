import type { User, SafeUser } from "@khangviet/types";

export interface UserJoinedRow {
  id: string;
  email: string;
  role: User["role"];
  passwordHash: string;
  createdAt: string;
  updatedAt: string;
  fullName: string;
  phone: string;
}

export function mapToUser(r: UserJoinedRow): User {
  return {
    id: r.id,
    email: r.email,
    role: r.role,
    password: r.passwordHash,
    info: { name: r.fullName, phone: r.phone },
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  };
}

export function mapToSafeUser(r: UserJoinedRow): SafeUser {
  return {
    id: r.id,
    email: r.email,
    role: r.role,
    info: { name: r.fullName, phone: r.phone },
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  };
}
