import { Request, Response } from "express";
import Category from "../models/Category";
import Product from "../models/Product";
import { asyncHandler } from "../middleware/asyncHandler";
import { ApiError } from "../middleware/errorHandler";
import { ok } from "../utils/apiResponse";

export const listCategories = asyncHandler(async (_req: Request, res: Response) => {
  const categories = await Category.find().sort({ name: 1 }).lean();
  const withCounts = await Promise.all(
    categories.map(async (c) => ({
      ...c,
      productCount: await Product.countDocuments({ category: c.slug }),
    }))
  );
  ok(res, withCounts, "Categories fetched successfully");
});

export const getCategory = asyncHandler(async (req: Request, res: Response) => {
  const category = await Category.findOne({ slug: req.params.slug }).lean();
  if (!category) throw new ApiError("Category not found", 404, "CATEGORY_NOT_FOUND");
  const productCount = await Product.countDocuments({ category: category.slug });
  ok(res, { ...category, productCount }, "Category fetched successfully");
});
