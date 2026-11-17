import { Request, Response } from "express";
import { ExpertiseService } from "./expertise.service";
import { AuthRequest } from "../../middleware/auth.middleware";
import { buildMeta, getPageParams } from "../../lib/pagination";
import { Prisma } from "../../generated/prisma/client";
import { expertiseCreateSchema, expertiseUpdateSchema } from "../../validators";
import { ZodError } from "zod";

const expertiseService = new ExpertiseService();

export class ExpertiseController {
  async getAll(req: Request, res: Response) {
    try {
      const data = await expertiseService.getPublishedExpertises();
      res.json({ success: true, data });
    } catch {
      res.status(500).json({ success: false, error: { message: "خطا" } });
    }
  }

  async getBySlug(req: Request, res: Response) {
    try {
      const data = await expertiseService.getExpertiseBySlug(
        req.params.slug as string,
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

  async adminGetAll(req: AuthRequest, res: Response) {
    try {
      const params = getPageParams(req);
      const { items, total } =
        await expertiseService.getAllExpertisesForAdmin(
          params.paginated
            ? {
                skip: params.skip,
                take: params.limit,
                search: params.search,
                status: params.status ?? undefined,
              }
            : { search: params.search, status: params.status ?? undefined },
        );

      res.json({
        success: true,
        data: items,
        meta: params.paginated
          ? buildMeta(total, params.page, params.limit)
          : undefined,
      });
    } catch {
      res.status(500).json({ success: false, error: { message: "خطا" } });
    }
  }

  async adminCreate(req: AuthRequest, res: Response) {
    try {
      const validated = expertiseCreateSchema.parse(req.body);
      const data = await expertiseService.createExpertise(validated);
      res.status(201).json({ success: true, data });
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
        return res
          .status(400)
          .json({ success: false, error: { message: "اسلاگ تکراری است" } });
      }
      res.status(500).json({ success: false, error: { message: "خطا" } });
    }
  }

  async adminGetById(req: AuthRequest, res: Response) {
    try {
      const data = await expertiseService.getExpertiseById(
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

  async adminUpdate(req: AuthRequest, res: Response) {
    try {
      const validated = expertiseUpdateSchema.parse(req.body);
      const data = await expertiseService.updateExpertise(
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
            fields: error.flatten().fieldErrors,
          },
        });
      }
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        return res
          .status(400)
          .json({ success: false, error: { message: "اسلاگ تکراری است" } });
      }
      res.status(500).json({ success: false, error: { message: "خطا" } });
    }
  }

  async adminDelete(req: AuthRequest, res: Response) {
    try {
      await expertiseService.deleteExpertise(req.params.id as string);
      res.json({ success: true });
    } catch {
      res.status(500).json({ success: false, error: { message: "خطا" } });
    }
  }
}
