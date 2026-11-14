"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { ArrowRight, Save, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function EditExperiencePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    organization: "",
    role: "",
    description: "",
    category: "customs",
    status: "draft",
  });

  useEffect(() => {
    const fetchExp = async () => {
      try {
        const res = await fetch(
          `http://localhost:4000/api/v1/public/experience/admin/${id}`,
          { credentials: "include" },
        );
        if (res.ok) setFormData((await res.json()).data);
        else router.push("/admin/experience");
      } catch (error) {
        console.error(error);
      } finally {
        setIsFetching(false);
      }
    };
    fetchExp();
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
        `http://localhost:4000/api/v1/public/experience/admin/${id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
          credentials: "include",
        },
      );
      if (!res.ok) throw new Error((await res.json()).error?.message || "خطا");
      router.push("/admin/experience");
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "خطا");
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching)
    return (
      <div className="flex justify-center h-96 items-center">
        <Loader2 className="animate-spin text-accent" size={40} />
      </div>
    );

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
          <h1 className="text-2xl font-black text-primary">ویرایش سابقه</h1>
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
        <div className="grid md:grid-cols-2 gap-5">
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
          <div className="space-y-2">
            <label className="text-xs font-bold">نهاد *</label>
            <input
              name="organization"
              value={formData.organization}
              onChange={handleChange}
              required
              className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm"
            />
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <label className="text-xs font-bold">سمت *</label>
            <input
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
              className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold">دسته‌بندی</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm"
            >
              <option value="customs">گمرکی</option>
              <option value="legal">حقوقی</option>
              <option value="management">مدیریتی</option>
            </select>
          </div>
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
        <div className="space-y-2">
          <label className="text-xs font-bold">وضعیت</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm"
          >
            <option value="published">منتشر شده</option>
            <option value="draft">پیش‌نویس</option>
          </select>
        </div>
      </div>
    </div>
  );
}
