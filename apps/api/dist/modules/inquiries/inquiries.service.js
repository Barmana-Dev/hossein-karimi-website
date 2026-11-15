"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InquiriesService = exports.inquirySchema = void 0;
const prisma_1 = require("../../config/prisma");
const zod_1 = require("zod");
exports.inquirySchema = zod_1.z
    .object({
    fullName: zod_1.z.string().min(3, "نام و نام خانوادگی الزامی است"),
    email: zod_1.z.string().email("ایمیل نامعتبر است").optional().or(zod_1.z.literal("")),
    phone: zod_1.z.string().optional().or(zod_1.z.literal("")),
    type: zod_1.z.string().min(1, "نوع درخواست الزامی است"),
    subject: zod_1.z.string().min(3, "موضوع الزامی است"),
    message: zod_1.z.string().min(10, "توضیحات باید حداقل ۱۰ کاراکتر باشد"),
})
    .refine((data) => data.email || data.phone, {
    message: "حداقل یکی از موارد ایمیل یا شماره تماس الزامی است",
    path: ["email"],
});
class InquiriesService {
    // ثبت درخواست عمومی
    async createInquiry(data) {
        return prisma_1.prisma.inquiry.create({
            data: {
                fullName: data.fullName,
                email: data.email || null,
                phone: data.phone || null,
                type: data.type,
                subject: data.subject,
                message: data.message,
                status: "new",
            },
        });
    }
    // دریافت لیست درخواست‌ها برای ادمین
    async getAllInquiries() {
        return prisma_1.prisma.inquiry.findMany({
            orderBy: { createdAt: "desc" },
        });
    }
    // دریافت یک درخواست با ID
    async getInquiryById(id) {
        return prisma_1.prisma.inquiry.findUnique({
            where: { id },
        });
    }
    // به‌روزرسانی وضعیت و یادداشت
    async updateInquiry(id, data) {
        return prisma_1.prisma.inquiry.update({
            where: { id },
            data,
        });
    }
}
exports.InquiriesService = InquiriesService;
