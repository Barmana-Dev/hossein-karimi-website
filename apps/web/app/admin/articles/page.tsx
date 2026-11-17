"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Filter,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { AdminPagination } from "@/components/admin/AdminPagination";
import { useAdminList } from "@/lib/use-admin-list";
import { API_URL } from "@/lib/api";

interface Article {
  id: string;
  title: string;
  category: string;
  status: string;
  createdAt: string;
  readTime: number;
}

function ArticlesList() {
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get("q") || "";

  const {
    items: articles,
    meta,
    isLoading,
    error,
    search,
    setSearch,
    status,
    setStatus,
    page,
    setPage,
    removeItem,
  } = useAdminList<Article>("/public/articles/admin/list", {
    limit: 10,
    initialSearch,
  });

  const handleDelete = async (id: string) => {
    if (!window.confirm("حذف شود؟")) return;
    try {
      const res = await fetch(`${API_URL}/public/articles/admin/${id}`, {
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
            مدیریت مقالات
          </h1>
          <p className="text-sm text-foreground-muted">
            ایجاد، ویرایش و حذف مقالات سایت.
          </p>
        </div>
        <Link
          href="/admin/articles/new"
          className="inline-flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-primary-light transition-colors"
        >
          <Plus size={16} /> مقاله جدید
        </Link>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex items-center gap-2">
          <AlertCircle size={18} /> {error}
        </div>
      )}

      <div className="bg-white border border-border rounded-2xl p-4 flex flex-col md:flex-row gap-4 justify-between items-center shadow-sm">
        <div className="relative w-full md:w-[350px]">
          <input
            type="text"
            placeholder="جستجوی مقاله..."
            aria-label="جستجوی مقاله"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-background border border-border rounded-xl py-2.5 pr-10 pl-4 text-sm focus:outline-none focus:border-accent"
          />
          <Search
            size={16}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-muted"
          />
        </div>
        <div className="flex items-center gap-2 bg-background border border-border rounded-xl px-3 py-1 w-full md:w-auto">
          <Filter size={16} className="text-foreground-muted" />
          <select
            aria-label="فیلتر وضعیت"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="bg-transparent py-1.5 text-sm focus:outline-none cursor-pointer w-full"
          >
            <option value="all">همه وضعیت‌ها</option>
            <option value="published">منتشر شده</option>
            <option value="draft">پیش‌نویس</option>
            <option value="review">در حال بررسی</option>
          </select>
        </div>
      </div>

      <div className="bg-white border border-border rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-right">
            <thead className="bg-background text-foreground-muted text-xs border-b border-border">
              <tr>
                <th className="px-6 py-4 font-medium">عنوان مقاله</th>
                <th className="px-6 py-4 font-medium">دسته‌بندی</th>
                <th className="px-6 py-4 font-medium">وضعیت</th>
                <th className="px-6 py-4 font-medium text-center">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {articles.length > 0 ? (
                articles.map((article) => (
                  <tr
                    key={article.id}
                    className="hover:bg-background/50 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="font-bold text-primary line-clamp-1">
                        {article.title}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-foreground-muted">
                      {article.category}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold ${article.status === "published" ? "bg-green-50 text-green-700" : article.status === "draft" ? "bg-orange-50 text-orange-700" : "bg-blue-50 text-blue-700"}`}
                      >
                        {article.status === "published"
                          ? "منتشر شده"
                          : article.status === "draft"
                            ? "پیش‌نویس"
                            : "در حال بررسی"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                        <Link
                          href={`/admin/articles/${article.id}/edit`}
                          aria-label={`ویرایش ${article.title}`}
                          className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-100"
                        >
                          <Edit size={14} />
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDelete(article.id)}
                          aria-label={`حذف ${article.title}`}
                          className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center hover:bg-red-100"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-12 text-center text-foreground-muted"
                  >
                    مقاله‌ای یافت نشد.
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

export default function AdminArticlesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center h-96 items-center">
          <Loader2 className="animate-spin text-accent" size={40} />
        </div>
      }
    >
      <ArticlesList />
    </Suspense>
  );
}
