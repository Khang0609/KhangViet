"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, Calendar } from "lucide-react";
import type { ProjectGalleryResponse } from "@khangviet/types";
import { getProjectCoverUrl, resolveGalleryClusters } from "@/lib/galleryClusters";
import { AdminShell } from "./AdminShell";

interface AdminGallerySlugClientProps {
  initialData: ProjectGalleryResponse;
  slug: string;
  backHref?: string;
}

export const AdminGallerySlugClient: React.FC<AdminGallerySlugClientProps> = ({
  initialData,
  slug,
  backHref = "/admin/gallery",
}) => {
  const cluster = useMemo(() => {
    const { partnerClusters, solutionClusters } =
      resolveGalleryClusters(initialData);
    return (
      [...partnerClusters, ...solutionClusters].find(
        (c) => c.config.slug === slug
      ) ?? null
    );
  }, [initialData, slug]);

  return (
    <AdminShell
      title={cluster ? cluster.config.title : `Cụm ${slug}`}
      subtitle="Danh sách dự án thuộc cụm hiển thị trên trang Gallery."
    >
      <div className="mb-6">
        <Link
          href={backHref}
          className="inline-flex items-center gap-2 rounded-full border border-black/12 bg-white px-4 py-2 text-xs font-semibold text-[#1a1918]"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Quay lại
        </Link>
      </div>

      {!cluster ? (
        <div className="rounded-2xl border border-black/10 bg-white p-8 text-center text-sm text-[#625f5a]">
          Không tìm thấy cụm dữ liệu cho "{slug}".
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cluster.projects.map((project) => (
            <div
              key={project.id}
              className="overflow-hidden rounded-2xl border border-black/10 bg-white"
            >
              <div className="aspect-4/3 bg-[#eae5dc]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={getProjectCoverUrl(project)}
                  alt={project.title}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="p-4">
                <div className="text-xs font-medium text-(--accent-bronze)">
                  {project.organization?.name || "Khách hàng Khang Việt"}
                </div>
                <h3 className="mt-1 text-sm font-semibold text-[#1a1918]">
                  {project.title}
                </h3>
                {project.year && (
                  <div className="mt-1.5 flex items-center gap-1.5 text-xs text-[#625f5a]">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>{project.year}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminShell>
  );
};

export default AdminGallerySlugClient;
