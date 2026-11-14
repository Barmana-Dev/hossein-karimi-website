import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function CtaBand() {
  return (
    <section className="section-padding bg-white">
      <Container>
        <div className="relative rounded-[32px] px-7 md:px-15 py-14 md:py-[90px] text-center text-white overflow-hidden bg-gradient-to-br from-primary-dark to-primary-light shadow-[0_30px_80px_rgba(15,30,51,.3)]">
          <div className="absolute -right-30 -top-30 w-[450px] h-[450px] rounded-full bg-[radial-gradient(circle,rgba(177,138,82,.28),transparent_65%)] blur-[20px]" />
          <div className="absolute w-[500px] h-[500px] rounded-full border border-accent/[.12] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />

          <div className="relative z-[1]">
            <span className="inline-block text-xs font-bold text-accent-light tracking-[2px] mb-5 px-4.5 py-1.5 border border-accent-light/30 rounded-full bg-accent/10">
              درخواست همکاری
            </span>
            <h2 className="text-[clamp(26px,3.2vw,32px)] font-extrabold tracking-[-0.025em] leading-[1.4] mb-4.5 max-w-[700px] mx-auto">
              برای طرح درخواست همکاری یا دریافت اطلاعات بیشتر
            </h2>
            <p className="text-white/70 mb-10 max-w-[560px] mx-auto text-[15px] leading-[1.9]">
              از طریق فرم ارتباط، درخواست خود را ثبت کنید. پاسخ‌گویی پس از بررسی
              انجام می‌شود.
            </p>

            {/* 👇 دکمه هماهنگ با بقیه سایت */}
            <Button
              href="/contact"
              variant="accent"
              size="lg"
              className="gap-2"
            >
              ثبت درخواست ارتباط <ArrowLeft size={18} />
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
