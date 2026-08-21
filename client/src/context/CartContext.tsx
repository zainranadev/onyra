import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import { CartItem, Product } from "@/types";
import { useToast } from "./ToastContext";

const STORAGE_KEY = "onyra:cart";

interface CartContextValue {
  items: CartItem[];
  isDrawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  subtotal: number;
  itemCount: number;
}

const CartContext = createContext<CartContextValue | null>(null);

function loadCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(loadCart);
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  // Cart business rules live here: never exceed stock, never drop below 1,
  // out-of-stock items can't be added at all.
  const addItem = (product: Product, quantity = 1) => {
    if (product.stock <= 0) {
      showToast(`${product.name} is out of stock.`, "error");
      return;
    }
    setItems((prev) => {
      const existing = prev.find((i) => i.product._id === product._id);
      if (existing) {
        const nextQty = Math.min(existing.quantity + quantity, product.stock);
        if (nextQty === existing.quantity) {
          showToast(`Only ${product.stock} of ${product.name} available.`, "error");
          return prev;
        }
        return prev.map((i) => (i.product._id === product._id ? { ...i, quantity: nextQty } : i));
      }
      return [...prev, { product, quantity: Math.min(quantity, product.stock) }];
    });
    showToast(`Added ${product.name} to cart`, "success");
    setDrawerOpen(true);
  };

  const removeItem = (productId: string) => {
    setItems((prev) => prev.filter((i) => i.product._id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    setItems((prev) =>
      prev.map((i) =>
        i.product._id === productId
          ? { ...i, quantity: Math.max(1, Math.min(quantity, i.product.stock)) }
          : i
      )
    );
  };

  const clearCart = () => setItems([]);

  const subtotal = useMemo(
    () => items.reduce((sum, i) => sum + i.product.price * i.quantity, 0),
    [items]
  );
  const itemCount = useMemo(() => items.reduce((sum, i) => sum + i.quantity, 0), [items]);

  return (
    <CartContext.Provider
      value={{
        items,
        isDrawerOpen,
        openDrawer: () => setDrawerOpen(true),
        closeDrawer: () => setDrawerOpen(false),
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        subtotal,
        itemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
