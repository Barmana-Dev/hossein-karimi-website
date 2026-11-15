import { prisma } from "../../config/prisma";

export interface CreateExperienceDTO {
  slug: string;
  title: string;
  organization: string;
  category: string;
  role: string;
  description: string;
  status: string;
  startDate?: string | null;
  endDate?: string | null;
}

export class ExperienceService {
  async getPublishedExperiences() {
    return prisma.experience.findMany({
      where: { status: "published" },
      orderBy: [{ startDate: "desc" }, { sortOrder: "asc" }],
    });
  }
  async getExperienceBySlug(slug: string) {
    return prisma.experience.findUnique({
      where: { slug, status: "published" },
    });
  }
  async getAllExperiencesForAdmin() {
    return prisma.experience.findMany({ orderBy: { createdAt: "desc" } });
  }
  async createExperience(data: CreateExperienceDTO) {
    return prisma.experience.create({
      data: {
        ...data,
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
      },
    });
  }
  async getExperienceById(id: string) {
    return prisma.experience.findUnique({ where: { id } });
  }
  async updateExperience(id: string, data: Partial<CreateExperienceDTO>) {
    const updateData: Record<string, unknown> = {};

    if (data.slug !== undefined) updateData.slug = data.slug;
    if (data.title !== undefined) updateData.title = data.title;
    if (data.organization !== undefined)
      updateData.organization = data.organization;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.role !== undefined) updateData.role = data.role;
    if (data.description !== undefined)
      updateData.description = data.description;
    if (data.status !== undefined) updateData.status = data.status;

    // 👇 تاریخ‌ها فقط اگه ارسال شده باشن
    if (data.startDate !== undefined) {
      updateData.startDate = data.startDate ? new Date(data.startDate) : null;
    }
    if (data.endDate !== undefined) {
      updateData.endDate = data.endDate ? new Date(data.endDate) : null;
    }

    return prisma.experience.update({
      where: { id },
      data: updateData,
    });
  }
  async deleteExperience(id: string) {
    return prisma.experience.delete({ where: { id } });
  }
}
