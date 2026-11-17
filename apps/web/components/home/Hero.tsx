import { Button } from "@/components/ui/Button";
import { SmartImage } from "@/components/ui/SmartImage";
import {
  SITE_NAME,
  SITE_SUBTITLE,
  SITE_FALLBACK_BIO,
} from "@/lib/constants";
import { Award, ShieldCheck, Scale } from "lucide-react";

interface HeroProps {
  settings: {
    siteTitle: string;
    subtitle: string;
    biographyShort: string;
    portraitImage: string | null;
  } | null;
}

export function Hero({ settings }: HeroProps) {
  // 👇 اگر API در دسترس نباشد، صفحه بدون تیتر نمی‌ماند
  const siteTitle = settings?.siteTitle || SITE_NAME;
  const subtitle = settings?.subtitle || SITE_SUBTITLE;
  const biography = settings?.biographyShort || SITE_FALLBACK_BIO;

  return (
    <section className="relative min-h-screen flex items-center pt-[140px] pb-[100px] bg-primary overflow-hidden isolate">
      {/* ====== پس‌زمینه ====== */}
      <div className="absolute inset-0 -z-20 bg-hero-gradient" />
      <div
        className="absolute inset-0 -z-20 bg-grid-pattern bg-[length:64px_64px] opacity-100"
        style={{
          maskImage:
            "radial-gradient(ellipse 80% 70% at 50% 50%, #000 20%, transparent 75%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 80% 70% at 50% 50%, #000 20%, transparent 75%)",
        }}
      />
      <div className="absolute inset-0 -z-10 pointer-events-none overflow-hidden">
        <div className="absolute w-[600px] h-[600px] -left-[200px] top-1/2 -translate-y-1/2 rounded-full border border-accent/[.12]" />
        <div className="absolute w-[900px] h-[900px] -left-[350px] top-1/2 -translate-y-1/2 rounded-full border border-accent/[.07]" />
      </div>
      {/* 👇 لایه mesh جدید */}
      <div className="absolute w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle,rgba(177,138,82,.22),transparent_65%)] right-[5%] top-[20%] blur-[40px] -z-10 pointer-events-none" />
      <div className="absolute w-[400px] h-[400px] rounded-full bg-[radial-gradient(circle,rgba(74,110,160,.25),transparent_65%)] left-[10%] bottom-[10%] blur-[50px] -z-10 pointer-events-none" />
      <div className="max-w-[1220px] mx-auto px-6 md:px-7 grid lg:grid-cols-[1.15fr_1fr] gap-14 lg:gap-20 items-center relative z-10 w-full">
        {/* Content */}
        <div className="text-center lg:text-right">
          <h1 className="text-[clamp(35px,5vw,55px)] font-black text-white leading-[1.15] tracking-[-0.02em] mb-2">
            <span className="relative inline-block">
              {siteTitle}
              <span className="absolute bottom-2 right-0 left-0 h-3.5 bg-gradient-to-l from-accent/35 to-transparent -z-10 rounded" />
            </span>
            <span className="block text-[clamp(20px,2.4vw,25px)] font-medium text-accent-light mt-[18px] leading-[1.5]">
              {subtitle}
            </span>
          </h1>

          <p className="text-[16.5px] text-white/70 max-w-[520px] mx-auto lg:mx-0 my-8 leading-[2]">
            {biography}
          </p>

          <div className="flex gap-3.5 flex-wrap justify-center lg:justify-start mb-10">
            <Button href="/experience" variant="accent" size="lg">
              آشنایی با سوابق
            </Button>
            <Button href="/contact" variant="ghost" size="lg">
              درخواست ارتباط
            </Button>
          </div>

          <div className="flex items-center justify-center lg:justify-start gap-6 pt-6 border-t border-white/10">
            <div className="flex items-center gap-2 text-white/50 text-xs">
              <ShieldCheck size={16} className="text-accent" /> مشاوره تخصصی
            </div>
            <div className="flex items-center gap-2 text-white/50 text-xs">
              <Scale size={16} className="text-accent" /> رویکرد حقوقی
            </div>
            <div className="flex items-center gap-2 text-white/50 text-xs">
              <Award size={16} className="text-accent" /> سوابق تأییدشده
            </div>
          </div>
        </div>

        {/* ====== Portrait Area ====== */}
        <div className="relative flex justify-center items-center">
          {/* 👇 هاله گرادیان طلایی پشت پرتره */}
          <div className="absolute inset-0 -z-10 flex justify-center items-center pointer-events-none">
            <div className="w-[90%] max-w-[440px] aspect-[4/5] rounded-[40px] bg-[radial-gradient(circle_at_50%_40%,rgba(177,138,82,.35),transparent_70%)] blur-2xl" />
          </div>

          {/* 👇 قاب پرتره با انیمیشن float */}
          <div className="relative w-full max-w-[340px] lg:max-w-[420px] aspect-[4/5] rounded-[28px] overflow-hidden bg-gradient-to-br from-primary-light to-primary shadow-[0_40px_100px_rgba(0,0,0,.5),0_0_0_1px_rgba(177,138,82,.2)] animate-[float_6s_ease-in-out_infinite]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(177,138,82,.15),transparent_50%),linear-gradient(180deg,transparent_50%,rgba(10,21,38,.8))] z-[1]" />
            <div className="absolute top-4 left-4 w-[60px] h-[60px] border-2 border-accent rounded-tl-[16px] border-r-0 border-b-0 z-[3] opacity-70" />
            <div className="absolute bottom-4 right-4 w-[60px] h-[60px] border-2 border-accent rounded-br-[16px] border-l-0 border-t-0 z-[3] opacity-70" />

            {settings?.portraitImage ? (
              <SmartImage
                src={settings.portraitImage}
                alt="پرتره رسمی"
                priority
                sizes="(max-width: 1024px) 90vw, 420px"
                className="object-cover z-[2]"
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white/30 gap-3.5 text-[13px] text-center px-6 z-[2]">
                <svg
                  className="w-20 h-20 opacity-40 text-accent-light"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.2}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 20.25a7.5 7.5 0 1115 0v.75H4.5v-.75z"
                  />
                </svg>
                <span>پرتره رسمی</span>
                <span className="text-[11px] text-accent-light/60 border border-dashed border-accent-light/30 px-3.5 py-1.5 rounded-full">
                  در انتظار تأیید
                </span>
              </div>
            )}
          </div>

          {/* 👇 badge پایین‌راست (بیرون از قاب) */}
          <div className="absolute bottom-6 -right-4 md:-right-8 bg-white/95 backdrop-blur-xl rounded-2xl p-4 shadow-2xl z-[4] flex items-center gap-3 border border-white/50">
            <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center">
              <ShieldCheck size={20} className="text-success" />
            </div>
            <div>
              <small className="block text-[10px] text-foreground-muted">
                وضعیت همکاری
              </small>
              <b className="text-xs text-primary font-bold">
                پذیرش درخواست مشاوره
              </b>
            </div>
          </div>
        </div>
      </div>{" "}
    </section>
  );
}
