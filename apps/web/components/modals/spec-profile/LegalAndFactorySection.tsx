import React from 'react';
import { Building2, ShieldCheck } from 'lucide-react';
import { COMPANY_LEGAL_INFO, PRODUCTION_DIVISIONS } from '@/data/khangVietData';

export const LegalAndFactorySection: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="p-6 bg-(--bg-obsidian) border border-white/8 space-y-4">
        <div className="flex items-center gap-2 text-(--accent-bronze) text-xs font-mono-tech uppercase tracking-widest">
          <Building2 className="w-4 h-4" /> 01. Thông Tin Pháp Lý Doanh Nghiệp
        </div>
        <dl className="space-y-3 text-sm">
          <div className="flex justify-between py-2 border-b border-white/5">
            <dt className="text-(--text-secondary)">Tên viết tắt:</dt>
            <dd className="text-(--text-primary) font-medium">{COMPANY_LEGAL_INFO.shortName}</dd>
          </div>
          <div className="flex justify-between py-2 border-b border-white/5">
            <dt className="text-(--text-secondary)">Mã số thuế / GPKD:</dt>
            <dd className="font-mono-tech text-(--accent-bronze) font-semibold">{COMPANY_LEGAL_INFO.taxId}</dd>
          </div>
          <div className="flex justify-between py-2 border-b border-white/5">
            <dt className="text-(--text-secondary)">Ngày cấp phép:</dt>
            <dd className="text-(--text-primary)">{COMPANY_LEGAL_INFO.licenseDate} (Sở KH&ĐT TP.HCM)</dd>
          </div>
          <div className="flex justify-between py-2 border-b border-white/5">
            <dt className="text-(--text-secondary)">Đại diện pháp luật:</dt>
            <dd className="text-(--text-primary) font-semibold">Ông {COMPANY_LEGAL_INFO.director} — Giám Đốc</dd>
          </div>
          <div className="flex justify-between py-2">
            <dt className="text-(--text-secondary)">Hotline điều hành:</dt>
            <dd className="font-mono-tech text-(--accent-bronze)">{COMPANY_LEGAL_INFO.hotline}</dd>
          </div>
        </dl>
      </div>

      <div className="p-6 bg-(--bg-obsidian) border border-white/8 space-y-4">
        <div className="flex items-center gap-2 text-(--accent-bronze) text-xs font-mono-tech uppercase tracking-widest">
          <ShieldCheck className="w-4 h-4" /> 02. Tổ Hợp Xưởng Sản Xuất Trực Tiếp
        </div>
        <p className="text-sm text-(--text-primary) leading-relaxed">
          Địa chỉ nhà xưởng: <span className="text-(--accent-bronze) font-medium">{COMPANY_LEGAL_INFO.factoryAddress}</span>
        </p>
        <div className="grid grid-cols-2 gap-3 pt-2">
          {PRODUCTION_DIVISIONS.map((div) => (
            <div key={div.code} className="p-3 bg-(--bg-surface) border border-white/6">
              <div className="font-syne text-xl font-bold text-(--accent-bronze)">
                {div.headcount} <span className="text-xs font-sans font-normal text-(--text-secondary)">nhân sự</span>
              </div>
              <div className="text-xs font-medium text-(--text-primary) mt-0.5">{div.name}</div>
            </div>
          ))}
        </div>
        <div className="text-xs text-(--text-secondary) pt-1 border-t border-white/6">
          Chỉ huy trực tiếp bởi đội ngũ Kỹ sư Kết cấu & Kiến trúc sư giàu kinh nghiệm thực chiến.
        </div>
      </div>
    </div>
  );
};

export default LegalAndFactorySection;

