import type {
  SiteSettings,
  Experience,
  Expertise,
  Agency,
  Article,
  MediaItem,
} from "@/types";

export const siteSettings: SiteSettings = {
  siteTitle: "دکتر حسین کریمی",
  subtitle: "حقوق • امور گمرکی • تجارت",
  biographyShort:
    "پایگاه حرفه‌ای معرفی شخصیت، سوابق و تخصص‌ها؛ با تمرکز بر مشاوره حقوقی و گمرکی، همکاری با مجموعه‌های معتبر و ارائه راهکارهای تخصصی در حوزه تجارت داخلی و بین‌الملل.",
  contactEmail: "info@example.com",
  phone: "—",
  socials: [],
};

export const experiences: Experience[] = [
  {
    id: "1",
    title: "عنوان سوابق نیازمند تأیید",
    slug: "customs-experience-1",
    organization: "نام نهاد / مجموعه",
    category: "customs",
    role: "سمت دقیق",
    startDate: null,
    endDate: null,
    description:
      "توضیحات دقیق فعالیت پس از دریافت مستندات و تأیید صاحب سایت درج خواهد شد.",
    sourceUrl: null,
    status: "draft",
  },
  {
    id: "2",
    slug: "legal-experience-1",
    title: "عنوان سوابق نیازمند تأیید",
    organization: "نام نهاد / مجموعه",
    category: "legal",
    role: "سمت دقیق",
    startDate: null,
    endDate: null,
    description:
      "توضیحات دقیق فعالیت پس از دریافت مستندات و تأیید صاحب سایت درج خواهد شد.",
    sourceUrl: null,
    status: "draft",
  },
  {
    id: "3",
    slug: "business-experience-1",
    title: "عنوان سوابق نیازمند تأیید",
    organization: "نام نهاد / مجموعه",
    category: "business",
    role: "سمت دقیق",
    startDate: null,
    endDate: null,
    description:
      "توضیحات دقیق فعالیت پس از دریافت مستندات و تأیید صاحب سایت درج خواهد شد.",
    sourceUrl: null,
    status: "draft",
  },
];

export const expertises: Expertise[] = [
  {
    id: "1",
    title: "امور حقوقی و مشاوره",
    slug: "legal-affairs",
    summary:
      "مشاوره تخصصی در زمینه قراردادها، اختلافات تجاری و مسائل حقوقی کسب‌وکار.",
    body: "محتوای کامل این حوزه پس از تأیید صاحب سایت درج خواهد شد.",
    icon: "scale",
    status: "published",
  },
  {
    id: "2",
    title: "امور گمرکی و ترخیص",
    slug: "customs-affairs",
    summary:
      "مقررات گمرکی، فرایندهای ترخیص و مشاوره در امور مرتبط با تجارت خارجی.",
    body: "محتوای کامل این حوزه پس از تأیید صاحب سایت درج خواهد شد.",
    icon: "package",
    status: "published",
  },
  {
    id: "3",
    title: "تجارت داخلی و بین‌الملل",
    slug: "trade",
    summary: "تحلیل مقررات تجارت، ریسک‌های قراردادی و مسیرهای توسعه کسب‌وکار.",
    body: "محتوای کامل این حوزه پس از تأیید صاحب سایت درج خواهد شد.",
    icon: "globe",
    status: "published",
  },
  {
    id: "4",
    title: "توسعه و همکاری",
    slug: "development",
    summary: "همکاری با مجموعه‌های تخصصی، کارگزاری‌ها و توسعه شبکه حرفه‌ای.",
    body: "محتوای کامل این حوزه پس از تأیید صاحب سایت درج خواهد شد.",
    icon: "users",
    status: "published",
  },
];

export const agencies: Agency[] = [
  {
    id: "1",
    name: "نام مجموعه / کارگزاری",
    slug: "agency-1",
    description: "معرفی مختصر مجموعه، حوزه فعالیت و نوع ارتباط با دکتر کریمی.",
    field: "امور گمرکی",
    relationType: "در انتظار تأیید",
    relationDescription: "نوع ارتباط پس از تأیید صاحب سایت درج می‌شود.",
    city: null,
    websiteUrl: null,
    featured: true,
    status: "draft",
  },
  {
    id: "2",
    name: "نام مجموعه / کارگزاری",
    slug: "agency-2",
    description: "معرفی مختصر مجموعه، حوزه فعالیت و نوع ارتباط با دکتر کریمی.",
    field: "حقوق تجارت",
    relationType: "در انتظار تأیید",
    relationDescription: "نوع ارتباط پس از تأیید صاحب سایت درج می‌شود.",
    city: null,
    websiteUrl: null,
    featured: true,
    status: "draft",
  },
  {
    id: "3",
    name: "نام مجموعه / کارگزاری",
    slug: "agency-3",
    description: "معرفی مختصر مجموعه، حوزه فعالیت و نوع ارتباط با دکتر کریمی.",
    field: "تجارت بین‌الملل",
    relationType: "در انتظار تأیید",
    relationDescription: "نوع ارتباط پس از تأیید صاحب سایت درج می‌شود.",
    city: null,
    websiteUrl: null,
    featured: true,
    status: "draft",
  },
];

export const articles: Article[] = [
  {
    id: "1",
    title: "عنوان مقاله نمونه درباره فرایندهای تجارت و گمرک",
    slug: "article-1",
    excerpt: "خلاصه کوتاه مقاله در چند خط برای نمایش در صفحه اصلی.",
    body: "محتوای کامل مقاله پس از تأیید درج خواهد شد.",
    authorName: "دکتر حسین کریمی",
    category: "حقوق تجارت",
    publishedAt: "2024-01-01",
    readTime: 5,
    status: "draft",
  },
  {
    id: "2",
    title: "عنوان مقاله نمونه درباره ریسک‌های قراردادی",
    slug: "article-2",
    excerpt: "خلاصه کوتاه مقاله در چند خط برای نمایش در صفحه اصلی.",
    body: "محتوای کامل مقاله پس از تأیید درج خواهد شد.",
    authorName: "دکتر حسین کریمی",
    category: "امور گمرکی",
    publishedAt: "2024-01-01",
    readTime: 7,
    status: "draft",
  },
  {
    id: "3",
    title: "عنوان مقاله نمونه درباره مقررات تجارت",
    slug: "article-3",
    excerpt: "خلاصه کوتاه مقاله در چند خط برای نمایش در صفحه اصلی.",
    body: "محتوای کامل مقاله پس از تأیید درج خواهد شد.",
    authorName: "دکتر حسین کریمی",
    category: "تحلیل",
    publishedAt: "2024-01-01",
    readTime: 4,
    status: "draft",
  },
];

export const mediaItems: MediaItem[] = [];
