"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { API_URL, assetUrl } from "@/lib/api";
import {
  ArrowRight,
  Save,
  Loader2,
  AlertCircle,
  Image as ImageIcon,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { MediaPicker } from "@/components/admin/MediaPicker";

export default function NewAgencyPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    field: "",
    relationType: "مشاور",
    relationDescription: "",
    city: "",
    websiteUrl: "",
    status: "draft",
    logoImage: "",
    featured: false,
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
      if (name === "name" && !prev.slug) {
        newData.slug =
          "agency-" + Math.floor(Math.random() * 100000).toString();
      }
      return newData;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/public/network/admin/create`, {
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
      router.push("/admin/network");
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
            href="/admin/network"
            className="w-10 h-10 rounded-xl bg-white border border-border flex items-center justify-center"
          >
            <ArrowRight size={18} />
          </Link>
          <h1 className="text-2xl font-black text-primary">ثبت مجموعه جدید</h1>
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

      <div className="grid lg:grid-cols-[2fr_1fr] gap-6">
        {/* ستون اصلی: اطلاعات */}
        <div className="bg-white border border-border rounded-2xl p-6 shadow-sm space-y-6">
          <div className="grid md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-xs font-bold text-primary">
                نام مجموعه *
              </label>
              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:outline-none"
                placeholder="نام شرکت..."
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
                placeholder="agency-123"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-primary">
              توضیحات <span className="text-red-500">*</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={3}
              className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:outline-none resize-none"
              placeholder="معرفی مختصر مجموعه..."
            />
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-xs font-bold text-primary">
                حوزه فعالیت *
              </label>
              <input
                name="field"
                value={formData.field}
                onChange={handleChange}
                required
                className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:outline-none"
                placeholder="مثلاً: امور گمرکی"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-primary">
                نوع ارتباط
              </label>
              <select
                name="relationType"
                value={formData.relationType}
                onChange={handleChange}
                className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:outline-none"
              >
                <option value="مشاور">مشاور</option>
                <option value="همکار">همکار</option>
                <option value="شریک">شریک</option>
                <option value="مؤسس">مؤسس</option>
                <option value="مدیر">مدیر</option>
              </select>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-xs font-bold text-primary">شهر</label>
              <input
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:outline-none"
                placeholder="مثلاً: تهران"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-primary">وب‌سایت</label>
              <input
                name="websiteUrl"
                value={formData.websiteUrl}
                onChange={handleChange}
                dir="ltr"
                className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-left focus:outline-none"
                placeholder="https://..."
              />
            </div>
          </div>
        </div>

        {/* ستون کناری: تنظیمات و عکس */}
        <div className="space-y-6">
          <div className="bg-white border border-border rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-primary">تنظیمات نمایش</h3>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none"
            >
              <option value="published">منتشر شده</option>
              <option value="draft">پیش‌نویس</option>
            </select>

            {/* 👇 چک‌باکس ویژه */}
            <label className="flex items-center gap-2 cursor-pointer pt-2">
              <input
                type="checkbox"
                name="featured"
                checked={formData.featured}
                onChange={(e) =>
                  setFormData({ ...formData, featured: e.target.checked })
                }
                className="w-4 h-4 accent-accent"
              />
              <span className="text-sm font-bold text-primary">
                نمایش در صفحه اصلی (ویژه)
              </span>
            </label>
          </div>

          <div className="bg-white border border-border rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-primary flex items-center gap-2">
              <ImageIcon size={16} className="text-accent" /> لوگوی مجموعه
            </h3>
            {formData.logoImage ? (
              <div className="relative aspect-square rounded-xl overflow-hidden border border-border group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img loading="lazy" decoding="async"
                  src={assetUrl(formData.logoImage)}
                  alt="Logo"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-primary/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button
                    onClick={() => setFormData({ ...formData, logoImage: "" })}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg text-xs font-bold"
                  >
                    حذف عکس
                  </button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => setIsMediaPickerOpen(true)}
                className="border-2 border-dashed border-border rounded-xl p-6 flex flex-col items-center justify-center text-center hover:bg-background transition-colors cursor-pointer"
              >
                <ImageIcon size={24} className="text-foreground-muted mb-2" />
                <span className="text-xs text-foreground-muted">
                  برای انتخاب عکس کلیک کنید
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {isMediaPickerOpen && (
        <MediaPicker
          onSelect={(url) => {
            setFormData({ ...formData, logoImage: url });
            setIsMediaPickerOpen(false);
          }}
          onClose={() => setIsMediaPickerOpen(false)}
        />
      )}
    </div>
  );
}
