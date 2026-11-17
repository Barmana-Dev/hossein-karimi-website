"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Edit, Trash2, Loader2 } from "lucide-react";
import { AdminPagination } from "@/components/admin/AdminPagination";
import { useAdminList } from "@/lib/use-admin-list";
import { API_URL } from "@/lib/api";

interface MediaItem {
  id: string;
  title: string;
  type: string;
  status: string;
  createdAt: string;
}
const typeLabels: Record<string, string> = {
  news: "خبر",
  interview: "مصاحبه",
  speech: "سخنرانی",
  event: "رویداد",
  video: "ویدئو",
};

export default function AdminMediaPage() {
  const [typeFilter, setTypeFilter] = useState("all");

  const {
    items: media,
    meta,
    isLoading,
    search,
    setSearch,
    page,
    setPage,
    removeItem,
  } = useAdminList<MediaItem>("/public/media/admin/list", {
    limit: 10,
    extraQuery: { type: typeFilter },
  });

  const handleDelete = async (id: string) => {
    if (!window.confirm("حذف شود؟")) return;
    try {
      const res = await fetch(`${API_URL}/public/media/admin/${id}`, {
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
    <div className="max-w-[1400px] mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-primary mb-1">
            رسانه و رویدادها
          </h1>
          <p className="text-sm text-foreground-muted">
            مدیریت اخبار و حضور رسانه‌ای.
          </p>
        </div>
        <Link
          href="/admin/media/new"
          className="inline-flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl text-sm font-bold"
        >
          <Plus size={16} /> آیتم جدید
        </Link>
      </div>

      <div className="bg-white border border-border rounded-2xl p-4 flex flex-col md:flex-row gap-4 justify-between items-center shadow-sm">
        <input
          type="text"
          placeholder="جستجو..."
          aria-label="جستجوی رسانه"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full md:w-[350px] bg-background border border-border rounded-xl py-2.5 px-4 text-sm focus:outline-none"
        />
        <select
          aria-label="فیلتر نوع"
          value={typeFilter}
          onChange={(e) => {
            setTypeFilter(e.target.value);
            setPage(1);
          }}
          className="bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none"
        >
          <option value="all">همه انواع</option>
          <option value="news">خبر</option>
          <option value="interview">مصاحبه</option>
          <option value="speech">سخنرانی</option>
          <option value="event">رویداد</option>
        </select>
      </div>

      <div className="bg-white border border-border rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-right">
            <thead className="bg-background text-foreground-muted text-xs border-b border-border">
              <tr>
                <th className="px-6 py-4">عنوان</th>
                <th className="px-6 py-4">نوع</th>
                <th className="px-6 py-4">وضعیت</th>
                <th className="px-6 py-4 text-center">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {media.map((item) => (
                <tr key={item.id} className="hover:bg-background/50 group">
                  <td className="px-6 py-4 font-bold text-primary">
                    {item.title}
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-accent/10 text-accent">
                      {typeLabels[item.type] || item.type}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${item.status === "published" ? "bg-green-50 text-green-700" : "bg-orange-50 text-orange-700"}`}
                    >
                      {item.status === "published" ? "منتشر شده" : "پیش‌نویس"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                      <Link
                        href={`/admin/media/${item.id}/edit`}
                        aria-label={`ویرایش ${item.title}`}
                        className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center"
                      >
                        <Edit size={14} />
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDelete(item.id)}
                        aria-label={`حذف ${item.title}`}
                        className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {media.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-12 text-center text-foreground-muted"
                  >
                    آیتمی یافت نشد.
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
