"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Search, Edit, Trash2, Loader2, ShieldCheck } from "lucide-react";
import { API_URL } from "@/lib/api";

interface Agency {
  id: string;
  name: string;
  field: string;
  relationType: string;
  status: string;
  featured: boolean;
}

export default function AdminNetworkPage() {
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchAgencies = async () => {
      try {
        const res = await fetch(`${API_URL}/public/network/admin/list`, {
          credentials: "include",
        });
        if (res.ok) setAgencies((await res.json()).data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAgencies();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm("آیا از حذف مطمئن هستید؟")) return;
    try {
      const res = await fetch(`${API_URL}/public/network/admin/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) setAgencies((prev) => prev.filter((a) => a.id !== id));
    } catch (error) {
      console.error(error);
    }
  };

  const filtered = agencies.filter(
    (a) => a.name.includes(searchTerm) || a.field.includes(searchTerm),
  );

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
            مدیریت شبکه کارگزاری‌ها
          </h1>
          <p className="text-sm text-foreground-muted">
            ایجاد، ویرایش و مدیریت مجموعه‌ها.
          </p>
        </div>
        <Link
          href="/admin/network/new"
          className="inline-flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-primary-light"
        >
          <Plus size={16} /> کارگزاری جدید
        </Link>
      </div>
      <div className="bg-white border border-border rounded-2xl p-4 shadow-sm">
        <div className="relative w-full md:w-[350px]">
          <input
            type="text"
            placeholder="جستجو..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-background border border-border rounded-xl py-2.5 pr-10 pl-4 text-sm focus:outline-none"
          />
          <Search
            size={16}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-muted"
          />
        </div>
      </div>
      <div className="bg-white border border-border rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full text-sm text-right">
          <thead className="bg-background text-foreground-muted text-xs border-b border-border">
            <tr>
              <th className="px-6 py-4">نام مجموعه</th>
              <th className="px-6 py-4">حوزه</th>
              <th className="px-6 py-4">نوع ارتباط</th>
              <th className="px-6 py-4">وضعیت</th>
              <th className="px-6 py-4 text-center">عملیات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map((agency) => (
              <tr key={agency.id} className="hover:bg-background/50 group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center font-black text-lg">
                      {agency.name.charAt(0)}
                    </div>
                    <div className="font-bold text-primary">{agency.name}</div>
                  </div>
                </td>
                <td className="px-6 py-4 text-foreground-muted">
                  {agency.field}
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold bg-background border border-border text-primary">
                    <ShieldCheck size={12} className="text-accent" />
                    {agency.relationType}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${agency.status === "published" ? "bg-green-50 text-green-700" : "bg-orange-50 text-orange-700"}`}
                  >
                    {agency.status === "published" ? "منتشر شده" : "پیش‌نویس"}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-center gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                    <Link
                      href={`/admin/network/${agency.id}/edit`}
                      className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center"
                    >
                      <Edit size={14} />
                    </Link>
                    <button
                      onClick={() => handleDelete(agency.id)}
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
      </div>
    </div>
  );
}
