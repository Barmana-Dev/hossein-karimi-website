# وب‌سایت شخصی دکتر حسین کریمی

پایگاه حرفه‌ای معرفی شخصیت، سوابق، تخصص‌ها و راه‌های ارتباط دکتر حسین کریمی در حوزه حقوق، امور گمرکی و تجارت.

پروژه از دو بخش تشکیل شده است:

- `apps/web` — فرانت‌اند Next.js (App Router)
- `apps/api` — API با Express + Prisma + PostgreSQL

---

## ۱. پیش‌نیازها

- **Node.js 20.9 یا بالاتر** (Next.js 16 حداقل این نسخه را می‌خواهد). نسخه را با `node -v` بررسی کنید.
- **npm** (همراه Node نصب می‌شود)
- **Docker** (برای اجرای PostgreSQL) — یا یک دیتابیس PostgreSQL در دسترس
- **Git**

---

## ۲. دریافت پروژه

```bash
git clone <repository-url>
cd hossein-karimi-website
```

---

## ۳. راه‌اندازی دیتابیس

```bash
docker compose up -d
```

این دستور یک PostgreSQL روی پورت `5432` با مشخصات زیر بالا می‌آورد:

| مورد | مقدار |
| --- | --- |
| کاربر | `postgres` |
| رمز | `password` |
| نام دیتابیس | `hossein_karimi_db` |

بررسی اجرا بودن دیتابیس:

```bash
docker compose ps
```

> اگر Docker ندارید، یک دیتابیس PostgreSQL بسازید و آدرس آن را در `DATABASE_URL` قرار دهید.

---

## ۴. تنظیم فایل‌های محیطی

### ۴.۱. API — فایل `apps/api/.env`

```bash
cp apps/api/.env.example apps/api/.env
```

سپس مقادیر را تنظیم کنید:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/hossein_karimi_db?schema=public"
JWT_SECRET="یک-کلید-تصادفی-طولانی"
PORT=4000
CORS_ORIGINS="http://localhost:3000"

# رمز حساب‌هایی که seed می‌سازد (اجباری — هیچ رمز پیش‌فرضی وجود ندارد)
SEED_ADMIN_PASSWORD=""
SEED_EDITOR_PASSWORD=""
SEED_INQUIRY_MANAGER_PASSWORD=""
```

| متغیر | توضیح |
| --- | --- |
| `DATABASE_URL` | آدرس اتصال PostgreSQL |
| `JWT_SECRET` | کلید امضای توکن ورود (اجباری) |
| `PORT` | پورت API (پیش‌فرض `4000`) |
| `CORS_ORIGINS` | دامنه‌های مجاز فرانت‌اند، جدا شده با کاما |
| `SEED_ADMIN_PASSWORD` | رمز مدیر ارشد برای ساخت حساب در seed |
| `SEED_EDITOR_PASSWORD` | رمز نویسنده محتوا برای ساخت حساب در seed |
| `SEED_INQUIRY_MANAGER_PASSWORD` | رمز مدیر درخواست‌ها برای ساخت حساب در seed |

### ۴.۲. فرانت‌اند — فایل `apps/web/.env.local`

```bash
cp apps/web/.env.example apps/web/.env.local
```

```env
NEXT_PUBLIC_API_URL="http://localhost:4000/api/v1"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
# هاست‌های اضافی تصویر (اختیاری، جدا شده با کاما)
NEXT_PUBLIC_IMAGE_HOSTS=""
```

| متغیر | توضیح |
| --- | --- |
| `NEXT_PUBLIC_API_URL` | آدرس کامل API (شامل `/api/v1`). همهٔ بخش‌های سایت، پنل مدیریت، تصاویر و sitemap از همین مقدار استفاده می‌کنند. |
| `NEXT_PUBLIC_SITE_URL` | آدرس عمومی سایت (برای sitemap و متادیتا) |
| `NEXT_PUBLIC_IMAGE_HOSTS` | دامنه‌های اضافی مجاز برای `next/image` |

> برای انتشار روی دامنهٔ دیگر، فقط کافی است `NEXT_PUBLIC_API_URL`، `NEXT_PUBLIC_SITE_URL` (فرانت‌اند) و `CORS_ORIGINS` (API) را تغییر دهید. هیچ آدرس ثابتی در کد باقی نمانده است.

---

## ۵. نصب وابستگی‌ها

```bash
# وابستگی‌های فرانت‌اند (ریشه پروژه)
npm install

# وابستگی‌های API
cd apps/api && npm install && cd ../..
```

---

## ۶. ساخت ساختار دیتابیس (migration)

```bash
cd apps/api
npx prisma generate
npx prisma migrate deploy
cd ../..
```

برای توسعهٔ محلی، `npm run prisma:migrate` (در پوشهٔ `apps/api`) هم می‌تواند به‌جای `migrate deploy` استفاده شود.

---

## ۷. داده‌های نمونه (seed)

ابتدا سه متغیر `SEED_*_PASSWORD` را در `apps/api/.env` تنظیم کنید. سپس:

```bash
cd apps/api
npm run seed
cd ../..
```

اگر یکی از رمزها تنظیم نشده باشد، seed با پیام روشن متوقف می‌شود و هیچ رمز پیش‌فرضی ساخته یا چاپ نمی‌شود.

**seed چه چیزی می‌سازد؟**

- سه حساب مدیریتی:
  - `admin@example.com` — نقش `SUPER_ADMIN`
  - `editor@example.com` — نقش `EDITOR`
  - `inquiries@example.com` — نقش `INQUIRY_MANAGER`
- ۳ سابقهٔ حرفه‌ای نمونه
- ۴ حوزهٔ تخصصی نمونه
- ۳ مقالهٔ نمونه
- ۳ کارگزاری نمونه

> **مهم:** همهٔ محتوای نمونه به‌صورت **پیش‌نویس (draft)** ساخته می‌شود و API عمومی فقط محتوای **منتشرشده** را برمی‌گرداند. بنابراین بعد از seed، فهرست‌های سایت خالی دیده می‌شوند تا زمانی که محتوا را در پنل مدیریت تأیید و منتشر کنید. فهرست داده‌های موردنیاز در `docs/content-needed.md` آمده است. seed از `upsert` استفاده می‌کند و داده‌های قبلی را پاک نمی‌کند.

---

## ۸. اجرای پروژه

دو ترمینال جداگانه لازم است.

**ترمینال ۱ — API:**

```bash
cd apps/api
npm run dev
```

- API: <http://localhost:4000>
- بررسی سلامت: <http://localhost:4000/api/health>
- مستندات: <http://localhost:4000/api-docs>

**ترمینال ۲ — فرانت‌اند:**

```bash
npm run dev
```

- سایت: <http://localhost:3000>
- پنل مدیریت: <http://localhost:3000/login>

اگر API بالا نباشد، صفحهٔ اصلی خالی نمی‌شود؛ برای هر بخش پیام روشن و دکمهٔ «تلاش دوباره» نمایش داده می‌شود.

---

## ۹. نقش‌ها

| نقش | دسترسی |
| --- | --- |
| `SUPER_ADMIN` | همهٔ بخش‌ها، کاربران ادمین، تنظیمات و درخواست‌ها |
| `EDITOR` | مقالات، سوابق، حوزه‌ها، کارگزاری‌ها، رسانه و کتابخانهٔ رسانه |
| `INQUIRY_MANAGER` | فقط درخواست‌های ارتباط |

اطلاعات شخصی درخواست‌دهندگان (نام و موضوع) فقط برای `SUPER_ADMIN` و `INQUIRY_MANAGER` برگردانده می‌شود.

---

## ۱۰. بررسی کیفیت کد

```bash
# lint فقط روی سورس فرانت‌اند و API (بدون فایل‌های build و کد تولیدشده)
npm run lint

# بررسی TypeScript
npm run typecheck

# build فرانت‌اند
npm run build

# بررسی TypeScript در API
cd apps/api && npx tsc --noEmit
```

---

## ۱۱. ساختار پروژه

```
.
├── apps
│   ├── api          # Express + Prisma (پورت 4000)
│   │   ├── prisma   # schema و migration ها
│   │   ├── src
│   │   └── seed.ts
│   └── web          # Next.js App Router (پورت 3000)
│       ├── app
│       ├── components
│       └── lib        # تنظیمات مشترک API
├── docs
│   ├── discovery.md
│   └── content-needed.md
└── docker-compose.yml
```

---

## ۱۲. عیب‌یابی

- **دیتابیس بالا نمی‌آید:** `docker compose logs db` را ببینید و مطمئن شوید پورت `5432` آزاد است.
- **خطای اتصال فرانت‌اند به API:** مقدار `NEXT_PUBLIC_API_URL` را بررسی کنید و بعد از تغییر آن، سرور Next را دوباره اجرا کنید.
- **خطای CORS:** دامنهٔ فرانت‌اند را در `CORS_ORIGINS` اضافه کنید.
- **تصاویر نمایش داده نمی‌شوند:** سرور API باید اجرا باشد (فایل‌ها از `/uploads` سرو می‌شوند) و دامنهٔ آن در `NEXT_PUBLIC_API_URL` درست تنظیم شده باشد.
- **اجرای seed متوقف می‌شود:** یعنی یکی از `SEED_*_PASSWORD` تنظیم نشده است.
