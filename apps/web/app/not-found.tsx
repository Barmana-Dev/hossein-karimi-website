import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-primary flex items-center justify-center relative overflow-hidden">
      {/* پس‌زمینه */}
      <div className="absolute inset-0 bg-hero-gradient opacity-90" />
      <div className="absolute inset-0 bg-grid-pattern bg-[length:64px_64px] opacity-20" />
      <div className="absolute w-[500px] h-[500px] rounded-full bg-accent/20 blur-[100px] -z-10" />

      <Container className="relative z-10 text-center">
        <div className="relative mb-8">
          <h1
            className="text-[120px] md:text-[180px] font-black text-transparent leading-none select-none tracking-tighter"
            style={{ WebkitTextStroke: "2px rgba(255,255,255,0.1)" }}
          >
            404
          </h1>
          <div className="absolute inset-0 bg-accent/5 blur-[80px] rounded-full pointer-events-none" />
        </div>

        <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
          صفحه‌ای که دنبالش بودید پیدا نشد
        </h2>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button href="/" variant="accent" size="lg" className="gap-2">
            <Home size={18} /> بازگشت به صفحه اصلی
          </Button>
          <Button href="/contact" variant="ghost" size="lg" className="gap-2">
            <ArrowLeft size={18} /> تماس با ما
          </Button>
        </div>
      </Container>
    </div>
  );
}
