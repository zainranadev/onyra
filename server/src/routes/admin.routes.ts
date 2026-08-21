import { Router } from "express";
import { getStats, getDashboard } from "../controllers/admin.controller";
import { requireAuth, adminOnly } from "../middleware/auth.middleware";

const router = Router();

router.get("/stats", requireAuth, adminOnly, getStats);
router.get("/dashboard", requireAuth, adminOnly, getDashboard);

export default router;
