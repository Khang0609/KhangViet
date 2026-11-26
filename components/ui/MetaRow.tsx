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
    <div className="grid grid-cols-[7rem_1fr] gap-4 border-b border-black/8 py-3 last:border-0">
      <dt className="text-xs font-medium text-[#625f5a]">
        {label}
      </dt>
      <dd className={`text-sm leading-5 ${accent ? 'font-medium text-(--accent-bronze)' : 'text-[#1a1918]'}`}>
        {value}
      </dd>
    </div>
  );
};

export default MetaRow;

