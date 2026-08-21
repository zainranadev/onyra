import { Router } from "express";
import {
  listProducts,
  featuredProducts,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
  createReview,
} from "../controllers/product.controller";
import { requireAuth, adminOnly } from "../middleware/auth.middleware";

const router = Router();

router.get("/featured", featuredProducts);
router.get("/", listProducts);
router.get("/:slug", getProductBySlug);
router.post("/:slug/reviews", requireAuth, createReview);
router.post("/", requireAuth, adminOnly, createProduct);
router.put("/:id", requireAuth, adminOnly, updateProduct);
router.delete("/:id", requireAuth, adminOnly, deleteProduct);

export default router;
