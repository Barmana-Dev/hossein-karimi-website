import path from "node:path";
import fs from "node:fs";
import dotenv from "dotenv";

export type AppEnv = "development" | "production";

// 👇 حالت اجرا: دولوپمنت (برنامه‌نویس) یا پروداکشن (محصول نهایی)
function detectAppEnv(): AppEnv {
  if (process.env.APP_ENV === "production") return "production";
  if (process.env.APP_ENV === "development") return "development";
  if (process.argv.includes("--production")) return "production";
  if (process.env.NODE_ENV === "production") return "production";
  return "development";
}

export const appEnv = detectAppEnv();
export const isProduction = appEnv === "production";

// .env پایه خوانده می‌شود و سپس .env.development یا .env.production روی آن اعمال می‌شود
const baseEnvFile = path.resolve(process.cwd(), ".env");
const modeEnvFile = path.resolve(process.cwd(), `.env.${appEnv}`);
dotenv.config({ path: baseEnvFile });
dotenv.config({ path: modeEnvFile, override: true });

function readNumber(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function readOrigins(value: string | undefined, fallback: string[]): string[] {
  const list = (value || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
  return list.length > 0 ? list : fallback;
}

function fail(message: string): never {
  console.error(`⛔ ${message}`);
  process.exit(1);
}

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  fail(
    "متغیر محیطی DATABASE_URL تنظیم نشده است. فایل .env (یا .env." +
      appEnv +
      ") را کامل کنید.",
  );
}

// 👇 در پروداکشن هیچ مقدار پیش‌فرض یا ناامنی پذیرفته نمی‌شود
const DEV_JWT_SECRET = "development-only-secret-change-me";
let jwtSecret = process.env.JWT_SECRET || "";

if (isProduction) {
  if (!jwtSecret || jwtSecret.length < 32) {
    fail(
      "در پروداکشن باید JWT_SECRET تنظیم شود و حداقل ۳۲ کاراکتر باشد.",
    );
  }
} else if (!jwtSecret) {
  jwtSecret = DEV_JWT_SECRET;
  console.warn(
    "⚠️  JWT_SECRET تنظیم نشده است؛ از مقدار مخصوص دولوپمنت استفاده می‌شود.",
  );
}

const defaultOrigins = isProduction ? [] : ["http://localhost:3000"];
const corsOrigins = readOrigins(process.env.CORS_ORIGINS, defaultOrigins);

if (corsOrigins.length === 0) {
  fail("در پروداکشن باید CORS_ORIGINS شامل دامنهٔ فرانت‌اند باشد.");
}

if (isProduction && corsOrigins.every((origin) => origin.includes("localhost"))) {
  fail("در پروداکشن CORS_ORIGINS نباید به localhost اشاره کند.");
}

// 👇 وقتی وب و API روی دو زیردامنه هستند (مثلاً site.com و api.site.com)
// کوکی باید روی دامنهٔ والد تنظیم شود تا Proxy وب آن را ببیند.
const cookieDomain = (process.env.COOKIE_DOMAIN || "").trim() || undefined;

const uploadsDir = path.resolve(
  process.cwd(),
  process.env.UPLOADS_DIR || "uploads",
);

// پوشهٔ آپلود باید از ابتدا وجود داشته باشد تا آپلود با خطای ۵۰۰ شکست نخورد
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

export const config = {
  appEnv,
  isProduction,
  port: readNumber(process.env.PORT, 4000),
  databaseUrl,
  jwtSecret,
  corsOrigins,
  uploadsDir,
  // در پروداکشن سخت‌گیرانه‌تر است تا ارسال فرم محدود شود
  inquiryRateLimitMax: readNumber(
    process.env.INQUIRY_RATE_LIMIT_MAX,
    isProduction ? 5 : 100,
  ),
  loginRateLimitMax: readNumber(
    process.env.LOGIN_RATE_LIMIT_MAX,
    isProduction ? 10 : 100,
  ),
  // محدودیت کلی درخواست‌های API برای جلوگیری از سوءاستفاده
  apiRateLimitMax: readNumber(
    process.env.API_RATE_LIMIT_MAX,
    isProduction ? 600 : 5000,
  ),
  trustProxy: isProduction
    ? readNumber(process.env.TRUST_PROXY, 1)
    : readNumber(process.env.TRUST_PROXY, 0),
  enableSwagger:
    process.env.ENABLE_SWAGGER === "true" || !isProduction,
  cookieSecure: isProduction,
  cookieDomain,
  // آدرس وب‌هوک خطا (اختیاری) برای مانیتورینگ متمرکز
  errorWebhookUrl: (process.env.ERROR_WEBHOOK_URL || "").trim(),
} as const;
