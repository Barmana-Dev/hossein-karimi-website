import { prisma } from "./src/config/prisma";
import bcrypt from "bcryptjs";

async function main() {
  console.log("⏳ در حال پاکسازی داده‌های قبلی...");
  await prisma.article.deleteMany();
  await prisma.agency.deleteMany();

  console.log("⏳ در حال ساخت داده‌های جدید...");

  // 👇 این بخش را قبل از خط console.log نهایی اضافه کنید
  await prisma.experience.deleteMany(); // پاک کردن سوابق قبلی

  await prisma.experience.createMany({
    data: [
      {
        slug: "customs-consultant",
        title: "مشاور ارشد امور گمرکی",
        organization: "گمرک جمهوری اسلامی ایران",
        category: "customs",
        role: "مشاور",
        startDate: new Date("2021-03-21"),
        endDate: null,
        description:
          "همکاری در تدوین و بازبینی مقررات گمرکی و ارائه مشاوره تخصصی به واحدهای مختلف.",
        status: "published",
      },
      {
        slug: "agency-collaboration",
        title: "همکاری با کارگزاری آلفا",
        organization: "کارگزاری آلفا",
        category: "business",
        role: "مشاور حقوقی",
        startDate: new Date("2019-08-03"),
        endDate: new Date("2021-03-20"),
        description:
          "مشاوره حقوقی در زمینه قراردادهای تجاری و پیگیری پرونده‌های گمرکی.",
        status: "published",
      },
      {
        slug: "board-member",
        title: "عضو هیئت مدیره",
        organization: "شرکت بازرگانی بتا",
        category: "management",
        role: "عضو",
        startDate: new Date("2016-05-01"),
        endDate: new Date("2019-08-03"),
        description:
          "نظارت بر امور حقوقی و تجاری شرکت و توسعه روابط بین‌الملل.",
        status: "published",
      },
    ],
  });

  await prisma.expertise.deleteMany();

  await prisma.expertise.createMany({
    data: [
      {
        slug: "legal-affairs",
        title: "امور حقوقی و مشاوره",
        summary:
          "مشاوره تخصصی در زمینه قراردادها، اختلافات تجاری و مسائل حقوقی کسب‌وکار.",
        body: "متن کامل حوزه حقوقی...",
        icon: "scale",
        sortOrder: 1,
        status: "published",
      },
      {
        slug: "customs-affairs",
        title: "امور گمرکی و ترخیص",
        summary:
          "مقررات گمرکی، فرایندهای ترخیص و مشاوره در امور مرتبط با تجارت خارجی.",
        body: "متن کامل حوزه گمرکی...",
        icon: "package",
        sortOrder: 2,
        status: "published",
      },
      {
        slug: "trade",
        title: "تجارت داخلی و بین‌الملل",
        summary:
          "تحلیل مقررات تجارت، ریسک‌های قراردادی و مسیرهای توسعه کسب‌وکار.",
        body: "متن کامل حوزه تجارت...",
        icon: "globe",
        sortOrder: 3,
        status: "published",
      },
      {
        slug: "development",
        title: "توسعه و همکاری",
        summary:
          "همکاری با مجموعه‌های تخصصی، کارگزاری‌ها و توسعه شبکه حرفه‌ای.",
        body: "متن کامل حوزه توسعه...",
        icon: "users",
        sortOrder: 4,
        status: "published",
      },
    ],
  });

  // 👇 ساخت کاربر ادمین
  const passwordHash = await bcrypt.hash("admin123", 10);
  await prisma.adminUser.upsert({
    where: { email: "admin@example.com" },
    update: {
      passwordHash: passwordHash, // 👈 اگر کاربر وجود داشت، رمز را آپدیت کن
    },
    create: {
      name: "مدیر ارشد",
      email: "admin@example.com",
      passwordHash,
      role: "SUPER_ADMIN",
    },
  });
  console.log("✅ Admin user created: admin@example.com / admin123");

  // ساخت کاربر ادیتور
  const editorPassword = await bcrypt.hash("editor123", 10);
  await prisma.adminUser.upsert({
    where: { email: "editor@example.com" },
    update: {
      passwordHash: editorPassword, // 👈 اگر کاربر وجود داشت، رمز را آپدیت کن
    },
    create: {
      name: "نویسنده مقالات",
      email: "editor@example.com",
      passwordHash: editorPassword,
      role: "EDITOR", // 👈 نقش ادیتور
    },
  });
  console.log("✅ Editor user created: editor@example.com / editor123");

  // ساخت مقالات تستی
  await prisma.article.createMany({
    data: [
      {
        slug: "customs-regulations-2024",
        title: "تحلیل مقررات گمرکی در سال ۱۴۰۳",
        excerpt:
          "بررسی تغییرات جدید در قوانین گمرکی و تاثیر آن بر واردات و صادرات.",
        body: "متن کامل مقاله در اینجا قرار می‌گیرد...",
        authorName: "دکتر حسین کریمی",
        category: "امور گمرکی",
        readTime: 5,
        status: "published",
        publishedAt: new Date(),
      },
      {
        slug: "contract-risks",
        title: "ریسک‌های قراردادی در تجارت بین‌الملل",
        excerpt:
          "چگونه از بروز اختلافات در قراردادهای بین‌المللی جلوگیری کنیم؟",
        body: "متن کامل مقاله در اینجا قرار می‌گیرد...",
        authorName: "دکتر حسین کریمی",
        category: "حقوق تجارت",
        readTime: 7,
        status: "published",
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
        status: "published",
        publishedAt: new Date(Date.now() - 172800000),
      },
    ],
  });

  // ساخت کارگزاری‌های تستی
  await prisma.agency.createMany({
    data: [
      {
        slug: "agency-alpha",
        name: "کارگزاری آلفا",
        description: "ارائه خدمات جامع در حوزه ترخیص کالا و امور گمرکی.",
        field: "امور گمرکی",
        relationType: "مشاور",
        relationDescription:
          "همکاری در زمینه مشاوره حقوقی و حل اختلافات گمرکی.",
        city: "تهران",
        websiteUrl: "https://example.com",
        featured: true,
        status: "published",
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
        status: "published",
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
        status: "published",
        sortOrder: 3,
      },
    ],
  });

  console.log("✅ داده‌های تستی (مقالات و کارگزاری‌ها) با موفقیت ساخته شدند.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
