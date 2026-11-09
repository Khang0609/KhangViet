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

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
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
        <label className="block text-xs font-medium tracking-wider text-(--text-secondary) uppercase">
          Email
        </label>
        <div className="relative">
          <Mail className="absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-(--text-secondary)" />
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@khangviet.vn"
            className="w-full rounded-lg border border-white/10 bg-(--bg-obsidian) py-2.5 pr-3 pl-10 text-sm text-(--text-primary) outline-hidden transition-colors placeholder:text-white/20 focus:border-(--accent) focus:outline-1 focus:outline-(--accent)"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="block text-xs font-medium tracking-wider text-(--text-secondary) uppercase">
          Mật khẩu
        </label>
        <div className="relative">
          <Lock className="absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-(--text-secondary)" />
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full rounded-lg border border-white/10 bg-(--bg-obsidian) py-2.5 pr-3 pl-10 text-sm text-(--text-primary) outline-hidden transition-colors placeholder:text-white/20 focus:border-(--accent) focus:outline-1 focus:outline-(--accent)"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="bg-brand shadow-brand/20 inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-medium text-white shadow-lg transition-all hover:bg-[#ff9547] focus-visible:outline-hidden active:bg-[#e07525] disabled:cursor-not-allowed disabled:opacity-50"
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
