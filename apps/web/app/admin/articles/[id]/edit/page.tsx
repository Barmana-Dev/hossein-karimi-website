"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
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

interface Article {
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  category: string;
  status: string;
  readTime: number;
  coverImage: string | null;
}

export default function EditArticlePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);

  const [formData, setFormData] = useState<Article>({
    title: "",
    slug: "",
    excerpt: "",
    body: "",
    category: "امور گمرکی",
    status: "draft",
    readTime: 5,
    coverImage: "",
  });

  useEffect(() => {
    let isMounted = true;
    const fetchArticle = async () => {
      try {
        const res = await fetch(`${API_URL}/public/articles/admin/${id}`, {
          credentials: "include",
        });
        if (res.ok && isMounted) {
          setFormData((await res.json()).data);
        } else if (isMounted) {
          router.push("/admin/articles");
        }
      } catch (error) {
        console.error(error);
      } finally {
        if (isMounted) setIsFetching(false);
      }
    };
    fetchArticle();
    return () => {
      isMounted = false;
    };
  }, [id, router]);

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
      const res = await fetch(`${API_URL}/public/articles/admin/${id}`, {
        method: "PATCH",
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
    <div className="max-w-[1000px] mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/articles"
            className="w-10 h-10 rounded-xl bg-white border border-border flex items-center justify-center"
          >
            <ArrowRight size={18} />
          </Link>
          <h1 className="text-2xl font-black text-primary">ویرایش مقاله</h1>
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

      <div className="grid lg:grid-cols-[2fr_1fr] gap-6">
        <div className="space-y-5 bg-white border border-border rounded-2xl p-6 shadow-sm">
          <div className="grid md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-xs font-bold">عنوان مقاله *</label>
              <input
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold">اسلاگ *</label>
              <input
                name="slug"
                value={formData.slug}
                onChange={handleChange}
                required
                dir="ltr"
                className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-left"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold">خلاصه</label>
            <textarea
              name="excerpt"
              value={formData.excerpt}
              onChange={handleChange}
              rows={2}
              className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm resize-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold">متن مقاله *</label>
            <textarea
              name="body"
              value={formData.body}
              onChange={handleChange}
              rows={10}
              required
              className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm resize-none"
            />
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white border border-border rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold">وضعیت انتشار</h3>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm"
            >
              <option value="draft">پیش‌نویس</option>
              <option value="review">در حال بررسی</option>
              <option value="published">منتشر شده</option>
            </select>
          </div>

          <div className="bg-white border border-border rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold">دسته‌بندی</h3>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm"
            >
              <option value="امور گمرکی">امور گمرکی</option>
              <option value="حقوق تجارت">حقوق تجارت</option>
              <option value="تحلیل مقررات">تحلیل مقررات</option>
            </select>
          </div>

          <div className="bg-white border border-border rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold flex items-center gap-2">
              <ImageIcon size={16} className="text-accent" /> تصویر شاخص
            </h3>
            {formData.coverImage ? (
              <div className="relative aspect-video rounded-xl overflow-hidden border border-border group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
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
