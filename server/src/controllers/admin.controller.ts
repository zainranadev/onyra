import { Request, Response } from "express";
import Product from "../models/Product";
import Order from "../models/Order";
import { asyncHandler } from "../middleware/asyncHandler";
import { ok } from "../utils/apiResponse";

// GET /api/admin/stats — summary cards
export const getStats = asyncHandler(async (_req: Request, res: Response) => {
  const [totalProducts, totalOrders, lowStock, revenueAgg, customerAgg] = await Promise.all([
    Product.countDocuments(),
    Order.countDocuments(),
    Product.countDocuments({ stock: { $lte: 5, $gt: 0 } }),
    Order.aggregate([{ $group: { _id: null, total: { $sum: "$total" } } }]),
    Order.aggregate([{ $group: { _id: "$customer.email" } }]),
  ]);

  ok(res, {
    totalProducts,
    totalOrders,
    totalRevenue: revenueAgg[0]?.total ?? 0,
    lowStockProducts: lowStock,
    totalCustomers: customerAgg.length,
  }, "Stats fetched successfully");
});

// GET /api/admin/dashboard — rich data for the expanded dashboard view
export const getDashboard = asyncHandler(async (_req: Request, res: Response) => {
  const [
    statsData,
    ordersByStatus,
    recentOrders,
    categoryCounts,
    salesByMonth,
    topProducts,
    lowStockItems,
    unitsInStock,
  ] = await Promise.all([
    // ── Summary stats ──────────────────────────────────────────────────
    (async () => {
      const [totalProducts, totalOrders, lowStock, revenueAgg, customerAgg, pendingCount, completedCount, stockAgg] =
        await Promise.all([
          Product.countDocuments(),
          Order.countDocuments(),
          Product.countDocuments({ stock: { $lte: 5, $gt: 0 } }),
          Order.aggregate([{ $group: { _id: null, total: { $sum: "$total" } } }]),
          Order.aggregate([{ $group: { _id: "$customer.email" } }]),
          Order.countDocuments({ status: "processing" }),
          Order.countDocuments({ status: "delivered" }),
          Product.aggregate([{ $group: { _id: null, total: { $sum: "$stock" } } }]),
        ]);
      return {
        totalProducts,
        totalOrders,
        totalRevenue: revenueAgg[0]?.total ?? 0,
        lowStockProducts: lowStock,
        totalCustomers: customerAgg.length,
        pendingOrders: pendingCount,
        completedOrders: completedCount,
        totalUnitsInStock: stockAgg[0]?.total ?? 0,
      };
    })(),

    // ── Orders by status ────────────────────────────────────────────────
    Order.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
      { $project: { _id: 0, status: "$_id", count: 1 } },
    ]),

    // ── Recent orders (last 10) ─────────────────────────────────────────
    Order.find().sort({ createdAt: -1 }).limit(10).select(
      "orderNumber customer total status createdAt items"
    ).lean(),

    // ── Category product counts ─────────────────────────────────────────
    Product.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $project: { _id: 0, name: "$_id", count: 1 } },
    ]),

    // ── Sales by month (last 6 months) ──────────────────────────────────
    Order.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000) },
          status: { $ne: "cancelled" },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          revenue: { $sum: "$total" },
          orders: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
      {
        $project: {
          _id: 0,
          year: "$_id.year",
          month: "$_id.month",
          revenue: 1,
          orders: 1,
        },
      },
    ]),

    // ── Top 5 selling products ──────────────────────────────────────────
    Order.aggregate([
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.name",
          sold: { $sum: "$items.quantity" },
          revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
          image: { $first: "$items.image" },
        },
      },
      { $sort: { sold: -1 } },
      { $limit: 5 },
      { $project: { _id: 0, name: "$_id", sold: 1, revenue: 1, image: 1 } },
    ]),

    // ── Low stock products (stock ≤ 5, > 0) ────────────────────────────
    Product.find({ stock: { $lte: 5, $gt: 0 } })
      .sort({ stock: 1 })
      .limit(6)
      .select("name image stock category")
      .lean(),

    // ── All products for units-in-stock grid ────────────────────────────
    Product.find({ stock: { $gt: 0 } })
      .sort({ stock: 1 })
      .limit(12)
      .select("name image stock category")
      .lean(),
  ]);

  ok(
    res,
    {
      stats: statsData,
      ordersByStatus,
      recentOrders,
      categoryCounts,
      salesByMonth,
      topProducts,
      lowStockItems,
      unitsInStock,
    },
    "Dashboard fetched successfully"
  );
});
