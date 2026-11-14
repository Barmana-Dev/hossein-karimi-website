"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowRight,
  Save,
  Loader2,
  AlertCircle,
  Image as ImageIcon,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { MediaPicker } from "@/components/admin/MediaPicker";

interface Agency {
  name: string;
  slug: string;
  description: string;
  field: string;
  relationType: string;
  relationDescription: string | null;
  city: string | null;
  websiteUrl: string | null;
  status: string;
  logoImage: string | null;
  featured: boolean; // 👈 اضافه شد
}

export default function EditAgencyPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);

  const [formData, setFormData] = useState<Agency>({
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
    featured: false, // 👈 مقدار اولیه
  });

  useEffect(() => {
    let isMounted = true;
    const fetchAgency = async () => {
      try {
        const res = await fetch(
          `http://localhost:4000/api/v1/public/network/admin/${id}`,
          { credentials: "include" },
        );
        if (res.ok && isMounted) {
          setFormData((await res.json()).data);
        } else if (isMounted) {
          router.push("/admin/network");
        }
      } catch (error) {
        console.error(error);
      } finally {
        if (isMounted) setIsFetching(false);
      }
    };
    fetchAgency();
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
        `http://localhost:4000/api/v1/public/network/admin/${id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
          credentials: "include",
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || "خطا در ذخیره");
      router.push("/admin/network");
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
            href="/admin/network"
            className="w-10 h-10 rounded-xl bg-white border border-border flex items-center justify-center"
          >
            <ArrowRight size={18} />
          </Link>
          <h1 className="text-2xl font-black text-primary">ویرایش مجموعه</h1>
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
                className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-primary">اسلاگ *</label>
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
            <label className="text-xs font-bold text-primary">توضیحات</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm resize-none"
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
                className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm"
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
                className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm"
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
                value={formData.city || ""}
                onChange={handleChange}
                className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-primary">وب‌سایت</label>
              <input
                name="websiteUrl"
                value={formData.websiteUrl || ""}
                onChange={handleChange}
                dir="ltr"
                className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-left"
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
              className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm"
            >
              <option value="published">منتشر شده</option>
              <option value="draft">پیش‌نویس</option>
            </select>

            {/* 👇 چک‌باکس ویژه */}
            <label className="flex items-center gap-2 cursor-pointer pt-2">
              <input
                type="checkbox"
                name="featured"
                checked={formData.featured || false}
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
                <img
                  src={`http://localhost:4000${formData.logoImage}`}
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
