"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
  items: { label: string; href: string }[];
}

export function MobileMenu({ open, onClose, items }: MobileMenuProps) {
  const pathname = usePathname();

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        className={cn(
          "fixed inset-0 z-[110] bg-primary/40 backdrop-blur-sm transition-opacity duration-300 lg:hidden",
          open ? "opacity-100" : "opacity-0 pointer-events-none",
        )}
      />
      {/* Drawer */}
      <div
        className={cn(
          "fixed top-0 right-0 bottom-0 z-[120] w-[300px] max-w-[85vw] bg-white shadow-2xl transition-transform duration-300 lg:hidden flex flex-col",
          open ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="flex items-center justify-between p-6 border-b border-border">
          <strong className="text-primary font-extrabold text-lg">منو</strong>
          <button
            onClick={onClose}
            aria-label="بستن"
            className="w-10 h-10 rounded-lg flex items-center justify-center text-primary hover:bg-primary/5 text-xl"
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
                "px-4 py-3 rounded-xl text-[15px] font-medium text-[#3a4654] transition-colors",
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
