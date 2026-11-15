"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Save, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { API_URL } from "@/lib/api";

export default function NewMediaPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    type: "news",
    description: "",
    sourceUrl: "",
    status: "draft",
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/public/media/admin/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.error?.code === "VALIDATION_ERROR") {
          const fieldErrors = data.error.fields;
          const firstError = Object.values(fieldErrors)[0];
          const message = Array.isArray(firstError)
            ? firstError[0]
            : "خطای اعتبارسنجی";
          throw new Error(message);
        }
        throw new Error(data.error?.message || "خطا در ذخیره");
      }
      router.push("/admin/media");
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "خطا");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-[800px] mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/media"
            className="w-10 h-10 rounded-xl bg-white border border-border flex items-center justify-center"
          >
            <ArrowRight size={18} />
          </Link>
          <h1 className="text-2xl font-black text-primary">
            ثبت آیتم رسانه‌ای
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
      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-xl text-sm">
          <AlertCircle size={18} /> {error}
        </div>
      )}
      <div className="bg-white border border-border rounded-2xl p-6 shadow-sm space-y-5">
        <div className="space-y-2">
          <label className="text-xs font-bold">عنوان *</label>
          <input
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm"
          />
        </div>
        <div className="grid md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <label className="text-xs font-bold">نوع</label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm"
            >
              <option value="news">خبر</option>
              <option value="interview">مصاحبه</option>
              <option value="speech">سخنرانی</option>
              <option value="event">رویداد</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold">وضعیت</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm"
            >
              <option value="draft">پیش‌نویس</option>
              <option value="published">منتشر شده</option>
            </select>
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold">لینک منبع</label>
          <input
            name="sourceUrl"
            value={formData.sourceUrl}
            onChange={handleChange}
            dir="ltr"
            className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-left"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold">توضیحات</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm resize-none"
          />
        </div>
      </div>
    </div>
  );
}
