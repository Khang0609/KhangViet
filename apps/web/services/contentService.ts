import type { LandingContent } from "@khangviet/types";
import { initialLandingContent } from "@khangviet/data";

/**
 * Cung cấp nội dung tĩnh cho Landing Page từ kho dữ liệu chuẩn @khangviet/data.
 * Đảm bảo tốc độ tải tức thì và không phụ thuộc vào kết nối API lúc build/runtime.
 */
export async function getLandingContent(): Promise<LandingContent> {
  return initialLandingContent;
}
