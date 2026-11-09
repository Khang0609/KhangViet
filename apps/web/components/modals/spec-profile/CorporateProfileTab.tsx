import React from 'react';
import { Printer } from 'lucide-react';
import { useLandingContext } from '@/components/contexts/LandingContext';
import TechBadge from '../../ui/TechBadge';
import PhoneCallButton from '../../ui/PhoneCallButton';
import { LegalAndFactorySection } from './LegalAndFactorySection';

export const CorporateProfileTab: React.FC = () => {
  const { legalInfo, partnerBrands } = useLandingContext();
  const handlePrint = () => window.print();

  return (
    <div className="space-y-8">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-white/8">
        <div>
          <TechBadge variant="boxed" className="mb-3">
            HS_NANG_LUC_CTY_KHANG_VIET.PDF • VERIFIED CORPORATE PROFILE
          </TechBadge>
          <h2 className="font-syne text-2xl sm:text-3xl font-bold text-(--text-primary) tracking-tight">
            {legalInfo.fullName}
          </h2>
          <p className="text-sm text-(--text-secondary) mt-2">
            Nhà thầu Thiết kế — Sản xuất — Thi công Quảng cáo Ngoại thất & Trang trí Nội thất Thương mại từ năm 2009
          </p>
        </div>
        <button
          type="button"
          onClick={handlePrint}
          className="px-4 py-2.5 bg-(--accent-bronze) hover:bg-(--accent-bronze-light) text-(--bg-obsidian) font-semibold text-xs uppercase tracking-wider flex items-center gap-2 transition-colors cursor-pointer shrink-0"
        >
          <Printer className="w-4 h-4" />
          In / Lưu PDF Hồ Sơ Năng Lực
        </button>
      </div>

      <LegalAndFactorySection />

      <div className="p-6 bg-(--bg-obsidian) border border-white/8">
        <div className="text-xs font-mono-tech uppercase tracking-widest text-(--accent-bronze) mb-4">
          03. Danh Sách Đối Tác & Tập Đoàn Tiêu Biểu Đã Thực Hiện
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {partnerBrands.map((partner) => (
            <div key={partner.name} className="p-3 bg-(--bg-surface) border border-white/6 flex flex-col justify-between">
              <span className="font-syne font-bold text-sm text-(--text-primary)">{partner.name}</span>
              <span className="text-[11px] text-(--text-secondary) mt-1">{partner.subtitle}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="p-6 bg-linear-to-r from-(--bg-surface) via-[#221E1A] to-(--bg-surface) border border-(--accent-bronze)/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-widest text-(--accent-bronze) font-mono-tech">CAM KẾT TỪ BAN GIÁM ĐỐC KHANG VIỆT</div>
          <div className="text-base font-semibold text-(--text-primary) mt-1">"{legalInfo.commitment}"</div>
        </div>
        <PhoneCallButton variant="filled" label={`Gọi Giám Đốc: ${legalInfo.hotlineFormatted}`} phoneNumber={legalInfo.hotline} />
      </div>
    </div>
  );
};

export default CorporateProfileTab;

