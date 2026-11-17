import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "کارگزاری‌ها و شبکه همکاری",
  description:
    "شبکه همکاری و کارگزاری‌های مرتبط با دکتر حسین کریمی در حوزه گمرک، حمل‌ونقل و تجارت.",
};

export default function NetworkLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
