import { z } from "zod";

/**
 * Phân quyền tài khoản trong hệ thống Khang Việt Design.
 * - ADMIN: Quản trị viên quản lý CMS, leads và cấu hình.
 * - STAFF: Nhân viên tư vấn, xử lý CRM và quản lý media.
 * - CUSTOMER: Khách hàng sử dụng dịch vụ và theo dõi tiến độ.
 */
export const UserRoleSchema = z.enum(["ADMIN", "STAFF", "CUSTOMER"]);
export type UserRole = z.infer<typeof UserRoleSchema>;

/**
 * Thông tin hồ sơ cá nhân người dùng.
 * Ràng buộc: Số điện thoại Việt Nam hợp lệ để liên hệ tư vấn và xác thực SMS sau này.
 */
export const UserInfoSchema = z.object({
  name: z.string().min(1, "Tên người dùng không được để trống"),
  phone: z.string().min(9, "Số điện thoại không hợp lệ"),
});
export type UserInfo = z.infer<typeof UserInfoSchema>;

/**
 * Schema đầy đủ của User lưu trữ trong cơ sở dữ liệu hoặc Mock Repository.
 */
export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email("Email không đúng định dạng"),
  role: UserRoleSchema,
  password: z.string().min(6, "Mật khẩu tối thiểu 6 ký tự"),
  info: UserInfoSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type User = z.infer<typeof UserSchema>;

export const SafeUserSchema = UserSchema.omit({ password: true });
export type SafeUser = z.infer<typeof SafeUserSchema>;

export const LoginCredentialsSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu tối thiểu 6 ký tự"),
});
export type LoginCredentials = z.infer<typeof LoginCredentialsSchema>;

export const AccessTokenPayloadSchema = z.object({
  sub: z.string(),
  email: z.string(),
  role: UserRoleSchema,
  exp: z.number(),
});
export type AccessTokenPayload = z.infer<typeof AccessTokenPayloadSchema>;

export const RefreshTokenPayloadSchema = z.object({
  sub: z.string(),
  exp: z.number(),
});
export type RefreshTokenPayload = z.infer<typeof RefreshTokenPayloadSchema>;

export const LoginResponseDataSchema = z.object({
  accessToken: z.string(),
  user: SafeUserSchema,
});
export type LoginResponseData = z.infer<typeof LoginResponseDataSchema>;

export type AuthErrorCode =
  | "INVALID_CREDENTIALS"
  | "USER_NOT_FOUND"
  | "TOKEN_EXPIRED"
  | "INVALID_TOKEN"
  | "UNAUTHORIZED"
  | "FORBIDDEN";
