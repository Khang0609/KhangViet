/**
 * Các ngưỡng giới hạn kỹ thuật và dung lượng cho Media Worker.
 * Tuân thủ trần bộ nhớ 128MB của Cloudflare Workers.
 */
export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

export const MAX_DIMENSION_PX = 2560; // 2.5K max dimension

export const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/bmp",
  "application/octet-stream",
]);

export function isAllowedMime(mime: string): boolean {
  if (!mime) return false;
  const cleanMime = mime.split(";")[0].trim().toLowerCase();
  return ALLOWED_MIME_TYPES.has(cleanMime);
}
