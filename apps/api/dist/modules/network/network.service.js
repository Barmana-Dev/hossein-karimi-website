"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NetworkService = void 0;
const prisma_1 = require("../../config/prisma");
class NetworkService {
    async getPublishedAgencies() {
        return prisma_1.prisma.agency.findMany({
            where: { status: "published" },
            orderBy: { sortOrder: "asc" },
        });
    }
    async getAgencyBySlug(slug) {
        return prisma_1.prisma.agency.findFirst({
            where: { slug, status: "published" },
        });
    }
    async getAllAgenciesForAdmin() {
        return prisma_1.prisma.agency.findMany({
            orderBy: { createdAt: "desc" },
        });
    }
    async createAgency(data) {
        return prisma_1.prisma.agency.create({ data });
    }
    async getAgencyById(id) {
        return prisma_1.prisma.agency.findUnique({
            where: { id },
        });
    }
    async updateAgency(id, data) {
        return prisma_1.prisma.agency.update({
            where: { id },
            data,
        });
    }
    async deleteAgency(id) {
        return prisma_1.prisma.agency.delete({
            where: { id },
        });
    }
}
exports.NetworkService = NetworkService;
