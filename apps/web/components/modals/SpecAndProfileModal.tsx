import React, { useState } from 'react';
import { FileText, Layers, X } from 'lucide-react';
import BaseModal from '../ui/BaseModal';
import TechBadge from '../ui/TechBadge';
import { CorporateProfileTab } from './spec-profile/CorporateProfileTab';
import { WireframeSpecTab } from './spec-profile/WireframeSpecTab';

export interface SpecAndProfileModalProps {
  isOpen: boolean;
  initialTab: 'profile' | 'wireframe';
  onClose: () => void;
}

export const SpecAndProfileModal: React.FC<SpecAndProfileModalProps> = ({
  isOpen,
  initialTab,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'wireframe'>(initialTab);

  React.useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-5xl"
      ariaLabel="Hồ sơ năng lực & Kiến trúc UI Khang Việt"
    >
      <div className="flex flex-col overflow-hidden max-h-[90vh]">
        <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-4 bg-(--bg-obsidian) border-b border-white/8">
          <TechBadge variant="square">
            KHANG VIET ARCHIVE // TECHNICAL DOSSIER & UI ARCHITECTURE
          </TechBadge>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('profile')}
              className={`px-3.5 py-1.5 text-xs font-medium tracking-wider uppercase transition-all cursor-pointer flex items-center gap-1.5 border ${
                activeTab === 'profile'
                  ? 'bg-(--accent-bronze) text-(--bg-obsidian) border-(--accent-bronze) font-semibold'
                  : 'bg-(--bg-surface) text-(--text-secondary) border-white/10 hover:text-(--text-primary)'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              Hồ Sơ Năng Lực (PDF Dossier)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('wireframe')}
              className={`px-3.5 py-1.5 text-xs font-medium tracking-wider uppercase transition-all cursor-pointer flex items-center gap-1.5 border ${
                activeTab === 'wireframe'
                  ? 'bg-(--accent-bronze) text-(--bg-obsidian) border-(--accent-bronze) font-semibold'
                  : 'bg-(--bg-surface) text-(--text-secondary) border-white/10 hover:text-(--text-primary)'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              Pixel Wireframe & Design System
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-(--text-secondary) hover:text-(--text-primary) hover:bg-white/5 border border-transparent hover:border-white/10 transition-colors cursor-pointer"
              aria-label="Đóng"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 sm:p-10 bg-(--bg-surface)">
          {activeTab === 'profile' ? <CorporateProfileTab /> : <WireframeSpecTab />}
        </div>
      </div>
    </BaseModal>
  );
};

export default SpecAndProfileModal;
