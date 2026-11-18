-- ابطال نشست‌های قبلی پس از تغییر رمز یا خروج
ALTER TABLE "AdminUser" ADD COLUMN "tokenVersion" INTEGER NOT NULL DEFAULT 0;

-- فیلدهای سئوی اختصاصی مقاله
ALTER TABLE "Article" ADD COLUMN "metaTitle" TEXT;
ALTER TABLE "Article" ADD COLUMN "metaDescription" TEXT;
