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
    return prisma.experience.update({
      where: { id },
      data: {
        ...data,
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
      },
    });
  }
  async deleteExperience(id: string) {
    return prisma.experience.delete({ where: { id } });
  }
}
