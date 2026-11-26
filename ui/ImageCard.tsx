import React from "react";
import { cn } from "@/lib/ultis";

type ImageCardSize = "sm" | "md" | "lg";

type ImageCardOrientation = "horizontal" | "vertical";

interface ImageCardProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  children?: React.ReactNode;
  imageURL: string;
  size?: ImageCardSize;
  orientation?: ImageCardOrientation;
}

const ImageHolder = "./image/image-placeholder.png";

export const ImageCard: React.FC<ImageCardProps> = ({
  className = "",
  imageURL = "",
  size = "md",
  orientation = "vertical",
  children = "",
  ...props
}) => {
  const isHorizonal = orientation === "horizontal";

  return (
    <div
      className={cn(
        className,
        isHorizonal && size === "sm" && "w-1/2"
      )}
      style={{
        backgroundImage: `url(${ImageHolder}), url(${imageURL})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/30 to-transparent" />
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};
