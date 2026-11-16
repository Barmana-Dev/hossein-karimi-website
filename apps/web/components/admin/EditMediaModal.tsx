"use client";

import { useState, useEffect } from "react";
import { X, Save, Loader2, AlertCircle } from "lucide-react";
import { API_URL } from "@/lib/api";
import { Button } from "@/components/ui/Button";

interface MediaItem {
  title: string;
  type: string;
  description: string;
  sourceUrl: string;
  status: string;
}

interface Props {
  mediaId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function EditMediaModal({ mediaId, onClose, onSuccess }: Props) {
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
          `${API_URL}/public/media/admin/${mediaId}`,
          { credentials: "include" },
        );
        const json = await res.json();

        if (res.ok && json.success && json.data && isMounted) {
          setFormData(json.data);
        } else if (isMounted) {
          setError(json.error?.message || "خطا در دریافت اطلاعات");
        }
      } catch {
        if (isMounted) setError("خطا در ارتباط با سرور");
      } finally {
        if (isMounted) setIsFetching(false);
      }
    };
    fetchMedia();
    return () => {
      isMounted = false;
    };
  }, [mediaId]);

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
        `${API_URL}/public/media/admin/${mediaId}`,
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
      <div className="bg-white rounded-2xl w-full max-w-[600px] shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-lg font-bold text-primary">
            ویرایش آیتم رسانه‌ای
          </h2>
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

              <div className="space-y-2">
                <label className="text-xs font-bold">عنوان *</label>
                <input
                  name="title"
                  value={formData.title || ""}
                  onChange={handleChange}
                  required
                  className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold">نوع</label>
                  <select
                    name="type"
                    value={formData.type || "news"}
                    onChange={handleChange}
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none"
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
                    value={formData.status || "draft"}
                    onChange={handleChange}
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none"
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
                  value={formData.sourceUrl || ""}
                  onChange={handleChange}
                  dir="ltr"
                  className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-left focus:outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold">توضیحات</label>
                <textarea
                  name="description"
                  value={formData.description || ""}
                  onChange={handleChange}
                  rows={3}
                  className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none resize-none"
                />
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
