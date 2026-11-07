import { drizzle, type DrizzleD1Database } from "drizzle-orm/d1";
import * as schema from "./schema";

export type D1DatabaseBinding = Parameters<typeof drizzle>[0];
export type D1Client = DrizzleD1Database<typeof schema>;

/**
 * Khởi tạo Drizzle Client cho Cloudflare D1.
 * Wrapper đảm bảo type-safe 100% với schema đã định nghĩa.
 */
export function createD1Client(d1: D1DatabaseBinding): D1Client {
  return drizzle(d1, { schema });
}
