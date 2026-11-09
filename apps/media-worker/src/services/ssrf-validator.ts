/**
 * Phòng vệ tấn công SSRF (Server-Side Request Forgery).
 * Ngăn chặn tuyệt đối việc tải ảnh từ IP nội bộ, loopback hoặc Cloud metadata.
 */
function isPrivateIpv4(ip: string): boolean {
  const parts = ip.split(".").map((p) => Number.parseInt(p, 10));
  if (parts.length !== 4 || parts.some((n) => Number.isNaN(n) || n < 0 || n > 255)) {
    return true; // Dạng biểu diễn IP không chuẩn -> chặn an toàn
  }
  const [a, b] = parts;
  if (a === 0 || a === 127) return true; // 0.0.0.0/8 và 127.0.0.0/8 (loopback)
  if (a === 10) return true; // 10.0.0.0/8 (RFC1918)
  if (a === 172 && b >= 16 && b <= 31) return true; // 172.16.0.0/12 (RFC1918)
  if (a === 192 && b === 168) return true; // 192.168.0.0/16 (RFC1918)
  if (a === 169 && b === 254) return true; // 169.254.0.0/16 (Link-Local / Metadata)
  return false;
}

function isPrivateHost(hostname: string): boolean {
  const host = hostname.toLowerCase().trim().replace(/^\[|\]$/g, "");
  if (host === "localhost" || host === "::1" || host === "::" || host === "0.0.0.0") return true;
  if (host.startsWith("fe80:") || host.startsWith("fc") || host.startsWith("fd")) return true;
  if (host.startsWith("::ffff:") || host.includes("ffff:")) {
    const v4Part = host.substring(host.lastIndexOf(":") + 1);
    if (/^(\d{1,3}\.){3}\d{1,3}$/.test(v4Part)) return isPrivateIpv4(v4Part);
    return true;
  }
  if (/^(\d{1,3}\.){3}\d{1,3}$/.test(host)) {
    return isPrivateIpv4(host);
  }
  // Chặn dải địa chỉ dạng số nguyên thô (integer IP e.g. 2130706433 = 127.0.0.1)
  if (/^\d+$/.test(host)) return true;
  return false;
}

export function validateSsrfUrl(targetUrl: string): { safe: boolean; reason?: string } {
  try {
    const parsed = new URL(targetUrl);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return { safe: false, reason: "Giao thức không hợp lệ. Chỉ chấp nhận HTTP/HTTPS" };
    }
    if (isPrivateHost(parsed.hostname)) {
      return { safe: false, reason: "Bị từ chối truy cập: Địa chỉ đích thuộc mạng nội bộ (SSRF blocked)" };
    }
    return { safe: true };
  } catch {
    return { safe: false, reason: "Định dạng URL không hợp lệ" };
  }
}
