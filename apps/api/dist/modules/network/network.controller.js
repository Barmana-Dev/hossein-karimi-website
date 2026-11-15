"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NetworkController = void 0;
const network_service_1 = require("./network.service");
const client_1 = require("../../generated/prisma/client");
const networkService = new network_service_1.NetworkService();
class NetworkController {
    // ====== متدهای عمومی ======
    async getAll(req, res) {
        try {
            const agencies = await networkService.getPublishedAgencies();
            res.json({ success: true, data: agencies });
        }
        catch (error) {
            const message = error instanceof Error ? error.message : "خطای ناشناخته";
            res.status(500).json({ success: false, error: { message } });
        }
    }
    async getBySlug(req, res) {
        try {
            const slug = req.params.slug;
            const agency = await networkService.getAgencyBySlug(slug);
            if (!agency)
                return res
                    .status(404)
                    .json({ success: false, error: { message: "یافت نشد" } });
            res.json({ success: true, data: agency });
        }
        catch (error) {
            const message = error instanceof Error ? error.message : "خطای ناشناخته";
            res.status(500).json({ success: false, error: { message } });
        }
    }
    // ====== متدهای مدیریتی ======
    async adminGetAll(req, res) {
        try {
            const agencies = await networkService.getAllAgenciesForAdmin();
            res.json({ success: true, data: agencies });
        }
        catch (error) {
            const message = error instanceof Error ? error.message : "خطای ناشناخته";
            res.status(500).json({ success: false, error: { message } });
        }
    }
    async adminCreate(req, res) {
        try {
            // 👇 ارسال مستقیم req.body به سرویس (شامل logoImage)
            const agency = await networkService.createAgency(req.body);
            res.status(201).json({ success: true, data: agency });
        }
        catch (error) {
            if (error instanceof client_1.Prisma.PrismaClientKnownRequestError &&
                error.code === "P2002") {
                return res.status(400).json({
                    success: false,
                    error: { message: "این اسلاگ قبلاً استفاده شده است." },
                });
            }
            const message = error instanceof Error ? error.message : "خطای ناشناخته";
            res.status(500).json({ success: false, error: { message } });
        }
    }
    async adminGetById(req, res) {
        try {
            const agency = await networkService.getAgencyById(req.params.id);
            if (!agency)
                return res
                    .status(404)
                    .json({ success: false, error: { message: "یافت نشد" } });
            res.json({ success: true, data: agency });
        }
        catch (error) {
            const message = error instanceof Error ? error.message : "خطای ناشناخته";
            res.status(500).json({ success: false, error: { message } });
        }
    }
    async adminUpdate(req, res) {
        try {
            // 👇 ارسال مستقیم req.body به سرویس (شامل logoImage)
            const agency = await networkService.updateAgency(req.params.id, req.body);
            res.json({ success: true, data: agency });
        }
        catch (error) {
            if (error instanceof client_1.Prisma.PrismaClientKnownRequestError &&
                error.code === "P2002") {
                return res.status(400).json({
                    success: false,
                    error: { message: "این اسلاگ قبلاً استفاده شده است." },
                });
            }
            const message = error instanceof Error ? error.message : "خطای ناشناخته";
            res.status(500).json({ success: false, error: { message } });
        }
    }
    async adminDelete(req, res) {
        try {
            await networkService.deleteAgency(req.params.id);
            res.json({ success: true, message: "حذف شد" });
        }
        catch (error) {
            const message = error instanceof Error ? error.message : "خطای ناشناخته";
            res.status(500).json({ success: false, error: { message } });
        }
    }
}
exports.NetworkController = NetworkController;
