"use client";

import { useState, useEffect } from "react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { API_URL } from "@/lib/api";
import { sanitizeHtml } from "@/lib/sanitize-html";
import {
  Mail,
  Phone,
  MapPin,
  SendHorizontal,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

interface Settings {
  siteTitle: string;
  contactEmail: string;
  phone: string;
  address: string;
  contactContent: string;
}

export default function ContactPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [settings, setSettings] = useState<Settings | null>(null);
  const [isSettingsLoading, setIsSettingsLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch(`${API_URL}/public/settings`);
        if (res.ok) {
          const json = await res.json();
          setSettings(json.data);
        }
      } catch (error) {
        console.error("Error fetching settings:", error);
      } finally {
        setIsSettingsLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);
    setFieldErrors({});

    const formData = new FormData(e.currentTarget);
    const consent = formData.get("consent") === "on";
    const data = {
      ...Object.fromEntries(formData.entries()),
      consent,
    };

    try {
      const res = await fetch(`${API_URL}/public/inquiries`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json();

      if (!res.ok) {
        if (json.error?.code === "VALIDATION_ERROR") {
          setFieldErrors(json.error.fields);
        }
        throw new Error(json.error?.message || "خطایی در ثبت درخواست رخ داد.");
      }

      setIsSuccess(true);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "خطای ناشناخته");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSettingsLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="animate-spin text-accent" size={40} />
      </div>
    );
  }

  return (
    <div className="pt-[120px] pb-24 bg-background min-h-screen relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-accent/5 rounded-full blur-[100px] pointer-events-none" />

      <Container className="relative z-10">
        <div className="text-center max-w-[600px] mx-auto mb-16">
          <h1 className="text-4xl md:text-5xl font-black text-primary mb-4">
            تماس با ما
          </h1>
          {/* 👇 متن داینامیک از دیتابیس (بدون مقدار پیش‌فرض) */}
          {settings?.contactContent && (
            <div
              className="text-foreground-muted text-lg prose prose-slate max-w-none"
              dangerouslySetInnerHTML={{
                __html: sanitizeHtml(settings.contactContent),
              }}
            />
          )}
        </div>

        <div className="bg-white rounded-3xl shadow-[0_20px_60px_-15px_rgba(15,30,51,.1)] overflow-hidden border border-border flex flex-col lg:flex-row max-w-[1100px] mx-auto">
          {/* ستون اطلاعات تماس */}
          <div className="w-full lg:w-[40%] bg-primary text-white p-10 md:p-12 relative overflow-hidden flex flex-col">
            <div className="absolute -right-20 -top-20 w-64 h-64 bg-accent/10 rounded-full blur-[40px] pointer-events-none" />

            <div className="relative z-10 flex-1">
              <h2 className="text-2xl font-bold mb-4">اطلاعات تماس</h2>
              <p className="text-white/70 text-sm leading-relaxed mb-10">
                برای شروع یک گفتگو با ما در ارتباط باشید.
              </p>

              <ul className="space-y-8">
                {/* 👇 شماره تماس (فقط اگر مقدار داشته باشد) */}
                {settings?.phone && (
                  <li className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0 text-accent-light">
                      <Phone size={18} />
                    </div>
                    <div>
                      <span className="block text-xs text-white/50 mb-1">
                        شماره تماس
                      </span>
                      <span className="font-semibold text-sm" dir="ltr">
                        {settings.phone}
                      </span>
                    </div>
                  </li>
                )}

                {/* 👇 ایمیل (فقط اگر مقدار داشته باشد) */}
                {settings?.contactEmail && (
                  <li className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0 text-accent-light">
                      <Mail size={18} />
                    </div>
                    <div>
                      <span className="block text-xs text-white/50 mb-1">
                        ایمیل
                      </span>
                      <span className="font-semibold text-sm" dir="ltr">
                        {settings.contactEmail}
                      </span>
                    </div>
                  </li>
                )}

                {/* 👇 آدرس (فقط اگر مقدار داشته باشد) */}
                {settings?.address && (
                  <li className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0 text-accent-light">
                      <MapPin size={18} />
                    </div>
                    <div>
                      <span className="block text-xs text-white/50 mb-1">
                        آدرس
                      </span>
                      <span className="font-semibold text-sm leading-relaxed">
                        {settings.address}
                      </span>
                    </div>
                  </li>
                )}
              </ul>
            </div>
          </div>

          {/* ستون فرم */}
          <div className="w-full lg:w-[60%] p-10 md:p-14 bg-white relative">
            {isSuccess ? (
              <div className="h-full flex flex-col items-center justify-center text-center animate-in fade-in zoom-in duration-500">
                <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center text-green-500 mb-6">
                  <CheckCircle2 size={40} />
                </div>
                <h2 className="text-2xl font-bold text-primary mb-4">
                  درخواست شما ثبت شد!
                </h2>
                <p className="text-foreground-muted mb-8 max-w-[300px]">
                  پیام شما با موفقیت دریافت شد. کارشناسان ما به‌زودی با شما تماس
                  خواهند گرفت.
                </p>
                <Button onClick={() => setIsSuccess(false)} variant="outline">
                  ارسال پیام جدید
                </Button>
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-bold text-primary mb-8">
                  فرم ثبت درخواست
                </h2>

                {errorMsg && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex items-center gap-2">
                    <AlertCircle size={18} /> {errorMsg}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label
                        htmlFor="fullName"
                        className="text-xs font-bold text-primary"
                      >
                        نام و نام خانوادگی{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        name="fullName"
                        id="fullName"
                        type="text"
                        autoComplete="name"
                        className={`w-full bg-transparent border-b-2 ${fieldErrors.fullName ? "border-red-500" : "border-border"} py-2 text-sm focus:outline-none focus:border-accent transition-colors`}
                        placeholder="مثلاً: علی محمدی"
                      />
                      {fieldErrors.fullName && (
                        <span className="text-[10px] text-red-500">
                          {fieldErrors.fullName}
                        </span>
                      )}
                    </div>
                    <div className="space-y-2">
                      <label
                        htmlFor="tel"
                        className="text-xs font-bold text-primary"
                      >
                        شماره تماس
                      </label>
                      <input
                        name="phone"
                        id="tel"
                        type="tel"
                        autoComplete="tel"
                        className={`w-full bg-transparent border-b-2 ${fieldErrors.phone ? "border-red-500" : "border-border"} py-2 text-sm focus:outline-none focus:border-accent transition-colors`}
                        placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                      />
                      {fieldErrors.phone && (
                        <span className="text-[10px] text-red-500">
                          {fieldErrors.phone}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label
                        htmlFor="email"
                        className="text-xs font-bold text-primary"
                      >
                        ایمیل
                      </label>
                      <input
                        name="email"
                        type="email"
                        id="email"
                        autoComplete="email"
                        className={`w-full bg-transparent border-b-2 ${fieldErrors.email ? "border-red-500" : "border-border"} py-2 text-sm focus:outline-none focus:border-accent transition-colors`}
                        placeholder="name@example.com"
                      />
                      {fieldErrors.email && (
                        <span className="text-[10px] text-red-500">
                          {fieldErrors.email}
                        </span>
                      )}
                    </div>
                    <div className="space-y-2">
                      <label
                        htmlFor="type"
                        className="text-xs font-bold text-primary"
                      >
                        موضوع درخواست <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="type"
                        id="type"
                        className="w-full bg-transparent border-b-2 border-border py-2 text-sm focus:outline-none focus:border-accent transition-colors appearance-none cursor-pointer"
                      >
                        <option value="">انتخاب کنید...</option>
                        <option value="legal">مشاوره حقوقی</option>
                        <option value="customs">موضوع گمرکی</option>
                        <option value="business">همکاری تجاری</option>
                        <option value="media">رسانه</option>
                        <option value="other">سایر</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="subject"
                      className="text-xs font-bold text-primary"
                    >
                      عنوان پیام <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="subject"
                      id="subject"
                      type="text"
                      className={`w-full bg-transparent border-b-2 ${fieldErrors.subject ? "border-red-500" : "border-border"} py-2 text-sm focus:outline-none focus:border-accent transition-colors`}
                      placeholder="موضوع پیام شما..."
                    />
                    {fieldErrors.subject && (
                      <span className="text-[10px] text-red-500">
                        {fieldErrors.subject}
                      </span>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="message"
                      className="text-xs font-bold text-primary"
                    >
                      پیام شما <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="message"
                      id="message"
                      rows={3}
                      className={`w-full bg-transparent border-b-2 ${fieldErrors.message ? "border-red-500" : "border-border"} py-2 text-sm focus:outline-none focus:border-accent transition-colors resize-none`}
                      placeholder="توضیحات خود را بنویسید..."
                    ></textarea>
                    {fieldErrors.message && (
                      <span className="text-[10px] text-red-500">
                        {fieldErrors.message}
                      </span>
                    )}
                  </div>

                  <div className="flex items-start gap-3 pt-2">
                    <input
                      type="checkbox"
                      name="consent"
                      required
                      id="consent"
                      className="mt-1 w-4 h-4 accent-accent cursor-pointer"
                    />
                    <label
                      htmlFor="consent"
                      className="text-[11px] text-foreground-muted leading-relaxed cursor-pointer"
                    >
                      با پردازش داده‌های خود برای پاسخ‌گویی موافقم.
                    </label>
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading}
                    variant="primary"
                    size="lg"
                    className="w-full mt-4 flex justify-between items-center group"
                  >
                    {isLoading ? (
                      <>
                        <span>در حال ارسال...</span>
                        <Loader2 size={18} className="animate-spin" />
                      </>
                    ) : (
                      <>
                        <span>ارسال پیام</span>
                        <SendHorizontal
                          size={18}
                          className="group-hover:-translate-x-1 group-hover:-translate-y-1 transition-transform"
                        />
                      </>
                    )}
                  </Button>
                </form>
              </>
            )}
          </div>
        </div>
      </Container>
    </div>
  );
}
