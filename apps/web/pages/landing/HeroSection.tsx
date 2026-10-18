"use client";

import React from "react";
import { cn } from "@/lib/ultis";
import { NavigationBar } from "@/components";
import { FlickeringImage, Button } from "@/ui";

interface SectionProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export const HeroSection = () => {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#050709]">
      {/* Reusable responsive Navigation Bar */}
      <NavigationBar onOpenProfile={() => console.log("Mở hồ sơ năng lực")} />

      {/* Hero Content with top spacing for floating navbar */}
      <div className="relative z-10 flex flex-col justify-between gap-10 px-6 pt-25 sm:px-10 md:flex-row md:pt-30 lg:px-16">
        <ContentSection className="w-full md:w-1/2 lg:w-116" />
        <ImageSection className="w-full md:w-1/2" />
      </div>
    </div>
  );
};

const ContentSection: React.FC<SectionProps> = ({ ...props }) => {
  return (
    <div className={cn("font-sans text-white", props.className)}>
      <h1 className="text-5xl leading-[1.1] font-extrabold tracking-tight sm:text-6xl lg:text-7xl">
        BIG ODD HERE AND NOW DONE!
      </h1>
      <p className="mt-6 text-base leading-relaxed text-zinc-400">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
        tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim
        veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea
        commodo consequat.
      </p>
      <Button variant={"primaryP"} size={"md"} className="mt-6">
        Khám phá ngay
      </Button>
    </div>
  );
};

const ImageSection: React.FC<SectionProps> = ({ ...props }) => {
  return (
    <div className={cn(props.className, "grid grid-cols-2 gap-5")}>
      <FlickeringImage colors={"yellow"}></FlickeringImage>
      <FlickeringImage colors={"blue"}></FlickeringImage>
      <FlickeringImage colors={"blue"}></FlickeringImage>
      <FlickeringImage></FlickeringImage>
    </div>
  );
};
