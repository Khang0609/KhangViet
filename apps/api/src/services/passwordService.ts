/**
 * Service xử lý mã hóa và so khớp mật khẩu bằng Web Crypto API.
 * Tương thích trực tiếp môi trường Cloudflare Workers không cần thư viện ngoài.
 */
export class PasswordService {
  private static async computeHash(data: string): Promise<string> {
    const encoder = new TextEncoder();
    const hashBuffer = await crypto.subtle.digest(
      "SHA-256",
      encoder.encode(data)
    );
    return Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }

  static async verifyPassword(
    plainText: string,
    storedHash: string
  ): Promise<boolean> {
    const [salt, expectedHash] = storedHash.split(":");
    if (!salt || !expectedHash) return false;
    const computed = await this.computeHash(salt + plainText);
    return computed === expectedHash;
  }
}

