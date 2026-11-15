import { Request, Response } from "express";
import { NetworkService } from "./network.service";
import { AuthRequest } from "../../middleware/auth.middleware";
import { Prisma } from "../../generated/prisma/client";
import { agencyCreateSchema, agencyUpdateSchema } from "../../validators";
import { ZodError } from "zod";

const networkService = new NetworkService();

export class NetworkController {
  async getAll(req: Request, res: Response) {
    try {
      const agencies = await networkService.getPublishedAgencies();
      res.json({ success: true, data: agencies });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "خطای ناشناخته";
      res.status(500).json({ success: false, error: { message } });
    }
  }

  async getBySlug(req: Request, res: Response) {
    try {
      const slug = req.params.slug as string;
      const agency = await networkService.getAgencyBySlug(slug);
      if (!agency)
        return res
          .status(404)
          .json({ success: false, error: { message: "یافت نشد" } });
      res.json({ success: true, data: agency });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "خطای ناشناخته";
      res.status(500).json({ success: false, error: { message } });
    }
  }

  async adminGetAll(req: AuthRequest, res: Response) {
    try {
      const agencies = await networkService.getAllAgenciesForAdmin();
      res.json({ success: true, data: agencies });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "خطای ناشناخته";
      res.status(500).json({ success: false, error: { message } });
    }
  }

  async adminCreate(req: AuthRequest, res: Response) {
    try {
      const validated = agencyCreateSchema.parse(req.body);
      const agency = await networkService.createAgency(validated);
      res.status(201).json({ success: true, data: agency });
    } catch (error: unknown) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            fields: error.flatten().fieldErrors,
          },
        });
      }
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        return res.status(400).json({
          success: false,
          error: { message: "این اسلاگ قبلاً استفاده شده است." },
        });
      }
      const message = error instanceof Error ? error.message : "خطای ناشناخته";
      res.status(500).json({ success: false, error: { message } });
    }
  }

  async adminGetById(req: AuthRequest, res: Response) {
    try {
      const agency = await networkService.getAgencyById(
        req.params.id as string,
      );
      if (!agency)
        return res
          .status(404)
          .json({ success: false, error: { message: "یافت نشد" } });
      res.json({ success: true, data: agency });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "خطای ناشناخته";
      res.status(500).json({ success: false, error: { message } });
    }
  }

  async adminUpdate(req: AuthRequest, res: Response) {
    try {
      const validated = agencyUpdateSchema.parse(req.body);
      const agency = await networkService.updateAgency(
        req.params.id as string,
        validated,
      );
      res.json({ success: true, data: agency });
    } catch (error: unknown) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            fields: error.flatten().fieldErrors,
          },
        });
      }
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        return res.status(400).json({
          success: false,
          error: { message: "این اسلاگ قبلاً استفاده شده است." },
        });
      }
      const message = error instanceof Error ? error.message : "خطای ناشناخته";
      res.status(500).json({ success: false, error: { message } });
    }
  }

  async adminDelete(req: AuthRequest, res: Response) {
    try {
      await networkService.deleteAgency(req.params.id as string);
      res.json({ success: true, message: "حذف شد" });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "خطای ناشناخته";
      res.status(500).json({ success: false, error: { message } });
    }
  }
}
