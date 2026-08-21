import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PackageSearch, ChevronRight } from "lucide-react";
import { orderService } from "@/services/orderService";
import { Order, OrderStatus } from "@/types";
import { Badge } from "@/components/common/Badge";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { Spinner } from "@/components/common/Spinner";
import { toApiError } from "@/services/api";

const STATUS_TONE: Record<OrderStatus, "orange" | "purple" | "ink" | "gray" | "red"> = {
  processing: "gray",
  confirmed: "purple",
  shipped: "orange",
  delivered: "ink",
  cancelled: "red",
};

export default function OrderHistory() {
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    setError(null);
    setOrders(null);
    orderService.myOrders().then(setOrders).catch((err) => setError(toApiError(err).message));
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="container-page py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl text-ink">Order History</h1>
          <p className="mt-1 text-sm text-graphite">View and track all your previous purchases.</p>
        </div>
        <Link to="/account" className="text-xs font-medium text-brown hover:underline">
          Back to Account
        </Link>
      </div>

      {error && <ErrorState message={error} onRetry={load} />}
      {!error && !orders && <Spinner label="Loading your orders..." />}
      {!error && orders && orders.length === 0 && (
        <EmptyState
          icon={<PackageSearch size={22} />}
          title="No orders found"
          description="You haven't placed any orders yet. Start exploring our collection."
          actionLabel="Start shopping"
          actionTo="/shop"
        />
      )}
      {!error && orders && orders.length > 0 && (
        <div className="space-y-3">
          {orders.map((o) => (
            <div key={o._id} className="flex flex-wrap items-center gap-4 rounded-xl2 bg-white p-5 shadow-card">
              <div className="min-w-[140px]">
                <p className="font-display text-sm text-ink font-semibold">#{o.orderNumber}</p>
                <p className="text-xs text-graphite">{new Date(o.createdAt).toLocaleDateString()}</p>
              </div>
              <Badge tone={STATUS_TONE[o.status]}>{o.status}</Badge>
              <span className="text-sm text-graphite">{o.items.length} item{o.items.length > 1 ? "s" : ""}</span>
              <span className="ml-auto font-semibold text-ink">${o.total.toFixed(2)}</span>
              <Link to={`/order-success/${o._id}`} className="flex items-center gap-1 text-sm font-medium text-brown hover:text-orange">
                View details <ChevronRight size={14} />
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
