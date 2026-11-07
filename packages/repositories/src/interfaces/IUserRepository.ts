import type { User, SafeUser } from "@khangviet/types";

/**
 * Interface cho việc truy xuất và quản lý người dùng.
 * Tách biệt lớp dữ liệu để dễ dàng hoán đổi giữa Mock JSON và Cloudflare D1/Postgres.
 */
export interface IUserRepository {
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  findSafeById(id: string): Promise<SafeUser | null>;
  getAllUsers(): Promise<SafeUser[]>;
}

