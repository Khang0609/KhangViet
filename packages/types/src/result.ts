/**
 * Result pattern chuẩn hóa kết quả thực thi thay vì ném ngoại lệ (exceptions).
 * Giúp kiểm soát luồng lỗi tường minh, an toàn kiểu dữ liệu ở compile-time.
 */
export type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E };

export const ok = <T>(data: T): Result<T, never> => ({
  success: true,
  data,
});

export const err = <E>(error: E): Result<never, E> => ({
  success: false,
  error,
});

