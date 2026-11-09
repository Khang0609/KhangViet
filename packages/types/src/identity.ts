import { z } from "zod";
import { UserRoleSchema } from "./user";

/**
 * Phân loại định danh đối tác: Cá nhân hoặc Tổ chức doanh nghiệp (B2B).
 */
export const IdentityTypeSchema = z.enum(["INDIVIDUAL", "ORGANIZATION"]);
export type IdentityType = z.infer<typeof IdentityTypeSchema>;

/**
 * Thực thể con người / pháp nhân (Party Model) độc lập với tài khoản.
 */
export const IdentitySchema = z.object({
  id: z.string(),
  fullName: z.string().min(1, "Họ tên không được để trống"),
  phone: z.string().min(9, "Số điện thoại không hợp lệ"),
  email: z.string().email("Email không đúng định dạng").optional().nullable(),
  taxCode: z.string().optional().nullable(),
  identityType: IdentityTypeSchema.default("INDIVIDUAL"),
  address: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type Identity = z.infer<typeof IdentitySchema>;

/**
 * Tài khoản đăng nhập liên kết với identity thông qua khóa ngoại identityId.
 */
export const UserAccountSchema = z.object({
  id: z.string(),
  identityId: z.string(),
  email: z.string().email("Email không đúng định dạng"),
  passwordHash: z.string(),
  role: UserRoleSchema,
  isActive: z.number().int().default(1),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type UserAccount = z.infer<typeof UserAccountSchema>;
