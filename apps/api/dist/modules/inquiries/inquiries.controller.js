"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InquiriesController = void 0;
const inquiries_service_1 = require("./inquiries.service");
const zod_1 = require("zod");
const prisma_1 = require("../../config/prisma");
const validators_1 = require("../../validators");
const inquiriesService = new inquiries_service_1.InquiriesService();
class InquiriesController {
    // ثبت عمومی
    async create(req, res) {
        try {
            const validatedData = inquiries_service_1.inquirySchema.parse(req.body);
            await inquiriesService.createInquiry(validatedData);
            res.status(201).json({ success: true, message: "درخواست شما ثبت شد." });
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                const fieldErrors = {};
                error.issues.forEach((issue) => {
                    const fieldName = issue.path[0];
                    if (fieldName)
                        fieldErrors[fieldName] = issue.message;
                });
                return res.status(400).json({
                    success: false,
                    error: { code: "VALIDATION_ERROR", fields: fieldErrors },
                });
            }
            res.status(500).json({ success: false, error: { message: "خطا" } });
        }
    }
    // دریافت لیست (ادمین)
    async adminGetAll(req, res) {
        try {
            const data = await inquiriesService.getAllInquiries();
            res.json({ success: true, data });
        }
        catch (error) {
            const message = error instanceof Error ? error.message : "خطا";
            res.status(500).json({ success: false, error: { message } });
        }
    }
    // دریافت یک درخواست (ادمین)
    async adminGetById(req, res) {
        try {
            const data = await inquiriesService.getInquiryById(req.params.id);
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
    // تغییر وضعیت (ادمین)
    async adminUpdate(req, res) {
        try {
            // 👇 فقط وضعیت و یادداشت داخلی قابل تغییر است
            const validated = validators_1.inquiryUpdateSchema.parse(req.body);
            const data = await inquiriesService.updateInquiry(req.params.id, validated);
            res.json({ success: true, data });
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                return res.status(400).json({
                    success: false,
                    error: {
                        code: "VALIDATION_ERROR",
                        message: "اطلاعات ارسالی معتبر نیست.",
                        fields: error.flatten().fieldErrors,
                    },
                });
            }
            const message = error instanceof Error ? error.message : "خطا";
            res.status(500).json({ success: false, error: { message } });
        }
    }
    // 👇 حذف درخواست (ادمین)
    async deleteInquiry(req, res) {
        try {
            const id = req.params.id; // 👈 کست به string
            const inquiry = await prisma_1.prisma.inquiry.findUnique({ where: { id } });
            if (!inquiry) {
                return res.status(404).json({
                    success: false,
                    error: { message: "درخواست یافت نشد" },
                });
            }
            await prisma_1.prisma.inquiry.delete({ where: { id } });
            res.json({ success: true, message: "درخواست با موفقیت حذف شد" });
        }
        catch (error) {
            const message = error instanceof Error ? error.message : "خطای ناشناخته";
            res.status(500).json({ success: false, error: { message } });
        }
    }
}
exports.InquiriesController = InquiriesController;
