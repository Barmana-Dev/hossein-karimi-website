"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Save, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function NewExperiencePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    organization: "",
    role: "",
    description: "",
    category: "customs",
    status: "published",
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const newData = { ...prev, [name]: value };
      // 👇 تولید اسلاگ انگلیسی به صورت خودکار
      if (name === "title" && !prev.slug) {
        newData.slug = "exp-" + Math.floor(Math.random() * 100000).toString();
      }
      return newData;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(
        "http://localhost:4000/api/v1/public/experience/admin/create",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
          credentials: "include",
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || "خطا در ذخیره");
      router.push("/admin/experience");
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "خطای ناشناخته");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-[1000px] mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/experience"
            className="w-10 h-10 rounded-xl bg-white border border-border flex items-center justify-center"
          >
            <ArrowRight size={18} />
          </Link>
          <h1 className="text-2xl font-black text-primary">ثبت سابقه جدید</h1>
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
        <div className="p-4 bg-red-50 text-red-700 rounded-xl text-sm flex items-center gap-2">
          <AlertCircle size={18} /> {error}
        </div>
      )}

      <div className="bg-white border border-border rounded-2xl p-6 shadow-sm space-y-6">
        <div className="grid md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <label className="text-xs font-bold text-primary">
              عنوان سابقه *
            </label>
            <input
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:outline-none"
              placeholder="مثلاً: مشاور ارشد"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-primary">
              اسلاگ (آدرس) *
            </label>
            <input
              name="slug"
              value={formData.slug}
              onChange={handleChange}
              required
              dir="ltr"
              className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-left focus:outline-none"
              placeholder="exp-123"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <label className="text-xs font-bold text-primary">
              نهاد / مجموعه *
            </label>
            <input
              name="organization"
              value={formData.organization}
              onChange={handleChange}
              required
              className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:outline-none"
              placeholder="نام شرکت..."
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-primary">
              سمت / نقش *
            </label>
            <input
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
              className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:outline-none"
              placeholder="مثلاً: مشاور حقوقی"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-primary">توضیحات</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:outline-none resize-none"
            placeholder="شرح فعالیت..."
          />
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <label className="text-xs font-bold text-primary">دسته‌بندی</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:outline-none"
            >
              <option value="customs">گمرکی</option>
              <option value="legal">حقوقی</option>
              <option value="management">مدیریتی</option>
              <option value="education">آموزشی</option>
              <option value="business">کسب‌وکار</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-primary">
              وضعیت انتشار
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:outline-none"
            >
              <option value="published">منتشر شده</option>
              <option value="draft">پیش‌نویس</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
