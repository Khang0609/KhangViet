/**
 * Kiểu dữ liệu và môi trường cho Cloudflare Media Worker.
 */
export interface R2ObjectHttpMetadata {
  contentType?: string;
  cacheControl?: string;
  contentDisposition?: string;
}

export interface R2ObjectMetadata {
  key: string;
  size: number;
  httpEtag?: string;
  httpMetadata?: R2ObjectHttpMetadata;
  body: ReadableStream | ArrayBuffer | Uint8Array;
}

export interface R2PutOptions {
  httpMetadata?: R2ObjectHttpMetadata;
}

export interface R2BucketBinding {
  put(
    key: string,
    value: ReadableStream | ArrayBuffer | ArrayBufferView | string | Blob,
    options?: R2PutOptions
  ): Promise<R2ObjectMetadata | null>;
  get(key: string): Promise<R2ObjectMetadata | null>;
  delete(key: string): Promise<void>;
}

export interface MediaWorkerEnv {
  MEDIA_BUCKET: R2BucketBinding;
  NODE_ENV: string;
  PUBLIC_R2_URL?: string;
  MAX_FILE_SIZE_BYTES?: string;
  WEB_APP_URL?: string;
}

export type AspectRatioType = "landscape" | "portrait" | "square" | "wide";

export interface ProcessedImage {
  webpBytes: Uint8Array;
  width_px: number;
  height_px: number;
  aspect_ratio: AspectRatioType;
  file_size_bytes: number;
}

export interface MediaUploadResult {
  public_url: string;
  r2_key: string;
  width_px: number;
  height_px: number;
  aspect_ratio: AspectRatioType;
  file_size_bytes: number;
  media_type: string;
}
