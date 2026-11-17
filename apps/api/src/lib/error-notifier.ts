import { config } from "../config/env";

/**
 * ارسال خطاهای سرور به وب‌هوک مانیتورینگ (اختیاری).
 * با تنظیم ERROR_WEBHOOK_URL می‌توانید خطاها را به Slack/Discord/سرویس
 * مانیتورینگ بفرستید؛ اگر تنظیم نشده باشد هیچ کاری انجام نمی‌شود.
 */
export function notifyError(
  error: unknown,
  context: Record<string, unknown> = {},
): void {
  const url = config.errorWebhookUrl;
  if (!url) return;

  const payload = {
    service: "hosseinkarimi-api",
    env: config.appEnv,
    message: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
    context,
    timestamp: new Date().toISOString(),
  };

  // ارسال نباید هرگز مسیر پاسخ‌دهی به کاربر را کند یا متوقف کند
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 5000);

  void fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
    signal: controller.signal,
  })
    .catch(() => undefined)
    .finally(() => clearTimeout(timer));
}
