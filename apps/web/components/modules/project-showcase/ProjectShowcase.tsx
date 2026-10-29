import React from "react";
import { FEATURED_PROJECTS } from "@/data/khangVietData";
import { type FeaturedProject } from "./type";
import { SectionHeading } from "../../ui/SectionHeading";
import { ProjectShowcaseGallery } from "./ProjectShowcaseGallery";
import { ProjectShowcaseDetails } from "./ProjectShowcaseDetails";

export interface ProjectShowcaseProps {
  projects?: FeaturedProject[];
  onSelectProject?: (project: FeaturedProject, imageIndex?: number) => void;
}

export const ProjectShowcase: React.FC<ProjectShowcaseProps> = ({
  projects = FEATURED_PROJECTS,
}) => {
  const activeProjects =
    projects && projects.length > 0 ? projects : FEATURED_PROJECTS;

  return (
    <section
      id="du-an"
      className="scroll-mt-20 border-y border-white/8 bg-[#0e0f12] py-24 md:py-32"
    >
      <div className="mx-auto max-w-360 px-5 md:px-8 xl:px-12">
        <SectionHeading
          index="02"
          eyebrow="Selected works archive"
          title="Công trình là tuyên ngôn rõ nhất."
          description="Hồ sơ thực tế về những hệ thống nhận diện được chế tác để bền bỉ, chính xác và nổi bật trong mọi điều kiện không gian."
        />

        <div className="mt-14 space-y-20 md:space-y-28">
          {activeProjects.map((project, projectIndex) => (
            <article
              key={project.id}
              className="grid gap-8 lg:grid-cols-12 lg:gap-10"
            >
              <ProjectShowcaseGallery
                project={project}
                projectIndex={projectIndex}
              />
              <ProjectShowcaseDetails
                project={project}
                projectIndex={projectIndex}
              />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProjectShowcase;
