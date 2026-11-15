"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, AlertCircle, ArrowLeft } from "lucide-react";
import { API_URL } from "@/lib/api";

// ۱. کامپوننت داخلی فرم (که با key ریست می‌شود)
function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error?.message || "ایمیل یا رمز عبور اشتباه است");
      }

      router.push("/admin");
      router.refresh();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "خطای ناشناخته رخ داد";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[440px] bg-white/[0.04] backdrop-blur-2xl border border-white/10 rounded-2xl p-8 md:p-10 shadow-2xl relative z-10">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">
          ورود به پنل مدیریت
        </h1>
        <p className="text-sm text-white/50">
          برای دسترسی به داشبورد، اطلاعات خود را وارد کنید.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-sm flex items-center justify-center gap-2">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2 group">
          <label className="text-xs font-bold text-white/90 block">ایمیل</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full bg-white/[0.05] border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all placeholder:text-white/30"
            placeholder="admin@example.com"
            dir="ltr"
          />
        </div>

        <div className="space-y-2 group">
          <label className="text-xs font-bold text-white/90 block">
            رمز عبور
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full bg-white/[0.05] border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all placeholder:text-white/30"
            placeholder="••••••••"
            dir="ltr"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="group relative w-full mt-6 bg-white text-[#0A1526] font-bold text-sm py-3.5 rounded-xl overflow-hidden active:scale-[0.98] transition-all"
        >
          <span className="absolute inset-0 bg-accent -translate-x-[120%] transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:translate-x-0 z-[1]" />

          <span className="relative z-10 flex items-center justify-center gap-2 group-hover:text-white transition-colors duration-300">
            {isLoading ? (
              <>
                <Loader2 size={18} className="animate-spin" /> در حال ورود...
              </>
            ) : (
              <>
                ورود به داشبورد{" "}
                <ArrowLeft
                  size={16}
                  className="group-hover:-translate-x-1 transition-transform"
                />
              </>
            )}
          </span>
        </button>
      </form>

      <div className="mt-8 text-center text-sm text-white/50">
        <Link href="/" className="hover:text-white transition-colors">
          بازگشت به سایت اصلی
        </Link>
      </div>
    </div>
  );
}

// ۲. کامپوننت اصلی که با key فرم را ریست می‌کند
export default function LoginPage() {
  // استیت برای key (مقدار اولیه 0)
  const [formKey, setFormKey] = useState(0);

  // استفاده از useEffect برای تغییر key بعد از mount شدن
  useEffect(() => {
    // استفاده از setTimeout برای جلوگیری از خطای cascading React
    const timer = setTimeout(() => {
      setFormKey((prev) => prev + 1);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-[#0A1526]">
      {/* پس‌زمینه */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0A1526] via-[#0F1E33] to-[#1A2E4A]" />
        <div className="absolute top-[-20%] right-[-10%] w-[60vw] h-[60vw] max-w-[800px] max-h-[800px] bg-accent/30 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[60vw] h-[60vw] max-w-[800px] max-h-[800px] bg-[#237D61]/20 rounded-full blur-[120px] pointer-events-none" />
      </div>

      {/* فرم لاگین با key که با هر بار باز شدن، ریست می‌شود */}
      <LoginForm key={formKey} />
    </div>
  );
}
