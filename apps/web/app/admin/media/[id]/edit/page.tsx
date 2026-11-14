"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { ArrowRight, Save, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface MediaItem {
  title: string;
  type: string;
  description: string;
  sourceUrl: string;
  status: string;
}

export default function EditMediaPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<MediaItem>({
    title: "",
    type: "news",
    description: "",
    sourceUrl: "",
    status: "draft",
  });

  useEffect(() => {
    let isMounted = true;
    const fetchMedia = async () => {
      try {
        const res = await fetch(
          `http://localhost:4000/api/v1/public/media/admin/${id}`,
          { credentials: "include" },
        );
        if (res.ok && isMounted) {
          setFormData((await res.json()).data);
        } else {
          router.push("/admin/media");
        }
      } catch (error) {
        console.error(error);
      } finally {
        if (isMounted) setIsFetching(false);
      }
    };
    fetchMedia();
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
      const res = await fetch(
        `http://localhost:4000/api/v1/public/media/admin/${id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
          credentials: "include",
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || "خطا در ذخیره");
      router.push("/admin/media");
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
        <div className="flex items-center gap-4">
          <Link
            href="/admin/media"
            className="w-10 h-10 rounded-xl bg-white border border-border flex items-center justify-center"
          >
            <ArrowRight size={18} />
          </Link>
          <h1 className="text-2xl font-black text-primary">
            ویرایش آیتم رسانه‌ای
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
        <div className="space-y-2">
          <label className="text-xs font-bold text-primary">عنوان *</label>
          <input
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:outline-none"
          />
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <label className="text-xs font-bold text-primary">نوع</label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:outline-none"
            >
              <option value="news">خبر</option>
              <option value="interview">مصاحبه</option>
              <option value="speech">سخنرانی</option>
              <option value="event">رویداد</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-primary">وضعیت</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:outline-none"
            >
              <option value="draft">پیش‌نویس</option>
              <option value="published">منتشر شده</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-primary">لینک منبع</label>
          <input
            name="sourceUrl"
            value={formData.sourceUrl || ""}
            onChange={handleChange}
            dir="ltr"
            className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-left focus:outline-none"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-primary">توضیحات</label>
          <textarea
            name="description"
            value={formData.description || ""}
            onChange={handleChange}
            rows={4}
            className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:outline-none resize-none"
          />
        </div>
      </div>
    </div>
  );
}
