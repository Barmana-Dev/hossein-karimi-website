"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { API_URL } from "@/lib/api";
import { MobileMenu } from "./MobileMenu";

import logo from "../../../../public/images/logo.webp";
import Image from "next/image";

const navItems = [
  { label: "صفحه اصلی", href: "/" },
  { label: "درباره من", href: "/about" },
  { label: "سوابق حرفه‌ای", href: "/experience" },
  { label: "حوزه‌های تخصصی", href: "/expertise" },
  { label: "کارگزاری‌ها", href: "/network" },
  { label: "مقالات", href: "/insights" },
  { label: "رسانه و رویدادها", href: "/media" },
];

// 👇 صفحاتی که پس‌زمینه‌شون روشنه → هدر سرمه‌ای
// اگه صفحه‌ای یادت رفت، اضافه‌ش کن. بقیه صفحات پیش‌فرض روشن فرض می‌شن.
const LIGHT_BG_PAGES = [
  "/",
  "/about",
  "/experience",
  "/expertise",
  "/network",
  "/insights",
  "/media",
  "/contact",
  "/terms",
  "/privacy",
  // ...
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();

  const [siteInfo, setSiteInfo] = useState({
    title: "دکتر حسین کریمی",
    subtitle: "حقوق، امور گمرکی و تجارت",
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch(`${API_URL}/public/settings`);
        if (res.ok) {
          const json = await res.json();
          setSiteInfo({
            title: json.data.siteTitle,
            subtitle: json.data.subtitle,
          });
        }
      } catch (error) {
        console.error("Error fetching site settings", error);
      }
    };
    fetchSettings();
  }, []);

  const isHome = pathname === "/";

  // 👇 آیا این صفحه پس‌زمینه روشن داره؟
  const isLightPage =
    LIGHT_BG_PAGES.includes(pathname) ||
    // صفحات داینامیک مثل /insights/[slug] هم روشن فرض می‌شن
    LIGHT_BG_PAGES.some((p) => p !== "/" && pathname.startsWith(p + "/"));

  // 👇 صفحه اصلی + اسکرول نشده → شفاف (روی Hero تیره)
  const isTransparent = isHome && !scrolled;

  // 👇 هدر سرمه‌ای: فقط وقتی روی صفحه روشن هستیم و شفاف نیستیم
  const isDarkHeader = isLightPage && !isTransparent;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <header
        className={cn(
          "fixed top-0 right-0 left-0 z-[100] transition-all duration-300",
          scrolled
            ? isDarkHeader
              ? "bg-primary/95 backdrop-blur-xl border-b border-white/10 shadow-[0_4px_30px_rgba(15,30,51,.25)]"
              : "bg-white/90 backdrop-blur-xl border-b border-border shadow-[0_4px_30px_rgba(15,30,51,.06)]"
            : isTransparent
              ? "bg-transparent"
              : isDarkHeader
                ? "bg-primary border-b border-white/10"
                : "bg-white/95 backdrop-blur-md border-b border-border",
        )}
      >
        <div
          className={cn(
            "max-w-[1220px] mx-auto px-6 md:px-7 flex items-center justify-between transition-all duration-300",
            scrolled ? "h-[70px]" : "h-[84px]",
          )}
        >
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3.5 shrink-0">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-primary-light flex items-center justify-center text-accent-light font-black text-lg shadow-[0_6px_18px_rgba(15,30,51,.25)] relative overflow-hidden">
              <Image
                loading="eager"
                src={logo}
                alt="لوگوی سایت"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-accent/25" />
            </div>
            <div className="leading-tight">
              <strong
                className={cn(
                  "block font-extrabold text-[17px] transition-colors",
                  isDarkHeader || isTransparent ? "text-white" : "text-primary",
                )}
              >
                {siteInfo.title}
              </strong>
              <span
                className={cn(
                  "text-[11px] font-medium tracking-wide",
                  isDarkHeader || isTransparent
                    ? "text-accent-light"
                    : "text-accent",
                )}
              >
                {siteInfo.subtitle}
              </span>
            </div>
          </Link>

          {/* Nav */}
          <nav className="hidden lg:flex gap-0.5 text-[13px] font-medium">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative px-3 py-2.5 rounded-[10px] transition-all whitespace-nowrap",
                  isDarkHeader || isTransparent
                    ? "text-white/85 hover:text-white hover:bg-white/10"
                    : "text-[#3a4654] hover:text-primary hover:bg-primary/[.04]",
                  pathname === item.href && "font-semibold",
                  pathname === item.href &&
                    (isDarkHeader || isTransparent
                      ? "text-white"
                      : "text-primary"),
                )}
              >
                {item.label}
                {pathname === item.href && (
                  <span className="absolute bottom-1 right-3 left-3 h-0.5 bg-accent rounded-sm" />
                )}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3 shrink-0">
            <Button
              href="/contact"
              variant="primary"
              size="md"
              className={cn(
                "hidden md:inline-flex",
                (isDarkHeader || isTransparent) &&
                  "bg-accent hover:bg-accent-dark shadow-[0_6px_20px_rgba(177,138,82,.35)]",
              )}
            >
              درخواست ارتباط
            </Button>
            <button
              ref={menuButtonRef}
              onClick={() => setMenuOpen(true)}
              aria-label="باز کردن منو"
              aria-expanded={menuOpen}
              aria-controls="mobile-menu-drawer"
              className={cn(
                "lg:hidden p-2 text-2xl transition-colors",
                isDarkHeader || isTransparent ? "text-white" : "text-primary",
              )}
            >
              ☰
            </button>
          </div>
        </div>
      </header>

      <MobileMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        items={navItems}
        triggerRef={menuButtonRef}
      />
    </>
  );
}
