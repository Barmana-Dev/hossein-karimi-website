"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Plus,
  Edit,
  Shield,
  User,
  Loader2,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import { EditUserModal } from "@/components/admin/EditUserModal";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
}

const API_BASE = "http://localhost:4000/api/v1";
const USERS_ENDPOINT = `${API_BASE}/auth/admin/users`;

export default function AdminAccountsPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [deletingUser, setDeletingUser] = useState<AdminUser | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // گرفتن آیدی خودت (برای مخفی کردن دکمه حذف)
  useEffect(() => {
    fetch(`${API_BASE}/auth/me`, { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setCurrentUserId(d?.data?.id ?? null))
      .catch(() => {});
  }, []);

  useEffect(() => {
    let isMounted = true;
    const fetchUsers = async () => {
      try {
        const res = await fetch(USERS_ENDPOINT, { credentials: "include" });
        if (res.ok && isMounted) {
          setUsers((await res.json()).data);
        }
      } catch (error) {
        console.error(error);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    fetchUsers();
    return () => {
      isMounted = false;
    };
  }, []);

  const refreshUsers = async () => {
    try {
      const res = await fetch(USERS_ENDPOINT, { credentials: "include" });
      if (res.ok) setUsers((await res.json()).data);
    } catch (error) {
      console.error(error);
    }
  };

  // 👇 حذف با خواندن صحیح پیام خطا از ساختار بک‌اند
  const handleDelete = async () => {
    if (!deletingUser) return;
    setIsDeleting(true);
    setDeleteError(null);

    try {
      const res = await fetch(`${USERS_ENDPOINT}/${deletingUser.id}`, {
        method: "DELETE",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        // خواندن بدنه خطا (JSON یا متن)
        const text = await res.text().catch(() => "");
        let msg = `خطای ${res.status}`;
        try {
          const j = JSON.parse(text);
          // 👇 بک‌اند شما خطا رو داخل error.message می‌ذاره
          msg = j?.error?.message || j?.message || msg;
        } catch {
          if (text) msg = text;
        }
        setDeleteError(msg);
        setIsDeleting(false);
        return;
      }

      // موفق — حذف از state بدون نیاز به refresh
      setUsers((prev) => prev.filter((u) => u.id !== deletingUser.id));
      setDeletingUser(null);
      setDeleteError(null);
    } catch (error) {
      setDeleteError("خطای شبکه در حذف کاربر");
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center h-96 items-center">
        <Loader2 className="animate-spin text-accent" size={40} />
      </div>
    );
  }

  return (
    <div className="max-w-[1000px] mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-black text-primary">
          مدیریت کاربران ادمین
        </h1>
        <Link
          href="/admin/accounts/new"
          className="inline-flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl text-sm font-bold"
        >
          <Plus size={16} /> کاربر جدید
        </Link>
      </div>

      <div className="bg-white border border-border rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-sm text-right">
          <thead className="bg-background text-xs border-b border-border">
            <tr>
              <th className="px-6 py-4">کاربر</th>
              <th className="px-6 py-4">نقش</th>
              <th className="px-6 py-4">وضعیت</th>
              <th className="px-6 py-4 text-center">عملیات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {users.map((u) => {
              const isSelf = u.id === currentUserId;
              return (
                <tr key={u.id} className="hover:bg-background/50 group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-background border border-border flex items-center justify-center">
                        <User size={18} />
                      </div>
                      <div>
                        <div className="font-bold text-primary">{u.name}</div>
                        <div className="text-xs text-foreground-muted">
                          {u.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-accent/10 text-accent flex items-center gap-1 w-fit">
                      <Shield size={12} /> {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                        u.isActive
                          ? "bg-green-50 text-green-700"
                          : "bg-red-50 text-red-700"
                      }`}
                    >
                      {u.isActive ? "فعال" : "غیرفعال"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center gap-2 opacity-50 group-hover:opacity-100">
                      <button
                        onClick={() => setEditingUserId(u.id)}
                        className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-100 transition-colors"
                        title="ویرایش"
                      >
                        <Edit size={14} />
                      </button>

                      {/* 👇 دکمه حذف فقط برای غیر خودت */}
                      {!isSelf && (
                        <button
                          onClick={() => {
                            setDeleteError(null);
                            setDeletingUser(u);
                          }}
                          className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center hover:bg-red-100 transition-colors"
                          title="حذف"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {editingUserId && (
        <EditUserModal
          userId={editingUserId}
          onClose={() => setEditingUserId(null)}
          onSuccess={() => {
            setEditingUserId(null);
            refreshUsers();
          }}
        />
      )}

      {/* مودال حذف */}
      {deletingUser && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => !isDeleting && setDeletingUser(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                <AlertTriangle size={22} />
              </div>
              <div>
                <h3 className="font-bold text-primary">حذف کاربر</h3>
                <p className="text-xs text-foreground-muted mt-1">
                  آیا از حذف این کاربر مطمئن هستید؟
                </p>
              </div>
            </div>

            <div className="bg-background border border-border rounded-xl p-3 text-sm">
              <div className="font-bold text-primary">{deletingUser.name}</div>
              <div className="text-xs text-foreground-muted mt-0.5">
                {deletingUser.email}
              </div>
            </div>

            {deleteError && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl p-3 leading-relaxed">
                <div className="font-bold mb-1">خطا:</div>
                {deleteError}
              </div>
            )}

            <p className="text-xs text-red-600">
              ⚠️ این عملیات قابل بازگشت نیست.
            </p>

            <div className="flex gap-2 justify-end pt-2">
              <button
                onClick={() => {
                  setDeletingUser(null);
                  setDeleteError(null);
                }}
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
