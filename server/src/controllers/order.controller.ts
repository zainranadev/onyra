import { Request, Response } from "express";
import Product from "../models/Product";
import Order from "../models/Order";
import { asyncHandler } from "../middleware/asyncHandler";
import { ApiError } from "../middleware/errorHandler";
import { ok, created } from "../utils/apiResponse";
import { orderInputSchema } from "../validations/order.validation";

const FREE_SHIPPING_THRESHOLD = 100;
const STANDARD_SHIPPING = 6.99;
const EXPRESS_SHIPPING = 16.99;
const TAX_RATE = 0.07;

// Demo coupons resolved and applied server-side only
const COUPONS: Record<string, number> = {
  WELCOME10: 0.1,
  SAVE20: 0.2,
};

function generateOrderNumber() {
  const year = new Date().getFullYear();
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `ORD-${year}-${rand}`;
}

// POST /api/orders
export const createOrder = asyncHandler(async (req: Request, res: Response) => {
  const input = orderInputSchema.parse(req.body);

  const productIds = input.items.map((i) => i.productId);
  const products = await Product.find({ _id: { $in: productIds } });
  const productMap = new Map(products.map((p) => [String(p._id), p]));

  const orderItems = input.items.map(({ productId, quantity }) => {
    const product = productMap.get(productId);
    if (!product) throw new ApiError("One of the products in your cart no longer exists.", 400, "PRODUCT_NOT_FOUND");
    if (product.stock < quantity) {
      throw new ApiError(`Only ${product.stock} left of "${product.name}".`, 400, "INSUFFICIENT_STOCK");
    }
    return {
      product: product._id,
      name: product.name,
      image: product.image,
      price: product.price,
      quantity,
    };
  });

  const subtotal = orderItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const shipping =
    input.deliveryMethod === "express"
      ? EXPRESS_SHIPPING
      : subtotal >= FREE_SHIPPING_THRESHOLD
      ? 0
      : STANDARD_SHIPPING;
  const discountRate = input.couponCode ? COUPONS[input.couponCode.toUpperCase()] ?? 0 : 0;
  const discount = Math.round(subtotal * discountRate * 100) / 100;
  const tax = Math.round((subtotal - discount) * TAX_RATE * 100) / 100;
  const total = Math.round((subtotal - discount + tax + shipping) * 100) / 100;

  // Decrement stock for each item
  for (const item of orderItems) {
    await Product.updateOne({ _id: item.product }, { $inc: { stock: -item.quantity } });
  }

  const order = await Order.create({
    orderNumber: generateOrderNumber(),
    user: req.user ? req.user._id : undefined,
    customer: input.customer,
    shippingAddress: input.shippingAddress,
    deliveryMethod: input.deliveryMethod,
    items: orderItems,
    subtotal,
    shipping,
    tax,
    discount,
    total,
    status: "processing",
  });

  created(res, order, "Order placed successfully");
});

// GET /api/orders/my-orders (authenticated customer orders)
export const getMyOrders = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError("Authentication required", 401, "UNAUTHORIZED");
  }
  const orders = await Order.find({
    $or: [{ user: req.user._id }, { "customer.email": req.user.email }],
  })
    .sort({ createdAt: -1 })
    .lean();

  ok(res, orders, "My orders fetched successfully");
});

// GET /api/orders (admin order list)
export const listOrders = asyncHandler(async (req: Request, res: Response) => {
  const { status, search } = req.query as Record<string, string>;
  const query: Record<string, any> = {};
  if (status && status !== "all") query.status = status;
  if (search && search.trim()) {
    const escaped = search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    query.$or = [
      { orderNumber: new RegExp(escaped, "i") },
      { "customer.email": new RegExp(escaped, "i") },
      { "customer.fullName": new RegExp(escaped, "i") },
    ];
  }
  const orders = await Order.find(query).sort({ createdAt: -1 }).lean();
  ok(res, orders, "Orders fetched successfully");
});

// GET /api/orders/:id
export const getOrder = asyncHandler(async (req: Request, res: Response) => {
  const order = await Order.findById(req.params.id).lean();
  if (!order) throw new ApiError("Order not found", 404, "ORDER_NOT_FOUND");
  ok(res, order, "Order fetched successfully");
});

// PUT /api/orders/:id/status (admin only)
export const updateOrderStatus = asyncHandler(async (req: Request, res: Response) => {
  const { status } = req.body;
  const allowed = ["processing", "confirmed", "shipped", "delivered", "cancelled"];
  if (!allowed.includes(status)) throw new ApiError("Invalid order status", 400, "INVALID_STATUS");

  const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
  if (!order) throw new ApiError("Order not found", 404, "ORDER_NOT_FOUND");
  ok(res, order, "Order status updated successfully");
});
