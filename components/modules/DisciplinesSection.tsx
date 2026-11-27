"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useInView } from "@/hooks/useInView";
import { cn } from "@/lib/ultis";

interface ServiceCardData {
  pills: [string, string];
  headingLines: [string, string?];
  description: string;
  ctaLabel: string;
  href: string;
}

const SERVICES: [
  ServiceCardData,
  ServiceCardData,
  ServiceCardData,
  ServiceCardData,
] = [
  {
    pills: ["Khảo sát & 3D", "Kết cấu – Điện"],
    headingLines: ["Thiết kế Kiến trúc", "& Kết cấu"],
    description:
      "Trước khi sản xuất, đội ngũ kiến trúc sư và kỹ sư kết cấu – điện của Khang Việt khảo sát thực tế, lên phối cảnh 3D và bản vẽ kỹ thuật chuẩn xác để mọi hạng mục thi công đều an toàn và đồng bộ.",
    ctaLabel: "Tìm hiểu quy trình",
    href: "/services",
  },
  {
    pills: ["Bảng hiệu mặt tiền", "Hộp đèn – Chữ nổi"],
    headingLines: ["Bảng hiệu, Hộp đèn", "& Chữ nổi"],
    description:
      "Hệ thống nhận diện thương hiệu ngoài trời và trong nhà được gia công sắc nét từ alu, mica, inox đến LED. Đảm bảo độ bền, tính thẩm mỹ và sự nổi bật ở mọi không gian.",
    ctaLabel: "Xem hạng mục bảng hiệu",
    href: "/services",
  },
  {
    pills: ["Xưởng cơ khí", "Nội thất bán lẻ"],
    headingLines: ["Thi công Cơ khí", "& Trang trí Nội thất"],
    description:
      "Từ quầy giao dịch ngân hàng, showroom thời trang đến gian hàng trung tâm thương mại — tổ thi công cơ khí lành nghề trực tiếp chế tác và lắp đặt đúng tiến độ.",
    ctaLabel: "Khám phá năng lực xưởng",
    href: "/services",
  },
  {
    pills: ["In ấn khổ lớn", "Vẽ tường nghệ thuật"],
    headingLines: ["In ấn Quảng cáo", "& Vẽ tường"],
    description:
      "Hoàn thiện trọn vẹn không gian thương hiệu với tổ in ấn quảng cáo và đội ngũ thi công vẽ tường chuyên biệt — giúp cửa hàng và chiến dịch của bạn thu hút ngay từ ánh nhìn đầu tiên.",
    ctaLabel: "Xem chi tiết dịch vụ",
    href: "/services",
  },
];

function MaskedHeading({
  lines,
  inView,
  className,
}: {
  lines: (string | undefined)[];
  inView: boolean;
  className?: string;
}) {
  return (
    <h3 className={className}>
      {lines.filter(Boolean).map((line, idx) => (
        <span key={line} className="block overflow-hidden pb-0.5">
          <span
            className={cn(
              "block transition-all duration-700 ease-out",
              inView
                ? "translate-y-0 opacity-100"
                : "translate-y-full opacity-0",
            )}
            style={{ transitionDelay: `${idx * 100}ms` }}
          >
            {line}
          </span>
        </span>
      ))}
    </h3>
  );
}

function IntroBentoCard() {
  const { ref, inView } = useInView(0.25);

  return (
    <div
      ref={ref}
      className="flex min-h-76 flex-col justify-center rounded-3xl border border-white/25 p-8 sm:min-h-88 sm:p-10"
    >
      <MaskedHeading
        lines={["Mọi hạng mục", "thương hiệu cần."]}
        inView={inView}
        className="text-[clamp(1.85rem,3.4vw,2.75rem)] leading-[1.08] font-bold tracking-[-0.03em] text-white"
      />

      <p
        className={cn(
          "mt-4 text-base font-bold text-white transition-all duration-700 ease-out sm:text-lg",
          inView ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
        )}
        style={{ transitionDelay: "160ms" }}
      >
        Không dư thừa, không rời rạc.
      </p>

      <p
        className={cn(
          "mt-3 max-w-md text-sm leading-relaxed text-[#D6D3C9] transition-all duration-700 ease-out sm:text-base",
          inView ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
        )}
        style={{ transitionDelay: "240ms" }}
      >
        Khang Việt không vận hành như một nhà thầu phụ chờ giao việc. Chúng tôi
        đồng hành như một bộ phận mở rộng của doanh nghiệp — trực tiếp thiết kế,
        gia công tại xưởng và thi công hoàn thiện.
      </p>
    </div>
  );
}

function ServiceBentoCard({ service }: { service: ServiceCardData }) {
  const { ref, inView } = useInView(0.25);

  return (
    <div
      ref={ref}
      className="flex min-h-76 flex-col justify-between rounded-3xl border border-white/25 p-8 transition-colors duration-300 hover:border-white/45 sm:min-h-88 sm:p-10"
    >
      <div>
        <div
          className={cn(
            "flex flex-wrap gap-2 transition-all duration-700 ease-out",
            inView ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0",
          )}
        >
          {service.pills.map((pill) => (
            <span
              key={pill}
              className="rounded-full border border-white/25 px-3.5 py-1 text-xs font-medium text-white/85"
            >
              {pill}
            </span>
          ))}
        </div>

        <MaskedHeading
          lines={service.headingLines}
          inView={inView}
          className="mt-6 text-2xl leading-[1.12] font-bold tracking-[-0.02em] text-white sm:text-3xl"
        />

        <p
          className={cn(
            "mt-4 max-w-md text-sm leading-relaxed text-[#D6D3C9] transition-all duration-700 ease-out sm:text-base",
            inView ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
          )}
          style={{ transitionDelay: "180ms" }}
        >
          {service.description}
        </p>
      </div>

      <div
        className={cn(
          "mt-7 transition-all duration-700 ease-out",
          inView ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0",
        )}
        style={{ transitionDelay: "260ms" }}
      >
        <Link
          href={service.href}
          className="inline-flex items-center gap-2 border-b border-white/70 pb-1 text-sm font-semibold text-white transition-colors duration-200 hover:border-brand hover:text-brand"
        >
          {service.ctaLabel}
          <span aria-hidden="true">→</span>
        </Link>
      </div>
    </div>
  );
}

function BentoPhotoTile({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  const { ref, inView } = useInView(0.2);

  return (
    <div
      ref={ref}
      className={cn(
        "group relative min-h-76 overflow-hidden rounded-3xl bg-[#181816] transition-all duration-700 ease-out sm:min-h-88",
        inView ? "scale-100 opacity-100" : "scale-[0.97] opacity-0",
        className,
      )}
    >
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 768px) 100vw, 50vw"
        className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
      />
    </div>
  );
}

export const DisciplinesSection: React.FC = () => {
  return (
    <section
      id="dich-vu"
      className="w-full scroll-mt-20 bg-[#222220] px-6 pt-12 pb-24 text-[#F7F4E6] sm:px-10 sm:pt-16 sm:pb-32"
    >
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-5 sm:gap-6 md:grid-cols-2">
        {/* Row 1 */}
        <IntroBentoCard />
        <ServiceBentoCard service={SERVICES[0]} />

        {/* Row 2 */}
        <ServiceBentoCard service={SERVICES[1]} />
        <BentoPhotoTile
          src="/image/projects/bigc/bigc3.jpg"
          alt="Thi công bảng hiệu và mặt tiền đại siêu thị GO! / BigC"
        />

        {/* Row 3 */}
        <BentoPhotoTile
          src="/image/projects/bidv/bidv2.jpg"
          alt="Thi công nhận diện mặt tiền và quầy giao dịch ngân hàng BIDV"
          className="hidden md:block"
        />
        <ServiceBentoCard service={SERVICES[2]} />

        {/* Row 4 (Asymmetric left service card, matching Alister layout) */}
        <ServiceBentoCard service={SERVICES[3]} />
      </div>
    </section>
  );
};

export default DisciplinesSection;
