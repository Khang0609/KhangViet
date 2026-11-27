"use client";

import React from "react";
import Link from "next/link";
import { useInView } from "@/hooks/useInView";
import { cn } from "@/lib/ultis";

/**
 * Editorial 2-tone line illustration (#F7F4E6 cream + #E05328 terracotta)
 * depicting Khang Việt's in-house design & field construction partnership.
 */
function PartnerIllustration() {
  return (
    <svg
      viewBox="0 0 360 320"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="mx-auto h-auto w-full max-w-[300px] sm:max-w-[340px]"
      aria-hidden="true"
    >
      {/* Ground line */}
      <path
        d="M52 284H312"
        stroke="#F7F4E6"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeOpacity="0.65"
      />

      {/* Person 1 (Front - Orange shirt: Architect / Project Lead) */}
      {/* Back leg */}
      <path
        d="M126 196L104 266L118 270L142 204"
        stroke="#F7F4E6"
        strokeWidth="2.2"
        strokeLinejoin="round"
        fill="#1E1E1C"
      />
      {/* Front leg */}
      <path
        d="M138 196L164 268L150 272L122 202"
        stroke="#F7F4E6"
        strokeWidth="2.2"
        strokeLinejoin="round"
        fill="#2A2A27"
      />
      {/* Shoes */}
      <path
        d="M100 266C92 268 89 276 96 280L118 282C122 276 120 269 114 266H100Z"
        fill="#E05328"
        stroke="#F7F4E6"
        strokeWidth="1.8"
      />
      <path
        d="M150 270C146 276 149 283 158 283H175C180 280 179 272 170 269L150 270Z"
        fill="#E05328"
        stroke="#F7F4E6"
        strokeWidth="1.8"
      />
      {/* Torso / Jacket */}
      <path
        d="M120 122C112 126 105 144 106 168L118 198H154L158 158C159 138 152 124 140 120L120 122Z"
        fill="#E05328"
        stroke="#F7F4E6"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      {/* Collar */}
      <path
        d="M124 120L131 134L142 121"
        stroke="#F7F4E6"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {/* Pocket / Arm */}
      <path
        d="M142 134C152 146 154 164 146 178L134 174"
        stroke="#F7F4E6"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Head */}
      <circle
        cx="132"
        cy="96"
        r="19"
        fill="#222220"
        stroke="#F7F4E6"
        strokeWidth="2.2"
      />
      {/* Nose & Eye */}
      <path
        d="M122 86L113 94L121 97"
        stroke="#F7F4E6"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="127" cy="91" r="1.8" fill="#F7F4E6" />
      {/* Hard hat brim */}
      <path
        d="M114 84C118 71 136 68 148 77L153 84H110"
        fill="#E05328"
        stroke="#F7F4E6"
        strokeWidth="2"
        strokeLinejoin="round"
      />

      {/* Person 2 (Back - Dark outline shirt: Site Engineer) */}
      {/* Back leg */}
      <path
        d="M214 196L194 268L208 272L228 204"
        stroke="#F7F4E6"
        strokeWidth="2.2"
        strokeLinejoin="round"
        fill="#1E1E1C"
      />
      {/* Front leg */}
      <path
        d="M226 196L252 268L238 272L212 202"
        stroke="#F7F4E6"
        strokeWidth="2.2"
        strokeLinejoin="round"
        fill="#2A2A27"
      />
      {/* Shoes */}
      <path
        d="M190 268C182 270 180 278 187 281L208 282C212 277 210 270 204 268H190Z"
        fill="#E05328"
        stroke="#F7F4E6"
        strokeWidth="1.8"
      />
      <path
        d="M238 270C234 276 237 283 246 283H263C268 280 267 272 258 269L238 270Z"
        fill="#E05328"
        stroke="#F7F4E6"
        strokeWidth="1.8"
      />
      {/* Torso */}
      <path
        d="M208 122C200 126 194 144 195 168L206 198H242L246 158C247 138 240 124 228 120L208 122Z"
        fill="#222220"
        stroke="#F7F4E6"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      {/* Blueprint roll under arm */}
      <path
        d="M188 156L244 142L247 153L191 167Z"
        fill="#E05328"
        stroke="#F7F4E6"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <ellipse
        cx="245.5"
        cy="147.5"
        rx="3.5"
        ry="5.5"
        transform="rotate(-14 245.5 147.5)"
        fill="#F7F4E6"
      />
      {/* Arm holding roll */}
      <path
        d="M226 134C234 144 235 156 225 164"
        stroke="#F7F4E6"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      {/* Head */}
      <circle
        cx="220"
        cy="96"
        r="19"
        fill="#222220"
        stroke="#F7F4E6"
        strokeWidth="2.2"
      />
      <path
        d="M210 86L201 94L209 97"
        stroke="#F7F4E6"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="215" cy="91" r="1.8" fill="#F7F4E6" />
      <path
        d="M216 103C219 105 223 105 226 102"
        stroke="#F7F4E6"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export const PartnerSection: React.FC = () => {
  const { ref, inView } = useInView(0.15);

  return (
    <div
      ref={ref}
      className={cn(
        "relative z-10 mx-auto mt-16 max-w-6xl rounded-(--radius-frame) bg-[#222220] p-8 transition-all duration-700 ease-out sm:mt-24 sm:p-12 lg:p-16",
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
              className="inline-flex items-center justify-center rounded-lg bg-[#C93818] px-7 py-3.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-[#AE2E12]"
            >
              Dịch vụ của chúng tôi
            </Link>
          </div>
        </div>

        {/* Right Illustration Column */}
        <div className="lg:col-span-5">
          <PartnerIllustration />
        </div>
      </div>
    </div>
  );
};

export default PartnerSection;
