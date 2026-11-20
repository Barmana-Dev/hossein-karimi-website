import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { MainLayoutWrapper } from "@/components/layout/MainLayoutWrapper";
import { API_URL, SITE_URL } from "@/lib/api";

// 👇 فونت وزیرمتن به‌صورت محلی (self-hosted) بارگذاری می‌شود.
// نسخهٔ قبلی از next/font/google استفاده می‌کرد که در زمان build به شبکه وابسته
// بود و در محیط بدون دسترسی به Google، سایت با فونت پیش‌فرض نمایش داده می‌شد.
const vazirmatn = localFont({
  src: "../public/fonts/Vazirmatn-Variable.woff2",
  variable: "--font-vazirmatn",
  weight: "100 900",
  style: "normal",
  display: "swap",
  fallback: ["system-ui", "sans-serif"],
});

const DEFAULT_TITLE = "دکتر حسین کریمی | حقوق، امور گمرکی و تجارت";
const DEFAULT_DESCRIPTION =
  "پایگاه حرفه‌ای معرفی دکتر حسین کریمی؛ مشاور حقوقی، امور گمرکی و تجارت بین‌الملل.";

// 👇 متادیتای اصلی سایت از تنظیمات ذخیره‌شده خوانده می‌شود
// (در صورت در دسترس نبودن API به مقادیر پیش‌فرض برمی‌گردد)
export async function generateMetadata(): Promise<Metadata> {
  let seoTitle = "";
  let seoDescription = "";
  let siteTitle = "";
  let subtitle = "";

  try {
    const res = await fetch(`${API_URL}/public/settings`, {
      cache: "no-store",
    });
    if (res.ok) {
      const json = await res.json();
      const data = json?.data ?? {};
      seoTitle = typeof data.seoTitle === "string" ? data.seoTitle.trim() : "";
      seoDescription =
        typeof data.seoDescription === "string"
          ? data.seoDescription.trim()
          : "";
      siteTitle = typeof data.siteTitle === "string" ? data.siteTitle.trim() : "";
      subtitle = typeof data.subtitle === "string" ? data.subtitle.trim() : "";
    }
  } catch {
    // استفاده از مقادیر پیش‌فرض
  }

  const defaultTitle =
    seoTitle ||
    (siteTitle ? `${siteTitle}${subtitle ? ` | ${subtitle}` : ""}` : DEFAULT_TITLE);
  const description = seoDescription || DEFAULT_DESCRIPTION;

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: defaultTitle,
      template: `%s | ${siteTitle || "دکتر حسین کریمی"}`,
    },
    description,
    openGraph: {
      title: defaultTitle,
      description,
      type: "website",
    },
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="fa"
      dir="rtl"
      className={vazirmatn.variable}
      data-scroll-behavior="smooth"
    >
      <body>
        <MainLayoutWrapper>{children}</MainLayoutWrapper>
      </body>
    </html>
  );
}
