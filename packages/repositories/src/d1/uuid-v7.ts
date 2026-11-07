/**
 * Triển khai UUIDv7 (RFC 9562) thuần túy cho môi trường Edge / Cloudflare Workers.
 * Lý do sử dụng: Tối ưu B-Tree indexing cho SQLite/D1 nhờ 48-bit timestamp đầu tiên,
 * ngăn ngừa phân mảnh trang (page fragmentation) và hỗ trợ sắp xếp theo thời gian tự nhiên.
 */
export function generateUuidV7(): string {
  const timestamp = Date.now();
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);

  // 48-bit timestamp phần đầu (big-endian)
  bytes[0] = (timestamp / 0x10000000000) & 0xff;
  bytes[1] = (timestamp / 0x100000000) & 0xff;
  bytes[2] = (timestamp / 0x1000000) & 0xff;
  bytes[3] = (timestamp / 0x10000) & 0xff;
  bytes[4] = (timestamp / 0x100) & 0xff;
  bytes[5] = timestamp & 0xff;

  // UUID version 7: 4 bit đầu của byte 6 là 0111
  bytes[6] = (bytes[6] & 0x0f) | 0x70;
  // UUID variant 1: 2 bit đầu của byte 8 là 10 (RFC 4122/9562)
  bytes[8] = (bytes[8] & 0x3f) | 0x80;

  const hexParts = Array.from(bytes, (b) => b.toString(16).padStart(2, "0"));
  const hex = hexParts.join("");

  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}
