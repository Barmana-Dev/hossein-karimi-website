"use client";

import { useState, useEffect, useRef } from "react";
import {
  Search,
  Trash2,
  Upload,
  Image as ImageIcon,
  Copy,
  X,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { toPersianNumber } from "@/lib/utils";
import { API_URL, assetUrl } from "@/lib/api";

interface Asset {
  id: string;
  urlOrKey: string;
  mimeType: string;
  size: number;
  altText: string | null;
  createdAt: string;
}
const ITEMS_PER_PAGE = 12;

export default function MediaLibraryPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [reloadKey, setReloadKey] = useState(0);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 👇 جستجو با تأخیر تا با هر کلید درخواست به سرور نرود
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm.trim());
      setCurrentPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // 👇 فهرست از سرور صفحه‌بندی می‌شود تا کتابخانهٔ خیلی بزرگ هم سریع بماند
  useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;

    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      const params = new URLSearchParams({
        page: String(currentPage),
        limit: String(ITEMS_PER_PAGE),
      });
      if (debouncedSearch) params.set("q", debouncedSearch);

      try {
        const res = await fetch(
          `${API_URL}/public/media/list?${params.toString()}`,
          {
            credentials: "include",
            signal: controller.signal,
            cache: "no-store",
          },
        );
        if (!res.ok) throw new Error("دریافت کتابخانه رسانه انجام نشد");
        const json = await res.json();
        if (cancelled) return;

        const items: Asset[] = Array.isArray(json.data) ? json.data : [];
        setAssets(items);
        setTotalPages(json.meta?.totalPages ?? 1);
        setTotalItems(json.meta?.total ?? items.length);

        // صفحهٔ فعلی بعد از حذف خالی شده باشد → یک صفحه عقب
        if (items.length === 0 && currentPage > 1) {
          setCurrentPage((page) => Math.max(1, page - 1));
        }
      } catch (err) {
        if (cancelled || (err instanceof Error && err.name === "AbortError")) {
          return;
        }
        setLoadError(
          err instanceof Error ? err.message : "خطای ناشناخته در دریافت فایل‌ها",
        );
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    void load();
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [currentPage, debouncedSearch, reloadKey]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setUploadError(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setIsUploading(true);
    setUploadError(null);
    const formData = new FormData();
    formData.append("file", selectedFile);
    try {
      const res = await fetch(`${API_URL}/public/media/upload`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || "خطا در آپلود");
      closeModal();
      // 👇 فایل جدید در ابتدای فهرست است؛ به صفحهٔ اول برگرد
      setCurrentPage(1);
      setReloadKey((key) => key + 1);
    } catch (err: unknown) {
      setUploadError(err instanceof Error ? err.message : "خطای ناشناخته");
    } finally {
      setIsUploading(false);
    }
  };

  const closeModal = () => {
    setIsUploadModalOpen(false);
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDeleteAsset = async (id: string) => {
    if (!window.confirm("آیا از حذف این فایل مطمئن هستید؟")) return;
    try {
      const res = await fetch(`${API_URL}/public/media/asset/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        // 👇 فهرست و شمارش از سرور دوباره خوانده می‌شود
        setReloadKey((key) => key + 1);
      } else alert("خطا در حذف فایل");
    } catch (error) {
      console.error(error);
      alert("خطا در ارتباط با سرور");
    }
  };

  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(assetUrl(url));
    alert("لینک تصویر کپی شد!");
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-primary mb-1">
            کتابخانه رسانه
          </h1>
          <p className="text-sm text-foreground-muted">
            مدیریت تصاویر و فایل‌های آپلود شده.
          </p>
        </div>
        <button
          onClick={() => setIsUploadModalOpen(true)}
          className="inline-flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-primary-light transition-colors shadow-lg shadow-primary/20"
        >
          <Upload size={16} /> آپلود فایل جدید
        </button>
      </div>

      <div className="bg-white border border-border rounded-2xl p-4 flex flex-col md:flex-row gap-4 justify-between items-center shadow-sm">
        <div className="relative w-full md:w-[350px]">
          <input
            type="text"
            placeholder="جستجوی نام فایل..."
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
        {totalItems > 0 && (
          <span className="text-xs text-foreground-muted">
            {toPersianNumber(totalItems)} فایل
          </span>
        )}
      </div>

      {loadError && (
        <div
          role="alert"
          className="bg-white border border-red-200 rounded-2xl p-8 text-center space-y-4"
        >
          <p className="text-sm text-red-700">{loadError}</p>
          <button
            onClick={() => setReloadKey((key) => key + 1)}
            className="inline-flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl text-sm font-bold"
          >
            تلاش دوباره
          </button>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-accent" size={40} />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {assets.map((asset) => (
              <div
                key={asset.id}
                className="bg-white border border-border rounded-2xl overflow-hidden shadow-sm group hover:shadow-md transition-all"
              >
                <div className="aspect-[4/3] bg-background flex items-center justify-center relative overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img loading="lazy" decoding="async"
                    src={assetUrl(asset.urlOrKey)}
                    alt={asset.altText || "تصویر"}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-primary/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-sm">
                    <button
                      onClick={() => handleCopyLink(asset.urlOrKey)}
                      className="w-10 h-10 rounded-full bg-white text-primary flex items-center justify-center hover:bg-accent hover:text-white transition-colors"
                      title="کپی لینک"
                    >
                      <Copy size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteAsset(asset.id)}
                      className="w-10 h-10 rounded-full bg-white text-red-600 flex items-center justify-center hover:bg-red-600 hover:text-white transition-colors"
                      title="حذف"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <div className="p-4">
                  <h3
                    className="text-sm font-bold text-primary truncate"
                    title={asset.altText || "بدون نام"}
                  >
                    {asset.altText || "بدون نام"}
                  </h3>
                  <div className="flex items-center justify-between text-xs text-foreground-muted mt-2">
                    <span>{Math.round(asset.size / 1024)} KB</span>
                    <span>
                      {new Date(asset.createdAt).toLocaleDateString("fa-IR")}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            {assets.length === 0 && !loadError && (
              <div className="col-span-full text-center py-20 bg-white border border-border rounded-2xl">
                <ImageIcon size={48} className="mx-auto text-border mb-4" />
                <p className="text-foreground-muted">فایلی یافت نشد.</p>
              </div>
            )}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-12">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 rounded-lg border border-border bg-white text-sm font-bold text-primary disabled:opacity-50 disabled:cursor-not-allowed hover:bg-background transition-colors"
              >
                قبلی
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`w-10 h-10 rounded-lg text-sm font-bold transition-colors ${currentPage === page ? "bg-primary text-white" : "bg-white border border-border text-primary hover:bg-background"}`}
                  >
                    {toPersianNumber(page)}
                  </button>
                ),
              )}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-4 py-2 rounded-lg border border-border bg-white text-sm font-bold text-primary disabled:opacity-50 disabled:cursor-not-allowed hover:bg-background transition-colors"
              >
                بعدی
              </button>
            </div>
          )}
        </>
      )}

      {/* مودال آپلود */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-[500px] shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-lg font-bold text-primary">
                آپلود فایل جدید
              </h2>
              <button
                onClick={closeModal}
                className="text-foreground-muted hover:text-primary"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
              />
              {uploadError && (
                <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg">
                  {uploadError}
                </div>
              )}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center justify-center text-center hover:bg-background transition-colors cursor-pointer group min-h-[200px]"
              >
                {previewUrl ? (
                  <div className="w-full">
                    <div className="relative w-full h-40 rounded-lg overflow-hidden mb-3 border border-border">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img loading="lazy" decoding="async"
                        src={previewUrl}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex items-center justify-center gap-2 text-sm font-bold text-primary">
                      <CheckCircle2 size={16} className="text-green-500" />
                      {selectedFile?.name}
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="w-16 h-16 rounded-full bg-primary/5 flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform">
                      <Upload size={24} />
                    </div>
                    <h3 className="text-sm font-bold text-primary mb-1">
                      فایل خود را اینجا رها کنید
                    </h3>
                    <p className="text-xs text-foreground-muted mb-4">
                      یا برای انتخاب کلیک کنید
                    </p>
                  </>
                )}
              </div>
            </div>
            <div className="p-6 border-t border-border flex justify-end gap-3 bg-background rounded-b-2xl">
              <Button variant="outline" onClick={closeModal}>
                انصراف
              </Button>
              <Button
                variant="primary"
                onClick={handleUpload}
                disabled={!selectedFile || isUploading}
                className="gap-2"
              >
                {isUploading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Upload size={16} />
                )}{" "}
                {isUploading ? "در حال آپلود..." : "شروع آپلود"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
