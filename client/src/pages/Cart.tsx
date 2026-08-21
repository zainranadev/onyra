import { Link } from "react-router-dom";
import { ShoppingBag, Trash2, ArrowRight, Lock, UserCheck } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { QuantitySelector } from "@/components/common/QuantitySelector";
import { Button } from "@/components/common/Button";
import { EmptyState } from "@/components/common/EmptyState";

const FREE_SHIPPING_THRESHOLD = 100;
const STANDARD_SHIPPING = 6.99;
const TAX_RATE = 0.07;

export default function Cart() {
  const { items, removeItem, updateQuantity, subtotal } = useCart();
  const { isAuthenticated, user } = useAuth();

  if (items.length === 0) {
    return (
      <div className="container-page py-16">
        <EmptyState
          icon={<ShoppingBag size={22} />}
          title="Your cart is empty"
          description="Browse the shop and add something you'll actually use every day."
          actionLabel="Start shopping"
          actionTo="/shop"
        />
      </div>
    );
  }

  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING;
  const tax = Math.round(subtotal * TAX_RATE * 100) / 100;
  const total = subtotal + shipping + tax;

  return (
    <div className="container-page py-10">
      <h1 className="mb-8 font-display text-3xl text-ink">Your cart</h1>
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_360px]">
        <div className="space-y-5">
          {items.map((item) => (
            <div key={item.product._id} className="flex gap-4 rounded-xl2 bg-white p-4 shadow-card">
              <Link to={`/products/${item.product.slug}`} className="h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-mist">
                <img src={item.product.image} alt={item.product.name} className="h-full w-full object-cover" />
              </Link>
              <div className="flex flex-1 flex-col justify-between">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <Link to={`/products/${item.product.slug}`} className="font-display text-base text-ink hover:text-brown">
                      {item.product.name}
                    </Link>
                    <p className="text-xs text-graphite">${item.product.price.toFixed(2)} each</p>
                  </div>
                  <button
                    onClick={() => removeItem(item.product._id)}
                    aria-label={`Remove ${item.product.name}`}
                    className="text-graphite hover:text-red-500"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <QuantitySelector value={item.quantity} max={item.product.stock} onChange={(q) => updateQuantity(item.product._id, q)} />
                  <span className="font-semibold text-ink">${(item.product.price * item.quantity).toFixed(2)}</span>
                </div>
              </div>
            </div>
          ))}
          <Link to="/shop" className="inline-flex items-center gap-1 text-sm font-medium text-brown hover:text-orange">
            ← Continue shopping
          </Link>
        </div>

        <aside className="h-fit rounded-xl2 bg-white p-6 shadow-card lg:sticky lg:top-24">
          <h2 className="mb-4 font-display text-lg text-ink">Order summary</h2>
          <div className="space-y-2.5 text-sm text-graphite">
            <div className="flex justify-between"><span>Subtotal</span><span className="text-ink">${subtotal.toFixed(2)}</span></div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span className="text-ink">{shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}</span>
            </div>
            <div className="flex justify-between"><span>Estimated tax</span><span className="text-ink">${tax.toFixed(2)}</span></div>
          </div>
          {shipping > 0 && (
            <p className="mt-3 rounded-lg bg-cream px-3 py-2 text-xs text-brown">
              Add ${(FREE_SHIPPING_THRESHOLD - subtotal).toFixed(2)} more for free shipping.
            </p>
          )}
          <div className="mt-4 flex justify-between border-t border-black/5 pt-4 text-base font-semibold text-ink">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>

          {!isAuthenticated ? (
            <div className="mt-6 space-y-2">
              <Link to="/login?redirect=/checkout">
                <Button size="lg" className="w-full flex items-center justify-center gap-2">
                  <Lock size={16} /> Sign in to checkout
                </Button>
              </Link>
              <p className="text-center text-[11px] text-graphite">
                You must have an account to place an order.
              </p>
            </div>
          ) : (
            <div className="mt-6 space-y-2">
              <Link to="/checkout">
                <Button size="lg" className="w-full">
                  Proceed to checkout <ArrowRight size={16} />
                </Button>
              </Link>
              <p className="flex items-center justify-center gap-1 text-center text-[11px] text-graphite">
                <UserCheck size={13} className="text-brown" /> Checking out as {user?.email}
              </p>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
