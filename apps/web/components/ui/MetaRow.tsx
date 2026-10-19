import React from 'react';

export interface MetaRowProps {
  label: string;
  value: string;
  accent?: boolean;
}

export const MetaRow: React.FC<MetaRowProps> = ({
  label,
  value,
  accent = false,
}) => {
  return (
    <div className="grid grid-cols-[6rem_1fr] gap-4 border-b border-white/6 py-3 last:border-0">
      <dt className="font-mono-tech text-[9px] uppercase tracking-wider text-(--text-secondary)">
        {label}
      </dt>
      <dd className={`text-xs leading-5 ${accent ? 'text-(--accent-bronze)' : 'text-white/80'}`}>
        {value}
      </dd>
    </div>
  );
};

export default MetaRow;

