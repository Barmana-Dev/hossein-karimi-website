"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProfileController = void 0;
const zod_1 = require("zod");
const profile_service_1 = require("./profile.service");
const validators_1 = require("../../validators");
const error_message_1 = require("../../lib/error-message");
const profileService = new profile_service_1.ProfileService();
class ProfileController {
    // ۱. دریافت تنظیمات (ادمین)
    async get(req, res) {
        try {
            const data = await profileService.getSettings();
            res.json({ success: true, data });
        }
        catch (error) {
            const message = (0, error_message_1.publicErrorMessage)(error, "خطا در دریافت تنظیمات");
            res.status(500).json({ success: false, error: { message } });
        }
    }
    // ۲. به‌روزرسانی تنظیمات (ادمین)
    async update(req, res) {
        try {
            const validated = validators_1.settingsUpdateSchema.parse(req.body);
            const data = await profileService.updateSettings(validated);
            res.json({ success: true, data, message: "تنظیمات با موفقیت ذخیره شد." });
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                return res.status(400).json({
                    success: false,
                    error: {
                        code: "VALIDATION_ERROR",
                        message: "اطلاعات ارسالی معتبر نیست.",
                        fields: error.flatten().fieldErrors,
                    },
                });
            }
            const message = (0, error_message_1.publicErrorMessage)(error, "خطا در ذخیره تنظیمات");
            res.status(500).json({ success: false, error: { message } });
        }
    }
    // ۳. دریافت تنظیمات عمومی (برای هدر و فوتر)
    async getPublicSettings(req, res) {
        try {
            const data = await profileService.getSettings();
            res.json({
                success: true,
                data: {
                    siteTitle: data.siteTitle,
                    subtitle: data.subtitle,
                    biographyShort: data.biographyShort,
                    contactEmail: data.contactEmail,
                    phone: data.phone,
                    address: data.address,
                    instagramUrl: data.instagramUrl,
                    linkedinUrl: data.linkedinUrl,
                    telegramUrl: data.telegramUrl,
                    seoTitle: data.seoTitle,
                    seoDescription: data.seoDescription,
                    portraitImage: data.portraitImage,
                    aboutContent: data.aboutContent,
                    contactContent: data.contactContent,
                    termsContent: data.termsContent,
                    privacyContent: data.privacyContent,
                    keyField: data.keyField,
                    keyDegree: data.keyDegree,
                    keyLanguages: data.keyLanguages,
                },
            });
        }
        catch (error) {
            const message = (0, error_message_1.publicErrorMessage)(error, "خطای ناشناخته");
            res.status(500).json({ success: false, error: { message } });
        }
    }
}
exports.ProfileController = ProfileController;
