import { prisma } from "../../config/prisma";

export interface CreateExpertiseDTO {
  slug: string;
  title: string;
  summary: string;
  body: string;
  icon: string;
  status: string;
}

export class ExpertiseService {
  async getPublishedExpertises() {
    return prisma.expertise.findMany({
      where: { status: "published" },
      orderBy: { sortOrder: "asc" },
    });
  }

  async getExpertiseBySlug(slug: string) {
    return prisma.expertise.findFirst({
      where: { slug, status: "published" },
    });
  }

  async getAllExpertisesForAdmin(
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
                summary: { contains: opts.search, mode: "insensitive" as const },
              },
            ],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      prisma.expertise.findMany({
        where,
        orderBy: { createdAt: "desc" },
        ...(opts.take ? { skip: opts.skip, take: opts.take } : {}),
      }),
      prisma.expertise.count({ where }),
    ]);

    return { items, total };
  }

  async createExpertise(data: CreateExpertiseDTO) {
    return prisma.expertise.create({ data });
  }

  async getExpertiseById(id: string) {
    return prisma.expertise.findUnique({ where: { id } });
  }

  async updateExpertise(id: string, data: Partial<CreateExpertiseDTO>) {
    return prisma.expertise.update({ where: { id }, data });
  }

  async deleteExpertise(id: string) {
    return prisma.expertise.delete({ where: { id } });
  }
}
