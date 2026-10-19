import React from 'react';

export interface TechBadgeProps {
  children: React.ReactNode;
  variant?: 'line' | 'square' | 'boxed';
  className?: string;
}

export const TechBadge: React.FC<TechBadgeProps> = ({
  children,
  variant = 'line',
  className = '',
}) => {
  if (variant === 'boxed') {
    return (
      <span
        className={`inline-flex items-center gap-2 px-2.5 py-1 bg-(--accent-bronze)/10 border border-(--accent-bronze)/30 text-(--accent-bronze) text-[11px] font-mono-tech uppercase tracking-widest ${className}`}
      >
        {children}
      </span>
    );
  }

  return (
    <div
      className={`flex items-center gap-3 font-mono-tech text-[10px] uppercase tracking-[0.2em] text-(--accent-bronze) ${className}`}
    >
      {variant === 'square' && <span className="inline-block w-2 h-2 bg-(--accent-bronze)" />}
      {variant === 'line' && <span className="h-px w-8 bg-(--accent-bronze)" />}
      <span>{children}</span>
    </div>
  );
};

export default TechBadge;

