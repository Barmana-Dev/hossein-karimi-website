import { prisma } from "./src/config/prisma";
import bcrypt from "bcryptjs";

// 👇 فقط در محیط توسعه اجرا شود
if (process.env.NODE_ENV === "production") {
  console.error("⛔ Seed فقط در محیط توسعه قابل اجراست.");
  process.exit(1);
}

async function main() {
  console.log("⏳ در حال ساخت داده‌های نمونه (بدون پاک‌کردن داده‌های قبلی)...");

  // 👇 به‌جای deleteMany، از upsert استفاده می‌کنیم تا داده‌های قبلی حفظ شوند
  // و فقط داده‌های نمونه ساخته/به‌روزرسانی شوند.

  // ===== سوابق =====
  await prisma.experience.upsert({
    where: { slug: "customs-consultant" },
    update: {},
    create: {
      slug: "customs-consultant",
      title: "مشاور ارشد امور گمرکی",
      organization: "گمرک جمهوری اسلامی ایران",
      category: "customs",
      role: "مشاور",
      startDate: new Date("2021-03-21"),
      endDate: null,
      description:
        "همکاری در تدوین و بازبینی مقررات گمرکی و ارائه مشاوره تخصصی به واحدهای مختلف.",
      status: "draft", //  draft به‌جای published
    },
  });

  await prisma.experience.upsert({
    where: { slug: "agency-collaboration" },
    update: {},
    create: {
      slug: "agency-collaboration",
      title: "همکاری با کارگزاری آلفا",
      organization: "کارگزاری آلفا",
      category: "business",
      role: "مشاور حقوقی",
      startDate: new Date("2019-08-03"),
      endDate: new Date("2021-03-20"),
      description:
        "مشاوره حقوقی در زمینه قراردادهای تجاری و پیگیری پرونده‌های گمرکی.",
      status: "draft",
    },
  });

  await prisma.experience.upsert({
    where: { slug: "board-member" },
    update: {},
    create: {
      slug: "board-member",
      title: "عضو هیئت مدیره",
      organization: "شرکت بازرگانی بتا",
      category: "management",
      role: "عضو",
      startDate: new Date("2016-05-01"),
      endDate: new Date("2019-08-03"),
      description: "نظارت بر امور حقوقی و تجاری شرکت و توسعه روابط بین‌الملل.",
      status: "draft",
    },
  });

  // ===== حوزه‌های تخصصی =====
  const expertises = [
    {
      slug: "legal-affairs",
      title: "امور حقوقی و مشاوره",
      summary:
        "مشاوره تخصصی در زمینه قراردادها، اختلافات تجاری و مسائل حقوقی کسب‌وکار.",
      body: "متن کامل حوزه حقوقی...",
      icon: "scale",
      sortOrder: 1,
    },
    {
      slug: "customs-affairs",
      title: "امور گمرکی و ترخیص",
      summary:
        "مقررات گمرکی، فرایندهای ترخیص و مشاوره در امور مرتبط با تجارت خارجی.",
      body: "متن کامل حوزه گمرکی...",
      icon: "package",
      sortOrder: 2,
    },
    {
      slug: "trade",
      title: "تجارت داخلی و بین‌الملل",
      summary:
        "تحلیل مقررات تجارت، ریسک‌های قراردادی و مسیرهای توسعه کسب‌وکار.",
      body: "متن کامل حوزه تجارت...",
      icon: "globe",
      sortOrder: 3,
    },
    {
      slug: "development",
      title: "توسعه و همکاری",
      summary: "همکاری با مجموعه‌های تخصصی، کارگزاری‌ها و توسعه شبکه حرفه‌ای.",
      body: "متن کامل حوزه توسعه...",
      icon: "users",
      sortOrder: 4,
    },
  ];

  for (const exp of expertises) {
    await prisma.expertise.upsert({
      where: { slug: exp.slug },
      update: {},
      create: { ...exp, status: "draft" }, // 👈 draft
    });
  }

  // ===== کاربران ادمین (رمز فقط از env — بدون هیچ رمز پیش‌فرض) =====
  const adminPassword = process.env.SEED_ADMIN_PASSWORD;
  const editorPassword = process.env.SEED_EDITOR_PASSWORD;
  const inquiryManagerPassword = process.env.SEED_INQUIRY_MANAGER_PASSWORD;

  // 👇 بدون رمز، seed اجرا نمی‌شود (هیچ رمز ساده‌ای ساخته یا چاپ نمی‌شود)
  if (!adminPassword || !editorPassword || !inquiryManagerPassword) {
    const missing = [
      !adminPassword && "SEED_ADMIN_PASSWORD",
      !editorPassword && "SEED_EDITOR_PASSWORD",
      !inquiryManagerPassword && "SEED_INQUIRY_MANAGER_PASSWORD",
    ].filter(Boolean);

    console.error("⛔ اجرای seed بدون رمز پیش‌فرض مجاز نیست.");
    console.error(
      `   این متغیرهای محیطی را در فایل .env تنظیم کنید: ${missing.join(", ")}`,
    );
    process.exit(1);
  }

  const adminHash = await bcrypt.hash(adminPassword, 10);
  await prisma.adminUser.upsert({
    where: { email: "admin@example.com" },
    update: {}, // 👈 دیگر رمز را آپدیت نمی‌کنیم (برای جلوگیری از بازنویسی)
    create: {
      name: "مدیر ارشد",
      email: "admin@example.com",
      passwordHash: adminHash,
      role: "SUPER_ADMIN",
    },
  });
  console.log("✅ Admin user: admin@example.com");

  const editorHash = await bcrypt.hash(editorPassword, 10);
  await prisma.adminUser.upsert({
    where: { email: "editor@example.com" },
    update: {},
    create: {
      name: "نویسنده مقالات",
      email: "editor@example.com",
      passwordHash: editorHash,
      role: "EDITOR",
    },
  });
  console.log("✅ Editor user: editor@example.com");

  // 👇 نقش INQUIRY_MANAGER هم ساخته می‌شود (قبل‌تر رمزش خوانده می‌شد ولی حسابی نداشت)
  const inquiryManagerHash = await bcrypt.hash(inquiryManagerPassword, 10);
  await prisma.adminUser.upsert({
    where: { email: "inquiries@example.com" },
    update: {},
    create: {
      name: "مدیر درخواست‌ها",
      email: "inquiries@example.com",
      passwordHash: inquiryManagerHash,
      role: "INQUIRY_MANAGER",
    },
  });
  console.log("✅ Inquiry manager user: inquiries@example.com");

  // ===== مقالات =====
  const articles = [
    {
      slug: "customs-regulations-2024",
      title: "تحلیل مقررات گمرکی در سال ۱۴۰۳",
      excerpt:
        "بررسی تغییرات جدید در قوانین گمرکی و تاثیر آن بر واردات و صادرات.",
      body: "متن کامل مقاله در اینجا قرار می‌گیرد...",
      authorName: "دکتر حسین کریمی",
      category: "امور گمرکی",
      readTime: 5,
      publishedAt: new Date(),
    },
    {
      slug: "contract-risks",
      title: "ریسک‌های قراردادی در تجارت بین‌الملل",
      excerpt: "چگونه از بروز اختلافات در قراردادهای بین‌المللی جلوگیری کنیم؟",
      body: "متن کامل مقاله در اینجا قرار می‌گیرد...",
      authorName: "دکتر حسین کریمی",
      category: "حقوق تجارت",
      readTime: 7,
      publishedAt: new Date(Date.now() - 86400000),
    },
    {
      slug: "trade-laws-update",
      title: "بررسی قوانین جدید تجارت داخلی",
      excerpt: "نگاهی به آخرین مصوبات در حوزه تجارت داخلی.",
      body: "متن کامل مقاله در اینجا قرار می‌گیرد...",
      authorName: "دکتر حسین کریمی",
      category: "تحلیل مقررات",
      readTime: 4,
      publishedAt: new Date(Date.now() - 172800000),
    },
  ];

  for (const art of articles) {
    await prisma.article.upsert({
      where: { slug: art.slug },
      update: {},
      create: { ...art, status: "draft" },
    });
  }

  // ===== کارگزاری‌ها =====
  const agencies = [
    {
      slug: "agency-alpha",
      name: "کارگزاری آلفا",
      description: "ارائه خدمات جامع در حوزه ترخیص کالا و امور گمرکی.",
      field: "امور گمرکی",
      relationType: "مشاور",
      relationDescription: "همکاری در زمینه مشاوره حقوقی و حل اختلافات گمرکی.",
      city: "تهران",
      websiteUrl: "https://example.com",
      featured: true,
      sortOrder: 1,
    },
    {
      slug: "company-beta",
      name: "شرکت بازرگانی بتا",
      description: "واردات و صادرات کالاهای صنعتی و تجهیزات.",
      field: "حقوق تجارت",
      relationType: "همکار",
      relationDescription: "مشاوره در تنظیم قراردادهای بین‌المللی.",
      city: "بندرعباس",
      websiteUrl: "https://example.com",
      featured: false,
      sortOrder: 2,
    },
    {
      slug: "group-gamma",
      name: "گروه تجاری گاما",
      description: "توسعه تجارت بین‌الملل و سرمایه‌گذاری خارجی.",
      field: "تجارت بین‌الملل",
      relationType: "شریک",
      relationDescription: "مشارکت در پروژه‌های تجاری مشترک.",
      city: "دبی",
      websiteUrl: "https://example.com",
      featured: true,
      sortOrder: 3,
    },
  ];

  for (const agency of agencies) {
    await prisma.agency.upsert({
      where: { slug: agency.slug },
      update: {},
      create: { ...agency, status: "draft" }, // 👈 draft
    });
  }

  console.log("✅ داده‌های نمونه (همه draft) با موفقیت ساخته شدند.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
