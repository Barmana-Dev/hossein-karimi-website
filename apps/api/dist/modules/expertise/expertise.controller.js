"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExpertiseController = void 0;
const expertise_service_1 = require("./expertise.service");
const pagination_1 = require("../../lib/pagination");
const client_1 = require("../../generated/prisma/client");
const validators_1 = require("../../validators");
const zod_1 = require("zod");
const expertiseService = new expertise_service_1.ExpertiseService();
class ExpertiseController {
    async getAll(req, res) {
        try {
            const data = await expertiseService.getPublishedExpertises();
            res.json({ success: true, data });
        }
        catch {
            res.status(500).json({ success: false, error: { message: "خطا" } });
        }
    }
    async getBySlug(req, res) {
        try {
            const data = await expertiseService.getExpertiseBySlug(req.params.slug);
            if (!data)
                return res
                    .status(404)
                    .json({ success: false, error: { message: "یافت نشد" } });
            res.json({ success: true, data });
        }
        catch {
            res.status(500).json({ success: false, error: { message: "خطا" } });
        }
    }
    async adminGetAll(req, res) {
        try {
            const params = (0, pagination_1.getPageParams)(req);
            const { items, total } = await expertiseService.getAllExpertisesForAdmin(params.paginated
                ? {
                    skip: params.skip,
                    take: params.limit,
                    search: params.search,
                    status: params.status ?? undefined,
                }
                : { search: params.search, status: params.status ?? undefined });
            res.json({
                success: true,
                data: items,
                meta: params.paginated
                    ? (0, pagination_1.buildMeta)(total, params.page, params.limit)
                    : undefined,
            });
        }
        catch {
            res.status(500).json({ success: false, error: { message: "خطا" } });
        }
    }
    async adminCreate(req, res) {
        try {
            const validated = validators_1.expertiseCreateSchema.parse(req.body);
            const data = await expertiseService.createExpertise(validated);
            res.status(201).json({ success: true, data });
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                return res.status(400).json({
                    success: false,
                    error: {
                        code: "VALIDATION_ERROR",
                        fields: error.flatten().fieldErrors,
                    },
                });
            }
            if (error instanceof client_1.Prisma.PrismaClientKnownRequestError &&
                error.code === "P2002") {
                return res
                    .status(400)
                    .json({ success: false, error: { message: "اسلاگ تکراری است" } });
            }
            res.status(500).json({ success: false, error: { message: "خطا" } });
        }
    }
    async adminGetById(req, res) {
        try {
            const data = await expertiseService.getExpertiseById(req.params.id);
            if (!data)
                return res
                    .status(404)
                    .json({ success: false, error: { message: "یافت نشد" } });
            res.json({ success: true, data });
        }
        catch {
            res.status(500).json({ success: false, error: { message: "خطا" } });
        }
    }
    async adminUpdate(req, res) {
        try {
            const validated = validators_1.expertiseUpdateSchema.parse(req.body);
            const data = await expertiseService.updateExpertise(req.params.id, validated);
            res.json({ success: true, data });
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                return res.status(400).json({
                    success: false,
                    error: {
                        code: "VALIDATION_ERROR",
                        fields: error.flatten().fieldErrors,
                    },
                });
            }
            if (error instanceof client_1.Prisma.PrismaClientKnownRequestError &&
                error.code === "P2002") {
                return res
                    .status(400)
                    .json({ success: false, error: { message: "اسلاگ تکراری است" } });
            }
            res.status(500).json({ success: false, error: { message: "خطا" } });
        }
    }
    async adminDelete(req, res) {
        try {
            await expertiseService.deleteExpertise(req.params.id);
            res.json({ success: true });
        }
        catch {
            res.status(500).json({ success: false, error: { message: "خطا" } });
        }
    }
}
exports.ExpertiseController = ExpertiseController;
