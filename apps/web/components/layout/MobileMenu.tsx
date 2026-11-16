"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
  items: { label: string; href: string }[];
  triggerRef?: React.RefObject<HTMLButtonElement | null>;
}

export function MobileMenu({
  open,
  onClose,
  items,
  triggerRef,
}: MobileMenuProps) {
  const pathname = usePathname();
  const drawerRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const wasOpenRef = useRef(false);

  // 👇 قفل اسکرول + فوکوس اولیه + بازگرداندن فوکوس به دکمه منو پس از بستن
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      wasOpenRef.current = true;
      // فوکوس روی دکمه بستن
      closeButtonRef.current?.focus();
    } else {
      document.body.style.overflow = "";
      if (wasOpenRef.current) {
        wasOpenRef.current = false;
        triggerRef?.current?.focus();
      }
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open, triggerRef]);

  // 👇 مدیریت کلید Escape
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  // 👇 مدیریت Tab (focus trap)
  useEffect(() => {
    if (!open) return;

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== "Tab" || !drawerRef.current) return;

      const focusable = drawerRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input, [tabindex]:not([tabindex="-1"])',
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleTab);
    return () => document.removeEventListener("keydown", handleTab);
  }, [open]);

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        aria-hidden="true"
        className={cn(
          "fixed inset-0 z-[110] bg-primary/40 backdrop-blur-sm transition-opacity duration-300 lg:hidden",
          open ? "opacity-100" : "opacity-0 pointer-events-none",
        )}
      />
      {/* Drawer — در حالت بسته از صفحه‌خوان و ترتیب فوکوس خارج است */}
      <div
        ref={drawerRef}
        id="mobile-menu-drawer"
        role="dialog"
        aria-modal={open ? "true" : undefined}
        aria-label="منوی موبایل"
        aria-hidden={!open}
        inert={!open}
        className={cn(
          "fixed top-0 right-0 bottom-0 z-[120] w-[300px] max-w-[85vw] bg-white shadow-2xl transition-transform duration-300 lg:hidden flex flex-col",
          open ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="flex items-center justify-between p-6 border-b border-border">
          <strong className="text-primary font-extrabold text-lg">منو</strong>
          <button
            ref={closeButtonRef}
            onClick={onClose}
            aria-label="بستن منو"
            className="w-10 h-10 rounded-lg flex items-center justify-center text-primary hover:bg-primary/5 text-xl focus:outline-none focus:ring-2 focus:ring-accent"
          >
            ✕
          </button>
        </div>
        <nav className="flex flex-col p-4 gap-1 flex-1 overflow-y-auto">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                "px-4 py-3 rounded-xl text-[15px] font-medium text-[#3a4654] transition-colors focus:outline-none focus:ring-2 focus:ring-accent",
                pathname === item.href
                  ? "bg-primary/5 text-primary font-semibold"
                  : "hover:bg-primary/5",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-border">
          <Button href="/contact" variant="primary" className="w-full">
            درخواست ارتباط
          </Button>
        </div>
      </div>
    </>
  );
}
