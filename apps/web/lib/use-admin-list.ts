"use client";

import { useEffect, useState } from "react";
import { API_URL } from "@/lib/api";

export interface ListMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface UseAdminListOptions {
  limit?: number;
  initialSearch?: string;
  /** فیلترهای اضافی مثل { type: "news" } که مستقیم به API ارسال می‌شوند */
  extraQuery?: Record<string, string>;
}

/**
 * دریافت لیست صفحه‌بندی‌شده از سرور.
 * جستجو با تأخیر ۳۵۰ میلی‌ثانیه و فیلتر وضعیت از سمت سرور اعمال می‌شود.
 */
export function useAdminList<T>(
  path: string,
  { limit = 10, initialSearch = "", extraQuery }: UseAdminListOptions = {},
) {
  const [items, setItems] = useState<T[]>([]);
  const [meta, setMeta] = useState<ListMeta>({
    page: 1,
    limit,
    total: 0,
    totalPages: 1,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState(initialSearch);
  const [status, setStatus] = useState("all");
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch);
  const [reloadKey, setReloadKey] = useState(0);
  const extraQueryKey = JSON.stringify(extraQuery ?? {});

  // تأخیر جستجو تا با هر کلید درخواست به سرور نرود
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;

    const run = async () => {
      // 👇 با تغییر صفحه/جستجو هم حالت بارگذاری فعال می‌شود؛ در غیر این صورت
      // فهرست قدیمی بدون هیچ نشانه‌ای نمایش داده می‌شد.
      setIsLoading(true);
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
      });
      if (debouncedSearch) params.set("q", debouncedSearch);
      if (status !== "all") params.set("status", status);
      const extra = JSON.parse(extraQueryKey) as Record<string, string>;
      for (const [key, value] of Object.entries(extra)) {
        if (value && value !== "all") params.set(key, value);
      }

      try {
        const res = await fetch(`${API_URL}${path}?${params.toString()}`, {
          credentials: "include",
          signal: controller.signal,
        });
        if (!res.ok) throw new Error("خطا در دریافت اطلاعات");
        const json = await res.json();
        if (cancelled) return;

        const nextItems: T[] = json.data ?? [];
        const nextMeta: ListMeta = json.meta ?? {
          page: 1,
          limit,
          total: nextItems.length,
          totalPages: 1,
        };

        // اگر صفحهٔ فعلی بعد از حذف/فیلتر خالی شد، یک صفحه به عقب برگرد
        if (nextItems.length === 0 && nextMeta.page > 1) {
          setPage(nextMeta.page - 1);
          return;
        }

        setItems(nextItems);
        setMeta(nextMeta);
        setError(null);
      } catch (err) {
        if (cancelled || (err instanceof Error && err.name === "AbortError")) {
          return;
        }
        setError(err instanceof Error ? err.message : "خطای ناشناخته");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    void run();
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [
    path,
    page,
    limit,
    debouncedSearch,
    status,
    reloadKey,
    extraQueryKey,
  ]);

  const changeSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const changeStatus = (value: string) => {
    setStatus(value);
    setPage(1);
  };

  return {
    items,
    meta,
    isLoading,
    error,
    page,
    setPage,
    search,
    setSearch: changeSearch,
    status,
    setStatus: changeStatus,
    reload: () => setReloadKey((key) => key + 1),
    removeItem: (id: string) =>
      setItems((prev) =>
        prev.filter((item) => (item as { id?: string }).id !== id),
      ),
  };
}
