import { ReactNode } from "react";

export interface NavItem {
  number?: string;
  label: string;
  href: string;
  external?: boolean;
}

export interface NavigationProps {
  items?: NavItem[];
  phoneNumber?: string;
  phoneTel?: string;
  onOpenProfile?: () => void;
  className?: string;
  customLogo?: ReactNode;
}
