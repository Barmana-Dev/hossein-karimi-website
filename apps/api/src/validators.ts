import { z } from "zod";

// ===== اسلاگ =====
// 👇 اسلاگ باید یک segment معتبر از URL باشد؛ / ? # % \ و فاصله مجاز نیست
const slugField = z
  .string()
  .trim()
  .min(1, "اسلاگ الزامی است")
  .max(100)
  .regex(
    /^[^\/\\?#%\s]+$/,
    "اسلاگ نمی‌تواند شامل / ، ? ، # ، % یا فاصله باشد",
  )
  // 👇 "." و ".." در نرمال‌سازی URL به مسیر جاری/والد تبدیل می‌شوند و لینک مقاله را می‌شکنند
  .refine((value) => !/^\.+$/.test(value), {
    message: "اسلاگ نمی‌تواند فقط از نقطه تشکیل شود",
  });

// ===== Experience =====
// 👇 فقط آدرس http/https یا مقدار خالی/تهی پذیرفته می‌شود (جلوگیری از javascript:)
const optionalExternalUrl = z
  .string()
  .max(500)
  .refine((value) => value === "" || /^https?:\/\//i.test(value), {
    message: "آدرس باید با http یا https شروع شود",
  })
  .nullable()
  .optional();

export const experienceCreateSchema = z.object({
  slug: slugField,
  title: z.string().min(1, "عنوان الزامی است").max(200),
  organization: z.string().min(1, "نهاد الزامی است").max(200),
  category: z.enum(["customs", "legal", "management", "education", "business"]),
  role: z.string().min(1, "سمت الزامی است").max(100),
  description: z.string().min(1, "توضیحات الزامی است"),
  status: z.enum(["published", "draft"]),
  startDate: z.string().datetime().nullable().optional(),
  endDate: z.string().datetime().nullable().optional(),
  sourceUrl: optionalExternalUrl,
});

export const experienceUpdateSchema = experienceCreateSchema.partial();

// ===== Article =====
export const articleCreateSchema = z.object({
  slug: slugField,
  title: z.string().min(1, "عنوان الزامی است").max(200),
  excerpt: z.string().min(1, "خلاصه الزامی است"),
  body: z.string().min(1, "متن مقاله الزامی است"),
  category: z.string().min(1, "دسته‌بندی الزامی است").max(100),
  readTime: z
    .number()
    .int()
    .min(1, "زمان مطالعه باید حداقل ۱ دقیقه باشد")
    .max(120),
  status: z.enum(["published", "review", "draft"], {
    message: "وضعیت نامعتبر است",
  }),
  publishedAt: z.string().datetime().nullable().optional(),
  coverImage: z.string().nullable().optional(),
  metaTitle: z.string().max(200).nullable().optional(),
  metaDescription: z.string().max(500).nullable().optional(),
  // 👇 authorName حذف شد (بک‌اند خودش ست می‌کنه)
});

export const articleUpdateSchema = articleCreateSchema.partial();

// ===== Agency (Network) =====
export const agencyCreateSchema = z.object({
  slug: slugField,
  name: z.string().min(1, "نام مجموعه الزامی است").max(200),
  description: z.string().min(1, "توضیحات الزامی است"),
  field: z.string().min(1, "حوزه فعالیت الزامی است").max(100),
  relationType: z.string().min(1, "نوع ارتباط الزامی است").max(50),
  relationDescription: z.string().nullable().optional(),
  city: z.string().nullable().optional(),
  websiteUrl: optionalExternalUrl,
  logoImage: z.string().nullable().optional(),
  featured: z.boolean().optional(),
  status: z.enum(["published", "draft"], { message: "وضعیت نامعتبر است" }),
  sortOrder: z.number().int().optional(),
});

export const agencyUpdateSchema = agencyCreateSchema.partial();

// ===== Expertise =====
export const expertiseCreateSchema = z.object({
  slug: slugField,
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
  // 👇 آدرس منبع روی سایت عمومی به‌صورت لینک رندر می‌شود؛ فقط http/https مجاز است
  sourceUrl: optionalExternalUrl,
  image: z.string().max(500).nullable().optional(),
  happenedAt: z.string().datetime().nullable().optional(),
  status: z.enum(["published", "draft"], { message: "وضعیت نامعتبر است" }),
});

export const mediaUpdateSchema = mediaCreateSchema.partial();

// ===== تنظیمات سایت =====
const optionalUrl = z
  .string()
  .max(500)
  .refine((value) => value === "" || /^https?:\/\//i.test(value), {
    message: "آدرس باید با http یا https شروع شود",
  })
  .nullable()
  .optional();

const optionalText = (max = 20000) =>
  z.string().max(max, "متن بیش از حد طولانی است").nullable().optional();

export const settingsUpdateSchema = z
  .object({
    siteTitle: z
      .string()
      .min(1, "عنوان سایت نمی‌تواند خالی باشد")
      .max(200)
      .optional(),
    subtitle: z.string().max(200).optional(),
    biographyShort: z.string().max(2000).optional(),
    contactEmail: z
      .string()
      .max(200)
      .refine((value) => value === "" || z.string().email().safeParse(value).success, {
        message: "ایمیل نامعتبر است",
      })
      .optional(),
    phone: z.string().max(50).optional(),
    address: optionalText(500),
    instagramUrl: optionalUrl,
    linkedinUrl: optionalUrl,
    telegramUrl: optionalUrl,
    seoTitle: optionalText(200),
    seoDescription: optionalText(500),
    portraitImage: optionalText(500),
    aboutContent: optionalText(100000),
    keyField: optionalText(200),
    keyDegree: optionalText(200),
    keyLanguages: optionalText(200),
    contactContent: optionalText(100000),
    termsContent: optionalText(100000),
    privacyContent: optionalText(100000),
  })
  .strict();

// ===== کاربران ادمین =====
export const adminRoleSchema = z.enum(
  ["SUPER_ADMIN", "EDITOR", "INQUIRY_MANAGER"],
  { message: "نقش نامعتبر است" },
);

const emailField = z
  .string()
  .trim()
  .email("ایمیل نامعتبر است")
  .max(200)
  .transform((value) => value.toLowerCase());

// 👇 bcrypt فقط ۷۲ بایت اول رمز را مقایسه می‌کند؛ پس بخش اضافی نباید پذیرفته شود
const passwordField = z
  .string()
  .min(8, "رمز عبور باید حداقل ۸ کاراکتر باشد")
  .max(72, "رمز عبور بیش از حد طولانی است")
  .refine((value) => Buffer.byteLength(value, "utf8") <= 72, {
    message: "رمز عبور نباید بیشتر از ۷۲ بایت (UTF-8) باشد",
  });

export const adminUserCreateSchema = z
  .object({
    name: z.string().trim().min(2, "نام الزامی است").max(120),
    email: emailField,
    password: passwordField,
    role: adminRoleSchema,
    isActive: z.boolean().optional(),
  })
  .strict();

export const adminUserUpdateSchema = z
  .object({
    name: z.string().trim().min(2, "نام الزامی است").max(120).optional(),
    email: emailField.optional(),
    password: passwordField.optional().or(z.literal("")),
    role: adminRoleSchema.optional(),
    isActive: z.boolean().optional(),
  })
  .strict();

export const profileUpdateSchema = z
  .object({
    name: z.string().trim().min(2, "نام الزامی است").max(120).optional(),
    email: emailField.optional(),
    password: passwordField.optional().or(z.literal("")),
    // 👇 هنگام تعیین رمز جدید، رمز فعلی برای تأیید هویت الزامی است
    currentPassword: z.string().max(200).optional().or(z.literal("")),
  })
  .strict();

// ===== تغییر وضعیت درخواست تماس =====
export const inquiryUpdateSchema = z
  .object({
    status: z
      .enum(["new", "in_review", "contacted", "closed"], {
        message: "وضعیت نامعتبر است",
      })
      .optional(),
    internalNote: z
      .string()
      .max(4000, "یادداشت داخلی بیش از حد طولانی است")
      .nullable()
      .optional(),
  })
  .strict()
  .refine((data) => data.status !== undefined || data.internalNote !== undefined, {
    message: "هیچ فیلد قابل تغییری ارسال نشده است",
  });
