import { prisma } from "../../config/prisma";

export interface UpdateSettingsDTO {
  siteTitle?: string;
  subtitle?: string;
  biographyShort?: string;
  contactEmail?: string;
  phone?: string;
  address?: string;
  instagramUrl?: string;
  linkedinUrl?: string;
  telegramUrl?: string;
  seoTitle?: string;
  seoDescription?: string;
  portraitImage?: string;
  aboutContent?: string;
  keyField?: string;
  keyDegree?: string;
  keyLanguages?: string;
  contactContent?: string;
  termsContent?: string;
  privacyContent?: string;
}

export class ProfileService {
  async getSettings() {
    let settings = await prisma.siteSettings.findFirst();
    if (!settings) {
      settings = await prisma.siteSettings.create({
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

  async updateSettings(data: UpdateSettingsDTO) {
    const current = await prisma.siteSettings.findFirst();
    if (current) {
      return prisma.siteSettings.update({
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
    return prisma.siteSettings.create({
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
