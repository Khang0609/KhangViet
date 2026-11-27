"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useInView } from "@/hooks/useInView";
import { cn } from "@/lib/ultis";

export const PartnerSection: React.FC = () => {
  const { ref, inView } = useInView(0.15);

  return (
    <div
      ref={ref}
      className={cn(
        "relative z-10 mx-auto mt-14 max-w-6xl rounded-(--radius-frame) bg-[#222220] p-6 transition-all duration-700 ease-out sm:mt-24 sm:p-12 lg:p-16",
        inView ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0",
      )}
    >
      <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-12">
        {/* Left Copy Column */}
        <div className="lg:col-span-7">
          <h3 className="text-[clamp(2rem,4vw,3.25rem)] leading-[1.06] font-bold tracking-[-0.03em] text-[#F7F4E6]">
            Đối tác thiết kế &amp; thi công trọn gói bạn cần.
          </h3>

          <div className="mt-7 max-w-xl space-y-4 text-sm leading-relaxed text-[#D6D3C9] sm:text-base">
            <p>
              Chúng tôi đồng hành cùng các tập đoàn bán lẻ, ngân hàng và nhãn
              hàng khi họ cần sự đồng nhất tuyệt đối — không còn cảnh phải ghép
              nối rời rạc giữa đơn vị thiết kế, xưởng gia công và đội thi công
              bên ngoài.
            </p>
            <p>
              Khang Việt quy tụ kiến trúc sư, kỹ sư kết cấu – điện, quản đốc
              xưởng cùng 4 tổ đội thi công cơ khí, quảng cáo, in ấn và vẽ tường
              trực tiếp dưới một mái nhà. Đáp ứng nhanh mọi yêu cầu khắt khe về
              tiến độ và chất lượng công trình.
            </p>
          </div>

          <div className="mt-8">
            <Link
              href="/services"
              className="inline-flex items-center justify-center rounded-lg bg-brand px-7 py-3.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-brand/90"
            >
              Dịch vụ của chúng tôi
            </Link>
          </div>
        </div>

        {/* Right Illustration Column */}
        <div className="lg:col-span-5">
          <Image
            src="/image/partner-illustration.png"
            alt="Đội ngũ thiết kế, kỹ sư và thi công Khang Việt"
            width={448}
            height={448}
            className="mx-auto h-auto w-full max-w-sm object-contain lg:max-w-md"
          />
        </div>
      </div>
    </div>
  );
};

export default PartnerSection;
