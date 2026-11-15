"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExpertiseController = void 0;
const expertise_service_1 = require("./expertise.service");
const client_1 = require("../../generated/prisma/client");
const expertiseService = new expertise_service_1.ExpertiseService();
class ExpertiseController {
    async getAll(req, res) {
        try {
            const data = await expertiseService.getPublishedExpertises();
            res.json({ success: true, data });
        }
        catch (error) {
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
        catch (error) {
            res.status(500).json({ success: false, error: { message: "خطا" } });
        }
    }
    async adminGetAll(req, res) {
        try {
            const data = await expertiseService.getAllExpertisesForAdmin();
            res.json({ success: true, data });
        }
        catch (error) {
            res.status(500).json({ success: false, error: { message: "خطا" } });
        }
    }
    async adminCreate(req, res) {
        try {
            const data = await expertiseService.createExpertise(req.body);
            res.status(201).json({ success: true, data });
        }
        catch (error) {
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
        catch (error) {
            res.status(500).json({ success: false, error: { message: "خطا" } });
        }
    }
    async adminUpdate(req, res) {
        try {
            const data = await expertiseService.updateExpertise(req.params.id, req.body);
            res.json({ success: true, data });
        }
        catch (error) {
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
        catch (error) {
            res.status(500).json({ success: false, error: { message: "خطا" } });
        }
    }
}
exports.ExpertiseController = ExpertiseController;
