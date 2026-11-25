import type { CreateUserDto, User } from "@khangviet/types";

export interface IUserRepository {
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  getAllUsers(): Promise<User[]>;
  createUser(input: CreateUserDto): Promise<User>;
}
