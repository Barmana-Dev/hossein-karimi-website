"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { ArrowRight, Save, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface AdminUser {
  name: string;
  email: string;
  role: string;
  isActive: boolean;
}

export default function EditAdminPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<AdminUser & { password?: string }>({
    name: "",
    email: "",
    role: "EDITOR",
    isActive: true,
    password: "",
  });

  // دریافت اطلاعات کاربر
  useEffect(() => {
    let isMounted = true;
    const fetchUser = async () => {
      try {
        const res = await fetch(
          `http://localhost:4000/api/v1/auth/admin/users/${id}`,
          { credentials: "include" },
        );
        if (res.ok && isMounted) {
          setFormData((await res.json()).data);
        } else {
          router.push("/admin/accounts");
        }
      } catch (error) {
        console.error(error);
      } finally {
        if (isMounted) setIsFetching(false);
      }
    };
    fetchUser();
    return () => {
      isMounted = false;
    };
  }, [id, router]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `http://localhost:4000/api/v1/auth/admin/users/${id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
          credentials: "include",
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || "خطا در ذخیره");
      router.push("/admin/accounts");
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "خطای ناشناخته");
    } finally {
      setIsLoading(false);
    }
  };

  // 👇 مهم‌ترین بخش: تا زمانی که اطلاعات لود نشده، نباید فرم رندر شود تا خطای Hydration رخ ندهد
  if (isFetching) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="animate-spin text-accent" size={40} />
      </div>
    );
  }

  return (
    <div className="max-w-[800px] mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/accounts"
            className="w-10 h-10 rounded-xl bg-white border border-border flex items-center justify-center"
          >
            <ArrowRight size={18} />
          </Link>
          <h1 className="text-2xl font-black text-primary">
            ویرایش کاربر ادمین
          </h1>
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

      <div className="bg-white border border-border rounded-2xl p-6 shadow-sm space-y-5">
        <div className="grid md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <label className="text-xs font-bold text-primary">نام</label>
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-primary">ایمیل</label>
            <input
              name="email"
              type="email"
              dir="ltr"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-left focus:outline-none"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-primary">
            رمز عبور جدید (در صورت نیاز)
          </label>
          <input
            name="password"
            type="password"
            dir="ltr"
            value={formData.password || ""}
            onChange={handleChange}
            placeholder="برای عدم تغییر، خالی بگذارید"
            className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-left focus:outline-none"
          />
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <label className="text-xs font-bold text-primary">نقش</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:outline-none"
            >
              <option value="EDITOR">نویسنده (Editor)</option>
              <option value="SUPER_ADMIN">مدیر ارشد (Super Admin)</option>
            </select>
          </div>
          <div className="space-y-2 flex items-center pt-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                className="w-4 h-4 accent-accent"
              />
              <span className="text-sm font-bold text-primary">
                حساب کاربری فعال باشد
              </span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
