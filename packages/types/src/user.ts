import { z } from "zod";

/**
 * Phân quyền nội bộ qua Cloudflare Access Zero Trust.
 * - ADMIN: Quản trị viên toàn quyền CMS, dự án, đối tác và leads.
 * - STAFF: Nhân viên tư vấn và biên tập nội dung.
 */
export const UserRoleSchema = z.enum(["ADMIN", "STAFF"]);
export type UserRole = z.infer<typeof UserRoleSchema>;

export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email("Email không đúng định dạng"),
  name: z.string().min(1, "Tên người dùng không được để trống"),
  role: UserRoleSchema,
  isActive: z.boolean().default(true),
  createdAt: z.number().int(),
});
export type User = z.infer<typeof UserSchema>;

export const CreateUserDtoSchema = z.object({
  email: z.string().trim().email("Email không hợp lệ"),
  name: z.string().trim().min(1).max(120),
  role: UserRoleSchema.default("STAFF"),
  isActive: z.boolean().default(true),
});
export type CreateUserDto = z.infer<typeof CreateUserDtoSchema>;

export type AuthErrorCode = "UNAUTHORIZED" | "FORBIDDEN" | "USER_INACTIVE";
