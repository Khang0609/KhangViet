"use client";

import React, { useState, useEffect } from "react";
import { Save, CheckCircle, AlertCircle } from "lucide-react";
import type { CompanyLegalInfo } from "@khangviet/types";
import { AdminCard } from "../shared";
import { ContactInfoForm } from "./ContactInfoForm";
import { LegalInfoForm } from "./LegalInfoForm";
import { getCompanyLegalInfo, updateCompanyLegalInfo } from "./contactLegalService";

export const ContactLegalView: React.FC = () => {
  const [data, setData] = useState<CompanyLegalInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  useEffect(() => {
    getCompanyLegalInfo().then((res) => {
      if (res.success) setData(res.data);
      setLoading(false);
    });
  }, []);

  const handleChange = (field: keyof CompanyLegalInfo, val: string | number) => {
    if (!data) return;
    setData({ ...data, [field]: val });
  };

  const handleSave = async () => {
    if (!data) return;
    setSaving(true);
    setFeedback(null);
    const res = await updateCompanyLegalInfo(data);
    if (res.success) {
      setFeedback({ type: "success", msg: "Đã lưu thông tin liên lạc & pháp lý thành công!" });
    } else {
      setFeedback({ type: "error", msg: `Không thể lưu: ${res.error}` });
    }
    setSaving(false);
  };

  if (loading || !data) {
    return <div className="p-8 text-center font-mono-tech text-xs text-white/40">Đang tải dữ liệu pháp lý...</div>;
  }

  return (
    <AdminCard
      title="Thông Tin Liên Lạc & Hồ Sơ Pháp Lý"
      subtitle="Quản lý các thông số hiển thị trực tiếp tại chân trang (Footer), mục In-House Engineering và nút bấm liên hệ nhanh."
      action={
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 rounded bg-(--color-brand) px-4 py-2 font-mono-tech text-xs font-semibold text-black transition-all hover:brightness-110 disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          <span>{saving ? "Đang lưu..." : "Lưu Thay Đổi"}</span>
        </button>
      }
    >
      {feedback && (
        <div className={`mb-6 flex items-center gap-2 rounded p-3 text-xs ${feedback.type === "success" ? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-400" : "border border-red-500/30 bg-red-500/10 text-red-400"}`}>
          {feedback.type === "success" ? <CheckCircle className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
          <span>{feedback.msg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <ContactInfoForm data={data} onChange={handleChange} />
        <LegalInfoForm data={data} onChange={handleChange} />
      </div>
    </AdminCard>
  );
};

export default ContactLegalView;

