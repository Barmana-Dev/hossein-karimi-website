import { prisma } from "../../config/prisma";
import { z } from "zod";

export const inquirySchema = z
  .object({
    fullName: z.string().min(3, "نام و نام خانوادگی الزامی است"),
    email: z.string().email("ایمیل نامعتبر است").optional().or(z.literal("")),
    phone: z.string().optional().or(z.literal("")),
    type: z.string().min(1, "نوع درخواست الزامی است"),
    subject: z.string().min(3, "موضوع الزامی است"),
    message: z.string().min(10, "توضیحات باید حداقل ۱۰ کاراکتر باشد"),
    consent: z.literal(true, {
      message: "رضایت به پردازش داده‌ها الزامی است",
    }),
  })
  .refine((data) => data.email || data.phone, {
    message: "حداقل یکی از موارد ایمیل یا شماره تماس الزامی است",
    path: ["email"],
  });

export class InquiriesService {
  async createInquiry(data: z.infer<typeof inquirySchema>) {
    return prisma.inquiry.create({
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

  async getAllInquiries() {
    return prisma.inquiry.findMany({
      orderBy: { createdAt: "desc" },
    });
  }

  async getInquiryById(id: string) {
    return prisma.inquiry.findUnique({ where: { id } });
  }

  async updateInquiry(
    id: string,
    data: {
      status?: "new" | "in_review" | "contacted" | "closed";
      internalNote?: string | null;
    },
  ) {
    return prisma.inquiry.update({
      where: { id },
      data,
    });
  }
}
