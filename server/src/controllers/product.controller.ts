import { Request, Response } from "express";
import slugify from "slugify";
import Product from "../models/Product";
import Review from "../models/Review";
import { asyncHandler } from "../middleware/asyncHandler";
import { ApiError } from "../middleware/errorHandler";
import { ok, created } from "../utils/apiResponse";
import { productInputSchema } from "../validations/product.validation";
import { reviewInputSchema } from "../validations/review.validation";

const SORT_MAP: Record<string, Record<string, 1 | -1>> = {
  featured: { featured: -1, createdAt: -1 },
  price_asc: { price: 1 },
  price_desc: { price: -1 },
  newest: { createdAt: -1 },
  rating: { rating: -1 },
};

// GET /api/products - supports search, category filter, sort, and pagination.
export const listProducts = asyncHandler(async (req: Request, res: Response) => {
  const { search, category, sort = "featured", page = "1", limit = "12" } = req.query as Record<
    string,
    string
  >;

  const query: Record<string, any> = {};
  if (category && category !== "all") query.category = category;
  if (search && search.trim()) {
    const escaped = search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    query.$or = [
      { name: { $regex: escaped, $options: "i" } },
      { description: { $regex: escaped, $options: "i" } },
      { shortDescription: { $regex: escaped, $options: "i" } },
      { tags: { $regex: escaped, $options: "i" } },
      { category: { $regex: escaped, $options: "i" } },
    ];
  }

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(48, Math.max(1, parseInt(limit, 10) || 12));

  const [items, total] = await Promise.all([
    Product.find(query)
      .sort(SORT_MAP[sort] ?? SORT_MAP.featured)
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .lean(),
    Product.countDocuments(query),
  ]);

  ok(res, {
    items,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.max(1, Math.ceil(total / limitNum)),
    },
  }, "Products fetched successfully");
});

export const featuredProducts = asyncHandler(async (_req: Request, res: Response) => {
  const items = await Product.find({ featured: true }).sort({ createdAt: -1 }).limit(8).lean();
  ok(res, items, "Featured products fetched successfully");
});

export const getProductBySlug = asyncHandler(async (req: Request, res: Response) => {
  const product = await Product.findOne({ slug: req.params.slug }).lean();
  if (!product) throw new ApiError("Product not found", 404, "PRODUCT_NOT_FOUND");

  const [reviews, related] = await Promise.all([
    Review.find({ product: product._id }).sort({ createdAt: -1 }).lean(),
    Product.find({ category: product.category, _id: { $ne: product._id } }).limit(4).lean(),
  ]);

  ok(res, { product, reviews, related }, "Product fetched successfully");
});

export const createProduct = asyncHandler(async (req: Request, res: Response) => {
  const input = productInputSchema.parse(req.body);
  const slug = slugify(input.name, { lower: true, strict: true });

  const exists = await Product.findOne({ slug });
  if (exists) throw new ApiError("A product with this name already exists.", 409, "DUPLICATE_PRODUCT");

  const product = await Product.create({ ...input, slug });
  created(res, product, "Product created successfully");
});

export const updateProduct = asyncHandler(async (req: Request, res: Response) => {
  const input = productInputSchema.partial().parse(req.body);
  const update: Record<string, any> = { ...input };
  if (input.name) update.slug = slugify(input.name, { lower: true, strict: true });

  const product = await Product.findByIdAndUpdate(req.params.id, update, { new: true });
  if (!product) throw new ApiError("Product not found", 404, "PRODUCT_NOT_FOUND");
  ok(res, product, "Product updated successfully");
});

export const deleteProduct = asyncHandler(async (req: Request, res: Response) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) throw new ApiError("Product not found", 404, "PRODUCT_NOT_FOUND");
  ok(res, { id: req.params.id }, "Product deleted successfully");
});

// POST /api/products/:slug/reviews  — requires auth
export const createReview = asyncHandler(async (req: Request, res: Response) => {
  const product = await Product.findOne({ slug: req.params.slug });
  if (!product) throw new ApiError("Product not found", 404, "PRODUCT_NOT_FOUND");

  // One review per user per product
  const existing = await Review.findOne({ product: product._id, userName: req.user!.name });
  if (existing) throw new ApiError("You have already reviewed this product.", 409, "ALREADY_REVIEWED");

  const input = reviewInputSchema.parse(req.body);

  const review = await Review.create({
    product: product._id,
    userName: req.user!.name,
    rating: input.rating,
    text: input.text,
  });

  // Recalculate average rating and review count
  const [agg] = await Review.aggregate([
    { $match: { product: product._id } },
    { $group: { _id: null, avg: { $avg: "$rating" }, count: { $sum: 1 } } },
  ]);

  await Product.findByIdAndUpdate(product._id, {
    rating: parseFloat((agg?.avg ?? input.rating).toFixed(2)),
    reviewCount: agg?.count ?? 1,
  });

  created(res, review, "Review submitted successfully.");
});
