import React from "react";
import { SectionHeading } from "../../ui/SectionHeading";
import { QuickQuoteForm } from "../../shared/QuickQuoteForm";
import PhoneCallButton from "../../ui/PhoneCallButton";

export const ContactDualGates: React.FC = () => {
  return (
    <section
      id="contact-gate"
      className="scroll-mt-20 border-t border-black/8 bg-[#f4f1ea] py-20 md:py-28"
    >
      <div className="mx-auto max-w-360 px-5 md:px-8 xl:px-12">
        <div className="grid items-start gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <SectionHeading
              orientation="vertical"
              eyebrow="Tư vấn & Báo giá"
              title="Bắt đầu công trình của bạn."
              description="Gửi nhanh nhu cầu mặt bằng hoặc hạng mục cần thi công. Đội ngũ kỹ thuật Khang Việt sẽ liên hệ khảo sát và đề xuất phương án vật liệu tối ưu chi phí."
            />

            <div className="mt-10 space-y-4 border-t border-black/10 pt-8 text-sm text-[#625f5a]">
              <div className="flex items-center justify-between">
                <span>1. Khảo sát &amp; đo đạc thực tế</span>
                <span className="font-medium text-[#1a1918]">Trong 24h</span>
              </div>
              <div className="flex items-center justify-between border-t border-black/6 pt-4">
                <span>2. Đề xuất vật liệu &amp; phối cảnh</span>
                <span className="font-medium text-[#1a1918]">Trực tiếp từ xưởng</span>
              </div>
              <div className="flex items-center justify-between border-t border-black/6 pt-4">
                <span>3. Hotline kỹ thuật</span>
                <PhoneCallButton variant="compact" className="px-0 py-0" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-black/10 bg-white p-6 md:p-10 lg:col-span-7">
            <h3 className="text-xl font-semibold tracking-tight text-[#1a1918]">
              Đăng ký nhận tư vấn &amp; báo giá
            </h3>
            <p className="mt-1.5 text-sm text-[#625f5a]">
              Điền thông tin bên dưới, kỹ sư phụ trách sẽ phản hồi trong giờ làm việc.
            </p>
            <QuickQuoteForm serviceCategory="Tư vấn & Báo giá" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactDualGates;
