import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "رسانه، اخبار و رویدادها",
  description:
    "اخبار، مصاحبه‌ها، سخنرانی‌ها و رویدادهای مرتبط با دکتر حسین کریمی.",
};

export default function MediaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
