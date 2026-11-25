import type { CreateUserDto, User } from "@khangviet/types";
import type { IUserRepository } from "../interfaces/IUserRepository";
import { generateUuidV7 } from "../d1/uuid-v7";
import { getStore } from "./store";

export class JsonUserRepository implements IUserRepository {
  async findByEmail(email: string): Promise<User | null> {
    const normalized = email.trim().toLowerCase();
    return (
      getStore().users.find((u) => u.email.toLowerCase() === normalized) ?? null
    );
  }

  async findById(id: string): Promise<User | null> {
    return getStore().users.find((u) => u.id === id) ?? null;
  }

  async getAllUsers(): Promise<User[]> {
    return [...getStore().users];
  }

  async createUser(input: CreateUserDto): Promise<User> {
    const user: User = {
      id: generateUuidV7(),
      email: input.email.trim().toLowerCase(),
      name: input.name.trim(),
      role: input.role,
      isActive: input.isActive,
      createdAt: Math.floor(Date.now() / 1000),
    };
    getStore().users.push(user);
    return user;
  }
}
