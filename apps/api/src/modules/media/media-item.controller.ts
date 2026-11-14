import { Request, Response } from "express";
import { MediaItemService } from "./media.service";
import { AuthRequest } from "../../middleware/auth.middleware";

const mediaService = new MediaItemService();

export class MediaItemController {
  async getAll(req: Request, res: Response) {
    try {
      const data = await mediaService.getPublishedMedia();
      res.json({ success: true, data });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "خطای ناشناخته";
      res.status(500).json({ success: false, error: { message } });
    }
  }

  async adminGetAll(req: AuthRequest, res: Response) {
    try {
      const data = await mediaService.getAllMediaForAdmin();
      res.json({ success: true, data });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "خطای ناشناخته";
      res.status(500).json({ success: false, error: { message } });
    }
  }

  async adminCreate(req: AuthRequest, res: Response) {
    try {
      const data = await mediaService.createMedia(req.body);
      res.status(201).json({ success: true, data });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "خطای ناشناخته";
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
      const message = error instanceof Error ? error.message : "خطای ناشناخته";
      res.status(500).json({ success: false, error: { message } });
    }
  }

  async adminUpdate(req: AuthRequest, res: Response) {
    try {
      const data = await mediaService.updateMedia(
        req.params.id as string,
        req.body,
      );
      res.json({ success: true, data });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "خطای ناشناخته";
      res.status(500).json({ success: false, error: { message } });
    }
  }

  async adminDelete(req: AuthRequest, res: Response) {
    try {
      await mediaService.deleteMedia(req.params.id as string);
      res.json({ success: true });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "خطای ناشناخته";
      res.status(500).json({ success: false, error: { message } });
    }
  }
}
