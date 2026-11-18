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
  sourceUrl?: string | null;
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
  async getAllExperiencesForAdmin(
    opts: { skip?: number; take?: number; search?: string; status?: string } = {},
  ) {
    const where = {
      ...(opts.status ? { status: opts.status } : {}),
      ...(opts.search
        ? {
            OR: [
              {
                title: { contains: opts.search, mode: "insensitive" as const },
              },
              {
                organization: {
                  contains: opts.search,
                  mode: "insensitive" as const,
                },
              },
            ],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      prisma.experience.findMany({
        where,
        orderBy: { createdAt: "desc" },
        ...(opts.take ? { skip: opts.skip, take: opts.take } : {}),
      }),
      prisma.experience.count({ where }),
    ]);

    return { items, total };
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
    if (data.sourceUrl !== undefined) updateData.sourceUrl = data.sourceUrl;

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
