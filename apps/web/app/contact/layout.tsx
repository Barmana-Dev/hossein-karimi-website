import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "تماس و درخواست مشاوره",
  description:
    "برای مشاوره حقوقی، گمرکی یا تجاری با دفتر دکتر حسین کریمی در تماس باشید.",
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
