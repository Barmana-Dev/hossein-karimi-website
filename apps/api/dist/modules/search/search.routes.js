"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const search_controller_1 = require("./search.controller");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const router = (0, express_1.Router)();
const controller = new search_controller_1.SearchController();
router.get("/", auth_middleware_1.requireAuth, (req, res) => controller.search(req, res));
exports.default = router;
