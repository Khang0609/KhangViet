import type { Hono } from "hono";
import type { MediaWorkerEnv } from "../services/types";
import { fetchExternalRoute } from "./fetch-external";
import { fileRoute } from "./file";
import { healthRoute } from "./health";
import { uploadRoute } from "./upload";

export function registerRoutes(app: Hono<{ Bindings: MediaWorkerEnv }>): void {
  app.route("/health", healthRoute);
  app.route("/upload", uploadRoute);
  app.route("/fetch-external", fetchExternalRoute);
  app.route("/file", fileRoute);
}
