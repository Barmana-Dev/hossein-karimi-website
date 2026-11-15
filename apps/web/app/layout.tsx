import type { Metadata } from "next";
import { Vazirmatn } from "next/font/google";
import "./globals.css";
import { MainLayoutWrapper } from "@/components/layout/MainLayoutWrapper";

const vazirmatn = Vazirmatn({
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-vazirmatn",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://hosseinkarimi.com"),
  title: {
    default: "دکتر حسین کریمی | حقوق، امور گمرکی و تجارت",
    template: "%s | دکتر حسین کریمی",
  },
  description:
    "پایگاه حرفه‌ای معرفی دکتر حسین کریمی؛ مشاور حقوقی، امور گمرکی و تجارت بین‌الملل.",
  openGraph: {
    title: "دکتر حسین کریمی",
    description: "حقوق، امور گمرکی و تجارت بین‌الملل",
    type: "website",
  },
};

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
