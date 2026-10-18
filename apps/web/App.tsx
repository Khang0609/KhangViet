import { FormEvent, useEffect, useState } from "react";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Building2,
  Check,
  ChevronLeft,
  ChevronRight,
  DraftingCompass,
  Factory,
  FileText,
  Hammer,
  Layers3,
  Mail,
  MapPin,
  Menu,
  Phone,
  Send,
  ShieldCheck,
  Sparkles,
  Upload,
  X,
} from "lucide-react";
import KhangVietLogo from "./components/KhangVietLogo";
import ProjectLightboxModal from "./components/ProjectLightboxModal";
import SpecAndProfileModal from "./components/SpecAndProfileModal";
import {
  COMPANY_LEGAL_INFO,
  CORE_DISCIPLINES,
  FEATURED_PROJECTS,
  HERO_SLIDES,
  PARTNER_BRANDS,
  PRODUCTION_DIVISIONS,
  type FeaturedProject,
} from "./data/khangVietData";

const NAV_ITEMS = [
  { number: "01.", label: "Dự án", href: "#du-an" },
  { number: "02.", label: "Lĩnh vực", href: "#linh-vuc" },
  { number: "03.", label: "Năng lực xưởng", href: "#nang-luc" },
  { number: "04.", label: "Về Khang Việt", href: "#ve-khang-viet" },
];

const STATS = [
  { value: "15+", label: "Năm kinh nghiệm", note: "2009 — Nay" },
  { value: "1,000+", label: "Công trình hoàn thiện", note: "Trên toàn quốc" },
  { value: "100%", label: "Tự chủ sản xuất", note: "Cơ khí & In ấn" },
];

function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [heroSlide, setHeroSlide] = useState(0);
  const [profileModal, setProfileModal] = useState<"profile" | "wireframe" | null>(null);
  const [activeProject, setActiveProject] = useState<FeaturedProject | null>(null);
  const [activeProjectImage, setActiveProjectImage] = useState(0);
  const [formSent, setFormSent] = useState(false);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setHeroSlide((current) => (current + 1) % HERO_SLIDES.length);
    }, 6500);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    document.body.style.overflow = profileModal || activeProject ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [profileModal, activeProject]);

  const currentSlide = HERO_SLIDES[heroSlide];

  const moveHero = (direction: number) => {
    setHeroSlide(
      (current) => (current + direction + HERO_SLIDES.length) % HERO_SLIDES.length,
    );
  };

  const openProject = (project: FeaturedProject, imageIndex = 0) => {
    setActiveProjectImage(imageIndex);
    setActiveProject(project);
  };

  const submitContact = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormSent(true);
    event.currentTarget.reset();
  };

  return (
    <div className="min-h-screen bg-[var(--bg-obsidian)] text-[var(--text-primary)]">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-white/[0.08] bg-[#111215]/85 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-[1440px] items-center justify-between gap-6 px-5 md:px-8 xl:px-12">
          <a href="#top" aria-label="Khang Việt Design — Trang chủ" className="shrink-0">
            <KhangVietLogo compact className="h-10" />
          </a>

          <nav className="hidden items-center gap-7 lg:flex xl:gap-9" aria-label="Điều hướng chính">
            {NAV_ITEMS.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="group text-xs font-medium text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
              >
                <span className="mr-1.5 font-mono-tech text-[10px] text-[var(--accent-bronze)]">
                  {item.number}
                </span>
                {item.label}
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-2 sm:flex">
            <button
              type="button"
              onClick={() => setProfileModal("profile")}
              className="hidden items-center gap-2 border border-[var(--border-bronze-subtle)] px-4 py-2.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--accent-bronze)] transition-colors hover:bg-[var(--accent-bronze)] hover:text-[var(--bg-obsidian)] xl:flex"
            >
              <FileText className="h-3.5 w-3.5" />
              Hồ sơ năng lực
            </button>
            <a
              href="tel:0903680449"
              className="flex items-center gap-2 border border-white/10 bg-white/[0.03] px-3.5 py-2.5 font-mono-tech text-[11px] transition-colors hover:border-[var(--accent-bronze)]"
            >
              <span className="h-1.5 w-1.5 bg-[var(--accent-bronze)] shadow-[0_0_10px_var(--accent-bronze)]" />
              0903 680 449
            </a>
          </div>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((open) => !open)}
            className="border border-white/10 p-2.5 text-[var(--text-primary)] lg:hidden"
            aria-label={mobileMenuOpen ? "Đóng menu" : "Mở menu"}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="border-t border-white/[0.08] bg-[var(--bg-obsidian)] px-5 py-5 lg:hidden">
            <nav className="mx-auto grid max-w-[1440px] gap-1" aria-label="Điều hướng di động">
              {NAV_ITEMS.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between border-b border-white/[0.06] py-3 text-sm"
                >
                  <span>
                    <span className="mr-3 font-mono-tech text-[var(--accent-bronze)]">
                      {item.number}
                    </span>
                    {item.label}
                  </span>
                  <ArrowRight className="h-4 w-4 text-[var(--text-secondary)]" />
                </a>
              ))}
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  setProfileModal("profile");
                }}
                className="mt-4 flex items-center justify-center gap-2 bg-[var(--accent-bronze)] px-4 py-3 text-xs font-bold uppercase tracking-wider text-[var(--bg-obsidian)]"
              >
                <FileText className="h-4 w-4" />
                Xem hồ sơ năng lực
              </button>
            </nav>
          </div>
        )}
      </header>

      <main id="top">
        <section className="bg-blueprint-grid relative overflow-hidden border-b border-white/[0.08] pt-20">
          <div className="pointer-events-none absolute -left-40 top-32 h-96 w-96 rounded-full bg-[var(--accent-bronze)]/[0.05] blur-[120px]" />
          <div className="mx-auto max-w-[1440px] px-5 pb-16 pt-16 md:px-8 md:pb-20 md:pt-24 xl:px-12 xl:pt-28">
            <div className="grid items-center gap-14 lg:grid-cols-12 lg:gap-10">
              <div className="lg:col-span-5">
                <div className="mb-7 flex items-center gap-3">
                  <span className="h-px w-10 bg-[var(--accent-bronze)]" />
                  <span className="font-mono-tech text-[10px] uppercase tracking-[0.2em] text-[var(--accent-bronze)]">
                    Since 2009 • Architectural signage & interior
                  </span>
                </div>
                <h1 className="font-syne text-[clamp(2.75rem,5.4vw,5rem)] font-extrabold leading-[0.98] tracking-[-0.045em]">
                  Kiến Tạo
                  <br />
                  Diện Mạo
                  <br />
                  <span className="text-[var(--accent-bronze)]">Thương Hiệu</span>
                  <br />
                  Đỉnh Cao.
                </h1>
                <p className="mt-7 max-w-xl text-sm leading-7 text-[var(--text-secondary)] md:text-base">
                  Hơn 15 năm đồng hành cùng các tập đoàn hàng đầu, kiến tạo không gian kinh
                  doanh và hệ thống nhận diện biển hiệu chuẩn mực — từ bản vẽ kỹ thuật đến
                  công trình hoàn thiện.
                </p>
                <div className="mt-9 flex flex-wrap gap-3">
                  <a
                    href="#du-an"
                    className="group flex items-center gap-3 bg-[var(--accent-bronze)] px-5 py-3.5 text-xs font-bold uppercase tracking-[0.12em] text-[var(--bg-obsidian)] transition-colors hover:bg-[var(--accent-bronze-light)]"
                  >
                    Khám phá dự án
                    <ArrowDown className="h-4 w-4 transition-transform group-hover:translate-y-1" />
                  </a>
                  <a
                    href="#contact-gate"
                    className="flex items-center gap-3 border border-white/15 px-5 py-3.5 text-xs font-semibold uppercase tracking-[0.12em] transition-colors hover:border-[var(--accent-bronze)] hover:text-[var(--accent-bronze)]"
                  >
                    Nhận tư vấn kỹ thuật
                    <ArrowUpRight className="h-4 w-4" />
                  </a>
                </div>
              </div>

              <div className="lg:col-span-7 lg:pl-4">
                <div className="amber-frame-glow group relative aspect-[4/3] overflow-hidden bg-[var(--bg-surface)] transition-shadow duration-700 md:aspect-video">
                  {HERO_SLIDES.map((slide, index) => (
                    <img
                      key={slide.id}
                      src={slide.image}
                      alt={slide.title}
                      className={`absolute inset-0 h-full w-full object-cover transition-all duration-1000 ${
                        index === heroSlide ? "scale-100 opacity-100" : "scale-105 opacity-0"
                      }`}
                    />
                  ))}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-black/20" />
                  <div className="absolute left-4 right-4 top-4 flex items-start justify-between gap-4 md:left-6 md:right-6 md:top-6">
                    <span className="max-w-[75%] bg-black/65 px-3 py-2 font-mono-tech text-[9px] uppercase tracking-[0.15em] text-[var(--accent-bronze)] backdrop-blur">
                      {currentSlide.tag}
                    </span>
                    <span className="hidden h-9 w-9 items-center justify-center border border-white/20 bg-black/40 font-mono-tech text-[10px] md:flex">
                      0{heroSlide + 1}
                    </span>
                  </div>
                  <div className="absolute inset-x-0 bottom-0 p-4 md:p-7">
                    <p className="mb-2 font-mono-tech text-[9px] uppercase tracking-[0.18em] text-[var(--accent-bronze)]">
                      {currentSlide.location}
                    </p>
                    <h2 className="max-w-2xl font-syne text-xl font-bold leading-tight md:text-3xl">
                      {currentSlide.title}
                    </h2>
                    <p className="mt-2 hidden max-w-2xl text-xs leading-relaxed text-white/65 md:block">
                      {currentSlide.specs}
                    </p>
                  </div>
                  <div className="absolute right-4 top-1/2 flex -translate-y-1/2 flex-col gap-2">
                    <button
                      type="button"
                      onClick={() => moveHero(-1)}
                      className="flex h-9 w-9 items-center justify-center border border-white/15 bg-black/55 transition-colors hover:border-[var(--accent-bronze)] hover:text-[var(--accent-bronze)]"
                      aria-label="Ảnh dự án trước"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveHero(1)}
                      className="flex h-9 w-9 items-center justify-center border border-white/15 bg-black/55 transition-colors hover:border-[var(--accent-bronze)] hover:text-[var(--accent-bronze)]"
                      aria-label="Ảnh dự án tiếp theo"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  {HERO_SLIDES.map((slide, index) => (
                    <button
                      type="button"
                      key={slide.id}
                      onClick={() => setHeroSlide(index)}
                      className={`h-0.5 flex-1 transition-colors ${
                        index === heroSlide ? "bg-[var(--accent-bronze)]" : "bg-white/15"
                      }`}
                      aria-label={`Xem slide ${index + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-16 grid border-y border-white/[0.08] sm:grid-cols-3 lg:ml-[42%] lg:mt-20">
              {STATS.map((stat, index) => (
                <div
                  key={stat.label}
                  className={`px-5 py-6 ${index ? "border-t border-white/[0.08] sm:border-l sm:border-t-0" : ""}`}
                >
                  <div className="font-syne text-3xl font-bold text-[var(--accent-bronze)] md:text-4xl">
                    {stat.value}
                  </div>
                  <div className="mt-2 text-xs font-semibold uppercase tracking-wide">
                    {stat.label}
                  </div>
                  <div className="mt-1 font-mono-tech text-[9px] uppercase tracking-wider text-[var(--text-secondary)]">
                    {stat.note}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="overflow-hidden border-b border-white/[0.08] bg-[#14161a] py-8" aria-label="Đối tác tiêu biểu">
          <div className="mb-6 flex items-center justify-center gap-3 px-5">
            <span className="h-px w-8 bg-white/15" />
            <span className="font-mono-tech text-[9px] uppercase tracking-[0.25em] text-[var(--text-secondary)]">
              Trusted by leading corporations
            </span>
            <span className="h-px w-8 bg-white/15" />
          </div>
          <div className="animate-marquee">
            {[...PARTNER_BRANDS, ...PARTNER_BRANDS].map((partner, index) => (
              <div
                key={`${partner.name}-${index}`}
                className="group mx-2 flex min-w-56 items-center gap-4 border border-white/[0.06] px-5 py-4 transition-colors hover:border-[var(--border-bronze-subtle)]"
              >
                <span className="font-syne text-sm font-bold text-[var(--text-secondary)] transition-colors group-hover:text-[var(--text-primary)]">
                  {partner.name}
                </span>
                <span className="font-mono-tech text-[8px] uppercase tracking-wider text-white/30">
                  {partner.category}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section id="linh-vuc" className="scroll-mt-20 py-24 md:py-32">
          <div className="mx-auto max-w-[1440px] px-5 md:px-8 xl:px-12">
            <SectionHeading
              index="01"
              eyebrow="Core disciplines"
              title="Ba trụ cột. Một tiêu chuẩn hoàn thiện."
              description="Từ kiến trúc mặt dựng quy mô lớn đến từng chi tiết trưng bày — mọi hạng mục được kiểm soát xuyên suốt bởi cùng một đội ngũ."
            />
            <div className="mt-12 grid gap-5 lg:grid-cols-3">
              {CORE_DISCIPLINES.map((discipline) => (
                <article
                  key={discipline.number}
                  className="group flex flex-col border border-white/[0.08] bg-[var(--bg-surface)] transition-all duration-500 hover:-translate-y-1 hover:border-[var(--accent-bronze)]/60"
                >
                  <div className="relative h-52 overflow-hidden">
                    <img
                      src={discipline.previewImage}
                      alt={discipline.vietnameseTitle}
                      className="h-full w-full object-cover grayscale-[35%] transition duration-700 group-hover:scale-105 group-hover:grayscale-0"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-surface)] via-transparent to-transparent" />
                    <span className="absolute left-5 top-5 border border-white/15 bg-black/60 px-2.5 py-1 font-mono-tech text-[9px] tracking-widest text-[var(--accent-bronze)]">
                      {discipline.code}
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col p-6 md:p-8">
                    <div className="mb-5 flex items-start justify-between gap-4">
                      <div>
                        <div className="font-syne text-4xl font-bold text-white/10">
                          {discipline.number}
                        </div>
                        <h3 className="-mt-2 font-syne text-xl font-bold">
                          {discipline.title}
                        </h3>
                      </div>
                      <ArrowUpRight className="h-5 w-5 text-[var(--accent-bronze)]" />
                    </div>
                    <p className="text-sm font-semibold leading-relaxed">
                      {discipline.vietnameseTitle}
                    </p>
                    <p className="mt-3 text-xs leading-6 text-[var(--text-secondary)]">
                      {discipline.description}
                    </p>
                    <ul className="mt-6 space-y-2 border-t border-white/[0.08] pt-5">
                      {discipline.specs.slice(0, 3).map((spec) => (
                        <li key={spec} className="flex items-start gap-2 text-[11px] leading-5 text-white/70">
                          <span className="mt-2 h-1 w-1 shrink-0 bg-[var(--accent-bronze)]" />
                          {spec}
                        </li>
                      ))}
                    </ul>
                    <div className="mt-auto flex items-end justify-between border-t border-white/[0.08] pt-6">
                      <span className="max-w-32 text-[10px] uppercase tracking-wider text-[var(--text-secondary)]">
                        {discipline.metricLabel}
                      </span>
                      <span className="font-mono-tech text-sm text-[var(--accent-bronze)]">
                        {discipline.metricValue}
                      </span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="du-an" className="scroll-mt-20 border-y border-white/[0.08] bg-[#0e0f12] py-24 md:py-32">
          <div className="mx-auto max-w-[1440px] px-5 md:px-8 xl:px-12">
            <SectionHeading
              index="02"
              eyebrow="Selected works archive"
              title="Công trình là tuyên ngôn rõ nhất."
              description="Hồ sơ thực tế về những hệ thống nhận diện được chế tác để bền bỉ, chính xác và nổi bật trong mọi điều kiện không gian."
            />

            <div className="mt-14 space-y-20 md:space-y-28">
              {FEATURED_PROJECTS.map((project, projectIndex) => (
                <article key={project.id} className="grid gap-8 lg:grid-cols-12 lg:gap-10">
                  <div className={`lg:col-span-8 ${projectIndex % 2 ? "lg:order-2" : ""}`}>
                    <button
                      type="button"
                      onClick={() => openProject(project)}
                      className="group relative block aspect-[16/10] w-full overflow-hidden bg-[var(--bg-surface)] text-left"
                    >
                      <img
                        src={project.coverImage}
                        alt={project.title}
                        className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.025]"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/15" />
                      <span className="absolute bottom-5 right-5 flex h-12 w-12 items-center justify-center border border-white/30 bg-black/50 backdrop-blur transition-colors group-hover:border-[var(--accent-bronze)] group-hover:bg-[var(--accent-bronze)] group-hover:text-black">
                        <ArrowUpRight className="h-5 w-5" />
                      </span>
                      <span className="absolute left-5 top-5 bg-[var(--accent-bronze)] px-3 py-1.5 font-mono-tech text-[9px] font-semibold uppercase tracking-widest text-black">
                        Featured 0{projectIndex + 1}
                      </span>
                    </button>
                    <div className="mt-3 grid grid-cols-3 gap-3">
                      {project.gallery.slice(0, 3).map((image, imageIndex) => (
                        <button
                          type="button"
                          key={image.id}
                          onClick={() => openProject(project, imageIndex)}
                          className="group relative aspect-[4/3] overflow-hidden border border-white/[0.08]"
                        >
                          <img
                            src={image.src}
                            alt={image.caption}
                            className="h-full w-full object-cover opacity-60 transition duration-500 group-hover:scale-105 group-hover:opacity-100"
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className={`flex flex-col justify-between lg:col-span-4 ${projectIndex % 2 ? "lg:order-1" : ""}`}>
                    <div>
                      <div className="font-mono-tech text-[10px] uppercase tracking-[0.2em] text-[var(--accent-bronze)]">
                        {project.code}
                      </div>
                      <h3 className="mt-4 font-syne text-2xl font-bold leading-tight md:text-3xl">
                        {project.title}
                      </h3>
                      <p className="mt-5 text-sm leading-7 text-[var(--text-secondary)]">
                        {project.summary}
                      </p>
                    </div>
                    <div className="mt-8">
                      <dl className="border-y border-white/[0.08]">
                        <MetaRow label="Khách hàng" value={project.client} />
                        <MetaRow label="Quy mô" value={project.scaleMetric} accent />
                        <MetaRow label="Thời kỳ" value={project.year} />
                        <MetaRow label="Vật liệu chính" value={project.materials.slice(0, 2).join(" • ")} />
                      </dl>
                      <button
                        type="button"
                        onClick={() => openProject(project)}
                        className="group mt-6 flex w-full items-center justify-between border border-[var(--border-bronze-subtle)] px-5 py-4 text-xs font-semibold uppercase tracking-wider text-[var(--accent-bronze)] transition-colors hover:bg-[var(--accent-bronze)] hover:text-black"
                      >
                        Xem hồ sơ dự án
                        <span className="font-mono-tech">0{project.gallery.length} frames</span>
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="nang-luc" className="bg-blueprint-grid scroll-mt-20 py-24 md:py-32">
          <div className="mx-auto max-w-[1440px] px-5 md:px-8 xl:px-12">
            <div className="grid gap-12 lg:grid-cols-12">
              <div className="lg:col-span-4">
                <SectionHeading
                  index="03"
                  eyebrow="In-house engineering"
                  title="Tự chủ từ xưởng. Làm chủ công trình."
                  description="Không qua trung gian. Mỗi đường hàn, mã màu và điểm sáng đều được kiểm soát ngay tại xưởng Khang Việt."
                />
                <div className="mt-8 border border-[var(--border-bronze-subtle)] bg-[var(--accent-bronze)]/[0.06] p-5">
                  <MapPin className="h-5 w-5 text-[var(--accent-bronze)]" />
                  <p className="mt-3 text-xs uppercase tracking-wider text-[var(--text-secondary)]">
                    Tổ hợp xưởng sản xuất
                  </p>
                  <p className="mt-2 text-sm font-semibold leading-6">
                    {COMPANY_LEGAL_INFO.factoryAddress}
                  </p>
                </div>
              </div>

              <div className="lg:col-span-8">
                <div className="border border-white/[0.08] bg-[var(--bg-surface)] p-5 md:p-8">
                  <div className="grid items-center gap-4 border border-[var(--border-bronze-subtle)] bg-[#15171a] p-5 sm:grid-cols-[auto_1fr_auto]">
                    <div className="flex h-12 w-12 items-center justify-center bg-[var(--accent-bronze)] text-black">
                      <DraftingCompass className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="font-mono-tech text-[9px] uppercase tracking-widest text-[var(--accent-bronze)]">
                        Command & engineering
                      </div>
                      <div className="mt-1 font-syne text-lg font-bold">
                        Ban Giám Đốc • Kỹ sư Kết cấu • Kiến trúc sư
                      </div>
                    </div>
                    <div className="font-mono-tech text-[10px] text-[var(--text-secondary)]">
                      QA / QC / HSE
                    </div>
                  </div>

                  <div className="mx-auto h-8 w-px bg-[var(--accent-bronze)]/50" />

                  <div className="grid gap-3 sm:grid-cols-2">
                    {PRODUCTION_DIVISIONS.map((division, index) => {
                      const DivisionIcon = [Hammer, Sparkles, Layers3, Factory][index];
                      return (
                        <article
                          key={division.code}
                          className="group border border-white/[0.08] bg-[#15171a] p-5 transition-colors hover:border-[var(--border-bronze-subtle)]"
                        >
                          <div className="flex items-start justify-between gap-5">
                            <div>
                              <div className="font-mono-tech text-[9px] tracking-widest text-[var(--accent-bronze)]">
                                {division.code}
                              </div>
                              <h3 className="mt-2 font-syne text-base font-bold">
                                {division.name}
                              </h3>
                            </div>
                            <DivisionIcon className="h-5 w-5 text-[var(--text-secondary)] transition-colors group-hover:text-[var(--accent-bronze)]" />
                          </div>
                          <div className="my-5 flex items-end gap-2">
                            <span className="font-syne text-5xl font-bold text-[var(--accent-bronze)]">
                              {division.headcount}
                            </span>
                            <span className="pb-1 text-[10px] uppercase leading-4 text-[var(--text-secondary)]">
                              {division.unitLabel}
                            </span>
                          </div>
                          <p className="text-[11px] leading-5 text-[var(--text-secondary)]">
                            {division.role}
                          </p>
                          <p className="mt-4 border-t border-white/[0.06] pt-3 font-mono-tech text-[9px] leading-4 text-white/50">
                            EQUIPMENT // {division.equipment}
                          </p>
                        </article>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-5 flex flex-col justify-between gap-5 border-l-2 border-[var(--accent-bronze)] bg-white/[0.025] p-6 sm:flex-row sm:items-center">
                  <div>
                    <div className="font-mono-tech text-[9px] uppercase tracking-[0.2em] text-[var(--accent-bronze)]">
                      Cam kết vận hành
                    </div>
                    <blockquote className="mt-2 font-syne text-lg font-bold">
                      “{COMPANY_LEGAL_INFO.commitment}”
                    </blockquote>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <ShieldCheck className="h-6 w-6 text-[var(--accent-bronze)]" />
                    <span className="font-mono-tech text-[10px] uppercase tracking-wider text-[var(--text-secondary)]">
                      24 nhân sự
                      <br />
                      trực tiếp biên chế
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="contact-gate" className="scroll-mt-20 border-t border-white/[0.08] bg-[#0d0e11] py-24 md:py-32">
          <div className="mx-auto max-w-[1440px] px-5 md:px-8 xl:px-12">
            <div className="mb-12 max-w-3xl">
              <div className="font-mono-tech text-[10px] uppercase tracking-[0.24em] text-[var(--accent-bronze)]">
                04 // Start a project
              </div>
              <h2 className="mt-5 font-syne text-4xl font-bold leading-[1.05] tracking-tight md:text-6xl">
                Mỗi quy mô dự án.
                <br />
                Một lối vào phù hợp.
              </h2>
            </div>

            <div className="grid border border-white/[0.08] lg:grid-cols-2">
              <div className="p-6 md:p-10 lg:border-r lg:border-white/[0.08]">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <span className="font-mono-tech text-[9px] uppercase tracking-widest text-[var(--accent-bronze)]">
                      Contact gate A
                    </span>
                    <h3 className="mt-2 font-syne text-2xl font-bold">
                      Chủ cửa hàng / Showroom
                    </h3>
                  </div>
                  <Building2 className="h-8 w-8 text-white/15" />
                </div>
                <p className="mt-4 max-w-lg text-sm leading-6 text-[var(--text-secondary)]">
                  Gửi nhanh nhu cầu. Kỹ thuật Khang Việt sẽ liên hệ khảo sát và tư vấn vật
                  liệu phù hợp trong giờ làm việc.
                </p>

                {formSent ? (
                  <div className="mt-8 flex min-h-64 flex-col items-center justify-center border border-[var(--border-bronze-subtle)] bg-[var(--accent-bronze)]/[0.05] p-8 text-center">
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--accent-bronze)] text-black">
                      <Check className="h-6 w-6" />
                    </span>
                    <h4 className="mt-5 font-syne text-xl font-bold">Đã ghi nhận yêu cầu</h4>
                    <p className="mt-2 text-sm text-[var(--text-secondary)]">
                      Khang Việt sẽ liên hệ với bạn trong thời gian sớm nhất.
                    </p>
                    <button
                      type="button"
                      onClick={() => setFormSent(false)}
                      className="mt-5 text-xs uppercase tracking-wider text-[var(--accent-bronze)]"
                    >
                      Gửi yêu cầu khác
                    </button>
                  </div>
                ) : (
                  <form onSubmit={submitContact} className="mt-8 space-y-3">
                    <label className="block">
                      <span className="sr-only">Họ và tên</span>
                      <input
                        required
                        name="name"
                        placeholder="01. HỌ VÀ TÊN"
                        className="w-full border border-white/[0.1] bg-white/[0.025] px-4 py-4 text-sm outline-none transition-colors placeholder:text-white/30 focus:border-[var(--accent-bronze)]"
                      />
                    </label>
                    <label className="block">
                      <span className="sr-only">Số điện thoại</span>
                      <input
                        required
                        type="tel"
                        name="phone"
                        placeholder="02. SỐ ĐIỆN THOẠI"
                        className="w-full border border-white/[0.1] bg-white/[0.025] px-4 py-4 text-sm outline-none transition-colors placeholder:text-white/30 focus:border-[var(--accent-bronze)]"
                      />
                    </label>
                    <label className="block">
                      <span className="sr-only">Nhu cầu thi công</span>
                      <textarea
                        required
                        name="request"
                        rows={3}
                        placeholder="03. NHU CẦU THI CÔNG / ĐỊA ĐIỂM"
                        className="w-full resize-none border border-white/[0.1] bg-white/[0.025] px-4 py-4 text-sm outline-none transition-colors placeholder:text-white/30 focus:border-[var(--accent-bronze)]"
                      />
                    </label>
                    <button
                      type="submit"
                      className="flex w-full items-center justify-between bg-[var(--accent-bronze)] px-5 py-4 text-xs font-bold uppercase tracking-wider text-black transition-colors hover:bg-[var(--accent-bronze-light)]"
                    >
                      Gửi yêu cầu khảo sát
                      <Send className="h-4 w-4" />
                    </button>
                  </form>
                )}
                <a
                  href="tel:0903680449"
                  className="mt-4 flex items-center justify-center gap-2 border border-white/10 py-3 text-xs font-semibold uppercase tracking-wider transition-colors hover:border-[var(--accent-bronze)] hover:text-[var(--accent-bronze)]"
                >
                  <Phone className="h-4 w-4" />
                  Gọi ngay / Zalo: 0903 680 449
                </a>
              </div>

              <div className="border-t border-white/[0.08] bg-[var(--bg-surface)] p-6 md:p-10 lg:border-t-0">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <span className="font-mono-tech text-[9px] uppercase tracking-widest text-[var(--accent-bronze)]">
                      Contact gate B
                    </span>
                    <h3 className="mt-2 font-syne text-2xl font-bold">
                      Tổng thầu / Chuỗi tập đoàn
                    </h3>
                  </div>
                  <DraftingCompass className="h-8 w-8 text-white/15" />
                </div>
                <p className="mt-4 max-w-lg text-sm leading-6 text-[var(--text-secondary)]">
                  Tiếp nhận hồ sơ mời thầu, BOQ, bản vẽ CAD và yêu cầu triển khai đồng bộ
                  chuỗi trên toàn quốc.
                </p>
                <div className="mt-8 border border-dashed border-white/15 bg-[#111215] p-8 text-center transition-colors hover:border-[var(--accent-bronze)]">
                  <Upload className="mx-auto h-7 w-7 text-[var(--accent-bronze)]" />
                  <p className="mt-4 text-sm font-semibold">Gửi bản vẽ & hồ sơ báo giá</p>
                  <p className="mt-2 text-xs text-[var(--text-secondary)]">
                    CAD • PDF • BOQ • Hồ sơ mời thầu
                  </p>
                  <a
                    href={`mailto:${COMPANY_LEGAL_INFO.email}`}
                    className="mt-5 inline-flex items-center gap-2 border border-[var(--border-bronze-subtle)] px-5 py-3 text-xs font-semibold uppercase tracking-wider text-[var(--accent-bronze)] transition-colors hover:bg-[var(--accent-bronze)] hover:text-black"
                  >
                    <Mail className="h-4 w-4" />
                    Gửi email trực tiếp
                  </a>
                </div>
                <div className="mt-5 flex items-center justify-between gap-4 border-t border-white/[0.08] pt-5">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-[var(--text-secondary)]">
                      Liên hệ điều hành trực tiếp
                    </p>
                    <p className="mt-1 font-syne text-lg font-bold">Ông Trần Xuân Đông</p>
                    <p className="text-xs text-[var(--accent-bronze)]">Giám Đốc Điều Hành</p>
                  </div>
                  <a
                    href="tel:0903680449"
                    aria-label="Gọi Giám đốc Trần Xuân Đông"
                    className="flex h-12 w-12 shrink-0 items-center justify-center bg-[var(--accent-bronze)] text-black"
                  >
                    <Phone className="h-5 w-5" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer id="ve-khang-viet" className="scroll-mt-20 border-t border-white/[0.08] bg-[#090a0c]">
        <div className="mx-auto max-w-[1440px] px-5 py-12 md:px-8 xl:px-12">
          <div className="grid gap-10 md:grid-cols-12">
            <div className="md:col-span-5">
              <KhangVietLogo className="h-12" />
              <p className="mt-5 max-w-lg text-xs uppercase leading-6 tracking-wide text-[var(--text-secondary)]">
                {COMPANY_LEGAL_INFO.fullName}
              </p>
              <p className="mt-2 font-mono-tech text-[10px] text-[var(--accent-bronze)]">
                KHANG VIET DESIGN CO., LTD — SINCE 2009
              </p>
            </div>
            <div className="md:col-span-3">
              <div className="font-mono-tech text-[9px] uppercase tracking-widest text-white/40">
                Pháp nhân doanh nghiệp
              </div>
              <dl className="mt-4 space-y-2 text-xs text-[var(--text-secondary)]">
                <div>
                  MST: <span className="text-[var(--text-primary)]">{COMPANY_LEGAL_INFO.taxId}</span>
                </div>
                <div>Cấp ngày {COMPANY_LEGAL_INFO.licenseDate}</div>
                <div>{COMPANY_LEGAL_INFO.licenseIssuer}</div>
                <div>Đại diện: Ông {COMPANY_LEGAL_INFO.director}</div>
              </dl>
            </div>
            <div className="md:col-span-4">
              <div className="font-mono-tech text-[9px] uppercase tracking-widest text-white/40">
                Liên hệ & tài liệu
              </div>
              <div className="mt-4 space-y-2">
                <a href="tel:0903680449" className="block text-sm transition-colors hover:text-[var(--accent-bronze)]">
                  Hotline: {COMPANY_LEGAL_INFO.hotline}
                </a>
                <a
                  href={`mailto:${COMPANY_LEGAL_INFO.email}`}
                  className="block text-sm transition-colors hover:text-[var(--accent-bronze)]"
                >
                  {COMPANY_LEGAL_INFO.email}
                </a>
                <button
                  type="button"
                  onClick={() => setProfileModal("wireframe")}
                  className="mt-3 flex items-center gap-2 text-[10px] uppercase tracking-wider text-[var(--accent-bronze)]"
                >
                  <Layers3 className="h-3.5 w-3.5" />
                  Xem Pixel Wireframe & Design Spec
                </button>
              </div>
            </div>
          </div>
          <div className="mt-10 flex flex-col justify-between gap-3 border-t border-white/[0.08] pt-5 font-mono-tech text-[9px] uppercase tracking-wider text-white/30 sm:flex-row">
            <span>© {new Date().getFullYear()} Khang Viet Design. All rights reserved.</span>
            <span>Design • Fabrication • Installation</span>
          </div>
        </div>
      </footer>

      <ProjectLightboxModal
        project={activeProject}
        initialImageIndex={activeProjectImage}
        onClose={() => setActiveProject(null)}
      />
      <SpecAndProfileModal
        isOpen={profileModal !== null}
        initialTab={profileModal ?? "profile"}
        onClose={() => setProfileModal(null)}
      />
    </div>
  );
}

function SectionHeading({
  index,
  eyebrow,
  title,
  description,
}: {
  index: string;
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-12">
      <div className="lg:col-span-3">
        <div className="flex items-center gap-3 font-mono-tech text-[10px] uppercase tracking-[0.2em] text-[var(--accent-bronze)]">
          <span>{index}</span>
          <span className="h-px w-8 bg-[var(--accent-bronze)]" />
          {eyebrow}
        </div>
      </div>
      <div className="lg:col-span-6">
        <h2 className="font-syne text-3xl font-bold leading-[1.08] tracking-tight md:text-5xl">
          {title}
        </h2>
      </div>
      <div className="lg:col-span-3">
        <p className="text-sm leading-7 text-[var(--text-secondary)]">{description}</p>
      </div>
    </div>
  );
}

function MetaRow({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="grid grid-cols-[6rem_1fr] gap-4 border-b border-white/[0.06] py-3 last:border-0">
      <dt className="font-mono-tech text-[9px] uppercase tracking-wider text-[var(--text-secondary)]">
        {label}
      </dt>
      <dd className={`text-xs leading-5 ${accent ? "text-[var(--accent-bronze)]" : "text-white/80"}`}>
        {value}
      </dd>
    </div>
  );
}

export default App;
