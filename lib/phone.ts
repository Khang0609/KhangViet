/**
 * Strips whitespace and non-dialable characters (preserving a leading "+")
 * for tel: and Zalo links.
 */
export function normalizePhone(phone: string): string {
  const trimmed = phone.trim();
  const hasPlus = trimmed.startsWith("+");
  const digits = trimmed.replace(/\D/g, "");
  return hasPlus ? `+${digits}` : digits;
}

/**
 * Formats a Vietnamese phone/hotline number for display (e.g. "0903680449" -> "0903 680 449").
 */
export function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) {
    return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`;
  }
  if (digits.length === 11) {
    return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`;
  }
  if (digits.length === 8) {
    return `${digits.slice(0, 4)} ${digits.slice(4)}`;
  }
  return phone.trim();
}
