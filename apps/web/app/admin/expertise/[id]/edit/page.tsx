"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowRight,
  Save,
  Loader2,
  AlertCircle,
  Scale,
  Package,
  Globe,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

const icons = [
  { id: "scale", icon: Scale, label: "حقوقی" },
  { id: "package", icon: Package, label: "گمرکی" },
  { id: "globe", icon: Globe, label: "تجارت" },
  { id: "users", icon: Users, label: "همکاری" },
];

export default function EditExpertisePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    summary: "",
    body: "",
    icon: "scale",
    status: "draft",
  });

  // دریافت اطلاعات حوزه
  useEffect(() => {
    const fetchExpertise = async () => {
      try {
        const res = await fetch(
          `http://localhost:4000/api/v1/public/expertise/admin/${id}`,
          { credentials: "include" },
        );
        if (res.ok) {
          const json = await res.json();
          setFormData(json.data);
        } else {
          router.push("/admin/expertise");
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsFetching(false);
      }
    };
    fetchExpertise();
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
        `http://localhost:4000/api/v1/public/expertise/admin/${id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
          credentials: "include",
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || "خطا در ذخیره");
      router.push("/admin/expertise");
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
    <div className="max-w-[900px] mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/expertise"
            className="w-10 h-10 rounded-xl bg-white border border-border flex items-center justify-center"
          >
            <ArrowRight size={18} />
          </Link>
          <h1 className="text-2xl font-black text-primary">
            ویرایش حوزه تخصصی
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
        <div className="grid md:grid-cols-2 gap-5">
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
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-primary">خلاصه *</label>
          <textarea
            name="summary"
            value={formData.summary}
            onChange={handleChange}
            required
            rows={2}
            className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:outline-none resize-none"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-primary">متن کامل *</label>
          <textarea
            name="body"
            value={formData.body}
            onChange={handleChange}
            required
            rows={6}
            className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:outline-none resize-none"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-primary">انتخاب آیکون</label>
          <div className="grid grid-cols-4 gap-3">
            {icons.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setFormData({ ...formData, icon: opt.id })}
                className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all ${formData.icon === opt.id ? "border-accent bg-accent/5 text-accent" : "border-border text-foreground-muted hover:border-accent/50"}`}
              >
                <opt.icon size={24} />
                <span className="text-xs font-bold">{opt.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-primary">وضعیت انتشار</label>
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
  );
}
