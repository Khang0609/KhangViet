"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Building2, Pencil, Plus, Search, Star, Trash2, X } from "lucide-react";
import type { Organization } from "@khangviet/types";
import {
  createAdminOrganization,
  deleteAdminOrganization,
  getAdminOrganizations,
  updateAdminOrganization,
} from "@/lib/adminApi";
import { toGallerySlug } from "@/lib/galleryClusters";
import { BaseModal } from "@/components/ui/BaseModal";
import { UniversalMediaUpload } from "@/components/ui/media-upload";
import { AdminShell } from "./AdminShell";

export const AdminPartnersClient: React.FC = () => {
  const [items, setItems] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Organization | null>(null);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [logoKey, setLogoKey] = useState("");
  const [isFeatured, setIsFeatured] = useState(true);
  const [featuredOrder, setFeaturedOrder] = useState(0);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getAdminOrganizations()
      .then((res) => {
        if (res.success) setItems(res.data);
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (o) =>
        o.name.toLowerCase().includes(q) ||
        o.slug.toLowerCase().includes(q) ||
        (o.description?.toLowerCase().includes(q) ?? false)
    );
  }, [items, search]);

  const openCreate = () => {
    setEditing(null);
    setName("");
    setSlug("");
    setDescription("");
    setLogoKey("");
    setIsFeatured(true);
    setFeaturedOrder(items.length);
    setModalOpen(true);
  };

  const openEdit = (org: Organization) => {
    setEditing(org);
    setName(org.name);
    setSlug(org.slug);
    setDescription(org.description ?? "");
    setLogoKey(org.logoKey ?? "");
    setIsFeatured(org.isFeatured);
    setFeaturedOrder(org.featuredOrder);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    setFeedback(null);

    const payload = {
      name: name.trim(),
      slug: slug.trim() || toGallerySlug(name),
      description: description.trim() || null,
      logoKey: logoKey.trim() || null,
      isFeatured,
      featuredOrder: Number(featuredOrder) || 0,
    };

    if (editing) {
      const res = await updateAdminOrganization(editing.id, payload);
      setSaving(false);
      if (!res.success) {
        setFeedback({ type: "error", text: res.error });
        return;
      }
      setItems((prev) =>
        prev.map((o) => (o.id === editing.id ? res.data : o))
      );
      setFeedback({ type: "success", text: `Đã cập nhật "${res.data.name}"` });
      setModalOpen(false);
      return;
    }

    const res = await createAdminOrganization(payload);
    setSaving(false);
    if (!res.success) {
      setFeedback({ type: "error", text: res.error });
      return;
    }
    setItems((prev) => [...prev, res.data]);
    setFeedback({ type: "success", text: `Đã thêm đối tác "${res.data.name}"` });
    setModalOpen(false);
  };

  const handleDelete = async (org: Organization) => {
    if (!window.confirm(`Xóa đối tác "${org.name}"?`)) return;
    const res = await deleteAdminOrganization(org.id);
    if (!res.success) {
      setFeedback({ type: "error", text: res.error });
      return;
    }
    setItems((prev) => prev.filter((o) => o.id !== org.id));
    setFeedback({ type: "success", text: `Đã xóa đối tác "${org.name}"` });
  };

  return (
    <AdminShell
      title="Quản lý Đối tác & Thương hiệu"
      subtitle="Danh sách doanh nghiệp, chuỗi thương hiệu đồng hành cùng Khang Việt."
    >
      <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div className="relative sm:w-72">
          <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-[#625f5a]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm đối tác..."
            className="w-full rounded-full border border-black/12 bg-white py-2 pr-4 pl-9 text-xs outline-hidden focus:border-(--accent-bronze)"
          />
        </div>

        <button
          type="button"
          onClick={openCreate}
          className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full bg-[#181715] px-5 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-(--accent-bronze)"
        >
          <Plus className="h-4 w-4" />
          <span>Thêm đối tác</span>
        </button>
      </div>

      {feedback && (
        <div
          className={`mb-4 rounded-xl border px-4 py-2.5 text-xs font-medium ${
            feedback.type === "success"
              ? "border-emerald-500/25 bg-emerald-50 text-emerald-700"
              : "border-red-500/25 bg-red-50 text-red-700"
          }`}
        >
          {feedback.text}
        </div>
      )}

      {loading ? (
        <div className="rounded-2xl border border-black/10 bg-white p-8 text-center text-xs text-[#625f5a]">
          Đang tải danh sách đối tác...
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((org) => (
            <div
              key={org.id}
              className="flex flex-col justify-between rounded-2xl border border-black/10 bg-white p-5 shadow-xs"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {org.logoKey ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={org.logoKey}
                        alt={org.name}
                        className="h-10 w-10 rounded-lg border border-black/10 object-contain p-1"
                      />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#f4f1ea] text-[#181715]">
                        <Building2 className="h-5 w-5" />
                      </div>
                    )}
                    <div>
                      <h3 className="text-sm font-semibold text-[#1a1918]">
                        {org.name}
                      </h3>
                      <span className="font-mono text-[11px] text-[#625f5a]">
                        /{org.slug}
                      </span>
                    </div>
                  </div>
                  {org.isFeatured && (
                    <span
                      title="Hiển thị nổi bật"
                      className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700"
                    >
                      <Star className="h-3 w-3" />
                      Nổi bật
                    </span>
                  )}
                </div>

                {org.description && (
                  <p className="mt-3 text-xs leading-relaxed text-[#625f5a]">
                    {org.description}
                  </p>
                )}
              </div>

              <div className="mt-4 flex items-center justify-end gap-2 border-t border-black/8 pt-3">
                <button
                  type="button"
                  onClick={() => openEdit(org)}
                  className="inline-flex cursor-pointer items-center gap-1 rounded-full border border-black/12 px-3 py-1.5 text-xs font-medium text-[#1a1918] hover:bg-[#faf9f6]"
                >
                  <Pencil className="h-3 w-3" />
                  Sửa
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(org)}
                  className="inline-flex cursor-pointer items-center gap-1 rounded-full border border-red-500/20 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-3 w-3" />
                  Xóa
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <BaseModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        maxWidth="max-w-lg"
        ariaLabel={editing ? "Chỉnh sửa đối tác" : "Thêm đối tác mới"}
      >
        <form onSubmit={handleSave} className="bg-white p-6 text-[#1a1918]">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold">
              {editing ? "Chỉnh sửa đối tác" : "Thêm đối tác mới"}
            </h2>
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="cursor-pointer rounded-full p-1 text-[#625f5a] hover:bg-black/5"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-xs font-semibold">
                Tên đối tác *
              </label>
              <input
                required
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (!editing) setSlug(toGallerySlug(e.target.value));
                }}
                placeholder="Ví dụ: Ngân hàng BIDV"
                className="w-full rounded-xl border border-black/15 px-3.5 py-2 text-sm outline-hidden focus:border-(--accent-bronze)"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold">Slug</label>
              <input
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="bidv"
                className="w-full rounded-xl border border-black/15 px-3.5 py-2 font-mono text-xs outline-hidden focus:border-(--accent-bronze)"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold">
                Lĩnh vực / Mô tả ngắn
              </label>
              <input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Hệ thống ngân hàng • Toàn quốc"
                className="w-full rounded-xl border border-black/15 px-3.5 py-2 text-sm outline-hidden focus:border-(--accent-bronze)"
              />
            </div>

            <UniversalMediaUpload
              label="Logo thương hiệu (tùy chọn)"
              value={logoKey}
              onChange={setLogoKey}
            />

            <div className="flex items-center justify-between gap-4">
              <label className="flex cursor-pointer items-center gap-2 text-xs font-medium">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="h-4 w-4 accent-[#181715]"
                />
                Hiển thị trên Trang chủ
              </label>
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#625f5a]">Thứ tự:</span>
                <input
                  type="number"
                  value={featuredOrder}
                  onChange={(e) => setFeaturedOrder(Number(e.target.value))}
                  className="w-16 rounded-lg border border-black/15 px-2 py-1 text-xs"
                />
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="cursor-pointer rounded-full border border-black/15 px-4 py-2 text-xs font-semibold text-[#625f5a]"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={saving}
              className="cursor-pointer rounded-full bg-[#181715] px-5 py-2 text-xs font-semibold text-white hover:bg-(--accent-bronze) disabled:opacity-60"
            >
              {saving ? "Đang lưu..." : "Lưu đối tác"}
            </button>
          </div>
        </form>
      </BaseModal>
    </AdminShell>
  );
};

export default AdminPartnersClient;
