"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Search, Share2, SlidersHorizontal, X } from "lucide-react";
import type {
  GalleryFilterState,
  GalleryProject,
  ProjectGalleryResponse,
} from "@khangviet/types";
import { KeyAccountsSpotlight } from "./KeyAccountsSpotlight";
import { GalleryFilterBar } from "./GalleryFilterBar";
import { ProjectCard } from "./ProjectCard";
import { ProjectDetailDrawer } from "./ProjectDetailDrawer";
import { QuoteRequestModal } from "./QuoteRequestModal";

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
  const [quoteProject, setQuoteProject] = useState<GalleryProject | null>(null);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
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
    const next = { ...filter, [key]: value };
    setFilter(next);
    syncUrlParams(next);
  };

  const handleSelectKeyAccount = (accountId: string) => {
    const next: GalleryFilterState = {
      ...filter,
      keyAccount: accountId,
      segment: accountId !== "ALL" ? "B2B" : filter.segment,
    };
    setFilter(next);
    syncUrlParams(next);
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
    <div className="min-h-screen bg-[#f4f1ea] text-[#1a1918]">
      <div className="pt-20">
        <KeyAccountsSpotlight
          keyAccounts={data.keyAccounts}
          selectedAccountId={filter.keyAccount}
          onSelectAccount={handleSelectKeyAccount}
        />
      </div>

      <main className="mx-auto max-w-360 px-5 py-8 md:px-8 lg:py-10 xl:px-12">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
          {/* Desktop Sidebar Filter */}
          <div className="hidden w-64 shrink-0 lg:sticky lg:top-24 lg:block xl:w-70">
            <GalleryFilterBar
              filter={filter}
              categories={data.categories}
              onUpdateFilter={updateFilter}
              onResetFilters={resetAllFilters}
            />
          </div>

          {/* Right Content Area */}
          <div className="min-w-0 flex-1">
            {/* Compact Toolbar: Result Count + Search + Share */}
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm text-[#625f5a]">
                  Hiển thị{" "}
                  <span className="font-semibold text-[#1a1918] tabular-nums">
                    {filteredProjects.length}
                  </span>{" "}
                  công trình
                </p>

                <button
                  type="button"
                  onClick={() => setMobileFilterOpen((prev) => !prev)}
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-black/10 bg-white px-3.5 py-1.5 text-xs font-medium text-[#1a1918] lg:hidden"
                >
                  <SlidersHorizontal className="h-3.5 w-3.5 text-(--accent-bronze)" />
                  Bộ lọc
                </button>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative flex-1 sm:w-68 sm:flex-initial">
                  <Search className="absolute top-1/2 left-3.5 h-3.5 w-3.5 -translate-y-1/2 text-[#625f5a]" />
                  <input
                    type="text"
                    value={filter.search}
                    onChange={(e) => updateFilter("search", e.target.value)}
                    placeholder="Tìm dự án, địa điểm, vật liệu..."
                    className="w-full rounded-full border border-black/10 bg-white py-2 pr-8 pl-9 text-xs text-[#1a1918] placeholder-[#625f5a]/70 outline-hidden transition-colors focus:border-(--accent-bronze)"
                  />
                  {filter.search && (
                    <button
                      type="button"
                      onClick={() => updateFilter("search", "")}
                      aria-label="Xóa từ khóa"
                      className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer text-[#625f5a] hover:text-[#1a1918]"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleCopyShareUrl}
                  title="Sao chép đường dẫn kèm bộ lọc hiện tại"
                  className="flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full border border-black/10 bg-white px-3.5 py-2 text-xs font-medium text-[#1a1918] transition-colors hover:border-[#1a1918]"
                >
                  <Share2 className="h-3.5 w-3.5 text-(--accent-bronze)" />
                  <span className="hidden sm:inline">Chia sẻ</span>
                </button>
              </div>
            </div>

            {/* Mobile Collapsible Filter */}
            {mobileFilterOpen && (
              <div className="mb-6 lg:hidden">
                <GalleryFilterBar
                  filter={filter}
                  categories={data.categories}
                  onUpdateFilter={updateFilter}
                  onResetFilters={resetAllFilters}
                />
              </div>
            )}

            {filteredProjects.length > 0 ? (
              <div className="grid grid-cols-1 gap-x-7 gap-y-10 sm:grid-cols-2 xl:grid-cols-3">
                {filteredProjects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    onSelect={setActiveProject}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-black/10 bg-white py-16 text-center">
                <h3 className="text-base font-semibold text-[#1a1918]">
                  Không tìm thấy công trình phù hợp
                </h3>
                <p className="mx-auto mt-1 max-w-md text-xs text-[#625f5a]">
                  Thử thay đổi từ khóa tìm kiếm hoặc đặt lại bộ lọc để xem toàn
                  bộ kho dự án của Khang Việt.
                </p>
                <button
                  type="button"
                  onClick={resetAllFilters}
                  className="mt-4 cursor-pointer rounded-full bg-[#1a1918] px-5 py-2.5 text-xs font-medium text-white transition-colors hover:bg-(--accent-bronze)"
                >
                  Xóa toàn bộ bộ lọc
                </button>
              </div>
            )}

            <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-black/8 pt-6 sm:flex-row">
              <div className="text-xs text-[#625f5a]">
                Đang hiển thị{" "}
                <span className="font-semibold text-[#1a1918] tabular-nums">
                  {filteredProjects.length}
                </span>{" "}
                / {data.projects.length} dự án tiêu biểu
              </div>
            </div>
          </div>
        </div>
      </main>

      <ProjectDetailDrawer
        project={activeProject}
        onClose={() => setActiveProject(null)}
        onRequestQuote={(project) => {
          setActiveProject(null);
          setQuoteProject(project);
        }}
      />

      <QuoteRequestModal
        project={quoteProject}
        onClose={() => setQuoteProject(null)}
      />

      {toastMessage && (
        <div className="fixed right-5 bottom-5 z-50 flex items-center gap-2.5 rounded-full bg-[#1a1918] px-5 py-3 text-xs text-white shadow-xl">
          <span className="h-2 w-2 rounded-full bg-(--accent-bronze)" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};

export default ProjectGalleryClient;
