import { PhotonImage, resize, SamplingFilter } from "@cf-wasm/photon/workerd";
import { MAX_DIMENSION_PX, MAX_FILE_SIZE_BYTES } from "../config/limits";
import type { AspectRatioType, ProcessedImage } from "./types";

export function computeAspectRatio(w: number, h: number): AspectRatioType {
  const ratio = w / h;
  if (ratio > 1.8) return "wide";
  if (ratio > 1.05) return "landscape";
  if (ratio < 0.95) return "portrait";
  return "square";
}

function calculateTargetSize(w: number, h: number): { w: number; h: number } {
  if (w <= MAX_DIMENSION_PX && h <= MAX_DIMENSION_PX) return { w, h };
  if (w >= h) {
    return { w: MAX_DIMENSION_PX, h: Math.round((h * MAX_DIMENSION_PX) / w) };
  }
  return { w: Math.round((w * MAX_DIMENSION_PX) / h), h: MAX_DIMENSION_PX };
}

function extractDimensions(image: PhotonImage): { origW: number; origH: number } {
  const origW = image.get_width();
  const origH = image.get_height();
  if (!origW || !origH || origW <= 0 || origH <= 0 || !Number.isFinite(origW) || !Number.isFinite(origH)) {
    throw new Error("Không hỗ trợ định dạng ảnh này hoặc dữ liệu bị hỏng");
  }
  return { origW, origH };
}

export async function processImageBuffer(buffer: Uint8Array): Promise<ProcessedImage> {
  if (buffer.length > MAX_FILE_SIZE_BYTES) {
    throw new Error(`FILE_TOO_LARGE: Kích thước tệp (${buffer.length} bytes) vượt quá giới hạn 10MB`);
  }

  let inputImage: PhotonImage | null = null;
  let outputImage: PhotonImage | null = null;

  try {
    inputImage = PhotonImage.new_from_byteslice(buffer);
    const { origW, origH } = extractDimensions(inputImage);
    const { w: targetW, h: targetH } = calculateTargetSize(origW, origH);
    const aspect_ratio = computeAspectRatio(targetW, targetH);

    let webpBytes: Uint8Array;
    if (targetW !== origW || targetH !== origH) {
      outputImage = resize(inputImage, targetW, targetH, SamplingFilter.Lanczos3);
      webpBytes = outputImage.get_bytes_webp();
    } else {
      webpBytes = inputImage.get_bytes_webp();
    }

    return {
      webpBytes,
      width_px: targetW,
      height_px: targetH,
      aspect_ratio,
      file_size_bytes: webpBytes.length,
    };
  } finally {
    if (inputImage) inputImage.free();
    if (outputImage) outputImage.free();
  }
}
