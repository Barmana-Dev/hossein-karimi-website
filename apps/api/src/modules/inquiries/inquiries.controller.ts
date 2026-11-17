import { Request, Response } from "express";
import { InquiriesService, inquirySchema } from "./inquiries.service";
import { AuthRequest } from "../../middleware/auth.middleware";
import { ZodError } from "zod";
import { prisma } from "../../config/prisma";
import { inquiryUpdateSchema } from "../../validators";

const inquiriesService = new InquiriesService();

export class InquiriesController {
  // ثبت عمومی
  async create(req: Request, res: Response) {
    try {
      const validatedData = inquirySchema.parse(req.body);
      await inquiriesService.createInquiry(validatedData);
      res.status(201).json({ success: true, message: "درخواست شما ثبت شد." });
    } catch (error: unknown) {
      if (error instanceof ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.issues.forEach((issue) => {
          const fieldName = issue.path[0] as string;
          if (fieldName) fieldErrors[fieldName] = issue.message;
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
  async adminGetAll(req: AuthRequest, res: Response) {
    try {
      const data = await inquiriesService.getAllInquiries();
      res.json({ success: true, data });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "خطا";
      res.status(500).json({ success: false, error: { message } });
    }
  }

  // دریافت یک درخواست (ادمین)
  async adminGetById(req: AuthRequest, res: Response) {
    try {
      const data = await inquiriesService.getInquiryById(
        req.params.id as string,
      );
      if (!data)
        return res
          .status(404)
          .json({ success: false, error: { message: "یافت نشد" } });
      res.json({ success: true, data });
    } catch {
      res.status(500).json({ success: false, error: { message: "خطا" } });
    }
  }

  // تغییر وضعیت (ادمین)
  async adminUpdate(req: AuthRequest, res: Response) {
    try {
      // 👇 فقط وضعیت و یادداشت داخلی قابل تغییر است
      const validated = inquiryUpdateSchema.parse(req.body);
      const data = await inquiriesService.updateInquiry(
        req.params.id as string,
        validated,
      );
      res.json({ success: true, data });
    } catch (error: unknown) {
      if (error instanceof ZodError) {
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
  async deleteInquiry(req: AuthRequest, res: Response) {
    try {
      const id = req.params.id as string; // 👈 کست به string

      const inquiry = await prisma.inquiry.findUnique({ where: { id } });
      if (!inquiry) {
        return res.status(404).json({
          success: false,
          error: { message: "درخواست یافت نشد" },
        });
      }

      await prisma.inquiry.delete({ where: { id } });

      res.json({ success: true, message: "درخواست با موفقیت حذف شد" });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "خطای ناشناخته";
      res.status(500).json({ success: false, error: { message } });
    }
  }
}
