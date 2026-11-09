import type { MediaUploadResult, MediaWorkerEnv, ProcessedImage } from "./types";

export function generateR2Key(folder = "projects"): string {
  const uuid = crypto.randomUUID();
  return `${folder}/${uuid}.webp`;
}

function resolvePublicUrl(env: MediaWorkerEnv, key: string, origin: string): string {
  if (env.PUBLIC_R2_URL) {
    const base = env.PUBLIC_R2_URL.replace(/\/+$/, "");
    return `${base}/${key}`;
  }
  const cleanOrigin = origin.replace(/\/+$/, "");
  return `${cleanOrigin}/file/${key}`;
}

export async function storeInR2(
  env: MediaWorkerEnv,
  processed: ProcessedImage,
  origin: string,
  folder = "projects",
  mediaType = "GALLERY_IMAGE"
): Promise<MediaUploadResult> {
  const r2Key = generateR2Key(folder);

  await env.MEDIA_BUCKET.put(r2Key, processed.webpBytes, {
    httpMetadata: {
      contentType: "image/webp",
      cacheControl: "public, max-age=31536000, immutable",
    },
  });

  const publicUrl = resolvePublicUrl(env, r2Key, origin);

  return {
    public_url: publicUrl,
    r2_key: r2Key,
    width_px: processed.width_px,
    height_px: processed.height_px,
    aspect_ratio: processed.aspect_ratio,
    file_size_bytes: processed.file_size_bytes,
    media_type: mediaType,
  };
}
