import React, { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { WIREFRAME_SPEC_TEXT } from './wireframeSpecData';

const COLOR_TOKENS = [
  { label: 'Canvas Obsidian', val: '#111215' },
  { label: 'Elevated Surface', val: '#1A1C20' },
  { label: 'Hairline Border', val: 'rgba(255,255,255,0.08)' },
  { label: 'Primary Pearl', val: '#F5F5F7' },
  { label: 'Titanium Metadata', val: '#8E929B' },
  { label: 'Champagne Bronze', val: '#D4A373', isAccent: true },
];

export const WireframeSpecTab: React.FC = () => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(WIREFRAME_SPEC_TEXT);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/8">
        <div>
          <span className="text-xs font-mono-tech uppercase tracking-widest text-(--accent-bronze)">
            DELIVERABLE #1 // ARCHITECTURAL WIREFRAME & PIXEL SPECIFICATION
          </span>
          <h3 className="font-syne text-2xl font-bold text-(--text-primary) mt-1">
            Đặc Tả Kỹ Thuật Giao Diện Từng Pixel (Editorial Luxury Dark-Mode)
          </h3>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className="px-4 py-2 bg-(--bg-surface) hover:bg-(--accent-bronze) hover:text-(--bg-obsidian) text-(--accent-bronze) border border-(--accent-bronze)/50 text-xs font-mono-tech uppercase tracking-wider flex items-center gap-2 transition-colors cursor-pointer self-start"
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          {copied ? 'Đã Sao Chép Spec' : 'Copy Toàn Bộ Tài Liệu Spec'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 bg-(--bg-obsidian) border border-white/8">
          <div className="text-xs font-mono-tech text-(--accent-bronze) uppercase mb-3">01. Color Palette Tokens</div>
          <ul className="space-y-2 text-xs font-mono-tech">
            {COLOR_TOKENS.map((c) => (
              <li key={c.label} className="flex items-center justify-between">
                <span className="text-(--text-secondary)">{c.label}:</span>
                <span className={c.isAccent ? 'text-(--accent-bronze)' : 'text-(--text-primary)'}>{c.val}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="p-5 bg-(--bg-obsidian) border border-white/8">
          <div className="text-xs font-mono-tech text-(--accent-bronze) uppercase mb-3">02. Typography Scale</div>
          <ul className="space-y-2 text-xs text-(--text-secondary)">
            <li><strong className="text-(--text-primary)">Hero Display:</strong> 56px–72px / 36px–42px (Mobile)</li>
            <li><strong className="text-(--text-primary)">Section H2:</strong> 36px–48px, line-height 1.12</li>
            <li><strong className="text-(--text-primary)">Card Title H3:</strong> 22px–26px, line-height 1.25</li>
            <li><strong className="text-(--text-primary)">CAD Metadata:</strong> 11px–12px, tracking +0.18em</li>
          </ul>
        </div>

        <div className="p-5 bg-(--bg-obsidian) border border-white/8">
          <div className="text-xs font-mono-tech text-(--accent-bronze) uppercase mb-3">03. Grid & Spacing System</div>
          <ul className="space-y-2 text-xs text-(--text-secondary)">
            <li><strong className="text-(--text-primary)">Container Max-Width:</strong> 1440px (max-w-360)</li>
            <li><strong className="text-(--text-primary)">Horizontal Padding:</strong> 24px / 48px / 64px</li>
            <li><strong className="text-(--text-primary)">Section Rhythm:</strong> py-24 md:py-32</li>
            <li><strong className="text-(--text-primary)">Dividers:</strong> 1px solid border-white/8</li>
          </ul>
        </div>
      </div>

      <div className="p-6 bg-(--bg-obsidian) border border-white/8 font-mono-tech text-xs text-(--text-secondary) whitespace-pre-wrap leading-relaxed">
        {WIREFRAME_SPEC_TEXT}
      </div>
    </div>
  );
};

export default WireframeSpecTab;

