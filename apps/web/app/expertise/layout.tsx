import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "حوزه‌های تخصصی",
  description:
    "زمینه‌های فعالیت تخصصی: امور حقوقی و قراردادها، امور گمرکی و ترخیص، تجارت بین‌الملل و توسعه همکاری.",
};

export default function ExpertiseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
