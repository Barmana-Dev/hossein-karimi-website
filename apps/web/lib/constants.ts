// 👇 آدرس سایت از تنظیمات محیطی می‌آید (منبع یگانه در lib/api.ts)
export { SITE_URL } from "./api";

export const SITE_NAME = "دکتر حسین کریمی";
export const SITE_SUBTITLE = "حقوق • امور گمرکی • تجارت";
export const SITE_FALLBACK_BIO =
  "مشاور حقوقی، امور گمرکی و تجارت بین‌الملل؛ ارائهٔ خدمات تخصصی در قراردادها، ترخیص کالا و تحلیل مقررات تجاری.";

export const NAV_ITEMS = [
  { label: "صفحه اصلی", href: "/" },
  { label: "درباره من", href: "/about" },
  { label: "حوزه‌های تخصصی", href: "/expertise" },
  { label: "کارگزاری‌ها", href: "/network" },
  { label: "مقالات", href: "/insights" },
  { label: "تماس", href: "/contact" },
];

export const SOCIAL_LINKS = [
  // در صورت وجود، لینک‌های رسمی شبکه‌های اجتماعی اینجا قرار می‌گیرند
  // { platform: "LinkedIn", url: "https://linkedin.com/in/..." }
];
