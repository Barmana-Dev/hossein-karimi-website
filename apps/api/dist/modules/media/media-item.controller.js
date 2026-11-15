"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MediaItemController = void 0;
const media_service_1 = require("./media.service");
const mediaService = new media_service_1.MediaItemService();
class MediaItemController {
    async getAll(req, res) {
        try {
            const data = await mediaService.getPublishedMedia();
            res.json({ success: true, data });
        }
        catch (error) {
            const message = error instanceof Error ? error.message : "خطای ناشناخته";
            res.status(500).json({ success: false, error: { message } });
        }
    }
    async adminGetAll(req, res) {
        try {
            const data = await mediaService.getAllMediaForAdmin();
            res.json({ success: true, data });
        }
        catch (error) {
            const message = error instanceof Error ? error.message : "خطای ناشناخته";
            res.status(500).json({ success: false, error: { message } });
        }
    }
    async adminCreate(req, res) {
        try {
            const data = await mediaService.createMedia(req.body);
            res.status(201).json({ success: true, data });
        }
        catch (error) {
            const message = error instanceof Error ? error.message : "خطای ناشناخته";
            res.status(500).json({ success: false, error: { message } });
        }
    }
    async adminGetById(req, res) {
        try {
            const data = await mediaService.getMediaById(req.params.id);
            if (!data)
                return res
                    .status(404)
                    .json({ success: false, error: { message: "یافت نشد" } });
            res.json({ success: true, data });
        }
        catch (error) {
            const message = error instanceof Error ? error.message : "خطای ناشناخته";
            res.status(500).json({ success: false, error: { message } });
        }
    }
    async adminUpdate(req, res) {
        try {
            const data = await mediaService.updateMedia(req.params.id, req.body);
            res.json({ success: true, data });
        }
        catch (error) {
            const message = error instanceof Error ? error.message : "خطای ناشناخته";
            res.status(500).json({ success: false, error: { message } });
        }
    }
    async adminDelete(req, res) {
        try {
            await mediaService.deleteMedia(req.params.id);
            res.json({ success: true });
        }
        catch (error) {
            const message = error instanceof Error ? error.message : "خطای ناشناخته";
            res.status(500).json({ success: false, error: { message } });
        }
    }
}
exports.MediaItemController = MediaItemController;
