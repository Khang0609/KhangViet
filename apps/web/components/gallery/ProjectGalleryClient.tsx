"use client";

import React, { useEffect, useMemo, useState } from "react";
import type {
  GalleryFilterState,
  GalleryProject,
  ProjectGalleryResponse,
} from "@khangviet/types";
import { GalleryHeroStats } from "./GalleryHeroStats";
import { KeyAccountsSpotlight } from "./KeyAccountsSpotlight";
import { GalleryFilterBar } from "./GalleryFilterBar";
import { ProjectCard } from "./ProjectCard";

interface ProjectGalleryClientProps {
  data: ProjectGalleryResponse;
}

const DEFAULT_FILTER: GalleryFilterState = {
  segment: "ALL",
  stage: "ALL",
  keyAccount: "ALL",
  category: "ALL",
  search: "",
};

export const ProjectGalleryClient: React.FC<ProjectGalleryClientProps> = ({
  data,
}) => {
  const [filter, setFilter] = useState<GalleryFilterState>(DEFAULT_FILTER);
  const [activeProject, setActiveProject] = useState<GalleryProject | null>(
    null
  );
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
  };

  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => setToastMessage(null), 3200);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const segment = params.get("segment");
    const status = params.get("status");
    const brand = params.get("brand");
    const category = params.get("category");
    const q = params.get("q");

    setFilter({
      segment: segment === "B2B" || segment === "C2B" ? segment : "ALL",
      stage:
        status === "COMPLETED" || status === "TENDER_3D" ? status : "ALL",
      keyAccount: brand || "ALL",
      category: category || "ALL",
      search: q || "",
    });
  }, []);

  const syncUrlParams = (next: GalleryFilterState) => {
    const url = new URL(window.location.href);
    if (next.segment !== "ALL") url.searchParams.set("segment", next.segment);
    else url.searchParams.delete("segment");

    if (next.stage !== "ALL") url.searchParams.set("status", next.stage);
    else url.searchParams.delete("status");

    if (next.keyAccount !== "ALL")
      url.searchParams.set("brand", next.keyAccount);
    else url.searchParams.delete("brand");

    if (next.category !== "ALL")
      url.searchParams.set("category", next.category);
    else url.searchParams.delete("category");

    if (next.search.trim()) url.searchParams.set("q", next.search.trim());
    else url.searchParams.delete("q");

    window.history.replaceState({}, "", url);
  };

  const updateFilter = <K extends keyof GalleryFilterState>(
    key: K,
    value: GalleryFilterState[K]
  ) => {
    setFilter((prev) => {
      const next = { ...prev, [key]: value };
      syncUrlParams(next);
      return next;
    });
  };

  const handleSelectKeyAccount = (accountId: string) => {
    setFilter((prev) => {
      const next: GalleryFilterState = {
        ...prev,
        keyAccount: accountId,
        segment: accountId !== "ALL" ? "B2B" : prev.segment,
      };
      syncUrlParams(next);
      return next;
    });
  };

  const resetAllFilters = () => {
    setFilter(DEFAULT_FILTER);
    syncUrlParams(DEFAULT_FILTER);
  };

  const handleCopyShareUrl = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      showToast("Đã sao chép đường dẫn danh mục kèm bộ lọc hiện tại!");
    } catch {
      showToast("Không thể truy cập clipboard. Hãy sao chép URL trên thanh địa chỉ.");
    }
  };

  const filteredProjects = useMemo(() => {
    const q = filter.search.trim().toLowerCase();
    return data.projects.filter((p) => {
      if (filter.segment !== "ALL" && p.segment !== filter.segment)
        return false;
      if (filter.stage !== "ALL" && p.stage !== filter.stage) return false;
      if (filter.keyAccount !== "ALL" && p.keyAccount !== filter.keyAccount)
        return false;
      if (filter.category !== "ALL" && p.category !== filter.category)
        return false;
      if (q) {
        const haystack = [
          p.title,
          p.client,
          p.location,
          p.material,
          p.category,
          p.keyAccount || "",
        ]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [data.projects, filter]);

  return (
    <div className="min-h-screen bg-(--bg-obsidian) text-white">
      <GalleryHeroStats stats={data.stats} />

      <KeyAccountsSpotlight
        keyAccounts={data.keyAccounts}
        selectedAccountId={filter.keyAccount}
        onSelectAccount={handleSelectKeyAccount}
      />

      <GalleryFilterBar
        filter={filter}
        categories={data.categories}
        resultCount={filteredProjects.length}
        onUpdateFilter={updateFilter}
        onCopyShareUrl={handleCopyShareUrl}
      />

      <main className="mx-auto max-w-360 px-5 py-8 md:px-8 xl:px-12">
        <div className="mb-5 flex items-center justify-between sm:hidden">
          <span className="text-xs text-zinc-400">
            Tìm thấy{" "}
            <strong className="text-white">{filteredProjects.length}</strong>{" "}
            công trình
          </span>
          <button
            type="button"
            onClick={resetAllFilters}
            className="cursor-pointer text-xs font-medium text-brand"
          >
            Đặt lại bộ lọc
          </button>
        </div>

        {filteredProjects.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onSelect={setActiveProject}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-white/8 bg-(--bg-surface) py-16 text-center">
            <h3 className="text-base font-bold text-white">
              Không tìm thấy công trình phù hợp
            </h3>
            <p className="mx-auto mt-1 max-w-md text-xs text-zinc-400">
              Thử thay đổi từ khóa tìm kiếm hoặc đặt lại bộ lọc phân khúc B2B /
              C2B để xem toàn bộ kho dự án của Khang Việt.
            </p>
            <button
              type="button"
              onClick={resetAllFilters}
              className="mt-4 cursor-pointer rounded-lg bg-brand px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-brand/90"
            >
              Xóa toàn bộ bộ lọc
            </button>
          </div>
        )}

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-white/8 pt-6 sm:flex-row">
          <div className="text-xs text-zinc-400">
            Đang hiển thị{" "}
            <span className="font-semibold text-white">
              {filteredProjects.length}
            </span>{" "}
            / {data.projects.length} dự án tiêu biểu
            {activeProject ? ` • Đang chọn: ${activeProject.id}` : ""}
          </div>
        </div>
      </main>

      {toastMessage && (
        <div className="fixed right-5 bottom-5 z-50 flex items-center gap-2.5 rounded-xl border border-brand/50 bg-zinc-900 px-4 py-3 text-xs text-white shadow-xl">
          <span className="h-2 w-2 rounded-full bg-brand" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};

export default ProjectGalleryClient;
