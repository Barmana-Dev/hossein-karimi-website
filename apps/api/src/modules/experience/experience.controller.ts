import { publicErrorMessage } from "../../lib/error-message";
import { Request, Response } from "express";
import { ExperienceService } from "./experience.service";
import { AuthRequest } from "../../middleware/auth.middleware";
import { buildMeta, getPageParams } from "../../lib/pagination";
import { Prisma } from "../../generated/prisma/client";
import {
  experienceCreateSchema,
  experienceUpdateSchema,
} from "../../validators";
import { ZodError } from "zod";

const experienceService = new ExperienceService();

export class ExperienceController {
  async getAll(req: Request, res: Response) {
    try {
      res.json({
        success: true,
        data: await experienceService.getPublishedExperiences(),
      });
    } catch (error: unknown) {
      res.status(500).json({
        success: false,
        error: { message: publicErrorMessage(error, "خطا") },
      });
    }
  }

  async getBySlug(req: Request, res: Response) {
    try {
      const exp = await experienceService.getExperienceBySlug(
        req.params.slug as string,
      );
      if (!exp)
        return res
          .status(404)
          .json({ success: false, error: { message: "یافت نشد" } });
      res.json({ success: true, data: exp });
    } catch {
      res.status(500).json({ success: false, error: { message: "خطا" } });
    }
  }

  async adminGetAll(req: AuthRequest, res: Response) {
    try {
      const params = getPageParams(req);
      const { items, total } =
        await experienceService.getAllExperiencesForAdmin(
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
      const validated = experienceCreateSchema.parse(req.body);
      res.status(201).json({
        success: true,
        data: await experienceService.createExperience(validated),
      });
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
      )
        return res
          .status(400)
          .json({ success: false, error: { message: "اسلاگ تکراری است" } });
      res.status(500).json({ success: false, error: { message: "خطا" } });
    }
  }

  async adminGetById(req: AuthRequest, res: Response) {
    try {
      const exp = await experienceService.getExperienceById(
        req.params.id as string,
      );
      if (!exp)
        return res
          .status(404)
          .json({ success: false, error: { message: "یافت نشد" } });
      res.json({ success: true, data: exp });
    } catch {
      res.status(500).json({ success: false, error: { message: "خطا" } });
    }
  }

  async adminUpdate(req: AuthRequest, res: Response) {
    try {
      const validated = experienceUpdateSchema.parse(req.body);
      res.json({
        success: true,
        data: await experienceService.updateExperience(
          req.params.id as string,
          validated,
        ),
      });
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
      )
        return res
          .status(400)
          .json({ success: false, error: { message: "اسلاگ تکراری است" } });
      res.status(500).json({ success: false, error: { message: "خطا" } });
    }
  }

  async adminDelete(req: AuthRequest, res: Response) {
    try {
      await experienceService.deleteExperience(req.params.id as string);
      res.json({ success: true });
    } catch {
      res.status(500).json({ success: false, error: { message: "خطا" } });
    }
  }
}
