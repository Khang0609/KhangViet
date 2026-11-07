import type { User, SafeUser } from "@khangviet/types";
import { IUserRepository } from "../interfaces/IUserRepository";
import { mockStore } from "./store";

/**
 * Triển khai IUserRepository đọc từ bộ nhớ Mock JSON.
 * Cung cấp dữ liệu tài khoản quản trị và khách hàng mẫu phục vụ test luồng auth.
 */
export class JsonUserRepository implements IUserRepository {
  async findByEmail(email: string): Promise<User | null> {
    const normalizedEmail = email.trim().toLowerCase();
    const user = mockStore.users.find(
      (u) => u.email.toLowerCase() === normalizedEmail
    );
    return user ? { ...user } : null;
  }

  async findById(id: string): Promise<User | null> {
    const user = mockStore.users.find((u) => u.id === id);
    return user ? { ...user } : null;
  }

  async findSafeById(id: string): Promise<SafeUser | null> {
    const user = await this.findById(id);
    if (!user) return null;
    const { password, ...safeUser } = user;
    return safeUser;
  }

  async getAllUsers(): Promise<SafeUser[]> {
    return mockStore.users.map(({ password, ...safeUser }) => safeUser);
  }
}

