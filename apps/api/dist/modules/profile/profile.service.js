"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProfileService = void 0;
const prisma_1 = require("../../config/prisma");
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
function isUniqueViolation(error) {
    return (typeof error === "object" &&
        error !== null &&
        "code" in error &&
        error.code === "P2002");
}
class ProfileService {
    async getSettings() {
        const existing = await prisma_1.prisma.siteSettings.findFirst();
        if (existing)
            return existing;
        try {
            return await prisma_1.prisma.siteSettings.create({ data: DEFAULT_SETTINGS });
        }
        catch (error) {
            // درخواست هم‌زمان دیگری رکورد را ساخته است
            if (isUniqueViolation(error)) {
                const created = await prisma_1.prisma.siteSettings.findFirst();
                if (created)
                    return created;
            }
            throw error;
        }
    }
    async updateSettings(data) {
        // 👇 رکورد را قبل از به‌روزرسانی تضمین می‌کنیم تا همهٔ فیلدها (حتی در
        // اولین ذخیره) با یک مسیر یکسان نوشته شوند.
        const current = await this.getSettings();
        return prisma_1.prisma.siteSettings.update({
            where: { id: current.id },
            data,
        });
    }
}
exports.ProfileService = ProfileService;
