# وب‌سایت شخصی دکتر حسین کریمی

پایگاه حرفه‌ای معرفی شخصیت، سوابق، تخصص‌ها و راه‌های ارتباط دکتر حسین کریمی در حوزه حقوق، امور گمرکی و تجارت.

پروژه دو بخش دارد:

- `apps/web` — فرانت‌اند Next.js (App Router)
- `apps/api` — API با Express + Prisma + PostgreSQL

> **نکتهٔ مهم:** پروژه دو حالت اجرای کاملاً جدا دارد:
> **دولوپمنت (Development)** برای برنامه‌نویس و **پروداکشن (Production)** برای محصول نهایی.
> فایل‌های محیطی، کلیدها، سطح امنیت و دستورهای اجرا در این دو حالت متفاوت‌اند و هیچ مقدار دولوپمنتی وارد پروداکشن نمی‌شود.

---

## ۱. پیش‌نیازها

- **Node.js 20.9 یا بالاتر** (Next.js 16 حداقل این نسخه را می‌خواهد) — `node -v`
- **npm**
- **Docker** (برای PostgreSQL) یا یک دیتابیس PostgreSQL در دسترس
- **Git**

---

## ۲. دریافت پروژه

```bash
git clone <repository-url>
cd hossein-karimi-website
```

---

## ۳. حالت توسعه (Development)

### ۳.۱. دیتابیس

```bash
docker compose up -d
docker compose ps
```

| مورد | مقدار |
| --- | --- |
| کاربر | `postgres` |
| رمز | `password` |
| نام دیتابیس | `hossein_karimi_db` |
| پورت | `5432` |

### ۳.۲. فایل‌های محیطی

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.development
```

`apps/api/.env` (نمونه):

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/hossein_karimi_db?schema=public"
PORT=4000
JWT_SECRET="change-me-in-production-min-32-characters"
CORS_ORIGINS="http://localhost:3000"
SEED_ADMIN_PASSWORD=""
SEED_EDITOR_PASSWORD=""
SEED_INQUIRY_MANAGER_PASSWORD=""
```

`apps/web/.env.development` (نمونه):

```env
NEXT_PUBLIC_API_URL="http://localhost:4000/api/v1"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
NEXT_PUBLIC_IMAGE_HOSTS=""
```

> اگر فایل `.env.local` هم بسازید، Next آن را بر `.env.development` ترجیح می‌دهد (برای تنظیمات شخصی).

### ۳.۳. نصب وابستگی‌ها

```bash
npm install
cd apps/api && npm install && cd ../..
```

### ۳.۴. ساخت دیتابیس

```bash
cd apps/api
npx prisma generate
npx prisma migrate dev
cd ../..
```

### ۳.۵. داده‌های نمونه (seed)

اول سه متغیر `SEED_*_PASSWORD` را در `apps/api/.env` مقدار دهید، سپس:

```bash
cd apps/api
npm run seed
cd ../..
```

- بدون این رمزها seed اجرا نمی‌شود و هیچ رمز پیش‌فرضی ساخته یا چاپ نمی‌شود.
- در حالت پروداکشن seed **اجرا نمی‌شود** (دستور به‌صورت خودکار متوقف می‌شود).
- حساب‌های ساخته‌شده: `admin@example.com` (`SUPER_ADMIN`)، `editor@example.com` (`EDITOR`)، `inquiries@example.com` (`INQUIRY_MANAGER`).
- محتوای نمونه (سوابق، حوزه‌ها، مقالات، کارگزاری‌ها) به‌صورت **پیش‌نویس** ساخته می‌شود و API عمومی فقط محتوای منتشرشده را برمی‌گرداند. فهرست داده‌های موردنیاز: `docs/content-needed.md`.

### ۳.۶. اجرا

دو ترمینال:

```bash
# ترمینال ۱ — API در حالت development
cd apps/api && npm run dev

# ترمینال ۲ — فرانت‌اند در حالت development
npm run dev
```

- سایت: <http://localhost:3000>
- API: <http://localhost:4000>
- سلامت API: <http://localhost:4000/api/health>
- آمادگی دیتابیس: <http://localhost:4000/api/health/db>
- مستندات API: <http://localhost:4000/api-docs>

---

## ۴. حالت پروداکشن (Production)

### ۴.۱. تنظیم فایل‌های محیطی

```bash
cp apps/api/.env.production.example apps/api/.env.production
cp apps/web/.env.production.example apps/web/.env.production
```

سپس مقادیر واقعی را وارد کنید. تفاوت‌های کلیدی با دولوپمنت:

| مورد | دولوپمنت | پروداکشن |
| --- | --- | --- |
| `DATABASE_URL` | دیتابیس محلی | دیتابیس محصول نهایی |
| `JWT_SECRET` | اختیاری (مقدار دولوپمنت) | **اجباری، حداقل ۳۲ کاراکتر** |
| `CORS_ORIGINS` | `http://localhost:3000` | دامنهٔ واقعی سایت (localhost مجاز نیست) |
| کوکی ورود | غیر `Secure` | `Secure` + `HttpOnly` + `SameSite=strict` |
| محدودیت فرم تماس | ۱۰۰ درخواست | ۵ درخواست در ۱۵ دقیقه |
| Swagger | فعال | غیرفعال (با `ENABLE_SWAGGER=true` فعال می‌شود) |
| `TRUST_PROXY` | ۰ | ۱ (پشت nginx/Cloudflare) |

در پروداکشن می‌توانید به‌جای فایل، همین متغیرها را در خود سرور تنظیم کنید؛ برنامه اولویت را به `.env.production` می‌دهد.

> ⚠️ مقدارهای `NEXT_PUBLIC_*` هنگام `build` داخل خروجی قرار می‌گیرند؛ قبل از build پروداکشن تنظیمشان کنید.

### ۴.۲. نصب، دیتابیس و build

```bash
npm install
npm ci --prefix apps/api

# دیتابیس محصول نهایی (بدون seed)
cd apps/api
npx prisma generate
npx prisma migrate deploy
npm run build
cd ../..

npm run build
```

### ۴.۳. اجرا

```bash
# API
cd apps/api && npm run start        # node dist/app.js --production

# فرانت‌اند
npm run start                       # next start
```

برنامه در حالت پروداکشن این موارد را **بررسی و در صورت نبود، اجرا را متوقف** می‌کند:

- نبود `DATABASE_URL`
- نبود یا کوتاه بودن `JWT_SECRET` (کمتر از ۳۲ کاراکتر)
- خالی بودن `CORS_ORIGINS` یا اشارهٔ آن به `localhost`

### ۴.۴. نکات استقرار

- پوشهٔ آپلود (`UPLOADS_DIR`) را روی فضای پایدار و با پشتیبان‌گیری منظم نگه دارید.
- پشت nginx/Cloudflare با HTTPS اجرا کنید تا کوکی `Secure` کار کند.
- مسیر `/api/health/db` برای مانیتورینگ آمادگی دیتابیس استفاده شود.

---

## ۵. دستورهای پروژه

| دستور | کار |
| --- | --- |
| `npm run dev` | اجرای فرانت‌اند در حالت توسعه |
| `npm run dev:api` | اجرای API در حالت توسعه |
| `npm run build` | build فرانت‌اند (پروداکشن) |
| `npm run build:api` | build API |
| `npm run build:prod` | build هر دو |
| `npm run start` | اجرای فرانت‌اند پروداکشن |
| `npm run start:api` | اجرای API پروداکشن |
| `npm run lint` | ESLint روی سورس فرانت‌اند و API |
| `npm run typecheck` | بررسی TypeScript هر دو بخش |
| `npm test` | تست‌های خودکار (وب + API) |

CI (`.github/workflows/ci.yml`) در هر push و pull request دستورهای lint، typecheck، test و build را اجرا می‌کند.

---

## ۵.۱. چگونه پروژه را تست کنیم

**۱) تست‌های خودکار (بدون نیاز به دیتابیس):**

```bash
npm test          # ۱۲ تست: اسکیماهای اعتبارسنجی API + توابع کمکی وب
npm run lint      # باید ۰ خطا و ۰ هشدار بدهد
npm run typecheck # باید بدون خطا تمام شود
```

**۲) تست دستی در حالت توسعه (روی دیتابیس محلی):**

```bash
npm run dev:api   # ترمینال ۱ — API روی http://localhost:4000
npm run dev       # ترمینال ۲ — سایت روی http://localhost:3000
curl http://localhost:4000/api/health      # {"status":"ok","env":"development"}
curl http://localhost:4000/api/health/db   # اتصال دیتابیس
```

مواردی که باید یک‌بار چشمی/دستی بررسی شود: ورود از `/login`، ساخت مقاله با تصویر در پنل و دیدن آن در `/insights`، ارسال فرم `/contact`، و باز شدن صفحات در عرض موبایل.

**۳) تست حالت پروداکشن روی همان دستگاه:**

```bash
# ۱. در apps/api فایل .env.production را از .env.production.example بسازید
# ۲. در apps/web فایل .env.production را از .env.production.example بسازید
npm run build:prod
npm run start:api   # API با فلگ --production؛ اگر تنظیمات ناقص باشد اجرا متوقف می‌شود
npm run start       # فرانت‌اند پروداکشن
curl http://localhost:4000/api/health   # {"status":"ok","env":"production"}
```

در حالت پروداکشن: Swagger خاموش است، کوکی ورود `Secure` می‌شود، محدودیت‌ها سخت‌گیرانه‌تر است و اجرا با `JWT_SECRET` کوتاه، `DATABASE_URL` خالی یا `CORS_ORIGINS` نامعتبر/لوکال متوقف می‌شود.

---

## ۶. نقش‌ها

| نقش | دسترسی |
| --- | --- |
| `SUPER_ADMIN` | همهٔ بخش‌ها، کاربران ادمین، تنظیمات و درخواست‌ها |
| `EDITOR` | مقالات، سوابق، حوزه‌ها، کارگزاری‌ها، رسانه و کتابخانهٔ رسانه |
| `INQUIRY_MANAGER` | فقط درخواست‌های ارتباط |

اطلاعات شخصی درخواست‌دهندگان فقط برای `SUPER_ADMIN` و `INQUIRY_MANAGER` برگردانده می‌شود.

---

## ۷. ساختار پروژه

```
.
├── apps
│   ├── api
│   │   ├── prisma            # schema و migration ها
│   │   ├── src
│   │   │   ├── config        # env.ts (تفکیک دولوپمنت/پروداکشن) و prisma
│   │   │   └── modules
│   │   ├── .env.example
│   │   ├── .env.production.example
│   │   └── seed.ts
│   └── web
│       ├── app
│       ├── components
│       ├── lib               # تنظیمات مشترک API و سایت
│       ├── .env.example
│       └── .env.production.example
├── docs
│   ├── discovery.md
│   └── content-needed.md
├── .github/workflows/ci.yml
└── docker-compose.yml
```

---

## ۸. عیب‌یابی

- **دیتابیس بالا نمی‌آید:** `docker compose logs db` و آزاد بودن پورت `5432` را بررسی کنید.
- **خطای اتصال فرانت‌اند به API:** `NEXT_PUBLIC_API_URL` را بررسی و سرور Next را دوباره اجرا کنید.
- **خطای CORS:** دامنهٔ فرانت‌اند را در `CORS_ORIGINS` اضافه کنید.
- **تصاویر نمایش داده نمی‌شوند:** API باید اجرا باشد (فایل‌ها از `/uploads` سرو می‌شوند) و `NEXT_PUBLIC_API_URL` درست باشد.
- **اجرای seed متوقف می‌شود:** یعنی یکی از `SEED_*_PASSWORD` تنظیم نشده یا در حالت پروداکشن اجرا شده است.
- **اجرای پروداکشن متوقف می‌شود:** پیام دقیق متغیر ناقص را در ترمینال ببینید (بخش ۴.۳).
- **صفحهٔ اصلی خالی نمی‌شود ولی محتوا ندارد:** محتوا پیش‌نویس است؛ آن را در پنل مدیریت منتشر کنید.
