import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

function getSharpPath() {
  const candidates = [
    path.resolve(process.cwd(), "node_modules/.pnpm/sharp@0.35.5_@types+node@20.19.43/node_modules/sharp"),
    path.resolve(process.cwd(), "../../node_modules/.pnpm/sharp@0.35.5_@types+node@20.19.43/node_modules/sharp"),
    path.resolve(process.cwd(), "../node_modules/.pnpm/sharp@0.35.5_@types+node@20.19.43/node_modules/sharp"),
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) return c.replace(/\\/g, "/");
  }
  return "sharp";
}

export function createMockR2() {
  const store = new Map();
  const bucket = {
    put: async (key, value, options) => {
      store.set(key, { value, options });
      return { key, size: value.length };
    },
    get: async (key) => {
      const item = store.get(key);
      if (!item) return null;
      return {
        body: item.value,
        size: item.value.length,
        httpEtag: '"mock-etag-12345"',
        httpMetadata: item.options?.httpMetadata,
      };
    },
  };
  return { bucket, store };
}

export function generateSampleImage(width, height, format = "png") {
  const sharpPath = getSharpPath();
  const script = `
    const s = require('${sharpPath}');
    s({ create: { width: ${width}, height: ${height}, channels: 3, background: { r: 245, g: 134, b: 51 } } })
      .${format}()
      .toBuffer()
      .then(b => process.stdout.write(b));
  `;
  return execFileSync(process.execPath, ["-e", script]);
}

export function create11MbPayload() {
  return Buffer.alloc(11 * 1024 * 1024, 0x41);
}
