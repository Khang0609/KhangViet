"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Mail, Loader2, ArrowRight } from "lucide-react";
import { authenticateUser } from "./authService";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    const result = await authenticateUser({ email, password });
    setIsLoading(false);

    if (!result.success) {
      setErrorMessage(result.error || "Email hoặc mật khẩu không chính xác.");
      return;
    }

    const redirectPath = result.data.user.role === "ADMIN" ? "/admin" : "/";
    router.push(redirectPath);
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {errorMessage && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {errorMessage}
        </div>
      )}

      <div className="space-y-1.5">
        <label className="block text-xs font-medium text-(--text-secondary) uppercase tracking-wider">
          Email
        </label>
        <div className="relative">
          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-(--text-secondary)" />
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@khangviet.vn"
            className="w-full rounded-lg border border-white/10 bg-(--bg-obsidian) py-2.5 pl-10 pr-3 text-sm text-(--text-primary) placeholder:text-white/20 focus:border-[#f58633] focus:ring-1 focus:ring-[#f58633] outline-hidden transition-colors"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="block text-xs font-medium text-(--text-secondary) uppercase tracking-wider">
          Mật khẩu
        </label>
        <div className="relative">
          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-(--text-secondary)" />
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full rounded-lg border border-white/10 bg-(--bg-obsidian) py-2.5 pl-10 pr-3 text-sm text-(--text-primary) placeholder:text-white/20 focus:border-[#f58633] focus:ring-1 focus:ring-[#f58633] outline-hidden transition-colors"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-[#f58633] px-4 py-3 text-sm font-medium text-white shadow-lg shadow-[#f58633]/20 hover:bg-[#ff9547] active:bg-[#e07525] focus-visible:outline-hidden disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
      >
        {isLoading ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            <span>Đang xác thực...</span>
          </>
        ) : (
          <>
            <span>Đăng nhập</span>
            <ArrowRight className="size-4" />
          </>
        )}
      </button>
    </form>
  );
}
