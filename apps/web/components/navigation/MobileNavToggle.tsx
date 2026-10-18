import React from "react";
import { Menu, X } from "lucide-react";

interface MobileNavToggleProps {
  isOpen: boolean;
  onToggle: () => void;
}

export const MobileNavToggle: React.FC<MobileNavToggleProps> = ({
  isOpen,
  onToggle,
}) => (
  <button
    type="button"
    onClick={onToggle}
    className="border border-white/10 p-2.5 text-(--text-primary) lg:hidden"
    aria-label={isOpen ? "Đóng menu" : "Mở menu"}
    aria-expanded={isOpen}
  >
    {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
  </button>
);
