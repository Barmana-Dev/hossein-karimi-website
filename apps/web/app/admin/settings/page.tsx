"use client";
import { useState, useEffect } from "react";
import {
  Save,
  Loader2,
  User,
  Globe,
  Share2,
  Search,
  AlertCircle,
  CheckCircle2,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { API_URL } from "@/lib/api";

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    siteTitle: "",
    subtitle: "",
    biographyShort: "",
    portraitImage: "",
    keyField: "",
    keyDegree: "",
    keyLanguages: "",
    contactEmail: "",
    phone: "",
    address: "",
    instagramUrl: "",
    linkedinUrl: "",
    telegramUrl: "",
    seoTitle: "",
    seoDescription: "",
    aboutContent: "",
    contactContent: "",
    termsContent: "",
    privacyContent: "",
  });

  // 👇 محو شدن خودکار پیغام موفقیت بعد از ۳ ثانیه
  useEffect(() => {
    if (successMsg) {
      const timer = setTimeout(() => setSuccessMsg(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMsg]);

  // 👇 محو شدن خودکار پیغام خطا بعد از ۵ ثانیه
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // 👇 اگر دریافت تنظیمات شکست بخورد، فرم خالی نباید با یک ذخیره،
  // داده‌های واقعی سایت را پاک کند.
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      setLoadError(null);
      try {
        const res = await fetch(`${API_URL}/public/settings`, {
          credentials: "include",
          cache: "no-store",
        });
        if (!res.ok) {
          setLoadError(
            "دریافت تنظیمات از سرور انجام نشد. برای جلوگیری از پاک شدن داده‌ها، ذخیره غیرفعال است.",
          );
          return;
        }
        const json = await res.json();
        if (json?.data) setFormData((prev) => ({ ...prev, ...json.data }));
      } catch (error) {
        console.error(error);
        setLoadError(
          "ارتباط با سرور برقرار نشد. برای جلوگیری از پاک شدن داده‌ها، ذخیره غیرفعال است.",
        );
      } finally {
        setIsFetching(false);
      }
    };
    fetchSettings();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    setError(null);
    setSuccessMsg(null);
    try {
      const res = await fetch(`${API_URL}/admin/settings`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
        credentials: "include",
      });

      const data = await res.json();
      if (!res.ok)
        throw new Error(data.error?.message || "خطا در ذخیره تنظیمات");

      setSuccessMsg("تنظیمات با موفقیت ذخیره شد.");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "خطای ناشناخته");
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching)
    return (
      <div className="flex justify-center h-96 items-center">
        <Loader2 className="animate-spin text-accent" size={40} />
      </div>
    );

  return (
    <div className="max-w-[1000px] mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-black text-primary">تنظیمات سایت</h1>
        <Button
          onClick={handleSave}
          disabled={isLoading || Boolean(loadError)}
          variant="primary"
          className="gap-2"
        >
          {isLoading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Save size={16} />
          )}{" "}
          ذخیره تغییرات
        </Button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-xl text-sm flex items-center gap-2">
          <AlertCircle size={18} /> {error}
        </div>
      )}
      {successMsg && (
        <div className="p-4 bg-green-50 text-green-700 rounded-xl text-sm flex items-center gap-2">
          <CheckCircle2 size={18} /> {successMsg}
        </div>
      )}
      {loadError && (
        <div
          role="alert"
          className="p-4 bg-orange-50 border border-orange-200 text-orange-800 rounded-xl text-sm flex flex-wrap items-center justify-between gap-3"
        >
          <span className="flex items-center gap-2">
            <AlertCircle size={18} /> {loadError}
          </span>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg text-xs font-bold"
          >
            تلاش دوباره
          </button>
        </div>
      )}

      {/* 👇 تب‌ها — تب «محتوا» اضافه شد */}
      <div className="flex gap-2 bg-white border border-border rounded-2xl p-2 shadow-sm overflow-x-auto">
        {[
          { id: "profile", label: "پروفایل", icon: User },
          { id: "contact", label: "اطلاعات تماس", icon: Globe },
          { id: "socials", label: "شبکه‌ها", icon: Share2 },
          { id: "seo", label: "سئو", icon: Search },
          { id: "content", label: "محتوای صفحات", icon: FileText },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap ${activeTab === tab.id ? "bg-primary text-white" : "text-foreground-muted hover:bg-background"}`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-white border border-border rounded-2xl p-6 md:p-8 shadow-sm">
        {activeTab === "profile" && (
          <div className="space-y-5">
            <div className="grid md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-xs font-bold">نام</label>
                <input
                  name="siteTitle"
                  value={formData.siteTitle || ""}
                  onChange={handleChange}
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold">شعار</label>
                <input
                  name="subtitle"
                  value={formData.subtitle || ""}
                  onChange={handleChange}
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold">بیوگرافی کوتاه</label>
              <textarea
                name="biographyShort"
                value={formData.biographyShort || ""}
                onChange={handleChange}
                rows={3}
                className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm resize-none"
              />
            </div>
            <div className="space-y-2 pt-4 border-t border-border">
              <label className="text-xs font-bold">آدرس تصویر پرتره</label>
              <input
                name="portraitImage"
                value={formData.portraitImage || ""}
                onChange={handleChange}
                dir="ltr"
                placeholder="/uploads/portrait.jpg"
                className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-left"
              />
            </div>
            <div className="grid md:grid-cols-3 gap-5 pt-4 border-t border-border">
              <div className="space-y-2">
                <label className="text-xs font-bold">حوزه فعالیت (کلیدی)</label>
                <input
                  name="keyField"
                  value={formData.keyField || ""}
                  onChange={handleChange}
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold">مدرک تحصیلی</label>
                <input
                  name="keyDegree"
                  value={formData.keyDegree || ""}
                  onChange={handleChange}
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold">زبان‌ها</label>
                <input
                  name="keyLanguages"
                  value={formData.keyLanguages || ""}
                  onChange={handleChange}
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === "contact" && (
          <div className="space-y-5">
            <div className="grid md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-xs font-bold">ایمیل</label>
                <input
                  name="contactEmail"
                  value={formData.contactEmail || ""}
                  onChange={handleChange}
                  dir="ltr"
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-left"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold">تلفن</label>
                <input
                  name="phone"
                  value={formData.phone || ""}
                  onChange={handleChange}
                  dir="ltr"
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-left"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold">آدرس</label>
              <textarea
                name="address"
                value={formData.address || ""}
                onChange={handleChange}
                rows={2}
                className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm resize-none"
              />
            </div>
          </div>
        )}

        {activeTab === "socials" && (
          <div className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-bold">اینستاگرام</label>
              <input
                name="instagramUrl"
                value={formData.instagramUrl || ""}
                onChange={handleChange}
                dir="ltr"
                className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-left"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold">لینکدین</label>
              <input
                name="linkedinUrl"
                value={formData.linkedinUrl || ""}
                onChange={handleChange}
                dir="ltr"
                className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-left"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold">تلگرام</label>
              <input
                name="telegramUrl"
                value={formData.telegramUrl || ""}
                onChange={handleChange}
                dir="ltr"
                className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-left"
              />
            </div>
          </div>
        )}

        {activeTab === "seo" && (
          <div className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-bold">Meta Title</label>
              <input
                name="seoTitle"
                value={formData.seoTitle || ""}
                onChange={handleChange}
                className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold">Meta Description</label>
              <textarea
                name="seoDescription"
                value={formData.seoDescription || ""}
                onChange={handleChange}
                rows={3}
                className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm resize-none"
              />
            </div>
          </div>
        )}

        {/* 👇 تب محتوای صفحات */}
        {activeTab === "content" && (
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold">محتوای صفحه درباره ما</label>
              <textarea
                name="aboutContent"
                value={formData.aboutContent || ""}
                onChange={handleChange}
                rows={8}
                className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm resize-y"
                placeholder="متن کامل صفحه درباره ما..."
              />
            </div>
            <div className="space-y-2 pt-4 border-t border-border">
              <label className="text-xs font-bold">
                محتوای صفحه تماس با ما
              </label>
              <textarea
                name="contactContent"
                value={formData.contactContent || ""}
                onChange={handleChange}
                rows={6}
                className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm resize-y"
                placeholder="متن کامل صفحه تماس با ما..."
              />
            </div>
            <div className="space-y-2 pt-4 border-t border-border">
              <label className="text-xs font-bold">
                محتوای صفحه قوانین و مقررات
              </label>
              <textarea
                name="termsContent"
                value={formData.termsContent || ""}
                onChange={handleChange}
                rows={6}
                className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm resize-y"
                placeholder="متن کامل صفحه قوانین و مقررات..."
              />
            </div>
            <div className="space-y-2 pt-4 border-t border-border">
              <label className="text-xs font-bold">
                محتوای صفحه حریم خصوصی
              </label>
              <textarea
                name="privacyContent"
                value={formData.privacyContent || ""}
                onChange={handleChange}
                rows={6}
                className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm resize-y"
                placeholder="متن کامل صفحه حریم خصوصی..."
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
