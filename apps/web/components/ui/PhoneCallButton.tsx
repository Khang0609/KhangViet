import React from 'react';
import { Phone, PhoneCall } from 'lucide-react';
import { COMPANY_LEGAL_INFO } from '@/data/khangVietData';

export interface PhoneCallButtonProps {
  variant?: 'compact' | 'filled' | 'outline' | 'icon-only';
  label?: string;
  className?: string;
  phoneNumber?: string;
}

export const PhoneCallButton: React.FC<PhoneCallButtonProps> = ({
  variant = 'outline',
  label = COMPANY_LEGAL_INFO.hotlineFormatted,
  className = '',
  phoneNumber = COMPANY_LEGAL_INFO.hotline,
}) => {
  const telHref = `tel:${phoneNumber.replace(/\s+/g, '')}`;

  if (variant === 'icon-only') {
    return (
      <a
        href={telHref}
        aria-label={`Gọi ${label}`}
        className={`flex h-12 w-12 shrink-0 items-center justify-center bg-(--accent-bronze) text-black hover:bg-(--accent-bronze-light) transition-colors ${className}`}
      >
        <Phone className="h-5 w-5" />
      </a>
    );
  }

  if (variant === 'filled') {
    return (
      <a
        href={telHref}
        className={`py-3 px-4 bg-(--accent-bronze) text-black font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-(--accent-bronze-light) transition-colors ${className}`}
      >
        <PhoneCall className="w-3.5 h-3.5" />
        {label}
      </a>
    );
  }

  if (variant === 'compact') {
    return (
      <a
        href={telHref}
        className={`flex items-center gap-2 border border-white/10 bg-white/3 px-3.5 py-2.5 font-mono-tech text-[11px] transition-colors hover:border-(--accent-bronze) hover:text-(--accent-bronze) ${className}`}
      >
        <span className="h-1.5 w-1.5 bg-(--accent-bronze) shadow-[0_0_10px_var(--accent-bronze)]" />
        {label}
      </a>
    );
  }

  return (
    <a
      href={telHref}
      className={`flex items-center justify-center gap-2 border border-white/10 bg-white/3 px-3.5 py-2.5 font-mono-tech text-[11px] transition-colors hover:border-(--accent-bronze) hover:text-(--accent-bronze) ${className}`}
    >
      <span className="h-1.5 w-1.5 bg-(--accent-bronze) shadow-[0_0_10px_var(--accent-bronze)]" />
      {label}
    </a>
  );
};

export default PhoneCallButton;

