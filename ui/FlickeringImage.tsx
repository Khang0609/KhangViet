import React from "react";
import { cn } from "@/lib/ultis";

type ExampleColor = "blue" | "yellow" | "red";

interface FlickeringImageProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  colors?: ExampleColor;
}

export const FlickeringImage: React.FC<FlickeringImageProps> = ({
  className = "",
  colors = "red",
  ...props
}) => {
  return (
    <div
      className={cn(
        "flex h-full w-76 items-center justify-center",
        colors === "blue" && "bg-blue-400",
        colors === "yellow" && "bg-yellow-400",
        colors === "red" && "bg-red-400 text-white",
        className,
      )}
      {...props}
    >
      Flickering Image
    </div>
  );
};
