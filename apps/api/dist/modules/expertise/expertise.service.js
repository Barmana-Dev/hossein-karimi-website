"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExpertiseService = void 0;
const prisma_1 = require("../../config/prisma");
class ExpertiseService {
    async getPublishedExpertises() {
        return prisma_1.prisma.expertise.findMany({
            where: { status: "published" },
            orderBy: { sortOrder: "asc" },
        });
    }
    async getExpertiseBySlug(slug) {
        return prisma_1.prisma.expertise.findFirst({
            where: { slug, status: "published" },
        });
    }
    async getAllExpertisesForAdmin(opts = {}) {
        const where = {
            ...(opts.status ? { status: opts.status } : {}),
            ...(opts.search
                ? {
                    OR: [
                        {
                            title: { contains: opts.search, mode: "insensitive" },
                        },
                        {
                            summary: { contains: opts.search, mode: "insensitive" },
                        },
                    ],
                }
                : {}),
        };
        const [items, total] = await Promise.all([
            prisma_1.prisma.expertise.findMany({
                where,
                orderBy: { createdAt: "desc" },
                ...(opts.take ? { skip: opts.skip, take: opts.take } : {}),
            }),
            prisma_1.prisma.expertise.count({ where }),
        ]);
        return { items, total };
    }
    async createExpertise(data) {
        return prisma_1.prisma.expertise.create({ data });
    }
    async getExpertiseById(id) {
        return prisma_1.prisma.expertise.findUnique({ where: { id } });
    }
    async updateExpertise(id, data) {
        return prisma_1.prisma.expertise.update({ where: { id }, data });
    }
    async deleteExpertise(id) {
        return prisma_1.prisma.expertise.delete({ where: { id } });
    }
}
exports.ExpertiseService = ExpertiseService;
