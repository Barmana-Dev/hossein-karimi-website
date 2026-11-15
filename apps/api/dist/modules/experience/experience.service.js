"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExperienceService = void 0;
const prisma_1 = require("../../config/prisma");
class ExperienceService {
    async getPublishedExperiences() {
        return prisma_1.prisma.experience.findMany({
            where: { status: "published" },
            orderBy: [{ startDate: "desc" }, { sortOrder: "asc" }],
        });
    }
    async getExperienceBySlug(slug) {
        return prisma_1.prisma.experience.findUnique({
            where: { slug, status: "published" },
        });
    }
    async getAllExperiencesForAdmin() {
        return prisma_1.prisma.experience.findMany({ orderBy: { createdAt: "desc" } });
    }
    async createExperience(data) {
        return prisma_1.prisma.experience.create({
            data: {
                ...data,
                startDate: data.startDate ? new Date(data.startDate) : null,
                endDate: data.endDate ? new Date(data.endDate) : null,
            },
        });
    }
    async getExperienceById(id) {
        return prisma_1.prisma.experience.findUnique({ where: { id } });
    }
    async updateExperience(id, data) {
        return prisma_1.prisma.experience.update({
            where: { id },
            data: {
                ...data,
                startDate: data.startDate ? new Date(data.startDate) : null,
                endDate: data.endDate ? new Date(data.endDate) : null,
            },
        });
    }
    async deleteExperience(id) {
        return prisma_1.prisma.experience.delete({ where: { id } });
    }
}
exports.ExperienceService = ExperienceService;
