import { config } from "../config/env";

/**
 * پیام خطای قابل‌نمایش به کاربر.
 * در پروداکشن جزئیات داخلی (نام جدول/کوئری/استک) هرگز به پاسخ نمی‌رود.
 */
export function publicErrorMessage(error: unknown, fallback: string): string {
  if (config.isProduction) return fallback;
  return error instanceof Error && error.message ? error.message : fallback;
}
