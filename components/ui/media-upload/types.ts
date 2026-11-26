export type UploadState = "idle" | "dragging" | "uploading" | "success" | "error";

export interface MediaUploadResult {
  url: string;
  r2Key?: string;
  width?: number;
  height?: number;
  aspectRatio?: "landscape" | "portrait" | "wide" | "square";
  fileSize?: number;
  mediaType?: string;
}

export interface UniversalMediaUploadProps {
  label: string;
  value: string;
  onChange: (url: string, metadata?: MediaUploadResult) => void;
  placeholder?: string;
  helperText?: string;
  allowManualInput?: boolean;
  folder?: string;
  className?: string;
}

export interface MediaWorkerSuccessData {
  public_url: string;
  r2_key: string;
  width_px: number;
  height_px: number;
  aspect_ratio: "landscape" | "portrait" | "wide" | "square";
  file_size_bytes: number;
  media_type: string;
}

export function toMediaResult(data: MediaWorkerSuccessData): MediaUploadResult {
  return {
    url: data.public_url,
    r2Key: data.r2_key,
    width: data.width_px,
    height: data.height_px,
    aspectRatio: data.aspect_ratio,
    fileSize: data.file_size_bytes,
    mediaType: data.media_type,
  };
}
