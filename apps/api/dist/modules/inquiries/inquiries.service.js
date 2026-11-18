"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InquiriesService = exports.inquirySchema = void 0;
const prisma_1 = require("../../config/prisma");
const zod_1 = require("zod");
const phoneField = zod_1.z
    .string()
    .trim()
    .max(30, "شماره تماس بیش از حد طولانی است")
    .optional()
    .or(zod_1.z.literal(""))
    .refine((value) => !value || /^[+0-9()\-\s]{7,30}$/.test(value), {
    message: "شماره تماس معتبر نیست",
});
exports.inquirySchema = zod_1.z
    .object({
    fullName: zod_1.z.string().trim().min(3, "نام و نام خانوادگی الزامی است"),
    email: zod_1.z
        .string()
        .trim()
        .email("ایمیل نامعتبر است")
        .optional()
        .or(zod_1.z.literal("")),
    phone: phoneField,
    // 👇 فقط گزینه‌های واقعی فرم تماس پذیرفته می‌شوند
    type: zod_1.z.enum(["legal", "customs", "business", "media", "other"], {
        message: "نوع درخواست معتبر نیست",
    }),
    subject: zod_1.z.string().trim().min(3, "موضوع الزامی است"),
    message: zod_1.z.string().trim().min(10, "توضیحات باید حداقل ۱۰ کاراکتر باشد"),
    consent: zod_1.z.literal(true, {
        message: "رضایت به پردازش داده‌ها الزامی است",
    }),
})
    .refine((data) => Boolean(data.email?.trim() || data.phone?.trim()), {
    message: "حداقل یکی از موارد ایمیل یا شماره تماس الزامی است",
    path: ["email"],
});
class InquiriesService {
    async createInquiry(data) {
        return prisma_1.prisma.inquiry.create({
            data: {
                fullName: data.fullName,
                email: data.email || null,
                phone: data.phone || null,
                type: data.type,
                subject: data.subject,
                message: data.message,
                // 👇 undefined به‌جای null
                consentAt: data.consent ? new Date() : undefined,
                status: "new",
            },
        });
    }
    async getAllInquiries(opts = {}) {
        const where = {
            ...(opts.status ? { status: opts.status } : {}),
            ...(opts.search
                ? {
                    OR: [
                        {
                            fullName: {
                                contains: opts.search,
                                mode: "insensitive",
                            },
                        },
                        {
                            subject: { contains: opts.search, mode: "insensitive" },
                        },
                        { email: { contains: opts.search, mode: "insensitive" } },
                    ],
                }
                : {}),
        };
        const [items, total] = await Promise.all([
            prisma_1.prisma.inquiry.findMany({
                where,
                orderBy: { createdAt: "desc" },
                ...(opts.take ? { skip: opts.skip, take: opts.take } : {}),
            }),
            prisma_1.prisma.inquiry.count({ where }),
        ]);
        return { items, total };
    }
    async getInquiryById(id) {
        return prisma_1.prisma.inquiry.findUnique({ where: { id } });
    }
    async updateInquiry(id, data) {
        return prisma_1.prisma.inquiry.update({
            where: { id },
            data,
        });
    }
}
exports.InquiriesService = InquiriesService;
