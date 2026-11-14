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
  })
  .refine((data) => data.email || data.phone, {
    message: "حداقل یکی از موارد ایمیل یا شماره تماس الزامی است",
    path: ["email"],
  });

export class InquiriesService {
  // ثبت درخواست عمومی
  async createInquiry(data: z.infer<typeof inquirySchema>) {
    return prisma.inquiry.create({
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
    return prisma.inquiry.findMany({
      orderBy: { createdAt: "desc" },
    });
  }

  // دریافت یک درخواست با ID
  async getInquiryById(id: string) {
    return prisma.inquiry.findUnique({
      where: { id },
    });
  }

  // به‌روزرسانی وضعیت و یادداشت
  async updateInquiry(
    id: string,
    data: { status?: string; internalNote?: string },
  ) {
    return prisma.inquiry.update({
      where: { id },
      data,
    });
  }
}
