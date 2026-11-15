"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProfileService = void 0;
const prisma_1 = require("../../config/prisma");
class ProfileService {
    async getSettings() {
        let settings = await prisma_1.prisma.siteSettings.findFirst();
        if (!settings) {
            settings = await prisma_1.prisma.siteSettings.create({
                data: {
                    siteTitle: "دکتر حسین کریمی",
                    subtitle: "حقوق، امور گمرکی و تجارت",
                    biographyShort: "",
                    contactEmail: "info@example.com",
                    phone: "021-12345678",
                },
            });
        }
        return settings;
    }
    async updateSettings(data) {
        const current = await prisma_1.prisma.siteSettings.findFirst();
        if (current) {
            return prisma_1.prisma.siteSettings.update({
                where: { id: current.id },
                data: {
                    ...data,
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
        return prisma_1.prisma.siteSettings.create({
            data: {
                siteTitle: data.siteTitle || "دکتر حسین کریمی",
                subtitle: data.subtitle || "حقوق، امور گمرکی و تجارت",
                biographyShort: data.biographyShort || "",
                contactEmail: data.contactEmail || "info@example.com",
                phone: data.phone || "021-12345678",
                address: data.address,
                instagramUrl: data.instagramUrl,
                linkedinUrl: data.linkedinUrl,
                telegramUrl: data.telegramUrl,
                seoTitle: data.seoTitle,
                seoDescription: data.seoDescription,
            },
        });
    }
}
exports.ProfileService = ProfileService;
