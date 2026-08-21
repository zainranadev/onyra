import { useEffect, useState } from "react";
import { Search, ClipboardX } from "lucide-react";
import { orderService } from "@/services/orderService";
import { Order, OrderStatus } from "@/types";
import { Badge } from "@/components/common/Badge";
import { TableRowSkeleton } from "@/components/common/Skeleton";
import { ErrorState } from "@/components/common/ErrorState";
import { EmptyState } from "@/components/common/EmptyState";
import { useToast } from "@/context/ToastContext";
import { toApiError } from "@/services/api";

const STATUSES: OrderStatus[] = ["processing", "confirmed", "shipped", "delivered", "cancelled"];
const STATUS_TONE: Record<OrderStatus, "orange" | "purple" | "ink" | "gray" | "red"> = {
  processing: "gray",
  confirmed: "purple",
  shipped: "orange",
  delivered: "ink",
  cancelled: "red",
};

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const { showToast } = useToast();

  const load = () => {
    setError(null);
    setOrders(null);
    orderService
      .list({ search: search || undefined, status })
      .then(setOrders)
      .catch((err) => setError(toApiError(err).message));
  };

  useEffect(() => {
    load();
  }, [search, status]);

  const handleStatusChange = async (order: Order, next: OrderStatus) => {
    try {
      await orderService.updateStatus(order._id, next);
      showToast(`Order #${order.orderNumber} marked ${next}`, "success");
      load();
    } catch (err) {
      showToast(toApiError(err).message, "error");
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl text-ink">Orders</h1>
        <p className="text-sm text-graphite">Track and update order fulfillment.</p>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="flex flex-1 min-w-[220px] items-center gap-2 rounded-lg border border-black/10 bg-white px-3.5 py-2.5">
          <Search size={16} className="text-graphite" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by order # or email..." className="w-full bg-transparent text-sm outline-none" />
        </div>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="input w-auto">
          <option value="all">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s} className="capitalize">{s}</option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto rounded-xl2 bg-white shadow-card">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-black/5 text-xs uppercase tracking-wide text-graphite">
              <th className="px-4 py-3 font-medium">Order</th>
              <th className="px-4 py-3 font-medium">Customer</th>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Items</th>
              <th className="px-4 py-3 font-medium">Total</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {!orders && !error && Array.from({ length: 6 }).map((_, i) => <TableRowSkeleton key={i} cols={6} />)}
            {orders &&
              orders.map((o) => (
                <tr key={o._id} className="border-b border-black/5 last:border-none hover:bg-black/[0.02]">
                  <td className="px-4 py-3 font-medium text-ink">#{o.orderNumber}</td>
                  <td className="px-4 py-3 text-graphite">{o.customer.fullName}<div className="text-xs">{o.customer.email}</div></td>
                  <td className="px-4 py-3 text-graphite">{new Date(o.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-graphite">{o.items.length}</td>
                  <td className="px-4 py-3 text-ink">${o.total.toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <select
                      value={o.status}
                      onChange={(e) => handleStatusChange(o, e.target.value as OrderStatus)}
                      className="rounded-lg border border-black/10 bg-white px-2 py-1.5 text-xs font-medium capitalize"
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                    <span className="ml-2 hidden sm:inline-block"><Badge tone={STATUS_TONE[o.status]}>{o.status}</Badge></span>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {error && <ErrorState message={error} onRetry={load} />}
      {!error && orders && orders.length === 0 && (
        <EmptyState icon={<ClipboardX size={22} />} title="No orders found" description="Orders placed by customers will show up here." />
      )}
    </div>
  );
}
