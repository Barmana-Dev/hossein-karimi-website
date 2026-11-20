"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { API_URL } from "@/lib/api";
import {
  Save,
  Loader2,
  AlertCircle,
  User,
  Mail,
  Key,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function MyProfilePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    currentPassword: "",
  });

  // 👇 محو شدن خودکار پیغام‌ها
  useEffect(() => {
    if (successMsg) {
      const timer = setTimeout(() => setSuccessMsg(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMsg]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const res = await fetch(`${API_URL}/auth/me`, {
          credentials: "include",
        });
        if (res.ok) {
          const json = await res.json();
          setFormData({
            name: json.data.name,
            email: json.data.email,
            password: "",
            currentPassword: "",
          });
        } else {
          router.push("/login");
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsFetching(false);
      }
    };
    fetchMe();
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMsg(null);
    try {
      const res = await fetch(`${API_URL}/auth/me/profile`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || "خطا در ذخیره");

      setSuccessMsg("اطلاعات با موفقیت به‌روزرسانی شد.");
      // 👇 نام/ایمیل جدید را هم در فرم همگام می‌کنیم (پاسخ سرور منبع حقیقت است)
      if (data?.data) {
        setFormData((prev) => ({
          ...prev,
          name: data.data.name ?? prev.name,
          email: data.data.email ?? prev.email,
          password: "",
          currentPassword: "",
        }));
      } else {
        setFormData((prev) => ({ ...prev, password: "", currentPassword: "" }));
      }
      // 👇 هدر داشبورد بدون رفرش صفحه نام جدید را نشان می‌دهد
      window.dispatchEvent(new Event("admin:user-updated"));
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "خطای ناشناخته");
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching)
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="animate-spin text-accent" size={40} />
      </div>
    );

  return (
    <div className="max-w-[800px] mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-primary mb-1">پروفایل من</h1>
          <p className="text-sm text-foreground-muted">
            مدیریت اطلاعات شخصی و رمز عبور.
          </p>
        </div>
        <Button
          onClick={handleSubmit}
          disabled={isLoading}
          variant="primary"
          className="gap-2"
        >
          {isLoading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Save size={16} />
          )}{" "}
          ذخیره تغییرات
        </Button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-xl text-sm flex items-center gap-2">
          <AlertCircle size={18} /> {error}
        </div>
      )}
      {successMsg && (
        <div className="p-4 bg-green-50 text-green-700 rounded-xl text-sm flex items-center gap-2">
          <CheckCircle2 size={18} /> {successMsg}
        </div>
      )}

      <div className="bg-white border border-border rounded-2xl p-6 shadow-sm space-y-5">
        <div className="space-y-2">
          <label className="text-xs font-bold text-primary flex items-center gap-2">
            <User size={14} className="text-accent" /> نام و نام خانوادگی
          </label>
          <input
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-primary flex items-center gap-2">
            <Mail size={14} className="text-accent" /> ایمیل
          </label>
          <input
            name="email"
            type="email"
            dir="ltr"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-left focus:outline-none focus:border-accent"
          />
        </div>

        <div className="space-y-2 pt-4 border-t border-border">
          <label className="text-xs font-bold text-primary flex items-center gap-2">
            <Key size={14} className="text-accent" /> رمز عبور جدید (اختیاری)
          </label>
          <input
            name="password"
            type="password"
            dir="ltr"
            autoComplete="new-password"
            value={formData.password}
            onChange={handleChange}
            placeholder="برای عدم تغییر، خالی بگذارید"
            className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-left focus:outline-none focus:border-accent"
          />
        </div>

        {formData.password && (
          <div className="space-y-2">
            <label className="text-xs font-bold text-primary flex items-center gap-2">
              <Key size={14} className="text-accent" /> رمز عبور فعلی
            </label>
            <input
              name="currentPassword"
              type="password"
              dir="ltr"
              autoComplete="current-password"
              value={formData.currentPassword}
              onChange={handleChange}
              required
              placeholder="برای تغییر رمز، رمز فعلی را وارد کنید"
              className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-left focus:outline-none focus:border-accent"
            />
          </div>
        )}
      </div>
    </div>
  );
}
