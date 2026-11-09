import { Hono } from "hono";
import type { MediaWorkerEnv } from "../services/types";

export const healthRoute = new Hono<{ Bindings: MediaWorkerEnv }>();

healthRoute.get("/", (c) => {
  return c.json({
    status: "ok",
    service: "media-worker",
    timestamp: new Date().toISOString(),
  });
});
