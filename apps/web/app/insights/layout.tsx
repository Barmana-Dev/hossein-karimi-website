import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "مقالات و تحلیل‌های حقوقی و گمرکی",
  description:
    "مقالات، یادداشت‌ها و تحلیل‌های تخصصی دکتر حسین کریمی در حوزه حقوق، امور گمرکی و تجارت بین‌الملل.",
};

export default function InsightsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
