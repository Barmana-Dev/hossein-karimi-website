import { Request, Response } from "express";
import { ZodError } from "zod";
import { ProfileService } from "./profile.service";
import { AuthRequest } from "../../middleware/auth.middleware";
import { settingsUpdateSchema } from "../../validators";
import { publicErrorMessage } from "../../lib/error-message";

const profileService = new ProfileService();

export class ProfileController {
  // ۱. دریافت تنظیمات (ادمین)
  async get(req: AuthRequest, res: Response) {
    try {
      const data = await profileService.getSettings();
      res.json({ success: true, data });
    } catch (error: unknown) {
      const message = publicErrorMessage(error, "خطا در دریافت تنظیمات");
      res.status(500).json({ success: false, error: { message } });
    }
  }

  // ۲. به‌روزرسانی تنظیمات (ادمین)
  async update(req: AuthRequest, res: Response) {
    try {
      const validated = settingsUpdateSchema.parse(req.body);
      const data = await profileService.updateSettings(validated);
      res.json({ success: true, data, message: "تنظیمات با موفقیت ذخیره شد." });
    } catch (error: unknown) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "اطلاعات ارسالی معتبر نیست.",
            fields: error.flatten().fieldErrors,
          },
        });
      }
      const message = publicErrorMessage(error, "خطا در ذخیره تنظیمات");
      res.status(500).json({ success: false, error: { message } });
    }
  }

  // ۳. دریافت تنظیمات عمومی (برای هدر و فوتر)
  async getPublicSettings(req: Request, res: Response) {
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
    } catch (error: unknown) {
      const message = publicErrorMessage(error, "خطای ناشناخته");
      res.status(500).json({ success: false, error: { message } });
    }
  }
}
