#!/usr/bin/env bash
# پشتیبان‌گیری از دیتابیس Postgres (pg_dump) با فشرده‌سازی و نگهداری دوره‌ای
#
# استفاده:
#   DATABASE_URL="postgresql://user:pass@host:5432/db" ./scripts/backup-db.sh
#
# متغیرهای اختیاری:
#   BACKUP_DIR             مسیر ذخیره (پیش‌فرض: ./backups)
#   BACKUP_RETENTION_DAYS  تعداد روز نگهداری (پیش‌فرض: 14)

set -euo pipefail

if [ -z "${DATABASE_URL:-}" ]; then
  echo "⛔ متغیر DATABASE_URL تنظیم نشده است." >&2
  exit 1
fi

if ! command -v pg_dump >/dev/null 2>&1; then
  echo "⛔ دستور pg_dump پیدا نشد. postgresql-client را نصب کنید." >&2
  exit 1
fi

BACKUP_DIR="${BACKUP_DIR:-./backups}"
RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-14}"
STAMP="$(date +%Y%m%d-%H%M%S)"
TARGET="${BACKUP_DIR}/hosseinkarimi-${STAMP}.sql.gz"

mkdir -p "$BACKUP_DIR"

echo "⏳ در حال تهیهٔ پشتیبان در ${TARGET} ..."
pg_dump "$DATABASE_URL" --no-owner --no-privileges | gzip > "$TARGET"

# بررسی سلامت فایل خروجی
if [ ! -s "$TARGET" ] || ! gzip -t "$TARGET" 2>/dev/null; then
  echo "⛔ پشتیبان معتبر نیست: ${TARGET}" >&2
  rm -f "$TARGET"
  exit 1
fi

echo "✅ پشتیبان ساخته شد: ${TARGET} ($(du -h "$TARGET" | cut -f1))"

# حذف پشتیبان‌های قدیمی
find "$BACKUP_DIR" -name "hosseinkarimi-*.sql.gz" -type f -mtime "+${RETENTION_DAYS}" -print -delete \
  | sed 's/^/🗑️ حذف شد: /'

echo "ℹ️ بازیابی: gunzip -c ${TARGET} | psql \"\$DATABASE_URL\""
