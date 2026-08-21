import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Package,
  ClipboardList,
  DollarSign,
  AlertTriangle,
  Users,
  TrendingUp,
  ShoppingBag,
  Boxes,
  ChevronRight,
  ArrowUpRight,
  Bell,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { adminService } from "@/services/orderService";
import { ErrorState } from "@/components/common/ErrorState";
import { Badge } from "@/components/common/Badge";
import { toApiError } from "@/services/api";
import { OrderStatus } from "@/types";

// ─── Types ─────────────────────────────────────────────────────────────────

interface DashboardData {
  stats: {
    totalProducts: number;
    totalOrders: number;
    totalRevenue: number;
    lowStockProducts: number;
    totalCustomers: number;
    pendingOrders: number;
    completedOrders: number;
    totalUnitsInStock: number;
  };
  ordersByStatus: { status: string; count: number }[];
  recentOrders: {
    _id: string;
    orderNumber: string;
    customer: { fullName: string; email: string };
    total: number;
    status: OrderStatus;
    createdAt: string;
    items: { name: string }[];
  }[];
  categoryCounts: { name: string; count: number }[];
  salesByMonth: { year: number; month: number; revenue: number; orders: number }[];
  topProducts: { name: string; sold: number; revenue: number; image: string }[];
  lowStockItems: { _id: string; name: string; image: string; stock: number; category: string }[];
  unitsInStock: { _id: string; name: string; image: string; stock: number; category: string }[];
}

// ─── Config ─────────────────────────────────────────────────────────────────

const STAT_CARDS = [
  { key: "totalRevenue", label: "Revenue", icon: DollarSign, color: "bg-emerald-50 text-emerald-600", isCurrency: true },
  { key: "totalOrders", label: "Total orders", icon: ClipboardList, color: "bg-orange/10 text-orange", isCurrency: false },
  { key: "totalProducts", label: "Products", icon: Package, color: "bg-purple/10 text-purple", isCurrency: false },
  { key: "totalUnitsInStock", label: "Units in stock", icon: Boxes, color: "bg-sky-50 text-sky-600", isCurrency: false },
  { key: "totalCustomers", label: "Customers", icon: Users, color: "bg-ink/10 text-ink", isCurrency: false },
  { key: "pendingOrders", label: "Pending orders", icon: ShoppingBag, color: "bg-amber-50 text-amber-600", isCurrency: false },
  { key: "completedOrders", label: "Completed", icon: TrendingUp, color: "bg-teal-50 text-teal-600", isCurrency: false },
  { key: "lowStockProducts", label: "Low stock", icon: AlertTriangle, color: "bg-red-50 text-red-500", isCurrency: false },
] as const;

const STATUS_COLORS: Record<string, string> = {
  processing: "bg-amber-100 text-amber-700",
  confirmed: "bg-purple/10 text-purple",
  shipped: "bg-sky-100 text-sky-700",
  delivered: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-red-100 text-red-600",
};

const STATUS_BADGE_TONE: Record<string, "orange" | "purple" | "ink" | "gray" | "red"> = {
  processing: "gray",
  confirmed: "purple",
  shipped: "orange",
  delivered: "ink",
  cancelled: "red",
};

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// ─── Sub-components ──────────────────────────────────────────────────────────

function StatCard({
  label,
  icon: Icon,
  color,
  value,
  isCurrency,
  loading,
}: {
  label: string;
  icon: typeof Package;
  color: string;
  value: number;
  isCurrency: boolean;
  loading: boolean;
}) {
  return (
    <div className="rounded-xl2 bg-white p-5 shadow-card">
      <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-full ${color}`}>
        <Icon size={18} />
      </div>
      {loading ? (
        <div className="skeleton h-7 w-20 rounded" />
      ) : (
        <p className="font-display text-2xl text-ink">
          {isCurrency
            ? `$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
            : value.toLocaleString()}
        </p>
      )}
      <p className="mt-1 text-xs text-graphite">{label}</p>
    </div>
  );
}

function SectionHeader({ title, subtitle, linkTo, linkLabel }: { title: string; subtitle?: string; linkTo?: string; linkLabel?: string }) {
  return (
    <div className="mb-4 flex items-start justify-between">
      <div>
        <h2 className="font-display text-lg text-ink">{title}</h2>
        {subtitle && <p className="text-xs text-graphite">{subtitle}</p>}
      </div>
      {linkTo && (
        <Link to={linkTo} className="flex items-center gap-1 text-xs font-medium text-brown hover:text-orange">
          {linkLabel} <ArrowUpRight size={12} />
        </Link>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    setError(null);
    setData(null);
    adminService
      .dashboard()
      .then(setData)
      .catch((err) => setError(toApiError(err).message));
  };

  useEffect(() => {
    load();
  }, []);

  const loading = !data && !error;
  const stats = data?.stats;

  return (
    <div className="space-y-8">
      {/* ── Page header ── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl text-ink">Dashboard</h1>
          <p className="text-sm text-graphite">A live overview of catalog, stock units, orders, and sales.</p>
        </div>
        <div className="flex gap-2">
          <Link
            to="/admin/products"
            className="flex items-center gap-1.5 rounded-lg bg-orange px-3.5 py-2 text-sm font-medium text-white hover:bg-orange/90"
          >
            <Package size={14} /> Manage products
          </Link>
          <Link
            to="/admin/orders"
            className="flex items-center gap-1.5 rounded-lg border border-black/10 bg-white px-3.5 py-2 text-sm font-medium text-ink hover:border-ink/20"
          >
            <ClipboardList size={14} /> Manage orders
          </Link>
        </div>
      </div>

      {error && <ErrorState message={error} onRetry={load} />}

      {/* ── Live New Order Notification Banner ── */}
      {stats && stats.pendingOrders > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-orange/30 bg-gradient-to-r from-orange/10 via-amber-500/10 to-violet-500/10 p-4 shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange text-white shadow-md shadow-orange/30">
              <Bell size={20} />
              <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-emerald-400 ring-2 ring-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display text-sm font-semibold text-ink">
                  New Order Alert: {stats.pendingOrders} Order{stats.pendingOrders !== 1 ? "s" : ""} Pending
                </h3>
                <span className="rounded-full bg-orange/20 px-2 py-0.5 text-[10px] font-bold text-orange uppercase tracking-wider">
                  Action Required
                </span>
              </div>
              <p className="mt-0.5 text-xs text-graphite">
                Customers have placed new orders waiting for review & fulfillment.
              </p>
            </div>
          </div>

          <Link
            to="/admin/orders"
            className="flex items-center gap-1.5 rounded-xl bg-ink px-4 py-2 text-xs font-medium text-white shadow-sm transition-transform hover:scale-105"
          >
            Review New Orders <ChevronRight size={14} />
          </Link>
        </motion.div>
      )}

      {/* ── Stats grid ── */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-8">
        {STAT_CARDS.map((c) => (
          <StatCard
            key={c.key}
            label={c.label}
            icon={c.icon}
            color={c.color}
            value={stats?.[c.key] ?? 0}
            isCurrency={c.isCurrency}
            loading={loading}
          />
        ))}
      </div>

      {/* ── Units in Stock grid ── */}
      <div className="rounded-xl2 bg-white p-6 shadow-card">
        <SectionHeader
          title="Units in Stock"
          subtitle={stats ? `${stats.totalUnitsInStock.toLocaleString()} units across ${stats.totalProducts} SKUs` : undefined}
          linkTo="/admin/products"
          linkLabel="View all"
        />
        {loading ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="skeleton h-14 rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
            {(data?.unitsInStock ?? []).map((p) => (
              <div
                key={p._id}
                className="flex flex-col rounded-lg border border-black/5 bg-mist/50 p-3"
              >
                <img src={p.image} alt={p.name} className="mb-2 h-10 w-10 rounded-md object-cover" />
                <p className="truncate text-xs font-medium text-ink">{p.name}</p>
                <p className="mt-0.5 text-xs text-graphite">
                  <span className={p.stock <= 5 ? "font-semibold text-red-500" : "font-semibold text-emerald-600"}>
                    {p.stock}
                  </span>{" "}
                  units
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Orders by Status ── */}
      <div className="rounded-xl2 bg-white p-6 shadow-card">
        <SectionHeader title="Orders by Status" />
        {loading ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
            {Array.from({ length: 5 }).map((_, i) => <div key={i} className="skeleton h-20 rounded-lg" />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
            {["processing", "confirmed", "shipped", "delivered", "cancelled"].map((s) => {
              const found = data?.ordersByStatus.find((o) => o.status === s);
              return (
                <div key={s} className={`rounded-lg p-4 ${STATUS_COLORS[s] ?? "bg-mist text-graphite"}`}>
                  <p className="text-2xl font-bold">{found?.count ?? 0}</p>
                  <p className="mt-1 text-xs font-medium capitalize">{s}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Two-column row: Categories + Recent Orders ── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[320px_1fr]">
        {/* Categories */}
        <div className="rounded-xl2 bg-white p-6 shadow-card">
          <SectionHeader title="Categories" linkTo="/admin/products" linkLabel="View all" />
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-12 rounded-lg" />)}
            </div>
          ) : (
            <ul className="divide-y divide-black/5">
              {(data?.categoryCounts ?? []).map((c) => (
                <li key={c.name} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium capitalize text-ink">{c.name}</p>
                  </div>
                  <span className="rounded-full bg-orange/10 px-2.5 py-0.5 text-xs font-semibold text-orange">
                    {c.count} products
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Recent Orders */}
        <div className="rounded-xl2 bg-white p-6 shadow-card">
          <SectionHeader
            title="Recent Orders"
            subtitle={
              stats?.pendingOrders
                ? `${stats.pendingOrders} pending order${stats.pendingOrders !== 1 ? "s" : ""} need attention.`
                : undefined
            }
            linkTo="/admin/orders"
            linkLabel="View all"
          />
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, i) => <div key={i} className="skeleton h-12 rounded-lg" />)}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px] text-sm">
                <thead>
                  <tr className="border-b border-black/5 text-xs uppercase tracking-wide text-graphite">
                    <th className="pb-2 pr-4 text-left font-medium">Order</th>
                    <th className="pb-2 pr-4 text-left font-medium">Customer</th>
                    <th className="pb-2 pr-4 text-right font-medium">Total</th>
                    <th className="pb-2 pr-4 text-left font-medium">Status</th>
                    <th className="pb-2 text-right font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {(data?.recentOrders ?? []).map((o) => (
                    <tr key={o._id} className="border-b border-black/5 last:border-none hover:bg-black/[0.02]">
                      <td className="py-2.5 pr-4 font-medium text-ink">#{o.orderNumber}</td>
                      <td className="py-2.5 pr-4">
                        <p className="font-medium text-ink">{o.customer.fullName}</p>
                        <p className="text-xs text-graphite">{o.customer.email}</p>
                      </td>
                      <td className="py-2.5 pr-4 text-right text-ink">${o.total.toFixed(2)}</td>
                      <td className="py-2.5 pr-4">
                        <Badge tone={STATUS_BADGE_TONE[o.status] ?? "gray"}>{o.status}</Badge>
                      </td>
                      <td className="py-2.5 text-right text-xs text-graphite">
                        {new Date(o.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                  {data?.recentOrders.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-sm text-graphite">
                        No orders yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ── Two-column row: Sales by Month + Top Products ── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Sales by Month */}
        <div className="rounded-xl2 bg-white p-6 shadow-card">
          <SectionHeader title="Sales by Month" subtitle="Last 6 months (excl. cancelled)" />
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-10 rounded" />)}
            </div>
          ) : (
            <div className="space-y-3">
              {(data?.salesByMonth ?? []).length === 0 && (
                <p className="text-sm text-graphite">No sales data yet.</p>
              )}
              {(data?.salesByMonth ?? []).map((s) => {
                const maxRevenue = Math.max(...(data?.salesByMonth.map((x) => x.revenue) ?? [1]));
                const pct = maxRevenue > 0 ? (s.revenue / maxRevenue) * 100 : 0;
                const label = `${s.year}-${String(s.month).padStart(2, "0")}`;
                return (
                  <div key={label} className="flex items-center gap-3">
                    <span className="w-14 shrink-0 text-xs text-graphite">
                      {MONTH_NAMES[s.month - 1]} {s.year}
                    </span>
                    <div className="flex-1 overflow-hidden rounded-full bg-black/5">
                      <div
                        className="h-2 rounded-full bg-gradient-to-r from-orange to-brown transition-all duration-700"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="w-16 shrink-0 text-right text-xs font-medium text-ink">
                      ${s.revenue.toFixed(2)}
                    </span>
                    <span className="w-14 shrink-0 text-right text-xs text-graphite">
                      {s.orders} order{s.orders !== 1 ? "s" : ""}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Top Selling Products */}
        <div className="rounded-xl2 bg-white p-6 shadow-card">
          <SectionHeader title="Top Selling Products" subtitle="By units sold across all orders" />
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => <div key={i} className="skeleton h-12 rounded-lg" />)}
            </div>
          ) : (
            <ul className="divide-y divide-black/5">
              {(data?.topProducts ?? []).length === 0 && (
                <li className="py-4 text-sm text-graphite">No sales data yet.</li>
              )}
              {(data?.topProducts ?? []).map((p, i) => (
                <li key={p.name} className="flex items-center gap-3 py-3">
                  <span className="w-5 shrink-0 text-xs font-semibold text-graphite">{i + 1}</span>
                  <img src={p.image} alt={p.name} className="h-9 w-9 shrink-0 rounded-lg object-cover" />
                  <p className="flex-1 truncate text-sm font-medium text-ink">{p.name}</p>
                  <span className="shrink-0 text-xs font-semibold text-orange">{p.sold} sold</span>
                  <span className="shrink-0 text-xs text-graphite">${p.revenue.toFixed(2)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* ── Low stock alert strip ── */}
      {(data?.lowStockItems.length ?? 0) > 0 && (
        <div className="rounded-xl2 border border-red-100 bg-red-50 p-5">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle size={15} className="text-red-500" />
              <h2 className="font-display text-sm text-red-700">
                Low Stock Alert — {data!.lowStockItems.length} product{data!.lowStockItems.length !== 1 ? "s" : ""} need restocking
              </h2>
            </div>
            <Link
              to="/admin/products"
              className="flex items-center gap-1 text-xs font-medium text-red-600 hover:underline"
            >
              Manage <ChevronRight size={12} />
            </Link>
          </div>
          <div className="flex flex-wrap gap-2">
            {data!.lowStockItems.map((p) => (
              <div
                key={p._id}
                className="flex items-center gap-2 rounded-lg border border-red-200 bg-white px-3 py-2"
              >
                <img src={p.image} alt={p.name} className="h-7 w-7 rounded object-cover" />
                <div>
                  <p className="text-xs font-medium text-ink">{p.name}</p>
                  <p className="text-xs text-red-500">{p.stock} left</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
