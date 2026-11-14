"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Edit, Trash2, Layers, Loader2 } from "lucide-react";
import { toPersianNumber } from "@/lib/utils";

interface Expertise {
  id: string;
  title: string;
  slug: string;
  status: string;
}
const ITEMS_PER_PAGE = 10;

export default function AdminExpertisePage() {
  const [expertises, setExpertises] = useState<Expertise[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchExps = async () => {
      try {
        const res = await fetch(
          "http://localhost:4000/api/v1/public/expertise/admin/list",
          { credentials: "include" },
        );
        if (res.ok) setExpertises((await res.json()).data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchExps();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm("حذف شود؟")) return;
    try {
      const res = await fetch(
        `http://localhost:4000/api/v1/public/expertise/admin/${id}`,
        { method: "DELETE", credentials: "include" },
      );
      if (res.ok) setExpertises((prev) => prev.filter((e) => e.id !== id));
    } catch (error) {
      console.error(error);
    }
  };

  const totalPages = Math.ceil(expertises.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedExps = expertises.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE,
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (isLoading)
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="animate-spin text-accent" size={40} />
      </div>
    );

  return (
    <div className="max-w-[1200px] mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-primary mb-1">
            مدیریت حوزه‌های تخصصی
          </h1>
          <p className="text-sm text-foreground-muted">
            ایجاد، ویرایش و مرتب‌سازی حوزه‌ها.
          </p>
        </div>
        <Link
          href="/admin/expertise/new"
          className="inline-flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl text-sm font-bold"
        >
          <Plus size={16} /> حوزه جدید
        </Link>
      </div>

      <div className="bg-white border border-border rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-sm text-right">
          <thead className="bg-background text-foreground-muted text-xs border-b border-border">
            <tr>
              <th className="px-6 py-4">عنوان</th>
              <th className="px-6 py-4">اسلاگ</th>
              <th className="px-6 py-4">وضعیت</th>
              <th className="px-6 py-4 text-center">عملیات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {paginatedExps.map((exp) => (
              <tr key={exp.id} className="hover:bg-background/50 group">
                <td className="px-6 py-4 font-bold text-primary">
                  {exp.title}
                </td>
                <td className="px-6 py-4 text-foreground-muted" dir="ltr">
                  /{exp.slug}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${exp.status === "published" ? "bg-green-50 text-green-700" : "bg-orange-50 text-orange-700"}`}
                  >
                    {exp.status === "published" ? "منتشر شده" : "پیش‌نویس"}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-center gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                    <Link
                      href={`/admin/expertise/${exp.id}/edit`}
                      className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center"
                    >
                      <Edit size={14} />
                    </Link>
                    <button
                      onClick={() => handleDelete(exp.id)}
                      className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 rounded-lg border border-border bg-white text-sm font-bold text-primary disabled:opacity-50 disabled:cursor-not-allowed hover:bg-background transition-colors"
          >
            قبلی
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`w-10 h-10 rounded-lg text-sm font-bold transition-colors ${currentPage === page ? "bg-primary text-white" : "bg-white border border-border text-primary hover:bg-background"}`}
            >
              {toPersianNumber(page)}
            </button>
          ))}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-4 py-2 rounded-lg border border-border bg-white text-sm font-bold text-primary disabled:opacity-50 disabled:cursor-not-allowed hover:bg-background transition-colors"
          >
            بعدی
          </button>
        </div>
      )}
    </div>
  );
}
