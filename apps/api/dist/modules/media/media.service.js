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
        return prisma_1.prisma.mediaItem.update({
            where: { id },
            data: {
                ...data,
                happenedAt: data.happenedAt ? new Date(data.happenedAt) : null,
            },
        });
    }
    async deleteMedia(id) {
        return prisma_1.prisma.mediaItem.delete({ where: { id } });
    }
}
exports.MediaItemService = MediaItemService;
