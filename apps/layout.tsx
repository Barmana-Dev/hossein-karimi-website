import type { Metadata } from "next";
import { Vazirmatn } from "next/font/google";
import "./globals.css";

const vazirmatn = Vazirmatn({
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-vazirmatn",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "دکتر حسین کریمی | حقوق، امور گمرکی و تجارت",
    template: "%s | دکتر حسین کریمی",
  },
  description:
    "پایگاه حرفه‌ای معرفی شخصیت، سوابق، تخصص‌ها و راه‌های ارتباط دکتر حسین کریمی در حوزه حقوق، امور گمرکی و تجارت.",
  metadataBase: new URL("https://hosseinkarimi.com"),
  openGraph: {
    type: "website",
    locale: "fa_IR",
    siteName: "دکتر حسین کریمی",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fa" dir="rtl" className={vazirmatn.variable}>
      <body>{children}</body>
    </html>
  );
}
