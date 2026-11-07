/**
 * Dịch vụ mã hóa và kiểm thực mật khẩu tuân thủ OWASP & Web Crypto API.
 * Hỗ trợ PBKDF2-HMAC-SHA256 (100k rounds) và Constant-Time comparison (SEC-03).
 */
export class PasswordService {
  private static readonly ITERATIONS = 100_000;
  private static readonly KEY_LEN = 32;

  private static hexToBytes(hex: string): Uint8Array {
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < bytes.length; i++) {
      bytes[i] = parseInt(hex.substring(i * 2, i * 2 + 2), 16);
    }
    return bytes;
  }

  private static bytesToHex(bytes: Uint8Array): string {
    return Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }

  private static constantTimeEqual(a: Uint8Array, b: Uint8Array): boolean {
    if (a.length !== b.length) return false;
    let diff = 0;
    for (let i = 0; i < a.length; i++) {
      diff |= a[i] ^ b[i];
    }
    return diff === 0;
  }

  static async hashPassword(password: string): Promise<string> {
    const saltBytes = crypto.getRandomValues(new Uint8Array(16));
    const saltHex = this.bytesToHex(saltBytes);
    const derived = await this.derivePbkdf2(password, saltBytes, this.ITERATIONS);
    return `pbkdf2:${this.ITERATIONS}:${saltHex}:${this.bytesToHex(new Uint8Array(derived))}`;
  }

  private static async derivePbkdf2(
    text: string,
    salt: Uint8Array,
    iterations: number
  ): Promise<ArrayBuffer> {
    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(text),
      "PBKDF2",
      false,
      ["deriveBits"]
    );
    return crypto.subtle.deriveBits(
      { name: "PBKDF2", salt, iterations, hash: "SHA-256" },
      key,
      this.KEY_LEN * 8
    );
  }

  static async verifyPassword(
    plainText: string,
    storedHash: string
  ): Promise<boolean> {
    if (storedHash.startsWith("pbkdf2:")) {
      return this.verifyPbkdf2(plainText, storedHash);
    }
    return this.verifyLegacySha256(plainText, storedHash);
  }

  private static async verifyPbkdf2(
    plainText: string,
    storedHash: string
  ): Promise<boolean> {
    const parts = storedHash.split(":");
    if (parts.length !== 4) return false;
    const [, iterStr, saltHex, expectedHex] = parts;
    const iterations = parseInt(iterStr, 10);
    const saltBytes = this.hexToBytes(saltHex);
    const derived = await this.derivePbkdf2(plainText, saltBytes, iterations);
    const expectedBytes = this.hexToBytes(expectedHex);
    return this.constantTimeEqual(expectedBytes, new Uint8Array(derived));
  }

  private static async verifyLegacySha256(
    plainText: string,
    storedHash: string
  ): Promise<boolean> {
    const [salt, expectedHex] = storedHash.split(":");
    if (!salt || !expectedHex) return false;
    const encoder = new TextEncoder();
    const digest = await crypto.subtle.digest("SHA-256", encoder.encode(salt + plainText));
    const computedBytes = new Uint8Array(digest);
    const expectedBytes = this.hexToBytes(expectedHex);
    return this.constantTimeEqual(expectedBytes, computedBytes);
  }
}
