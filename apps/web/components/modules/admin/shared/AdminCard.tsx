import React from "react";

export interface AdminCardProps {
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

/**
 * Card container chuẩn cho các phân hệ của CMS.
 * Tái sử dụng để đảm bảo tính nhất quán của phong cách Minimalist Obsidian & Bronze.
 */
export const AdminCard: React.FC<AdminCardProps> = ({
  title,
  subtitle,
  action,
  children,
  className = "",
}) => {
  return (
    <div
      className={`rounded-lg border border-white/8 bg-(--bg-surface) p-6 transition-colors hover:border-(--border-bronze-subtle) ${className}`}
    >
      {(title || action) && (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-white/6 pb-4">
          <div>
            {title && (
              <h3 className="font-syne text-base font-bold text-(--text-primary)">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="mt-1 font-sans text-xs text-(--text-secondary)">
                {subtitle}
              </p>
            )}
          </div>
          {action && <div className="flex items-center gap-2">{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
};

export default AdminCard;

