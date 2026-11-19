import { prisma } from "../../config/prisma";
import { z } from "zod";
import { isValidPhone, normalizePhoneDigits } from "../../lib/phone";

const phoneField = z
  .string()
  .trim()
  .max(30, "شماره تماس بیش از حد طولانی است")
  // 👇 ارقام فارسی/عربی نرمال می‌شوند و ساختار شماره واقعی بررسی می‌شود
  .transform(normalizePhoneDigits)
  .refine((value) => value === "" || isValidPhone(value), {
    message: "شماره تماس معتبر نیست",
  })
  .optional();

export const inquirySchema = z
  .object({
    fullName: z.string().trim().min(3, "نام و نام خانوادگی الزامی است"),
    email: z
      .string()
      .trim()
      .email("ایمیل نامعتبر است")
      .optional()
      .or(z.literal("")),
    phone: phoneField,
    // 👇 فقط گزینه‌های واقعی فرم تماس پذیرفته می‌شوند
    type: z.enum(["legal", "customs", "business", "media", "other"], {
      message: "نوع درخواست معتبر نیست",
    }),
    subject: z.string().trim().min(3, "موضوع الزامی است"),
    message: z.string().trim().min(10, "توضیحات باید حداقل ۱۰ کاراکتر باشد"),
    consent: z.literal(true, {
      message: "رضایت به پردازش داده‌ها الزامی است",
    }),
  })
  .refine((data) => Boolean(data.email?.trim() || data.phone?.trim()), {
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

  async getAllInquiries(
    opts: { skip?: number; take?: number; search?: string; status?: string } = {},
  ) {
    const where = {
      ...(opts.status ? { status: opts.status } : {}),
      ...(opts.search
        ? {
            OR: [
              {
                fullName: {
                  contains: opts.search,
                  mode: "insensitive" as const,
                },
              },
              {
                subject: { contains: opts.search, mode: "insensitive" as const },
              },
              { email: { contains: opts.search, mode: "insensitive" as const } },
            ],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      prisma.inquiry.findMany({
        where,
        orderBy: { createdAt: "desc" },
        ...(opts.take ? { skip: opts.skip, take: opts.take } : {}),
      }),
      prisma.inquiry.count({ where }),
    ]);

    return { items, total };
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
