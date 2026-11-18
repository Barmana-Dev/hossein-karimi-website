import { prisma } from "../../config/prisma";

export interface UpdateSettingsDTO {
  siteTitle?: string;
  subtitle?: string;
  biographyShort?: string;
  contactEmail?: string;
  phone?: string;
  address?: string | null;
  instagramUrl?: string | null;
  linkedinUrl?: string | null;
  telegramUrl?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  portraitImage?: string | null;
  aboutContent?: string | null;
  keyField?: string | null;
  keyDegree?: string | null;
  keyLanguages?: string | null;
  contactContent?: string | null;
  termsContent?: string | null;
  privacyContent?: string | null;
}

// 👇 تنظیمات سایت تک‌نسخه‌ای است؛ شناسهٔ ثابت از ساخت رکوردهای هم‌زمان
// و چندگانه جلوگیری می‌کند.
const SETTINGS_ID = "site-settings";

const DEFAULT_SETTINGS = {
  id: SETTINGS_ID,
  siteTitle: "دکتر حسین کریمی",
  subtitle: "حقوق، امور گمرکی و تجارت",
  biographyShort: "",
  contactEmail: "info@example.com",
  phone: "021-12345678",
};

function isUniqueViolation(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: unknown }).code === "P2002"
  );
}

export class ProfileService {
  async getSettings() {
    const existing = await prisma.siteSettings.findFirst();
    if (existing) return existing;

    try {
      return await prisma.siteSettings.create({ data: DEFAULT_SETTINGS });
    } catch (error) {
      // درخواست هم‌زمان دیگری رکورد را ساخته است
      if (isUniqueViolation(error)) {
        const created = await prisma.siteSettings.findFirst();
        if (created) return created;
      }
      throw error;
    }
  }

  async updateSettings(data: UpdateSettingsDTO) {
    // 👇 رکورد را قبل از به‌روزرسانی تضمین می‌کنیم تا همهٔ فیلدها (حتی در
    // اولین ذخیره) با یک مسیر یکسان نوشته شوند.
    const current = await this.getSettings();

    return prisma.siteSettings.update({
      where: { id: current.id },
      data,
    });
  }
}
