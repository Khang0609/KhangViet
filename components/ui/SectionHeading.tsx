import React from "react";
import { cn } from "@/lib/ultis";

export interface SectionHeadingProps {
  index?: string;
  eyebrow?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  orientation?: "horizontal" | "vertical";
  className?: string;
  titleClassName?: string;
}

export const SectionHeading: React.FC<SectionHeadingProps> = ({
  index,
  eyebrow,
  title,
  description,
  orientation = "horizontal",
  className,
  titleClassName,
}) => {
  const isHorizontal = orientation === "horizontal";

  return (
    <div
      className={cn(
        isHorizontal ? "grid gap-6 lg:grid-cols-12" : "flex flex-col gap-6",
        className,
      )}
    >
      {(index || eyebrow) && (
        <div className={cn(isHorizontal && "lg:col-span-3")}>
          <div className="flex items-center gap-2.5 text-xs font-medium tracking-[0.14em] text-(--accent-bronze) uppercase">
            {eyebrow && <span>{eyebrow}</span>}
          </div>
        </div>
      )}

      <div
        className={cn(
          isHorizontal && (description ? "lg:col-span-6" : "lg:col-span-9"),
        )}
      >
        <h2
          className={cn(
            "font-sans text-3xl leading-[1.12] font-semibold tracking-tight md:text-4xl lg:text-5xl",
            titleClassName,
          )}
        >
          {title}
        </h2>
      </div>

      {description && (
        <div className={cn(isHorizontal && "lg:col-span-3")}>
          <p className="text-sm leading-7 text-(--text-secondary)">
            {description}
          </p>
        </div>
      )}
    </div>
  );
};

export default SectionHeading;
