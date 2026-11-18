"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NetworkController = void 0;
const error_message_1 = require("../../lib/error-message");
const network_service_1 = require("./network.service");
const pagination_1 = require("../../lib/pagination");
const client_1 = require("../../generated/prisma/client");
const validators_1 = require("../../validators");
const zod_1 = require("zod");
const networkService = new network_service_1.NetworkService();
class NetworkController {
    async getAll(req, res) {
        try {
            const agencies = await networkService.getPublishedAgencies();
            res.json({ success: true, data: agencies });
        }
        catch (error) {
            const message = (0, error_message_1.publicErrorMessage)(error, "خطای ناشناخته");
            res.status(500).json({ success: false, error: { message } });
        }
    }
    async getBySlug(req, res) {
        try {
            const slug = req.params.slug;
            const agency = await networkService.getAgencyBySlug(slug);
            if (!agency)
                return res
                    .status(404)
                    .json({ success: false, error: { message: "یافت نشد" } });
            res.json({ success: true, data: agency });
        }
        catch (error) {
            const message = (0, error_message_1.publicErrorMessage)(error, "خطای ناشناخته");
            res.status(500).json({ success: false, error: { message } });
        }
    }
    async adminGetAll(req, res) {
        try {
            const params = (0, pagination_1.getPageParams)(req);
            const { items, total } = await networkService.getAllAgenciesForAdmin(params.paginated
                ? {
                    skip: params.skip,
                    take: params.limit,
                    search: params.search,
                    status: params.status ?? undefined,
                }
                : { search: params.search, status: params.status ?? undefined });
            res.json({
                success: true,
                data: items,
                meta: params.paginated
                    ? (0, pagination_1.buildMeta)(total, params.page, params.limit)
                    : undefined,
            });
        }
        catch (error) {
            const message = (0, error_message_1.publicErrorMessage)(error, "خطای ناشناخته");
            res.status(500).json({ success: false, error: { message } });
        }
    }
    async adminCreate(req, res) {
        try {
            const validated = validators_1.agencyCreateSchema.parse(req.body);
            const agency = await networkService.createAgency(validated);
            res.status(201).json({ success: true, data: agency });
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                return res.status(400).json({
                    success: false,
                    error: {
                        code: "VALIDATION_ERROR",
                        fields: error.flatten().fieldErrors,
                    },
                });
            }
            if (error instanceof client_1.Prisma.PrismaClientKnownRequestError &&
                error.code === "P2002") {
                return res.status(400).json({
                    success: false,
                    error: { message: "این اسلاگ قبلاً استفاده شده است." },
                });
            }
            const message = (0, error_message_1.publicErrorMessage)(error, "خطای ناشناخته");
            res.status(500).json({ success: false, error: { message } });
        }
    }
    async adminGetById(req, res) {
        try {
            const agency = await networkService.getAgencyById(req.params.id);
            if (!agency)
                return res
                    .status(404)
                    .json({ success: false, error: { message: "یافت نشد" } });
            res.json({ success: true, data: agency });
        }
        catch (error) {
            const message = (0, error_message_1.publicErrorMessage)(error, "خطای ناشناخته");
            res.status(500).json({ success: false, error: { message } });
        }
    }
    async adminUpdate(req, res) {
        try {
            const validated = validators_1.agencyUpdateSchema.parse(req.body);
            const agency = await networkService.updateAgency(req.params.id, validated);
            res.json({ success: true, data: agency });
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                return res.status(400).json({
                    success: false,
                    error: {
                        code: "VALIDATION_ERROR",
                        fields: error.flatten().fieldErrors,
                    },
                });
            }
            if (error instanceof client_1.Prisma.PrismaClientKnownRequestError &&
                error.code === "P2002") {
                return res.status(400).json({
                    success: false,
                    error: { message: "این اسلاگ قبلاً استفاده شده است." },
                });
            }
            const message = (0, error_message_1.publicErrorMessage)(error, "خطای ناشناخته");
            res.status(500).json({ success: false, error: { message } });
        }
    }
    async adminDelete(req, res) {
        try {
            await networkService.deleteAgency(req.params.id);
            res.json({ success: true, message: "حذف شد" });
        }
        catch (error) {
            const message = (0, error_message_1.publicErrorMessage)(error, "خطای ناشناخته");
            res.status(500).json({ success: false, error: { message } });
        }
    }
}
exports.NetworkController = NetworkController;
