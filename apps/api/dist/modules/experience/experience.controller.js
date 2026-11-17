"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExperienceController = void 0;
const experience_service_1 = require("./experience.service");
const pagination_1 = require("../../lib/pagination");
const client_1 = require("../../generated/prisma/client");
const validators_1 = require("../../validators");
const zod_1 = require("zod");
const experienceService = new experience_service_1.ExperienceService();
class ExperienceController {
    async getAll(req, res) {
        try {
            res.json({
                success: true,
                data: await experienceService.getPublishedExperiences(),
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: { message: error instanceof Error ? error.message : "خطا" },
            });
        }
    }
    async getBySlug(req, res) {
        try {
            const exp = await experienceService.getExperienceBySlug(req.params.slug);
            if (!exp)
                return res
                    .status(404)
                    .json({ success: false, error: { message: "یافت نشد" } });
            res.json({ success: true, data: exp });
        }
        catch {
            res.status(500).json({ success: false, error: { message: "خطا" } });
        }
    }
    async adminGetAll(req, res) {
        try {
            const params = (0, pagination_1.getPageParams)(req);
            const { items, total } = await experienceService.getAllExperiencesForAdmin(params.paginated
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
            const validated = validators_1.experienceCreateSchema.parse(req.body);
            res.status(201).json({
                success: true,
                data: await experienceService.createExperience(validated),
            });
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
                error.code === "P2002")
                return res
                    .status(400)
                    .json({ success: false, error: { message: "اسلاگ تکراری است" } });
            res.status(500).json({ success: false, error: { message: "خطا" } });
        }
    }
    async adminGetById(req, res) {
        try {
            const exp = await experienceService.getExperienceById(req.params.id);
            if (!exp)
                return res
                    .status(404)
                    .json({ success: false, error: { message: "یافت نشد" } });
            res.json({ success: true, data: exp });
        }
        catch {
            res.status(500).json({ success: false, error: { message: "خطا" } });
        }
    }
    async adminUpdate(req, res) {
        try {
            const validated = validators_1.experienceUpdateSchema.parse(req.body);
            res.json({
                success: true,
                data: await experienceService.updateExperience(req.params.id, validated),
            });
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
                error.code === "P2002")
                return res
                    .status(400)
                    .json({ success: false, error: { message: "اسلاگ تکراری است" } });
            res.status(500).json({ success: false, error: { message: "خطا" } });
        }
    }
    async adminDelete(req, res) {
        try {
            await experienceService.deleteExperience(req.params.id);
            res.json({ success: true });
        }
        catch {
            res.status(500).json({ success: false, error: { message: "خطا" } });
        }
    }
}
exports.ExperienceController = ExperienceController;
