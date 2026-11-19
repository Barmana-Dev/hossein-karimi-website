import test from "node:test";
import assert from "node:assert/strict";

import { isValidPhone, normalizePhoneDigits } from "../src/lib/phone";
import {
  settingsUpdateSchema,
  inquiryUpdateSchema,
  adminUserCreateSchema,
  adminUserUpdateSchema,
  articleCreateSchema,
  agencyCreateSchema,
  experienceCreateSchema,
} from "../src/validators";

test("settingsUpdateSchema فقط فیلدهای شناخته‌شده را می‌پذیرد", () => {
  assert.equal(settingsUpdateSchema.safeParse({ siteTitle: "عنوان" }).success, true);
  assert.equal(
    settingsUpdateSchema.safeParse({ siteTitle: "عنوان", isAdmin: true }).success,
    false,
  );
});

test("settingsUpdateSchema عنوان خالی، ایمیل بد و آدرس غیر http را رد می‌کند", () => {
  assert.equal(settingsUpdateSchema.safeParse({ siteTitle: "" }).success, false);
  assert.equal(settingsUpdateSchema.safeParse({ contactEmail: "not-an-email" }).success, false);
  assert.equal(settingsUpdateSchema.safeParse({ contactEmail: "" }).success, true);
  assert.equal(
    settingsUpdateSchema.safeParse({ instagramUrl: "javascript:alert(1)" }).success,
    false,
  );
  assert.equal(
    settingsUpdateSchema.safeParse({ instagramUrl: "https://instagram.com/x" }).success,
    true,
  );
  assert.equal(settingsUpdateSchema.safeParse({ instagramUrl: null }).success, true);
});

test("inquiryUpdateSchema بدنهٔ خالی، وضعیت نامعتبر و فیلد اضافه را رد می‌کند", () => {
  assert.equal(inquiryUpdateSchema.safeParse({}).success, false);
  assert.equal(inquiryUpdateSchema.safeParse({ status: "unknown" }).success, false);
  assert.equal(inquiryUpdateSchema.safeParse({ status: "closed" }).success, true);
  assert.equal(
    inquiryUpdateSchema.safeParse({ status: "new", fullName: "hack" }).success,
    false,
  );
  assert.equal(inquiryUpdateSchema.safeParse({ internalNote: null }).success, true);
});

test("adminUserCreateSchema ایمیل را نرمال و رمز کوتاه را رد می‌کند", () => {
  const parsed = adminUserCreateSchema.safeParse({
    name: "مدیر",
    email: "  ADMIN@Example.COM ",
    password: "longenough123",
    role: "EDITOR",
  });
  assert.equal(parsed.success, true);
  assert.equal(parsed.data.email, "admin@example.com");

  assert.equal(
    adminUserCreateSchema.safeParse({
      name: "مدیر",
      email: "admin@example.com",
      password: "short",
      role: "EDITOR",
    }).success,
    false,
  );
  assert.equal(
    adminUserCreateSchema.safeParse({
      name: "مدیر",
      email: "admin@example.com",
      password: "longenough123",
      role: "HACKER",
    }).success,
    false,
  );
});

test("adminUserUpdateSchema رمز خالی را می‌پذیرد ولی فیلد ناشناخته را نه", () => {
  assert.equal(adminUserUpdateSchema.safeParse({ password: "" }).success, true);
  assert.equal(adminUserUpdateSchema.safeParse({ role: "SUPER_ADMIN" }).success, true);
  assert.equal(adminUserUpdateSchema.safeParse({ passwordHash: "x" }).success, false);
});

test("articleCreateSchema الزامات پایه و وضعیت‌های مجاز را کنترل می‌کند", () => {
  const base = {
    slug: "ar-16",
    title: "عنوان",
    excerpt: "خلاصه",
    body: "متن",
    category: "حقوقی",
    readTime: 5,
    status: "published",
  };
  assert.equal(articleCreateSchema.safeParse(base).success, true);
  assert.equal(articleCreateSchema.safeParse({ ...base, status: "deleted" }).success, false);
  assert.equal(articleCreateSchema.safeParse({ ...base, readTime: 0 }).success, false);
  assert.equal(articleCreateSchema.safeParse({ ...base, readTime: 3.5 }).success, false);
  assert.equal(
    articleCreateSchema.safeParse({ ...base, publishedAt: "2026-01-01T00:00:00.000Z" }).success,
    true,
  );
});

test("articleCreateSchema اسلاگ نقطه‌ای را رد می‌کند", () => {
  const base = {
    slug: "ar-16",
    title: "عنوان",
    excerpt: "خلاصه",
    body: "متن",
    category: "حقوقی",
    readTime: 5,
    status: "published",
  };
  assert.equal(articleCreateSchema.safeParse({ ...base, slug: "." }).success, false);
  assert.equal(articleCreateSchema.safeParse({ ...base, slug: ".." }).success, false);
  assert.equal(articleCreateSchema.safeParse({ ...base, slug: "..." }).success, false);
  assert.equal(
    articleCreateSchema.safeParse({ ...base, slug: "article-123" }).success,
    true,
  );
  assert.equal(
    articleCreateSchema.safeParse({ ...base, slug: "../etc" }).success,
    false,
  );
});

test("شماره تماس فارسی، عربی و لاتین یکسان پذیرفته و رشتهٔ بدون رقم رد می‌شود", () => {
  assert.equal(isValidPhone("۰۹۱۲۳۴۵۶۷۸۹"), true);
  assert.equal(isValidPhone("٠٩١٢٣٤٥٦٧٨٩"), true);
  assert.equal(isValidPhone("09123456789"), true);
  assert.equal(isValidPhone("+989123456789"), true);
  assert.equal(isValidPhone("+++++++"), false);
  assert.equal(isValidPhone("-------"), false);
  assert.equal(isValidPhone("12345"), false);
  assert.equal(normalizePhoneDigits("۰۹۱۲۳۴۵۶۷۸۹"), "09123456789");
});

test("agencyCreateSchema آدرس وب‌سایت خطرناک را رد می‌کند", () => {
  const base = {
    slug: "agency-alpha",
    name: "کارگزاری",
    description: "توضیح",
    field: "گمرک",
    relationType: "همکار",
    status: "published",
  };
  assert.equal(agencyCreateSchema.safeParse(base).success, true);
  assert.equal(
    agencyCreateSchema.safeParse({ ...base, websiteUrl: "javascript:alert(1)" }).success,
    false,
  );
  assert.equal(
    agencyCreateSchema.safeParse({ ...base, websiteUrl: "https://example.com" }).success,
    true,
  );
});

test("experienceCreateSchema منبع غیر http را رد می‌کند", () => {
  const base = {
    slug: "customs-consultant",
    title: "سابقه",
    organization: "گمرک",
    category: "customs",
    role: "مشاور",
    description: "توضیح",
    status: "published",
  };
  assert.equal(experienceCreateSchema.safeParse(base).success, true);
  assert.equal(
    experienceCreateSchema.safeParse({ ...base, sourceUrl: "data:text/html,<script>" }).success,
    false,
  );
  assert.equal(
    experienceCreateSchema.safeParse({ ...base, sourceUrl: "https://example.com/a" }).success,
    true,
  );
});
