import { prisma } from "../../config/prisma";

export interface CreateMediaDTO {
  type: string;
  title: string;
  description?: string | null;
  sourceUrl?: string | null;
  image?: string | null;
  happenedAt?: string | null;
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
    const updateData: Record<string, unknown> = {};

    if (data.type !== undefined) updateData.type = data.type;
    if (data.title !== undefined) updateData.title = data.title;
    // 👇 این خط همون چیزیه که گفتی
    if (data.description !== undefined)
      updateData.description = data.description;
    if (data.sourceUrl !== undefined) updateData.sourceUrl = data.sourceUrl;
    if (data.image !== undefined) updateData.image = data.image;
    if (data.status !== undefined) updateData.status = data.status;

    if (data.happenedAt !== undefined) {
      updateData.happenedAt = data.happenedAt
        ? new Date(data.happenedAt)
        : null;
    }

    return prisma.mediaItem.update({
      where: { id },
      data: updateData,
    });
  }

  async deleteMedia(id: string) {
    return prisma.mediaItem.delete({ where: { id } });
  }
}
