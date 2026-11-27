import Link from "next/link";
import KhangVietLogo from "@/ui/KhangVietLogo";

interface ComingSoonPageProps {
  eyebrow?: string;
  title: string;
  description: string;
}

export function ComingSoonPage({
  eyebrow = "Coming Soon",
  title,
  description,
}: ComingSoonPageProps) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#F7F4E6] px-6 py-20 text-[#1e1e1e]">
      <div className="mx-auto flex w-full max-w-xl flex-col items-center text-center">
        <Link href="/" aria-label="Về trang chủ Khang Việt" className="mb-10">
          <KhangVietLogo className="h-12 w-auto" />
        </Link>

        <span className="inline-flex items-center rounded-full border border-[#1e1e1e]/15 bg-white/70 px-4 py-1.5 text-xs font-semibold tracking-widest text-brand uppercase">
          {eyebrow}
        </span>

        <h1 className="mt-6 text-[clamp(2rem,4.5vw,3.25rem)] leading-[1.1] font-bold tracking-[-0.03em] text-[#1e1e1e]">
          {title}
        </h1>

        <p className="mt-4 max-w-md text-sm leading-relaxed text-[#4D4D48] sm:text-base">
          {description}
        </p>

        <Link
          href="/"
          className="mt-9 inline-flex items-center justify-center rounded-lg bg-brand px-7 py-3.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-brand/90"
        >
          Quay về trang chủ
        </Link>
      </div>
    </main>
  );
}
