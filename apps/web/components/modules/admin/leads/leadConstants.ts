import type { LeadStatus } from "@khangviet/types";

export interface LeadFilterTab {
  id: LeadStatus | "ALL";
  label: string;
}

export const leadFilterTabs: LeadFilterTab[] = [
  { id: "ALL", label: "TẤT CẢ" },
  { id: "NEW", label: "MỚI" },
  { id: "CONTACTED", label: "ĐÃ LIÊN HỆ" },
  { id: "QUOTED", label: "BÁO GIÁ" },
  { id: "WON", label: "THẮNG DEAL" },
];

