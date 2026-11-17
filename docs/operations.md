# راهنمای عملیات (مانیتورینگ، پشتیبان‌گیری، لاگ)

این سند کارهای دوره‌ای و زمان حادثه را پوشش می‌دهد. تنظیمات محیط در
`apps/api/.env.production.example` فهرست شده است.

## ۱. بررسی سلامت (Health checks)

| مسیر | کاربرد | پاسخ سالم |
| --- | --- | --- |
| `GET /api/health` | زنده بودن پروسهٔ API | `{"status":"ok","env":"production"}` |
| `GET /api/health/db` | اتصال به Postgres | `{"status":"ok"}` |

- در سرویس UptimeRobot / Better Stack / هر مانیتور خارجی، هر ۱ تا ۵ دقیقه
  `/api/health/db` را با کد وضعیت ۲۰۰ بررسی کنید (این مسیر هم دیتابیس و هم API
  را می‌سنجد).
- برای فرانت‌اند، صفحهٔ اصلی (`/`) هر ۵ دقیقه بررسی شود.
- هشدار (Alert) روی دو شرط تنظیم شود: کد غیر ۲۰۰ و زمان پاسخ بیش از ۵ ثانیه.

## ۲. مانیتورینگ خطا

خطاهای ۵۰۰ و خطاهای مهارنشدهٔ پروسهٔ API به‌صورت خودکار به وب‌هوک ارسال می‌شوند
اگر متغیر زیر تنظیم شده باشد:

```env
ERROR_WEBHOOK_URL=https://hooks.slack.com/services/...
```

- ارسال غیرمسدودکننده (non-blocking) است و در صورت خطای وب‌هوک، درخواست کاربر
  تحت تأثیر قرار نمی‌گیرد.
- می‌توانید همین آدرس را به Incoming Webhook اسلک، دیسکورد یا یک سرویس
  مانیتورینگ (مثل سرویس‌هایی که endpoint عمومی JSON می‌پذیرند) وصل کنید.
- برای هشدارهای فرانت‌اند، سرویس‌های RUM/مانیتورینگ خطای مرورگر را در صورت
  نیاز جداگانه اضافه کنید.

## ۳. پشتیبان‌گیری از دیتابیس

اسکریپت آماده در `scripts/backup-db.sh` است:

```bash
DATABASE_URL="postgresql://user:pass@host:5432/db" \
BACKUP_DIR=/var/backups/hosseinkarimi \
./scripts/backup-db.sh
```

- خروجی: `hosseinkarimi-YYYYMMDD-HHMMSS.sql.gz`
- پس از ساخت، صحت فایل gzip بررسی می‌شود.
- پشتیبان‌های قدیمی‌تر از `BACKUP_RETENTION_DAYS` (پیش‌فرض ۱۴ روز) حذف می‌شوند.
- زمان‌بندی پیشنهادی: هر ۶ ساعت (cron):

```cron
0 */6 * * * cd /srv/hosseinkarimi && DATABASE_URL="postgresql://..." BACKUP_DIR=/var/backups/hosseinkarimi ./scripts/backup-db.sh >> /var/log/hk-backup.log 2>&1
```

- پوشهٔ آپلود (`UPLOADS_DIR`) را هم با `rsync`/`rclone` روزانه به فضای پایدار
  دیگر منتقل کنید؛ پشتیبان دیتابیس شامل فایل‌های تصویری نیست.

### بازیابی

```bash
gunzip -c backups/hosseinkarimi-20260101-000000.sql.gz | psql "$DATABASE_URL"
```

پیش از بازیابی روی محیط پروداکشن، ابتدا روی یک دیتابیس تستی بازیابی و بررسی
کنید.

## ۴. لاگ‌ها

- API لاگ‌ها را روی stdout می‌نویسد؛ در سرور با `pm2 logs` یا
  `docker logs <container>` یا `journalctl -u hosseinkarimi-api` ببینید.
- فرانت‌اند (`next start`) هم روی stdout لاگ می‌دهد.
- اگر لاگ متمرکز لازم بود، stdout را به یک collector (Loki، Datadog یا
  journald) بفرستید؛ نیازی به تغییر کد نیست.
- در پروداکشن، stack trace کامل فقط سمت سرور ثبت می‌شود و به کاربر نمی‌رسد
  (`NODE_ENV=production` + `APP_ENV=production`).

## ۵. چک‌لیست انتشار

1. `npm run build:prod` بدون خطا.
2. `APP_ENV=production node apps/api/dist/app.js` بالا بیاید و `/api/health` و
   `/api/health/db` سالم باشند.
3. `/api-docs` در پروداکشن ۴۰۴ باشد (مگر با `ENABLE_SWAGGER=true`).
4. CORS فقط دامنهٔ سایت را مجاز کند.
5. یک نسخهٔ پشتیبان دستی قبل از انتشار بگیرید.
