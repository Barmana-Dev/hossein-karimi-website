import { Router } from "express";
import { SearchController } from "./search.controller";
import { requireAuth } from "../../middleware/auth.middleware";

const router = Router();
const controller = new SearchController();

router.get("/", requireAuth, (req, res) => controller.search(req, res));

export default router;
