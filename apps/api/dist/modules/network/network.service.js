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
    async getAllAgenciesForAdmin(opts = {}) {
        const where = {
            ...(opts.status ? { status: opts.status } : {}),
            ...(opts.search
                ? {
                    OR: [
                        { name: { contains: opts.search, mode: "insensitive" } },
                        { field: { contains: opts.search, mode: "insensitive" } },
                    ],
                }
                : {}),
        };
        const [items, total] = await Promise.all([
            prisma_1.prisma.agency.findMany({
                where,
                orderBy: { createdAt: "desc" },
                ...(opts.take ? { skip: opts.skip, take: opts.take } : {}),
            }),
            prisma_1.prisma.agency.count({ where }),
        ]);
        return { items, total };
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
