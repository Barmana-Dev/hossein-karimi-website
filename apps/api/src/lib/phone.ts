// ===== نرمال‌سازی و اعتبارسنجی شماره تماس =====

const PERSIAN_DIGITS = "۰۱۲۳۴۵۶۷۸۹";
const ARABIC_DIGITS = "٠١٢٣٤٥٦٧٨٩";

// 👇 ارقام فارسی/عربی به لاتین تبدیل می‌شوند تا هر سه نگارش یکسان پذیرفته شود
export function normalizePhoneDigits(value: string) {
  return value.replace(/[۰-۹٠-٩]/g, (digit) => {
    const persianIndex = PERSIAN_DIGITS.indexOf(digit);
    if (persianIndex !== -1) return String(persianIndex);
    return String(ARABIC_DIGITS.indexOf(digit));
  });
}

// 👇 ساختار واقعی شماره: کد کشور اختیاری، بین ۷ تا ۱۵ رقم و بدون کاراکتر اضافه
export function isValidPhone(value: string) {
  const compact = normalizePhoneDigits(value)
    .trim()
    .replace(/[\s()\-.]/g, "");
  return /^\+?\d{7,15}$/.test(compact);
}
