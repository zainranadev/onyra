import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle2, Package } from "lucide-react";
import { orderService } from "@/services/orderService";
import { Order } from "@/types";
import { Button } from "@/components/common/Button";
import { Spinner } from "@/components/common/Spinner";
import { ErrorState } from "@/components/common/ErrorState";
import { toApiError } from "@/services/api";

export default function OrderSuccess() {
  const { orderId = "" } = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    orderService.get(orderId).then(setOrder).catch((err) => setError(toApiError(err).message));
  }, [orderId]);

  if (error) return <div className="container-page py-16"><ErrorState message={error} /></div>;
  if (!order) return <Spinner label="Loading your order..." />;

  const estimate = order.deliveryMethod === "express" ? "1–2 business days" : "4–6 business days";

  return (
    <div className="container-page max-w-2xl py-16 text-center">
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 18 }}
        className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-orange/10 text-orange"
      >
        <CheckCircle2 size={32} />
      </motion.div>
      <h1 className="mt-6 font-display text-3xl text-ink">Thank you, {order.customer.fullName.split(" ")[0]}!</h1>
      <p className="mt-2 text-graphite">Your order has been successfully placed.</p>
      <p className="mt-1 font-display text-lg text-brown">Order #{order.orderNumber}</p>

      <div className="mt-8 rounded-xl2 bg-white p-6 text-left shadow-card">
        <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-ink">
          <Package size={16} /> Order summary
        </div>
        <div className="space-y-3">
          {order.items.map((item) => (
            <div key={item.name} className="flex items-center gap-3">
              <img src={item.image} alt={item.name} className="h-12 w-12 rounded-lg object-cover" />
              <div className="flex-1 text-sm">
                <p className="text-ink">{item.name}</p>
                <p className="text-xs text-graphite">Qty {item.quantity}</p>
              </div>
              <span className="text-sm font-medium text-ink">${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 space-y-1.5 border-t border-black/5 pt-4 text-sm text-graphite">
          <div className="flex justify-between"><span>Subtotal</span><span>${order.subtotal.toFixed(2)}</span></div>
          <div className="flex justify-between"><span>Shipping</span><span>{order.shipping === 0 ? "Free" : `$${order.shipping.toFixed(2)}`}</span></div>
          {order.discount > 0 && <div className="flex justify-between"><span>Discount</span><span>-${order.discount.toFixed(2)}</span></div>}
          <div className="flex justify-between"><span>Tax</span><span>${order.tax.toFixed(2)}</span></div>
        </div>
        <div className="mt-3 flex justify-between border-t border-black/5 pt-3 text-base font-semibold text-ink">
          <span>Total</span><span>${order.total.toFixed(2)}</span>
        </div>
        <p className="mt-4 text-xs text-graphite">Estimated delivery: {estimate}</p>
      </div>

      <Link to="/shop" className="mt-8 inline-block">
        <Button size="lg">Continue shopping</Button>
      </Link>
    </div>
  );
}
