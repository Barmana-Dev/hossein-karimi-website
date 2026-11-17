import { prisma } from "../../config/prisma";

export interface CreateAgencyDTO {
  slug: string;
  name: string;
  description: string;
  field: string;
  relationType: string;
  relationDescription?: string | null;
  city?: string | null;
  websiteUrl?: string | null;
  logoImage?: string | null;
  featured?: boolean;
  status: string;
  sortOrder?: number;
}

export class NetworkService {
  async getPublishedAgencies() {
    return prisma.agency.findMany({
      where: { status: "published" },
      orderBy: { sortOrder: "asc" },
    });
  }

  async getAgencyBySlug(slug: string) {
    return prisma.agency.findFirst({
      where: { slug, status: "published" },
    });
  }

  async getAllAgenciesForAdmin(
    opts: { skip?: number; take?: number; search?: string; status?: string } = {},
  ) {
    const where = {
      ...(opts.status ? { status: opts.status } : {}),
      ...(opts.search
        ? {
            OR: [
              { name: { contains: opts.search, mode: "insensitive" as const } },
              { field: { contains: opts.search, mode: "insensitive" as const } },
            ],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      prisma.agency.findMany({
        where,
        orderBy: { createdAt: "desc" },
        ...(opts.take ? { skip: opts.skip, take: opts.take } : {}),
      }),
      prisma.agency.count({ where }),
    ]);

    return { items, total };
  }

  async createAgency(data: CreateAgencyDTO) {
    return prisma.agency.create({ data });
  }

  async getAgencyById(id: string) {
    return prisma.agency.findUnique({
      where: { id },
    });
  }

  async updateAgency(id: string, data: Partial<CreateAgencyDTO>) {
    return prisma.agency.update({
      where: { id },
      data,
    });
  }

  async deleteAgency(id: string) {
    return prisma.agency.delete({
      where: { id },
    });
  }
}
