"use client";

import React from 'react';
import { Layers3 } from 'lucide-react';
import type { CompanyLegalInfo } from '@/types/landing';
import { useLegalInfo } from '@/components/contexts/LandingContext';
import KhangVietLogo from '@/ui/KhangVietLogo';
import { formatPhone, normalizePhone } from '@/lib/phone';
import { useModalContext } from '../modals/modalContext';

export interface FooterProps {
  legalInfo?: CompanyLegalInfo;
  onOpenSpecWireframe?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  legalInfo,
  onOpenSpecWireframe,
}) => {
  const { openProfileModal } = useModalContext();
  const contextLegal = useLegalInfo();
  const activeLegal = contextLegal || legalInfo;

  const handleOpenSpec = () => {
    if (onOpenSpecWireframe) onOpenSpecWireframe();
    else openProfileModal('wireframe');
  };

  return (
    <footer id="ve-khang-viet" className="scroll-mt-20 bg-[#181715] text-white">
      <div className="mx-auto max-w-360 px-5 py-14 md:px-8 xl:px-12">
        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-5">
            <KhangVietLogo className="h-12" />
            <p className="mt-5 max-w-lg text-xs leading-6 tracking-wide text-white/65 uppercase">
              {activeLegal.fullName}
            </p>
            <p className="mt-2 text-xs font-medium text-(--accent-bronze)">
              KHANG VIET DESIGN CO., LTD — SINCE 2009
            </p>
          </div>
          <div className="md:col-span-3">
            <div className="text-xs font-medium tracking-wider text-white/45 uppercase">
              Pháp nhân doanh nghiệp
            </div>
            <dl className="mt-4 space-y-2 text-xs text-white/65">
              <div>
                MST: <span className="text-white">{activeLegal.taxId}</span>
              </div>
              <div>Cấp ngày {activeLegal.licenseDate}</div>
              <div>{activeLegal.licenseIssuer}</div>
              <div>Đại diện: Ông {activeLegal.director}</div>
            </dl>
          </div>
          <div className="md:col-span-4">
            <div className="text-xs font-medium tracking-wider text-white/45 uppercase">
              Liên hệ & tài liệu
            </div>
            <div className="mt-4 space-y-2 text-white/85">
              <a
                href={`tel:${normalizePhone(activeLegal.hotline)}`}
                className="block text-sm transition-colors hover:text-(--accent-bronze)"
              >
                Hotline: {formatPhone(activeLegal.hotline)}
              </a>
              <a
                href={`mailto:${activeLegal.email}`}
                className="block text-sm transition-colors hover:text-(--accent-bronze)"
              >
                {activeLegal.email}
              </a>
              <button
                type="button"
                onClick={handleOpenSpec}
                className="mt-3 flex cursor-pointer items-center gap-2 text-xs font-medium text-(--accent-bronze) transition-opacity hover:opacity-80"
              >
                <Layers3 className="h-3.5 w-3.5" />
                Xem hồ sơ kỹ thuật & quy chuẩn
              </button>
            </div>
          </div>
        </div>
        <div className="mt-12 flex flex-col justify-between gap-3 border-t border-white/10 pt-6 text-xs text-white/40 sm:flex-row">
          <span>© {new Date().getFullYear()} Khang Việt Design. All rights reserved.</span>
          <span>Design • Fabrication • Installation</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
