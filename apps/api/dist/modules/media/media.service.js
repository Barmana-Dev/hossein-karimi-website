"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MediaItemService = void 0;
const prisma_1 = require("../../config/prisma");
class MediaItemService {
    async getPublishedMedia() {
        return prisma_1.prisma.mediaItem.findMany({
            where: { status: "published" },
            orderBy: { happenedAt: "desc" },
        });
    }
    async getAllMediaForAdmin() {
        return prisma_1.prisma.mediaItem.findMany({
            orderBy: { createdAt: "desc" },
        });
    }
    async createMedia(data) {
        return prisma_1.prisma.mediaItem.create({
            data: {
                ...data,
                happenedAt: data.happenedAt ? new Date(data.happenedAt) : null,
            },
        });
    }
    async getMediaById(id) {
        return prisma_1.prisma.mediaItem.findUnique({ where: { id } });
    }
    async updateMedia(id, data) {
        const updateData = {};
        if (data.type !== undefined)
            updateData.type = data.type;
        if (data.title !== undefined)
            updateData.title = data.title;
        // 👇 این خط همون چیزیه که گفتی
        if (data.description !== undefined)
            updateData.description = data.description;
        if (data.sourceUrl !== undefined)
            updateData.sourceUrl = data.sourceUrl;
        if (data.image !== undefined)
            updateData.image = data.image;
        if (data.status !== undefined)
            updateData.status = data.status;
        if (data.happenedAt !== undefined) {
            updateData.happenedAt = data.happenedAt
                ? new Date(data.happenedAt)
                : null;
        }
        return prisma_1.prisma.mediaItem.update({
            where: { id },
            data: updateData,
        });
    }
    async deleteMedia(id) {
        return prisma_1.prisma.mediaItem.delete({ where: { id } });
    }
}
exports.MediaItemService = MediaItemService;
