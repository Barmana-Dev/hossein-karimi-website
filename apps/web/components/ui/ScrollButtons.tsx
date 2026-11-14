"use client";

import { useSyncExternalStore, useCallback } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

// 👇 اسنپ‌شات سرور به صورت ثابت (خارج از کامپوننت) تعریف شود
const SERVER_SNAPSHOT = {
  scrollY: 0,
  hasScroll: false,
  showBackToTop: false,
  isAtBottom: false,
};

// 👇 getSnapshot باید مقدار پایدار برگرداند
// چون آبجکت جدید برمی‌گرداند، باید کش شود
let cachedSnapshot = SERVER_SNAPSHOT;

const subscribe = (callback: () => void) => {
  window.addEventListener("scroll", callback, { passive: true });
  window.addEventListener("resize", callback);
  return () => {
    window.removeEventListener("scroll", callback);
    window.removeEventListener("resize", callback);
  };
};

const getSnapshot = () => {
  const scrollY = window.scrollY;
  const viewportH = window.innerHeight;
  const docH = document.documentElement.scrollHeight;

  const newSnapshot = {
    scrollY,
    hasScroll: docH > viewportH + 50,
    showBackToTop: scrollY > 400,
    isAtBottom: viewportH + scrollY >= docH - 80,
  };

  // 👇 فقط اگر واقعاً تغییری کرده، آبجکت جدید برگردان
  if (
    cachedSnapshot.hasScroll === newSnapshot.hasScroll &&
    cachedSnapshot.showBackToTop === newSnapshot.showBackToTop &&
    cachedSnapshot.isAtBottom === newSnapshot.isAtBottom
  ) {
    return cachedSnapshot;
  }

  cachedSnapshot = newSnapshot;
  return cachedSnapshot;
};

const getServerSnapshot = () => SERVER_SNAPSHOT;

export function ScrollButtons() {
  const { hasScroll, showBackToTop, isAtBottom } = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  const scrollToNextSection = useCallback(() => {
    const headerOffset = 80;
    const scrollY = window.scrollY;

    const candidates = Array.from(
      document.querySelectorAll("section, article, main > div"),
    );

    const next = candidates.find((el) => {
      const rect = el.getBoundingClientRect();
      return rect.top > headerOffset + 10;
    });

    if (next) {
      const top = next.getBoundingClientRect().top + scrollY - headerOffset;
      window.scrollTo({ top, behavior: "smooth" });
      return;
    }

    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: "smooth",
    });
  }, []);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  if (!hasScroll) return null;

  return (
    <div className="fixed bottom-8 left-6 z-[90] flex flex-col gap-3">
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          aria-label="بازگشت به بالا"
          className="group w-12 h-12 rounded-full bg-white/90 backdrop-blur-md border border-border text-primary shadow-lg flex items-center justify-center transition-all duration-300 hover:bg-primary hover:text-white hover:-translate-y-1 hover:shadow-xl"
        >
          <ChevronUp
            size={22}
            className="transition-transform group-hover:-translate-y-0.5"
          />
        </button>
      )}

      {!isAtBottom && (
        <button
          onClick={scrollToNextSection}
          aria-label="اسکرول به بخش بعدی"
          className="group w-12 h-12 rounded-full bg-primary/90 backdrop-blur-md text-white shadow-lg flex items-center justify-center transition-all duration-300 hover:bg-accent hover:-translate-y-1 hover:shadow-xl"
        >
          <ChevronDown
            size={22}
            className="transition-transform group-hover:translate-y-0.5"
          />
        </button>
      )}
    </div>
  );
}
