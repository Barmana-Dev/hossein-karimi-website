"use client";

import Link from "next/link";
import { Plus, Edit, Trash2, Loader2 } from "lucide-react";
import { AdminPagination } from "@/components/admin/AdminPagination";
import { useAdminList } from "@/lib/use-admin-list";
import { API_URL } from "@/lib/api";

interface Expertise {
  id: string;
  title: string;
  slug: string;
  status: string;
}

export default function AdminExpertisePage() {
  const {
    items: expertises,
    meta,
    isLoading,
    page,
    setPage,
    removeItem,
  } = useAdminList<Expertise>("/public/expertise/admin/list", { limit: 10 });

  const handleDelete = async (id: string) => {
    if (!window.confirm("حذف شود؟")) return;
    try {
      const res = await fetch(`${API_URL}/public/expertise/admin/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) removeItem(id);
    } catch (error) {
      console.error(error);
    }
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
        <div className="overflow-x-auto">
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
              {expertises.map((exp) => (
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
                        aria-label={`ویرایش ${exp.title}`}
                        className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center"
                      >
                        <Edit size={14} />
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDelete(exp.id)}
                        aria-label={`حذف ${exp.title}`}
                        className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {expertises.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-12 text-center text-foreground-muted"
                  >
                    حوزه‌ای یافت نشد.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AdminPagination
        page={page}
        totalPages={meta.totalPages}
        onChange={setPage}
      />
    </div>
  );
}
