"use client";

import React, { useState, useEffect } from "react";
import { CheckCircle, AlertCircle } from "lucide-react";
import type { HeroSlide } from "@khangviet/types";
import { AdminCard } from "../shared";
import { HeroSlideItem } from "./HeroSlideItem";
import { HeroViewActions } from "./HeroViewActions";
import { createDefaultHeroSlide } from "./heroConstants";
import { getHeroSlides, updateHeroSlides } from "./heroService";

export const HeroSlidesView: React.FC = () => {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ isSuccess: boolean; text: string } | null>(null);

  useEffect(() => {
    let active = true;
    getHeroSlides().then((res) => {
      if (active && res.success) setSlides(res.data);
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, []);

  const handleChange = (index: number, field: keyof HeroSlide, val: string) => {
    const updated = [...slides];
    updated[index] = { ...updated[index], [field]: val };
    setSlides(updated);
  };

  const handleSave = async () => {
    setSaving(true);
    setMsg(null);
    const res = await updateHeroSlides(slides);
    setMsg({
      isSuccess: res.success,
      text: res.success ? "Đã lưu slides thành công!" : `Lỗi: ${res.error}`,
    });
    setSaving(false);
  };

  return (
    <AdminCard
      title="Quản Lý Hero Slides"
      subtitle="Danh sách các slide chạy tự động tại phần đầu trang chủ."
      action={
        <HeroViewActions
          saving={saving}
          onAdd={() => setSlides([...slides, createDefaultHeroSlide()])}
          onSave={handleSave}
        />
      }
    >
      {msg && (
        <div className={`mb-4 flex items-center gap-2 rounded p-3 text-xs ${msg.isSuccess ? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-400" : "border border-red-500/30 bg-red-500/10 text-red-400"}`}>
          {msg.isSuccess ? <CheckCircle className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
          <span>{msg.text}</span>
        </div>
      )}

      {loading ? (
        <div className="py-8 text-center font-mono-tech text-xs text-white/40">Đang tải slides...</div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {slides.map((s, idx) => (
            <HeroSlideItem
              key={s.id || idx}
              slide={s}
              index={idx}
              onChange={handleChange}
              onRemove={(i) => setSlides(slides.filter((_, index) => index !== i))}
            />
          ))}
        </div>
      )}
    </AdminCard>
  );
};

export default HeroSlidesView;
