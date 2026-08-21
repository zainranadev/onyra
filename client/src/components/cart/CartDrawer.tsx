import { AnimatePresence, motion } from "framer-motion";
import { Link } from "react-router-dom";
import { X, ShoppingBag, Trash2, Lock } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { QuantitySelector } from "../common/QuantitySelector";
import { Button } from "../common/Button";
import { EmptyState } from "../common/EmptyState";

export function CartDrawer() {
  const { items, isDrawerOpen, closeDrawer, removeItem, updateQuantity, subtotal } = useCart();
  const { isAuthenticated } = useAuth();

  return (
    <AnimatePresence>
      {isDrawerOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeDrawer}
            className="fixed inset-0 z-[60] bg-violet-950/30 backdrop-blur-sm"
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 34 }}
            className="fixed right-0 top-0 z-[70] flex h-full w-full max-w-md flex-col border-l border-violet-100 bg-white/90 backdrop-blur-xl shadow-[0_0_60px_-10px_rgba(139,92,246,0.4)]"
            role="dialog"
            aria-label="Shopping cart"
          >
            <div className="flex items-center justify-between border-b border-violet-100 px-5 py-4">
              <h2 className="font-display text-lg text-ink">
                Your cart <span className="text-violet-500">({items.length})</span>
              </h2>
              <button
                onClick={closeDrawer}
                aria-label="Close cart"
                className="rounded-full p-2 text-graphite transition-colors hover:bg-violet-500/10 hover:text-violet-600"
              >
                <X size={20} />
              </button>
            </div>

            {items.length === 0 ? (
              <div className="flex flex-1 items-center justify-center p-6">
                <EmptyState
                  icon={<ShoppingBag size={22} />}
                  title="Your cart is empty"
                  description="Items you add will show up here, ready when you are."
                  actionLabel="Start shopping"
                  actionTo="/shop"
                />
              </div>
            ) : (
              <>
                <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
                  {items.map((item) => (
                    <div
                      key={item.product._id}
                      className="flex gap-3 rounded-xl2 border border-transparent p-2 transition-colors hover:border-violet-100 hover:bg-violet-50/40"
                    >
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="h-20 w-20 rounded-lg object-cover ring-1 ring-black/5"
                      />
                      <div className="flex flex-1 flex-col">
                        <div className="flex items-start justify-between gap-2">
                          <Link
                            to={`/products/${item.product.slug}`}
                            onClick={closeDrawer}
                            className="text-sm font-medium text-ink hover:text-violet-600 transition-colors"
                          >
                            {item.product.name}
                          </Link>
                          <button
                            onClick={() => removeItem(item.product._id)}
                            aria-label={`Remove ${item.product.name}`}
                            className="text-graphite/60 transition-colors hover:text-red-500"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                        <span className="text-xs text-graphite">${item.product.price.toFixed(2)} each</span>
                        <div className="mt-2 flex items-center justify-between">
                          <QuantitySelector
                            size="sm"
                            value={item.quantity}
                            max={item.product.stock}
                            onChange={(q) => updateQuantity(item.product._id, q)}
                          />
                          <span className="text-sm font-semibold text-ink">
                            ${(item.product.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-violet-100 bg-gradient-to-b from-violet-50/40 to-transparent p-5">
                  <div className="mb-4 flex items-center justify-between text-sm font-medium text-graphite">
                    <span>Subtotal</span>
                    <span className="text-base font-semibold text-ink">${subtotal.toFixed(2)}</span>
                  </div>

                  {!isAuthenticated ? (
                    <Link to="/login?redirect=/checkout" onClick={closeDrawer}>
                      <Button
                        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-violet-500 to-fuchsia-500 shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40"
                        size="lg"
                      >
                        <Lock size={16} /> Sign in to checkout
                      </Button>
                    </Link>
                  ) : (
                    <Link to="/checkout" onClick={closeDrawer}>
                      <Button
                        className="w-full bg-gradient-to-r from-violet-500 to-fuchsia-500 shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40"
                        size="lg"
                      >
                        Proceed to checkout
                      </Button>
                    </Link>
                  )}

                  <Link
                    to="/cart"
                    onClick={closeDrawer}
                    className="mt-3 block text-center text-sm font-medium text-graphite transition-colors hover:text-violet-600"
                  >
                    View full cart
                  </Link>
                </div>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}