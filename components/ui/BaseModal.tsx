import React, { useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { useModalBodyLock } from '@/hooks/useModalEffects';

const emptySubscribe = () => () => {};

export interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  maxWidth?: 'max-w-lg' | 'max-w-4xl' | 'max-w-5xl' | 'max-w-6xl' | 'max-w-7xl';
  children: React.ReactNode;
  ariaLabel?: string;
}

export const BaseModal: React.FC<BaseModalProps> = ({
  isOpen,
  onClose,
  maxWidth = 'max-w-6xl',
  children,
  ariaLabel,
}) => {
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  useModalBodyLock(isOpen, onClose);

  if (!mounted || !isOpen) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-md"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className={`relative w-full ${maxWidth} max-h-[92vh] rounded-2xl bg-(--bg-surface) border border-black/10 shadow-2xl flex flex-col overflow-hidden`}
      >
        {children}
      </div>
    </div>,
    document.body
  );
};

export default BaseModal;

