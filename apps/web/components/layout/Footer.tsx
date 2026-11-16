"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Mail, Phone, MapPin, SendHorizontal, Loader2 } from "lucide-react";
import { API_URL } from "@/lib/api";
import logo from "../../../../public/images/logo.webp";
import Image from "next/image";

// 👇 لینک‌ها ثابت هستند (چون ساختار سایت تغییر نمی‌کند)
const sections = [
  {
    title: "صفحات اصلی",
    links: [
      { label: "صفحه اصلی", href: "/" },
      { label: "درباره من", href: "/about" },
      { label: "سوابق حرفه‌ای", href: "/experience" },
      { label: "شبکه کارگزاری‌ها", href: "/network" },
    ],
  },
  {
    title: "محتوا و خدمات",
    links: [
      { label: "حوزه‌های تخصصی", href: "/expertise" },
      { label: "مقالات و دیدگاه‌ها", href: "/insights" },
      { label: "رسانه و رویدادها", href: "/media" },
      { label: "درخواست ارتباط", href: "/contact" },
    ],
  },
  {
    title: "شرایط استفاده",
    links: [
      { label: "قوانین و مقررات", href: "/terms" },
      { label: "حریم خصوصی", href: "/privacy" },
    ],
  },
];

interface Settings {
  siteTitle: string;
  subtitle: string;
  biographyShort: string;
  contactEmail: string;
  phone: string;
  address: string;
  instagramUrl: string | null;
  linkedinUrl: string | null;
  telegramUrl: string | null;
}

export function Footer() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch(`${API_URL}/public/settings`);
        if (res.ok) {
          const json = await res.json();
          setSettings(json.data);
        }
      } catch (error) {
        console.error("Error fetching settings for footer:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSettings();
  }, []);

  if (isLoading) {
    return (
      <footer className="relative bg-primary text-white/70 overflow-hidden isolate">
        <div className="absolute inset-0 -z-20 bg-hero-gradient opacity-95" />
        <div className="relative z-10 max-w-[1220px] mx-auto px-6 md:px-7 py-8 flex items-center justify-center h-64">
          <Loader2 className="animate-spin text-accent" size={32} />
        </div>
      </footer>
    );
  }

  return (
    <footer className="relative bg-primary text-white/70 overflow-hidden isolate">
      {/* ====== پس‌زمینه جذاب ====== */}
      <div className="absolute inset-0 -z-20 bg-hero-gradient opacity-95" />
      <div
        className="absolute inset-0 -z-20 bg-grid-pattern bg-[length:64px_64px] opacity-100"
        style={{
          maskImage:
            "radial-gradient(ellipse 80% 70% at 50% 50%, #000 20%, transparent 75%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 80% 70% at 50% 50%, #000 20%, transparent 75%)",
        }}
      />
      <div className="absolute inset-0 -z-10 pointer-events-none overflow-hidden">
        <div className="absolute w-[600px] h-[600px] -left-[200px] top-1/2 -translate-y-1/2 rounded-full border border-accent/[.12]" />
        <div className="absolute w-[900px] h-[900px] -left-[350px] top-1/2 -translate-y-1/2 rounded-full border border-accent/[.07]" />
      </div>

      <div className="relative z-10 max-w-[1220px] mx-auto px-6 md:px-7 pt-8 pb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1.2fr] gap-6 lg:gap-6">
          {/* ستون برند */}
          <div>
            <Link
              href="/"
              className="flex items-center gap-2.5 mb-3 group w-fit"
            >
              {/* 👇 لوگو ثابت است (چون بخشی از هویت بصری است) */}
              <div className="w-15 h-15 rounded-full bg-gradient-to-br from-primary-light to-primary-dark flex items-center justify-center text-accent-light overflow-hidden font-black text-base shadow-lg border border-white/10 group-hover:border-accent/40 transition-colors">
                <Image
                  src={logo}
                  alt="لوگوی سایت"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                {/* 👇 نام و شعار فقط اگر وجود داشته باشند */}
                {settings?.siteTitle && (
                  <strong className="block text-white text-[15px] font-extrabold leading-tight">
                    {settings.siteTitle}
                  </strong>
                )}
                {settings?.subtitle && (
                  <span className="text-[10px] text-accent-light tracking-wider">
                    {settings.subtitle}
                  </span>
                )}
              </div>
            </Link>

            {/* 👇 بیوگرافی کوتاه داینامیک (فقط اگر وجود داشته باشد) */}
            {settings?.biographyShort && (
              <p className="text-[13px] leading-[1.7] mb-4 max-w-[280px]">
                {settings.biographyShort}
              </p>
            )}

            {/* شبکه‌های اجتماعی */}
            <div className="flex items-center gap-2.5 mt-4">
              {settings?.instagramUrl && (
                <a
                  href={settings.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-bold text-white/70 hover:bg-accent hover:text-white hover:border-accent transition-all duration-300"
                  aria-label="اینستاگرام"
                >
                  IG
                </a>
              )}
              {settings?.linkedinUrl && (
                <a
                  href={settings.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-bold text-white/70 hover:bg-accent hover:text-white hover:border-accent transition-all duration-300"
                  aria-label="لینکدین"
                >
                  IN
                </a>
              )}
              {settings?.telegramUrl && (
                <a
                  href={settings.telegramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/70 hover:bg-accent hover:text-white hover:border-accent transition-all duration-300"
                  aria-label="تلگرام"
                >
                  <SendHorizontal size={14} />
                </a>
              )}
            </div>
          </div>

          {/* لینک‌ها */}
          {sections.map((section) => (
            <div key={section.title}>
              <h4 className="text-white font-bold mb-3 text-sm">
                {section.title}
              </h4>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="group inline-flex items-center gap-2 text-[13px] text-white/60 hover:text-accent transition-colors"
                    >
                      <span className="w-1 h-1 rounded-full bg-white/20 group-hover:bg-accent transition-colors" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* اطلاعات تماس */}
          <div>
            <h4 className="text-white font-bold mb-3 text-sm">اطلاعات تماس</h4>
            <ul className="space-y-3">
              {settings?.phone && (
                <li className="flex items-center gap-2.5">
                  <Phone size={14} className="text-accent shrink-0" />
                  <span
                    className="text-[13px] font-medium text-white/80"
                    dir="ltr"
                  >
                    {settings.phone}
                  </span>
                </li>
              )}
              {settings?.contactEmail && (
                <li className="flex items-center gap-2.5">
                  <Mail size={14} className="text-accent shrink-0" />
                  <span
                    className="text-[13px] font-medium text-white/80"
                    dir="ltr"
                  >
                    {settings.contactEmail}
                  </span>
                </li>
              )}
              {settings?.address && (
                <li className="flex items-start gap-2.5">
                  <MapPin size={14} className="text-accent shrink-0 mt-0.5" />
                  <span className="text-[13px] font-medium text-white/80 leading-relaxed">
                    {settings.address}
                  </span>
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* نوار پایین */}
      <div className="relative z-10 border-t border-white/10">
        <div className="max-w-[1220px] mx-auto px-6 md:px-7 py-3 flex flex-col md:flex-row items-center justify-between gap-2 text-[11px]">
          <span className="text-white/40">
            {settings?.siteTitle &&
              `© ۱۴۰۵ ${settings.siteTitle} — تمامی حقوق محفوظ است.`}
          </span>
          <div className="flex items-center gap-4">
            <Link
              href="/privacy"
              className="text-white/50 hover:text-accent transition-colors"
            >
              حریم خصوصی
            </Link>
            <Link
              href="/terms"
              className="text-white/50 hover:text-accent transition-colors"
            >
              قوانین و مقررات
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
