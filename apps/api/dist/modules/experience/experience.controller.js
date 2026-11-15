"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExperienceController = void 0;
const experience_service_1 = require("./experience.service");
const client_1 = require("../../generated/prisma/client");
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
        catch (error) {
            res.status(500).json({ success: false, error: { message: "خطا" } });
        }
    }
    async adminGetAll(req, res) {
        try {
            res.json({
                success: true,
                data: await experienceService.getAllExperiencesForAdmin(),
            });
        }
        catch (error) {
            res.status(500).json({ success: false, error: { message: "خطا" } });
        }
    }
    async adminCreate(req, res) {
        try {
            res.status(201).json({
                success: true,
                data: await experienceService.createExperience(req.body),
            });
        }
        catch (error) {
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
        catch (error) {
            res.status(500).json({ success: false, error: { message: "خطا" } });
        }
    }
    async adminUpdate(req, res) {
        try {
            res.json({
                success: true,
                data: await experienceService.updateExperience(req.params.id, req.body),
            });
        }
        catch (error) {
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
        catch (error) {
            res.status(500).json({ success: false, error: { message: "خطا" } });
        }
    }
}
exports.ExperienceController = ExperienceController;
