import { z } from "zod";

// ===== Experience =====
export const experienceCreateSchema = z.object({
  slug: z
    .string()
    .min(1, "اسلاگ الزامی است")
    .max(100, "اسلاگ حداکثر ۱۰۰ کاراکتر"),
  title: z
    .string()
    .min(1, "عنوان الزامی است")
    .max(200, "عنوان حداکثر ۲۰۰ کاراکتر"),
  organization: z.string().min(1, "نهاد الزامی است").max(200),
  category: z.enum(
    ["customs", "legal", "management", "education", "business"],
    {
      message: "دسته‌بندی نامعتبر است",
    },
  ),
  role: z.string().min(1, "سمت الزامی است").max(100),
  description: z.string().min(1, "توضیحات الزامی است"),
  status: z.enum(["published", "draft"], { message: "وضعیت نامعتبر است" }),
  startDate: z.string().datetime().nullable().optional(),
  endDate: z.string().datetime().nullable().optional(),
});

export const experienceUpdateSchema = experienceCreateSchema.partial();

// ===== Article =====
export const articleCreateSchema = z.object({
  slug: z.string().min(1, "اسلاگ الزامی است").max(100),
  title: z.string().min(1, "عنوان الزامی است").max(200),
  excerpt: z.string().min(1, "خلاصه الزامی است"),
  body: z.string().min(1, "متن مقاله الزامی است"),
  authorName: z.string().min(1, "نام نویسنده الزامی است").max(100),
  category: z.string().min(1, "دسته‌بندی الزامی است").max(100),
  readTime: z
    .number()
    .int()
    .min(1, "زمان مطالعه باید حداقل ۱ دقیقه باشد")
    .max(120),
  status: z.enum(["published", "draft"], { message: "وضعیت نامعتبر است" }),
  publishedAt: z.string().datetime().nullable().optional(),
  coverImage: z.string().nullable().optional(),
});

export const articleUpdateSchema = articleCreateSchema.partial();

// ===== Agency (Network) =====
export const agencyCreateSchema = z.object({
  slug: z.string().min(1, "اسلاگ الزامی است").max(100),
  name: z.string().min(1, "نام مجموعه الزامی است").max(200),
  description: z.string().min(1, "توضیحات الزامی است"),
  field: z.string().min(1, "حوزه فعالیت الزامی است").max(100),
  relationType: z.string().min(1, "نوع ارتباط الزامی است").max(50),
  relationDescription: z.string().nullable().optional(),
  city: z.string().nullable().optional(),
  websiteUrl: z.string().nullable().optional(),
  logoImage: z.string().nullable().optional(),
  featured: z.boolean().optional(),
  status: z.enum(["published", "draft"], { message: "وضعیت نامعتبر است" }),
  sortOrder: z.number().int().optional(),
});

export const agencyUpdateSchema = agencyCreateSchema.partial();

// ===== Expertise =====
export const expertiseCreateSchema = z.object({
  slug: z.string().min(1, "اسلاگ الزامی است").max(100),
  title: z.string().min(1, "عنوان الزامی است").max(200),
  summary: z.string().min(1, "خلاصه الزامی است"),
  body: z.string().min(1, "متن الزامی است"),
  icon: z.enum(["scale", "package", "globe", "users"], {
    message: "آیکون نامعتبر است",
  }),
  sortOrder: z.number().int().optional(),
  status: z.enum(["published", "draft"], { message: "وضعیت نامعتبر است" }),
});

export const expertiseUpdateSchema = expertiseCreateSchema.partial();

// ===== Media =====
export const mediaCreateSchema = z.object({
  type: z.enum(["news", "interview", "speech", "event", "video"], {
    message: "نوع رسانه نامعتبر است",
  }),
  title: z.string().min(1, "عنوان الزامی است").max(200),
  description: z.string().nullable().optional(),
  sourceUrl: z.string().nullable().optional(),
  image: z.string().nullable().optional(),
  happenedAt: z.string().datetime().nullable().optional(),
  status: z.enum(["published", "draft"], { message: "وضعیت نامعتبر است" }),
});

export const mediaUpdateSchema = mediaCreateSchema.partial();
