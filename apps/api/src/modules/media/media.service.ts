import { prisma } from "../../config/prisma";

export interface CreateMediaDTO {
  type: string;
  title: string;
  description?: string;
  sourceUrl?: string;
  image?: string;
  happenedAt?: string;
  status: string;
}

export class MediaItemService {
  async getPublishedMedia() {
    return prisma.mediaItem.findMany({
      where: { status: "published" },
      orderBy: { happenedAt: "desc" },
    });
  }

  async getAllMediaForAdmin() {
    return prisma.mediaItem.findMany({
      orderBy: { createdAt: "desc" },
    });
  }

  async createMedia(data: CreateMediaDTO) {
    return prisma.mediaItem.create({
      data: {
        ...data,
        happenedAt: data.happenedAt ? new Date(data.happenedAt) : null,
      },
    });
  }

  async getMediaById(id: string) {
    return prisma.mediaItem.findUnique({ where: { id } });
  }

  async updateMedia(id: string, data: Partial<CreateMediaDTO>) {
    return prisma.mediaItem.update({
      where: { id },
      data: {
        ...data,
        happenedAt: data.happenedAt ? new Date(data.happenedAt) : null,
      },
    });
  }

  async deleteMedia(id: string) {
    return prisma.mediaItem.delete({ where: { id } });
  }
}
