"use client";

import React from "react";
import { UniversalMediaUpload, type MediaUploadResult } from "./media-upload";

export interface ImageUrlInputProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  placeholder?: string;
  helperText?: string;
  allowFilePath?: boolean;
}

/**
 * ImageUrlInput duy trì tương thích ngược 100% với các form hiện hữu (ProjectFormFields,
 * ProjectGalleryRow, HeroSlideItem), đồng thời nâng cấp toàn diện sang UniversalMediaUpload.
 */
export const ImageUrlInput: React.FC<ImageUrlInputProps> = ({
  label,
  value,
  onChange,
  placeholder,
  helperText,
  allowFilePath = true,
}) => {
  return (
    <UniversalMediaUpload
      label={label}
      value={value}
      onChange={(url: string, _meta?: MediaUploadResult) => onChange(url)}
      placeholder={placeholder}
      helperText={helperText}
      allowManualInput={allowFilePath}
    />
  );
};

export default ImageUrlInput;
export * from "./media-upload";
