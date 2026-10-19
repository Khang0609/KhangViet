"use client";

import React from 'react';
import { Layers3 } from 'lucide-react';
import { COMPANY_LEGAL_INFO } from '@/data/khangVietData';
import KhangVietLogo from '@/ui/KhangVietLogo';
import { useModalContext } from '../modals/modalContext';

export interface FooterProps {
  onOpenSpecWireframe?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenSpecWireframe }) => {
  const { openProfileModal } = useModalContext();

  const handleOpenSpec = () => {
    if (onOpenSpecWireframe) onOpenSpecWireframe();
    else openProfileModal('wireframe');
  };

  return (
    <footer id="ve-khang-viet" className="scroll-mt-20 border-t border-white/8 bg-[#090a0c]">
      <div className="mx-auto max-w-360 px-5 py-12 md:px-8 xl:px-12">
        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-5">
            <KhangVietLogo className="h-12" />
            <p className="mt-5 max-w-lg text-xs uppercase leading-6 tracking-wide text-(--text-secondary)">
              {COMPANY_LEGAL_INFO.fullName}
            </p>
            <p className="mt-2 font-mono-tech text-[10px] text-(--accent-bronze)">
              KHANG VIET DESIGN CO., LTD — SINCE 2009
            </p>
          </div>
          <div className="md:col-span-3">
            <div className="font-mono-tech text-[9px] uppercase tracking-widest text-white/40">
              Pháp nhân doanh nghiệp
            </div>
            <dl className="mt-4 space-y-2 text-xs text-(--text-secondary)">
              <div>
                MST: <span className="text-(--text-primary)">{COMPANY_LEGAL_INFO.taxId}</span>
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
              <a
                href={`tel:${COMPANY_LEGAL_INFO.hotline.replace(/\s+/g, '')}`}
                className="block text-sm transition-colors hover:text-(--accent-bronze)"
              >
                Hotline: {COMPANY_LEGAL_INFO.hotline}
              </a>
              <a
                href={`mailto:${COMPANY_LEGAL_INFO.email}`}
                className="block text-sm transition-colors hover:text-(--accent-bronze)"
              >
                {COMPANY_LEGAL_INFO.email}
              </a>
              <button
                type="button"
                onClick={handleOpenSpec}
                className="mt-3 flex items-center gap-2 text-[10px] uppercase tracking-wider text-(--accent-bronze) cursor-pointer"
              >
                <Layers3 className="h-3.5 w-3.5" />
                Xem Pixel Wireframe & Design Spec
              </button>
            </div>
          </div>
        </div>
        <div className="mt-10 flex flex-col justify-between gap-3 border-t border-white/8 pt-5 font-mono-tech text-[9px] uppercase tracking-wider text-white/30 sm:flex-row">
          <span>© {new Date().getFullYear()} Khang Viet Design. All rights reserved.</span>
          <span>Design • Fabrication • Installation</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
