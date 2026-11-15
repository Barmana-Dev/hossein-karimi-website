"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { API_URL } from "@/lib/api";
import {
  Search,
  Eye,
  Filter,
  Loader2,
  MessageSquare,
  AlertCircle,
  Trash2,
} from "lucide-react";
import { toPersianNumber } from "@/lib/utils";

interface Inquiry {
  id: string;
  fullName: string;
  subject: string;
  type: string;
  createdAt: string;
  status: string;
}
const ITEMS_PER_PAGE = 10;

const statusLabels: Record<string, { label: string; color: string }> = {
  new: { label: "جدید", color: "bg-blue-50 text-blue-700 border-blue-200" },
  in_review: {
    label: "در حال بررسی",
    color: "bg-orange-50 text-orange-700 border-orange-200",
  },
  contacted: {
    label: "تماس گرفته شده",
    color: "bg-purple-50 text-purple-700 border-purple-200",
  },
  closed: {
    label: "بسته شده",
    color: "bg-gray-100 text-gray-700 border-gray-200",
  },
};

export default function AdminInquiriesPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  // 👇 state های جدید برای حذف
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    const fetchInquiries = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_URL}/public/inquiries/admin/list`, {
          credentials: "include",
          signal: controller.signal,
        });

        if (!res.ok) {
          throw new Error("خطا در دریافت اطلاعات از سرور");
        }

        const json = await res.json();
        setInquiries(json.data);
      } catch (err: unknown) {
        if (err instanceof Error) {
          if (err.name !== "AbortError") {
            setError(err.message || "خطای ناشناخته");
          }
        } else {
          setError("خطای ناشناخته رخ داد");
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    fetchInquiries();

    return () => {
      controller.abort();
    };
  }, []);

  // 👇 تابع حذف درخواست
  const handleDelete = async () => {
    if (!deletingId) return;
    setIsDeleting(true);
    setError(null);

    try {
      const res = await fetch(
        `${API_URL}/public/inquiries/admin/${deletingId}`,
        {
          method: "DELETE",
          credentials: "include",
        },
      );

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        let msg = `خطای ${res.status}`;
        try {
          const j = JSON.parse(text);
          msg = j?.error?.message || j?.message || msg;
        } catch {
          if (text) msg = text;
        }
        setError(msg);
        setIsDeleting(false);
        return;
      }

      // 👇 حذف از state (بدون نیاز به refresh)
      setInquiries((prev) => prev.filter((i) => i.id !== deletingId));
      setDeletingId(null);
    } catch {
      setError("خطای شبکه در حذف درخواست");
    } finally {
      setIsDeleting(false);
    }
  };

  const filtered = inquiries.filter((inq) => {
    const matchesSearch =
      inq.fullName.includes(searchTerm) || inq.subject.includes(searchTerm);
    const matchesStatus = statusFilter === "all" || inq.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedInquiries = filtered.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE,
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="animate-spin text-accent" size={40} />
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-primary mb-1">
          درخواست‌های ارتباط
        </h1>
        <p className="text-sm text-foreground-muted">
          مدیریت پیام‌های دریافتی از فرم تماس سایت.
        </p>
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
            placeholder="جستجوی نام یا موضوع..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-background border border-border rounded-xl py-2.5 pr-10 pl-4 text-sm focus:outline-none"
          />
          <Search
            size={16}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-muted"
          />
        </div>
        <div className="flex items-center gap-2 bg-background border border-border rounded-xl px-3 py-1 w-full md:w-auto">
          <Filter size={16} className="text-foreground-muted" />
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-transparent py-1.5 text-sm focus:outline-none w-full"
          >
            <option value="all">همه وضعیت‌ها</option>
            <option value="new">جدید</option>
            <option value="in_review">در حال بررسی</option>
            <option value="contacted">تماس گرفته شده</option>
            <option value="closed">بسته شده</option>
          </select>
        </div>
      </div>

      <div className="bg-white border border-border rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-sm text-right">
          <thead className="bg-background text-foreground-muted text-xs border-b border-border">
            <tr>
              <th className="px-6 py-4">نام فرستنده</th>
              <th className="px-6 py-4">موضوع</th>
              <th className="px-6 py-4">نوع</th>
              <th className="px-6 py-4">وضعیت</th>
              <th className="px-6 py-4 text-center">عملیات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {paginatedInquiries.map((inq) => (
              <tr key={inq.id} className="hover:bg-background/50 group">
                <td className="px-6 py-4 font-bold text-primary">
                  {inq.fullName}
                </td>
                <td className="px-6 py-4 text-foreground-muted line-clamp-1 max-w-[250px]">
                  {inq.subject}
                </td>
                <td className="px-6 py-4 text-foreground-muted text-xs">
                  {inq.type}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${statusLabels[inq.status]?.color || "bg-gray-100"}`}
                  >
                    {statusLabels[inq.status]?.label || inq.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {/* 👇 دکمه مشاهده + دکمه حذف */}
                  <div className="flex justify-center items-center gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                    <Link
                      href={`/admin/inquiries/${inq.id}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-bold hover:bg-primary-light"
                    >
                      <Eye size={14} /> مشاهده
                    </Link>
                    <button
                      onClick={() => setDeletingId(inq.id)}
                      className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center hover:bg-red-100 transition-colors"
                      title="حذف"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {paginatedInquiries.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-12 text-center text-foreground-muted"
                >
                  <MessageSquare
                    size={32}
                    className="mx-auto mb-2 opacity-20"
                  />{" "}
                  درخواستی یافت نشد.
                </td>
              </tr>
            )}
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

      {/* 👇 مودال تایید حذف */}
      {deletingId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => !isDeleting && setDeletingId(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                <AlertCircle size={22} />
              </div>
              <div>
                <h3 className="font-bold text-primary">حذف درخواست</h3>
                <p className="text-xs text-foreground-muted mt-1">
                  آیا از حذف این درخواست مطمئن هستید؟
                </p>
              </div>
            </div>

            <p className="text-xs text-red-600">
              ⚠️ این عملیات قابل بازگشت نیست.
            </p>

            <div className="flex gap-2 justify-end pt-2">
              <button
                onClick={() => setDeletingId(null)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl text-sm font-bold border border-border hover:bg-background disabled:opacity-50"
              >
                انصراف
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl text-sm font-bold bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 inline-flex items-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    در حال حذف...
                  </>
                ) : (
                  <>
                    <Trash2 size={14} />
                    حذف
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
