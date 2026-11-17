"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { API_URL, assetUrl } from "@/lib/api";
import {
  ArrowRight,
  Save,
  Image as ImageIcon,
  Settings2,
  Tag,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { MediaPicker } from "@/components/admin/MediaPicker";

export default function NewArticlePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("content");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    excerpt: "",
    body: "",
    category: "امور گمرکی",
    status: "draft",
    readTime: 5,
    coverImage: "",
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
        newData.slug =
          "article-" + Math.floor(Math.random() * 100000).toString();
      }
      return newData;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_URL}/public/articles/admin/create`, {
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

      router.push("/admin/articles");
      router.refresh();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "خطای ناشناخته";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/articles"
            className="w-10 h-10 rounded-xl bg-white border border-border flex items-center justify-center text-foreground-muted hover:text-primary transition-colors"
          >
            <ArrowRight size={18} />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-primary mb-1">
              ایجاد مقاله جدید
            </h1>
            <p className="text-sm text-foreground-muted">
              محتوای جدید خود را وارد کنید.
            </p>
          </div>
        </div>
        <Button
          type="submit"
          onClick={handleSubmit}
          disabled={isLoading}
          variant="primary"
          className="gap-2"
        >
          {isLoading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Save size={16} />
          )}
          {isLoading ? "در حال ذخیره..." : "ذخیره مقاله"}
        </Button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex items-center gap-2">
          <AlertCircle size={18} /> {error}
        </div>
      )}

      <div className="grid lg:grid-cols-[2fr_1fr] gap-6">
        <div className="space-y-6">
          <div className="bg-white border border-border rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-6 border-b border-border mb-6">
              <button
                onClick={() => setActiveTab("content")}
                className={`pb-3 text-sm font-bold border-b-2 transition-colors ${activeTab === "content" ? "border-accent text-primary" : "border-transparent text-foreground-muted hover:text-primary"}`}
              >
                محتوای اصلی
              </button>
              <button
                onClick={() => setActiveTab("seo")}
                className={`pb-3 text-sm font-bold border-b-2 transition-colors ${activeTab === "seo" ? "border-accent text-primary" : "border-transparent text-foreground-muted hover:text-primary"}`}
              >
                تنظیمات سئو (SEO)
              </button>
            </div>

            {activeTab === "content" ? (
              <div className="space-y-5">
                <div className="grid md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-primary">
                      عنوان مقاله <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      type="text"
                      placeholder="عنوان جذاب و گویا..."
                      required
                      className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-primary">
                      اسلاگ (آدرس یکتا) <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="slug"
                      value={formData.slug}
                      onChange={handleChange}
                      type="text"
                      placeholder="article-123"
                      dir="ltr"
                      required
                      className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-left focus:outline-none focus:border-accent"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-primary">
                    خلاصه (Excerpt)
                  </label>
                  <textarea
                    name="excerpt"
                    value={formData.excerpt}
                    onChange={handleChange}
                    rows={2}
                    placeholder="توضیح کوتاه..."
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-primary">
                    متن اصلی مقاله <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="body"
                    value={formData.body}
                    onChange={handleChange}
                    rows={10}
                    placeholder="متن مقاله خود را اینجا بنویسید..."
                    required
                    className="w-full bg-white border border-border rounded-xl p-4 text-sm focus:outline-none resize-none"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-primary">
                    Meta Title
                  </label>
                  <input
                    type="text"
                    placeholder="عنوان سئو..."
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-primary">
                    Meta Description
                  </label>
                  <textarea
                    rows={3}
                    placeholder="توضیحات سئو..."
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent resize-none"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white border border-border rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-primary flex items-center gap-2">
              <Settings2 size={16} className="text-accent" /> وضعیت انتشار
            </h3>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-accent"
            >
              <option value="draft">پیش‌نویس (Draft)</option>
              <option value="review">در حال بررسی (Review)</option>
              <option value="published">منتشر شده (Published)</option>
            </select>
          </div>

          <div className="bg-white border border-border rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-primary flex items-center gap-2">
              <Tag size={16} className="text-accent" /> دسته‌بندی
            </h3>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-accent"
            >
              <option value="امور گمرکی">امور گمرکی</option>
              <option value="حقوق تجارت">حقوق تجارت</option>
              <option value="تحلیل مقررات">تحلیل مقررات</option>
            </select>
          </div>

          <div className="bg-white border border-border rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-primary flex items-center gap-2">
              <ImageIcon size={16} className="text-accent" /> تصویر شاخص
            </h3>
            {formData.coverImage ? (
              <div className="relative aspect-video rounded-xl overflow-hidden border border-border group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img loading="lazy" decoding="async"
                  src={assetUrl(formData.coverImage)}
                  alt="Cover"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-primary/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button
                    onClick={() => setFormData({ ...formData, coverImage: "" })}
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
            setFormData({ ...formData, coverImage: url });
            setIsMediaPickerOpen(false);
          }}
          onClose={() => setIsMediaPickerOpen(false)}
        />
      )}
    </div>
  );
}
