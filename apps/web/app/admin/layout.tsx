"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import logo from "../../../../public/images/logo.webp";
import Image from "next/image";
import { Suspense } from "react";
import { API_URL } from "@/lib/api";

import {
  LayoutDashboard,
  FileText,
  Building2,
  Briefcase,
  Layers,
  MessageSquare,
  Settings,
  LogOut,
  Search,
  Bell,
  ChevronLeft,
  ChevronRight,
  X,
  Newspaper,
  Image as ImageIcon,
  Users,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";

const menuItems = [
  {
    title: "داشبورد",
    href: "/admin",
    icon: LayoutDashboard,
    roles: ["SUPER_ADMIN", "EDITOR", "INQUIRY_MANAGER"],
  },
  {
    title: "مقالات",
    href: "/admin/articles",
    icon: FileText,
    roles: ["SUPER_ADMIN", "EDITOR"],
  },
  {
    title: "کارگزاری‌ها",
    href: "/admin/network",
    icon: Building2,
    roles: ["SUPER_ADMIN", "EDITOR"],
  },
  {
    title: "سوابق",
    href: "/admin/experience",
    icon: Briefcase,
    roles: ["SUPER_ADMIN", "EDITOR"],
  },
  {
    title: "حوزه‌ها",
    href: "/admin/expertise",
    icon: Layers,
    roles: ["SUPER_ADMIN", "EDITOR"],
  },
  {
    title: "رسانه و رویداد",
    href: "/admin/media",
    icon: Newspaper,
    roles: ["SUPER_ADMIN", "EDITOR"],
  },
  {
    title: "درخواست‌ها",
    href: "/admin/inquiries",
    icon: MessageSquare,
    roles: ["SUPER_ADMIN", "INQUIRY_MANAGER"],
  },
  {
    title: "کتابخانه رسانه",
    href: "/admin/media-library",
    icon: ImageIcon,
    roles: ["SUPER_ADMIN", "EDITOR"],
  },
  {
    title: "کاربران ادمین",
    href: "/admin/accounts",
    icon: Users,
    roles: ["SUPER_ADMIN"],
  },
  {
    title: "تنظیمات",
    href: "/admin/settings",
    icon: Settings,
    roles: ["SUPER_ADMIN"],
  },
];

interface Notification {
  id: string;
  fullName: string;
  subject: string;
  createdAt: string;
}

interface SearchResults {
  articles: { id: string; title: string; status: string }[];
  experiences: { id: string; title: string; organization: string }[];
  agencies: { id: string; name: string; field: string }[];
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [user, setUser] = useState<{ name: string; role: string } | null>(null);

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const [notifications, setNotifications] = useState<Notification[]>([]);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResults | null>(
    null,
  );
  const [isSearching, setIsSearching] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  // ۱. دریافت اطلاعات کاربر
  useEffect(() => {
    let isMounted = true;
    const fetchUser = async () => {
      try {
        const userRes = await fetch(`${API_URL}/auth/me`, {
          credentials: "include",
        });
        if (userRes.ok) {
          const userData = await userRes.json();
          if (isMounted) setUser(userData.data);
        } else {
          router.push("/login");
        }
      } catch {
        router.push("/login");
      }
    };
    fetchUser();
    return () => {
      isMounted = false;
    };
  }, [router]);

  // ۲. به‌روزرسانی دوره‌ای اعلان‌ها (هر ۶۰ ثانیه و فقط وقتی تب فعال است)
  useEffect(() => {
    let isMounted = true;

    const readIdsFromStorage = (): string[] => {
      try {
        const saved = localStorage.getItem("read_notifications");
        const parsed = saved ? JSON.parse(saved) : [];
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    };

    const fetchNotifications = async () => {
      if (typeof document !== "undefined" && document.hidden) return;
      try {
        const dashRes = await fetch(`${API_URL}/admin/dashboard`, {
          credentials: "include",
        });
        if (dashRes.ok && isMounted) {
          const dashData = await dashRes.json();
          // فیلتر کردن اعلان‌های خوانده‌شده
          const readIds = readIdsFromStorage();
          const unread = dashData.data.inquiries.recent.filter(
            (n: Notification) => !readIds.includes(n.id),
          );
          setNotifications(unread);
        }
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };

    // اجرای اولیه و سپس هر ۶۰ ثانیه
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // ۴. بستن منوها با کلیک بیرون
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      )
        setIsProfileOpen(false);
      if (notifRef.current && !notifRef.current.contains(event.target as Node))
        setIsNotificationsOpen(false);
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      )
        setSearchResults(null);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ۵. جستجوی زنده
  useEffect(() => {
    const query = searchQuery.trim();
    if (query.length < 2) {
      const clearTimer = setTimeout(() => setSearchResults(null), 0);
      return () => clearTimeout(clearTimer);
    }

    const searchTimer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`${API_URL}/admin/search?q=${query}`, {
          credentials: "include",
        });
        if (res.ok) {
          const json = await res.json();
          setSearchResults(json.data);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsSearching(false);
      }
    }, 500);

    return () => clearTimeout(searchTimer);
  }, [searchQuery]);

  const handleLogout = async () => {
    setIsProfileOpen(false); //  بستن منو
    try {
      await fetch(`${API_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });

      //  استفاده از router.push + router.refresh
      router.push("/login");
      router.refresh(); // این خط باعث می‌شود صفحه لاگین از سرور دوباره بارگذاری شود
    } catch (error) {
      console.error(error);
      router.push("/login");
      router.refresh();
    }
  };

  const handleNotificationClick = (id: string) => {
    try {
      const saved = localStorage.getItem("read_notifications");
      const parsed = saved ? JSON.parse(saved) : [];
      const current: string[] = Array.isArray(parsed) ? parsed : [];
      if (!current.includes(id)) {
        localStorage.setItem(
          "read_notifications",
          JSON.stringify([...current, id]),
        );
      }
    } catch {
      /* ذخیره‌سازی محلی اختیاری است */
    }
    setNotifications((prev) => prev.filter((item) => item.id !== id));
    setIsNotificationsOpen(false);
  };

  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-screen">
          در حال بارگذاری پنل...
        </div>
      }
    >
      <div className="min-h-screen bg-[#F4F7F9] flex" dir="rtl">
        {/* ====== SIDEBAR ====== */}
        <aside
          className={cn(
            "fixed inset-y-0 right-0 z-50 bg-[#1E293B] text-white transition-all duration-300 flex flex-col shadow-2xl",
            isCollapsed ? "w-[80px]" : "w-[240px]",
            isMobileOpen
              ? "translate-x-0 w-[240px]"
              : "translate-x-full lg:translate-x-0",
          )}
        >
          <div className="h-20 flex items-center justify-between px-4 border-b border-white/10 relative">
            <Link
              href="/"
              className={cn(
                "flex items-center gap-3 overflow-hidden hover:opacity-80 transition-opacity",
                isCollapsed && "justify-center w-full",
              )}
            >
              <div className="w-14 h-14 min-w-[56px] rounded-full bg-accent/20 text-accent flex items-center justify-center font-black shrink-0 overflow-hidden">
                <Image
                  src={logo}
                  alt="لوگوی سایت"
                  width={56}
                  height={56}
                  className="w-full h-full object-cover"
                />
              </div>
              {!isCollapsed && (
                <div className="whitespace-nowrap">
                  <strong className="block text-sm font-bold">
                    بازگشت به سایت
                  </strong>
                  <span className="text-[14px] text-white/50">
                    پنل مدیریت دکتر کریمی
                  </span>
                </div>
              )}
            </Link>
            <button
              onClick={() => setIsMobileOpen(false)}
              className="lg:hidden text-white/50 hover:text-white absolute left-4"
            >
              <X size={20} />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto overflow-x-hidden py-6 px-3 space-y-2">
            {menuItems.map((item) => {
              if (!user || !item.roles.includes(user.role)) return null;

              const isActive =
                pathname === item.href ||
                (pathname.startsWith(item.href) && item.href !== "/admin");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all group",
                    isActive
                      ? "bg-accent/10 text-accent"
                      : "text-white/60 hover:text-white hover:bg-white/5",
                    isCollapsed && "justify-center",
                  )}
                  title={item.title}
                >
                  <item.icon
                    size={20}
                    className={cn(
                      "shrink-0",
                      isActive
                        ? "text-accent"
                        : "text-white/40 group-hover:text-accent",
                    )}
                  />
                  {!isCollapsed && (
                    <span className="whitespace-nowrap">{item.title}</span>
                  )}
                </Link>
              );
            })}
          </nav>

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex absolute top-24 -left-4 w-8 h-8 bg-[#1E293B] border border-white/20 rounded-full items-center justify-center text-white/70 hover:text-white hover:bg-accent transition-colors z-50 shadow-md"
          >
            {isCollapsed ? (
              <ChevronLeft size={18} />
            ) : (
              <ChevronRight size={18} />
            )}
          </button>
        </aside>

        {/* ====== MAIN CONTENT ====== */}
        <div
          className={cn(
            // min-w-0 تا جدول‌ها و تب‌های عریض، ستون محتوا را در موبایل بیرون نزنند
            "flex-1 flex flex-col min-h-screen min-w-0 transition-all duration-300",
            isCollapsed ? "mr-0 lg:mr-[80px]" : "mr-0 lg:mr-[240px]",
          )}
        >
          <header className="h-20 bg-white border-b border-border flex items-center justify-between px-6 sticky top-0 z-40">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsMobileOpen(true)}
                className="lg:hidden text-primary"
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <line x1="3" y1="12" x2="21" y2="12"></line>
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <line x1="3" y1="18" x2="21" y2="18"></line>
                </svg>
              </button>
              <span className="text-lg font-bold text-primary hidden md:block">
                پیشخوان
              </span>
            </div>

            <div className="hidden md:block relative w-[350px]" ref={searchRef}>
              <div className="relative">
                <Search
                  size={18}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-muted"
                />
                <input
                  type="text"
                  placeholder="جستجوی سراسری..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl py-2 pr-10 pl-4 text-sm focus:outline-none focus:border-accent"
                />
              </div>

              {searchQuery.length >= 2 && searchResults && (
                <div className="absolute top-12 left-0 right-0 bg-white border border-border rounded-2xl shadow-xl z-50 overflow-hidden max-h-[400px] overflow-y-auto">
                  {isSearching && (
                    <div className="p-4 text-center text-sm text-foreground-muted">
                      در حال جستجو...
                    </div>
                  )}
                  {!isSearching &&
                    searchResults.articles.length === 0 &&
                    searchResults.experiences.length === 0 &&
                    searchResults.agencies.length === 0 && (
                      <div className="p-4 text-center text-sm text-foreground-muted">
                        نتیجه‌ای یافت نشد.
                      </div>
                    )}
                  {searchResults.articles.length > 0 && (
                    <div className="p-2 border-b border-border">
                      <div className="text-[10px] font-bold text-foreground-muted px-2 mb-1">
                        مقالات
                      </div>
                      {searchResults.articles.map((item) => (
                        <Link
                          key={item.id}
                          href={`/admin/articles/${item.id}/edit`}
                          onClick={() => setSearchQuery("")}
                          className="flex items-center gap-2 px-2 py-2 hover:bg-background rounded-lg text-sm"
                        >
                          <FileText size={14} className="text-accent" />{" "}
                          <span className="truncate">{item.title}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                  {searchResults.experiences.length > 0 && (
                    <div className="p-2 border-b border-border">
                      <div className="text-[10px] font-bold text-foreground-muted px-2 mb-1">
                        سوابق
                      </div>
                      {searchResults.experiences.map((item) => (
                        <Link
                          key={item.id}
                          href={`/admin/experience/${item.id}/edit`}
                          onClick={() => setSearchQuery("")}
                          className="flex items-center gap-2 px-2 py-2 hover:bg-background rounded-lg text-sm"
                        >
                          <Briefcase size={14} className="text-accent" />{" "}
                          <span className="truncate">{item.title}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                  {searchResults.agencies.length > 0 && (
                    <div className="p-2">
                      <div className="text-[10px] font-bold text-foreground-muted px-2 mb-1">
                        کارگزاری‌ها
                      </div>
                      {searchResults.agencies.map((item) => (
                        <Link
                          key={item.id}
                          href={`/admin/network/${item.id}/edit`}
                          onClick={() => setSearchQuery("")}
                          className="flex items-center gap-2 px-2 py-2 hover:bg-background rounded-lg text-sm"
                        >
                          <Building2 size={14} className="text-accent" />{" "}
                          <span className="truncate">{item.name}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center gap-4">
              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                  className="w-10 h-10 rounded-full bg-background flex items-center justify-center text-foreground-muted hover:text-primary transition-colors relative"
                >
                  <Bell size={18} />
                  {notifications.length > 0 && (
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                  )}
                </button>

                {isNotificationsOpen && (
                  <div className="absolute left-0 top-12 w-[320px] bg-white border border-border rounded-2xl shadow-xl z-50 overflow-hidden">
                    <div className="p-4 border-b border-border bg-background/50 flex justify-between items-center">
                      <h3 className="font-bold text-primary text-sm">
                        درخواست‌های جدید
                      </h3>
                      <span className="bg-accent/10 text-accent text-[10px] font-bold px-2 py-0.5 rounded-full">
                        {notifications.length} جدید
                      </span>
                    </div>
                    <div className="divide-y divide-border max-h-[300px] overflow-y-auto">
                      {notifications.length > 0 ? (
                        notifications.map((notif) => (
                          <Link
                            key={notif.id}
                            href={`/admin/inquiries/${notif.id}`}
                            onClick={() => handleNotificationClick(notif.id)}
                            className="block p-4 hover:bg-background transition-colors"
                          >
                            <p className="text-sm font-bold text-primary mb-1">
                              {notif.fullName}
                            </p>
                            <p className="text-xs text-foreground-muted line-clamp-1">
                              {notif.subject}
                            </p>
                            <span className="text-[10px] text-accent mt-2 block">
                              {new Date(notif.createdAt).toLocaleDateString(
                                "fa-IR",
                              )}
                            </span>
                          </Link>
                        ))
                      ) : (
                        <div className="p-6 text-center text-sm text-foreground-muted">
                          اعلان جدیدی ندارید.
                        </div>
                      )}
                    </div>
                    <Link
                      href="/admin/inquiries"
                      onClick={() => setIsNotificationsOpen(false)}
                      className="block text-center p-3 text-xs font-bold text-accent hover:bg-accent/5 border-t border-border"
                    >
                      مشاهده همه درخواست‌ها
                    </Link>
                  </div>
                )}
              </div>

              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-3 pl-2 pr-1 py-1 rounded-full border border-border hover:bg-background transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm">
                    {user?.name.charAt(0) || "م"}
                  </div>
                  <div className="text-right hidden md:block">
                    <span className="block text-sm font-bold text-primary leading-tight">
                      {user?.name || "مدیر"}
                    </span>
                    <span className="block text-[10px] text-foreground-muted">
                      {user?.role === "SUPER_ADMIN"
                        ? "مدیر ارشد"
                        : user?.role === "EDITOR"
                          ? "نویسنده"
                          : "مدیر درخواست‌ها"}
                    </span>
                  </div>
                  <ChevronDown
                    size={14}
                    className="text-foreground-muted hidden md:block ml-1"
                  />
                </button>

                {isProfileOpen && (
                  <div className="absolute left-0 top-14 w-[200px] bg-white border border-border rounded-2xl shadow-xl z-50 overflow-hidden">
                    <div className="p-2">
                      <Link
                        onClick={() => setIsProfileOpen(false)}
                        href="/admin/profile"
                        className="flex items-center gap-2 w-full px-3 py-2 text-sm text-foreground-muted hover:bg-background rounded-lg transition-colors"
                      >
                        <Settings size={16} /> پروفایل من
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 w-full px-3 py-2 mt-1 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <LogOut size={16} /> خروج از حساب
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </header>

          <main className="flex-1 p-6 md:p-8">{children}</main>
        </div>

        {isMobileOpen && (
          <div
            onClick={() => setIsMobileOpen(false)}
            className="fixed inset-0 bg-primary/50 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </div>
    </Suspense>
  );
}
