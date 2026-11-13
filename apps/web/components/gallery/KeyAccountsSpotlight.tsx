"use client";

import React from "react";
import type { GalleryKeyAccount } from "@khangviet/types";

interface KeyAccountsSpotlightProps {
  keyAccounts: GalleryKeyAccount[];
  selectedAccountId: string;
  onSelectAccount: (accountId: string) => void;
}

export const KeyAccountsSpotlight: React.FC<KeyAccountsSpotlightProps> = ({
  keyAccounts,
  selectedAccountId,
  onSelectAccount,
}) => {
  const activeAccount =
    selectedAccountId !== "ALL"
      ? keyAccounts.find((k) => k.id === selectedAccountId)
      : undefined;

  return (
    <section className="border-b border-white/8 bg-(--bg-obsidian) py-6 sm:py-8">
      <div className="mx-auto max-w-360 px-5 md:px-8 xl:px-12">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xs font-bold tracking-wider text-zinc-400 uppercase">
              01. Đối Tác Chiến Lược Dài Hạn (Enterprise Key Accounts)
            </h2>
            <p className="mt-0.5 text-xs text-zinc-500">
              Chọn thương hiệu lớn để lọc nhanh toàn bộ chuỗi dự án đã triển
              khai
            </p>
          </div>
          {selectedAccountId !== "ALL" && (
            <button
              type="button"
              onClick={() => onSelectAccount("ALL")}
              className="shrink-0 cursor-pointer text-xs font-medium text-brand hover:underline"
            >
              × Bỏ chọn thương hiệu
            </button>
          )}
        </div>

        <div className="no-scrollbar flex gap-3 overflow-x-auto pb-1 lg:grid lg:grid-cols-6">
          {keyAccounts.map((acc) => {
            const isActive = selectedAccountId === acc.id;
            return (
              <button
                key={acc.id}
                type="button"
                onClick={() => onSelectAccount(isActive ? "ALL" : acc.id)}
                className={`min-w-44 shrink-0 cursor-pointer rounded-xl border p-3.5 text-left transition-all lg:min-w-0 ${
                  isActive
                    ? "border-brand bg-brand/12 shadow-lg shadow-brand/10"
                    : "border-white/8 bg-(--bg-surface) hover:border-white/20 hover:bg-(--bg-surface-elevated)"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`truncate text-xs font-bold ${
                      isActive ? "text-brand" : "text-white"
                    }`}
                  >
                    {acc.name}
                  </span>
                  {isActive && (
                    <span className="h-2 w-2 shrink-0 rounded-full bg-brand" />
                  )}
                </div>
                <div className="mt-1 text-[11px] text-zinc-400">{acc.tag}</div>
              </button>
            );
          })}
        </div>

        {activeAccount && (
          <div className="mt-4 flex flex-col items-start justify-between gap-4 rounded-xl border border-brand/40 bg-zinc-900/90 p-4 sm:flex-row sm:items-center">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded border border-brand/30 bg-brand/20 px-2 py-0.5 text-[10px] font-bold text-brand uppercase">
                  Đối tác chiến lược B2B
                </span>
                <h3 className="text-sm font-bold text-white">
                  {activeAccount.name}
                </h3>
              </div>
              <p className="mt-1.5 text-xs leading-relaxed text-zinc-300">
                {activeAccount.desc}
              </p>
            </div>
            <div className="flex w-full shrink-0 items-center justify-between gap-4 border-t border-zinc-800 pt-2 sm:w-auto sm:justify-end sm:border-t-0 sm:pt-0">
              <div className="text-left sm:text-right">
                <div className="text-sm font-bold text-brand">
                  {activeAccount.scale}
                </div>
                <div className="text-[11px] text-zinc-400">Quy mô hợp tác</div>
              </div>
              <button
                type="button"
                onClick={() => onSelectAccount("ALL")}
                className="cursor-pointer rounded-lg bg-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-200 hover:bg-zinc-700"
              >
                Xem tất cả
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default KeyAccountsSpotlight;
