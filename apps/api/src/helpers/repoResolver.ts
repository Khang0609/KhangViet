import { Context } from "hono";
import { getRepositories, Repositories } from "@khangviet/repositories";
import { AppEnv } from "../middlewares/authMiddleware";

/**
 * Phân giải Repositories instance dựa trên binding môi trường của Cloudflare Worker.
 * Tự động chuyển đổi sang D1 Database khi c.env.DB có mặt (SEC/PERF chuẩn hóa).
 */
export function getContextRepos(c: Context<AppEnv>): Repositories {
  return getRepositories(c.env?.DB ? "d1" : "json", c.env?.DB);
}
