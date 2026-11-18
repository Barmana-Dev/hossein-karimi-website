import { publicErrorMessage } from "../../lib/error-message";
import { Request, Response } from "express";
import { ZodError } from "zod";
import { MediaItemService } from "./media.service";
import { AuthRequest } from "../../middleware/auth.middleware";
import { buildMeta, getPageParams } from "../../lib/pagination";
import { mediaCreateSchema, mediaUpdateSchema } from "../../validators";

const mediaService = new MediaItemService();

function sendValidationError(res: Response, error: ZodError) {
  return res.status(400).json({
    success: false,
    error: {
      code: "VALIDATION_ERROR",
      message: "اطلاعات ارسالی معتبر نیست.",
      fields: error.flatten().fieldErrors,
    },
  });
}

export class MediaItemController {
  async getAll(req: Request, res: Response) {
    try {
      const data = await mediaService.getPublishedMedia();
      res.json({ success: true, data });
    } catch (error: unknown) {
      const message = publicErrorMessage(error, "خطای ناشناخته");
      res.status(500).json({ success: false, error: { message } });
    }
  }

  async adminGetAll(req: AuthRequest, res: Response) {
    try {
      const params = getPageParams(req);
      const { items, total } = await mediaService.getAllMediaForAdmin(
        params.paginated
          ? {
              skip: params.skip,
              take: params.limit,
              search: params.search,
              status: params.status ?? undefined,
              type: params.type ?? undefined,
            }
          : {
              search: params.search,
              status: params.status ?? undefined,
              type: params.type ?? undefined,
            },
      );
      res.json({
        success: true,
        data: items,
        meta: params.paginated
          ? buildMeta(total, params.page, params.limit)
          : undefined,
      });
    } catch (error: unknown) {
      const message = publicErrorMessage(error, "خطای ناشناخته");
      res.status(500).json({ success: false, error: { message } });
    }
  }

  async adminCreate(req: AuthRequest, res: Response) {
    try {
      const validated = mediaCreateSchema.parse(req.body);
      const data = await mediaService.createMedia(validated);
      res.status(201).json({ success: true, data });
    } catch (error: unknown) {
      if (error instanceof ZodError) {
        return sendValidationError(res, error);
      }
      const message = publicErrorMessage(error, "خطای ناشناخته");
      res.status(500).json({ success: false, error: { message } });
    }
  }

  async adminGetById(req: AuthRequest, res: Response) {
    try {
      const data = await mediaService.getMediaById(req.params.id as string);
      if (!data)
        return res
          .status(404)
          .json({ success: false, error: { message: "یافت نشد" } });
      res.json({ success: true, data });
    } catch (error: unknown) {
      const message = publicErrorMessage(error, "خطای ناشناخته");
      res.status(500).json({ success: false, error: { message } });
    }
  }

  async adminUpdate(req: AuthRequest, res: Response) {
    try {
      const validated = mediaUpdateSchema.parse(req.body);
      const data = await mediaService.updateMedia(
        req.params.id as string,
        validated,
      );
      res.json({ success: true, data });
    } catch (error: unknown) {
      if (error instanceof ZodError) {
        return sendValidationError(res, error);
      }
      const message = publicErrorMessage(error, "خطای ناشناخته");
      res.status(500).json({ success: false, error: { message } });
    }
  }

  async adminDelete(req: AuthRequest, res: Response) {
    try {
      await mediaService.deleteMedia(req.params.id as string);
      res.json({ success: true });
    } catch (error: unknown) {
      const message = publicErrorMessage(error, "خطای ناشناخته");
      res.status(500).json({ success: false, error: { message } });
    }
  }
}
