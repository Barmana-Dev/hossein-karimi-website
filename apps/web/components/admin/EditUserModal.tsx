"use client";

import { useState, useEffect } from "react";
import { X, Save, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
}

interface Props {
  userId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function EditUserModal({ userId, onClose, onSuccess }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // مقداردهی اولیه دقیق با تمام فیلدهای اینترفیس
  const [formData, setFormData] = useState<AdminUser & { password?: string }>({
    id: "",
    name: "",
    email: "",
    role: "EDITOR",
    isActive: true,
    password: "",
  });

  useEffect(() => {
    let isMounted = true;
    const fetchUser = async () => {
      try {
        const res = await fetch(
          `http://localhost:4000/api/v1/auth/admin/users/${userId}`,
          {
            credentials: "include",
          },
        );

        const json = await res.json();

        // 👇 بررسی دقیق‌تر
        if (res.ok && json.success && json.data) {
          if (isMounted) {
            setFormData({ ...json.data, password: "" });
          }
        } else {
          if (isMounted)
            setError(json.error?.message || "خطا در دریافت اطلاعات");
        }
      } catch (err) {
        if (isMounted) setError("خطا در ارتباط با سرور");
      } finally {
        if (isMounted) setIsFetching(false);
      }
    };
    fetchUser();
    return () => {
      isMounted = false;
    };
  }, [userId]);

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
        `http://localhost:4000/api/v1/auth/admin/users/${userId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
          credentials: "include",
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || "خطا در ذخیره");

      onSuccess();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "خطای ناشناخته");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-[500px] shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-lg font-bold text-primary">ویرایش کاربر</h2>
          <button
            onClick={onClose}
            className="text-foreground-muted hover:text-primary"
          >
            <X size={20} />
          </button>
        </div>

        {isFetching ? (
          <div className="p-10 flex justify-center">
            <Loader2 className="animate-spin text-accent" size={32} />
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="p-6 space-y-5">
              {error && (
                <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg flex items-center gap-2">
                  <AlertCircle size={16} />
                  {error}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold">نام</label>
                  <input
                    name="name"
                    value={formData.name || ""}
                    onChange={handleChange}
                    required
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold">ایمیل</label>
                  <input
                    name="email"
                    type="email"
                    dir="ltr"
                    value={formData.email || ""}
                    onChange={handleChange}
                    required
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-left focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold">
                  رمز عبور جدید (اختیاری)
                </label>
                <input
                  name="password"
                  type="password"
                  dir="ltr"
                  value={formData.password || ""}
                  onChange={handleChange}
                  placeholder="برای عدم تغییر، خالی بگذارید"
                  className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-left focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold">نقش</label>
                  <select
                    name="role"
                    value={formData.role || "EDITOR"}
                    onChange={handleChange}
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none"
                  >
                    <option value="EDITOR">نویسنده</option>
                    <option value="SUPER_ADMIN">مدیر ارشد</option>
                  </select>
                </div>
                <div className="space-y-2 flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={formData.isActive || false}
                      onChange={handleChange}
                      className="w-4 h-4 accent-accent"
                    />
                    <span className="text-sm font-bold">فعال</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-border flex justify-end gap-3 bg-background rounded-b-2xl">
              <Button type="button" variant="outline" onClick={onClose}>
                انصراف
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={isLoading}
                className="gap-2"
              >
                {isLoading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Save size={16} />
                )}{" "}
                ذخیره
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
