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
        return prisma_1.prisma.expertise.findUnique({
            where: { slug, status: "published" },
        });
    }
    async getAllExpertisesForAdmin() {
        return prisma_1.prisma.expertise.findMany({
            orderBy: { createdAt: "desc" },
        });
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
