import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "سوابق و دستاوردهای حرفه‌ای",
  description:
    "مسیر حرفه‌ای دکتر حسین کریمی: سوابق مشاوره در امور گمرکی، حقوقی و تجارت بین‌الملل.",
};

export default function ExperienceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
