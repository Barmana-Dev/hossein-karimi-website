"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function NewAdminPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "EDITOR",
    isActive: true, // 👈 جدید
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch("http://localhost:4000/api/v1/auth/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
        credentials: "include",
      });
      if (!res.ok) throw new Error((await res.json()).error?.message || "خطا");
      router.push("/admin/accounts");
      router.refresh();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "خطا");
    } finally {
      setIsLoading(false);
    }
  };

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
            ایجاد کاربر ادمین
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
          ذخیره
        </Button>
      </div>
      <div className="bg-white border border-border rounded-2xl p-6 shadow-sm space-y-5">
        <div className="grid md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <label className="text-xs font-bold">نام</label>
            <input
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
              className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold">ایمیل</label>
            <input
              type="email"
              dir="ltr"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              required
              className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-left"
            />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold">رمز عبور</label>
          <input
            type="password"
            dir="ltr"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            required
            className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-left"
          />
        </div>

        {/* 👇 نقش و وضعیت کنار هم */}
        <div className="grid md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <label className="text-xs font-bold">نقش</label>
            <select
              value={formData.role}
              onChange={(e) =>
                setFormData({ ...formData, role: e.target.value })
              }
              className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm"
            >
              <option value="EDITOR">نویسنده (Editor)</option>
              <option value="SUPER_ADMIN">مدیر ارشد (Super Admin)</option>
            </select>
          </div>

          {/* 👇 چک‌باکس فعال/غیرفعال */}
          <div className="space-y-2 flex items-center pt-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) =>
                  setFormData({ ...formData, isActive: e.target.checked })
                }
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
