import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/d1/schema/index.ts",
  out: "./migrations",
  dialect: "sqlite",
});
