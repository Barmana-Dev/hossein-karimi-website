"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MediaItemController = void 0;
const zod_1 = require("zod");
const media_service_1 = require("./media.service");
const pagination_1 = require("../../lib/pagination");
const validators_1 = require("../../validators");
const mediaService = new media_service_1.MediaItemService();
function sendValidationError(res, error) {
    return res.status(400).json({
        success: false,
        error: {
            code: "VALIDATION_ERROR",
            message: "اطلاعات ارسالی معتبر نیست.",
            fields: error.flatten().fieldErrors,
        },
    });
}
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
            const params = (0, pagination_1.getPageParams)(req);
            const { items, total } = await mediaService.getAllMediaForAdmin(params.paginated
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
                });
            res.json({
                success: true,
                data: items,
                meta: params.paginated
                    ? (0, pagination_1.buildMeta)(total, params.page, params.limit)
                    : undefined,
            });
        }
        catch (error) {
            const message = error instanceof Error ? error.message : "خطای ناشناخته";
            res.status(500).json({ success: false, error: { message } });
        }
    }
    async adminCreate(req, res) {
        try {
            const validated = validators_1.mediaCreateSchema.parse(req.body);
            const data = await mediaService.createMedia(validated);
            res.status(201).json({ success: true, data });
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                return sendValidationError(res, error);
            }
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
            const validated = validators_1.mediaUpdateSchema.parse(req.body);
            const data = await mediaService.updateMedia(req.params.id, validated);
            res.json({ success: true, data });
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                return sendValidationError(res, error);
            }
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
