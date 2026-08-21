import { Router } from "express";
import {
  createOrder,
  listOrders,
  getOrder,
  getMyOrders,
  updateOrderStatus,
} from "../controllers/order.controller";
import { requireAuth, optionalAuth, adminOnly } from "../middleware/auth.middleware";

const router = Router();

router.post("/", requireAuth, createOrder);
router.get("/my-orders", requireAuth, getMyOrders);
router.get("/", requireAuth, adminOnly, listOrders);
router.get("/:id", getOrder);
router.put("/:id/status", requireAuth, adminOnly, updateOrderStatus);

export default router;
