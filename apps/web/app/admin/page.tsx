"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { API_URL } from "@/lib/api";
import {
  FileText,
  FileEdit,
  MessageSquare,
  Building2,
  Activity,
  Loader2,
  Trash2,
  AlertCircle,
} from "lucide-react";

interface DashboardStats {
  articles: { published: number; drafts: number };
  inquiries: {
    new: number;
    recent: {
      id: string;
      fullName: string;
      subject: string;
      status: string;
      createdAt: string;
    }[];
  };
  agencies: { total: number };
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userName, setUserName] = useState<string>("مدیر");

  // 👇 state های جدید برای حذف
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchDashboardData = async () => {
      try {
        const userRes = await fetch(`${API_URL}/auth/me`, {
          credentials: "include",
        });
        let role = "EDITOR";
        if (userRes.ok) {
          const userData = await userRes.json();
          role = userData.data.role;
          if (isMounted) {
            setUserRole(role);
            setUserName(userData.data.name);
          }
        }

        const statsRes = await fetch(`${API_URL}/admin/dashboard`, {
          credentials: "include",
        });
        if (statsRes.ok && isMounted) {
          const statsData = await statsRes.json();
          setStats(statsData.data);
        }
      } catch (error) {
        console.error(error);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    fetchDashboardData();
    return () => {
      isMounted = false;
    };
  }, []);

  // 👇 تابع حذف درخواست
  const handleDelete = async () => {
    if (!deletingId) return;
    setIsDeleting(true);
    setDeleteError(null);

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
        setDeleteError(msg);
        setIsDeleting(false);
        return;
      }

      // 👇 حذف از state (بدون نیاز به refresh)
      setStats((prev) =>
        prev
          ? {
              ...prev,
              inquiries: {
                ...prev.inquiries,
                recent: prev.inquiries.recent.filter(
                  (i) => i.id !== deletingId,
                ),
                new: Math.max(0, prev.inquiries.new - 1),
              },
            }
          : prev,
      );
      setDeletingId(null);
    } catch {
      setDeleteError("خطای شبکه در حذف درخواست");
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading || !stats) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="animate-spin text-accent" size={40} />
      </div>
    );
  }

  const isInquiryManager = userRole === "INQUIRY_MANAGER";

  return (
    <div className="max-w-[1400px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-primary mb-1">
            خوش آمدید {userName}
          </h1>
          <p className="text-sm text-foreground-muted">
            {userRole === "SUPER_ADMIN"
              ? "مدیر ارشد سیستم"
              : userRole === "EDITOR"
                ? "نویسنده محتوا"
                : "مدیر درخواست‌ها"}{" "}
            — خلاصه‌ای از وضعیت سایت.
          </p>
        </div>
        {!isInquiryManager && (
          <Link
            href="/admin/articles/new"
            className="inline-flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-primary-light transition-colors"
          >
            <FileText size={16} />
            ایجاد مقاله جدید
          </Link>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white border border-border rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
              <MessageSquare size={24} />
            </div>
            <span className="text-[11px] font-bold text-green-600 bg-green-50 px-2 py-1 rounded-md">
              جدید
            </span>
          </div>
          <h3 className="text-3xl font-black text-primary mb-1">
            {stats.inquiries.new}
          </h3>
          <p className="text-sm font-medium text-foreground-muted">
            درخواست‌های جدید
          </p>
        </div>

        {!isInquiryManager && (
          <>
            <div className="bg-white border border-border rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <FileText size={24} />
                </div>
              </div>
              <h3 className="text-3xl font-black text-primary mb-1">
                {stats.articles.published}
              </h3>
              <p className="text-sm font-medium text-foreground-muted">
                مقالات منتشر شده
              </p>
            </div>

            <div className="bg-white border border-border rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
                  <FileEdit size={24} />
                </div>
              </div>
              <h3 className="text-3xl font-black text-primary mb-1">
                {stats.articles.drafts}
              </h3>
              <p className="text-sm font-medium text-foreground-muted">
                مقالات پیش‌نویس
              </p>
            </div>

            <div className="bg-white border border-border rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-accent/10 text-accent flex items-center justify-center">
                  <Building2 size={24} />
                </div>
              </div>
              <h3 className="text-3xl font-black text-primary mb-1">
                {stats.agencies.total}
              </h3>
              <p className="text-sm font-medium text-foreground-muted">
                کارگزاری‌های ثبت شده
              </p>
            </div>
          </>
        )}
      </div>

      {/* 👇 خطای حذف */}
      {deleteError && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex items-center gap-2">
          <AlertCircle size={18} /> {deleteError}
        </div>
      )}

      {/* Recent Activity Table */}
      <div className="bg-white border border-border rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-border flex items-center justify-between">
          <h2 className="text-lg font-bold text-primary flex items-center gap-2">
            <Activity size={18} className="text-accent" /> آخرین درخواست‌های
            ارتباط
          </h2>
          <Link
            href="/admin/inquiries"
            className="text-xs font-bold text-accent hover:underline"
          >
            مشاهده همه
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-right">
            <thead className="bg-background text-foreground-muted text-xs">
              <tr>
                <th className="px-6 py-4 font-medium">نام فرستنده</th>
                <th className="px-6 py-4 font-medium">موضوع</th>
                <th className="px-6 py-4 font-medium">تاریخ</th>
                <th className="px-6 py-4 font-medium">وضعیت</th>
                <th className="px-6 py-4 font-medium">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {stats.inquiries.recent.map((inquiry) => (
                <tr
                  key={inquiry.id}
                  className="hover:bg-background/50 transition-colors group"
                >
                  <td className="px-6 py-4 font-bold text-primary">
                    {inquiry.fullName}
                  </td>
                  <td className="px-6 py-4 text-foreground-muted line-clamp-1">
                    {inquiry.subject}
                  </td>
                  <td className="px-6 py-4 text-foreground-muted">
                    {new Date(inquiry.createdAt).toLocaleDateString("fa-IR")}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold ${
                        inquiry.status === "new"
                          ? "bg-blue-50 text-blue-700"
                          : inquiry.status === "in_review"
                            ? "bg-orange-50 text-orange-700"
                            : inquiry.status === "contacted"
                              ? "bg-purple-50 text-purple-700"
                              : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {inquiry.status === "new"
                        ? "جدید"
                        : inquiry.status === "in_review"
                          ? "در حال بررسی"
                          : inquiry.status === "contacted"
                            ? "تماس گرفته شده"
                            : "بسته شده"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {/* 👇 مشاهده + حذف */}
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/admin/inquiries/${inquiry.id}`}
                        className="text-accent text-xs font-bold hover:underline"
                      >
                        مشاهده
                      </Link>
                      <button
                        onClick={() => {
                          setDeleteError(null);
                          setDeletingId(inquiry.id);
                        }}
                        className="w-7 h-7 rounded-lg bg-red-50 text-red-600 flex items-center justify-center hover:bg-red-100 transition-colors opacity-60 group-hover:opacity-100"
                        title="حذف"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {stats.inquiries.recent.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-foreground-muted"
                  >
                    درخواستی برای نمایش وجود ندارد.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

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
