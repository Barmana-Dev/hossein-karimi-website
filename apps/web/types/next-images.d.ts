// 👇 اعلان‌های ماژول‌های تصویری Next (png/jpg/webp/svg/...)
// next-env.d.ts توسط Next ساخته می‌شود و در گیت نیست؛ بدون این فایل،
// typecheck روی checkout تازه پیش از اولین build با TS2307 شکست می‌خورد.
/// <reference types="next/image-types/global" />
