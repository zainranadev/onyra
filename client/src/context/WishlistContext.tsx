import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Product } from "@/types";
import { useToast } from "./ToastContext";

const STORAGE_KEY = "onyra:wishlist";

interface WishlistContextValue {
  items: Product[];
  isWishlisted: (productId: string) => boolean;
  toggle: (product: Product) => void;
}

const WishlistContext = createContext<WishlistContextValue | null>(null);

function loadWishlist(): Product[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Product[]) : [];
  } catch {
    return [];
  }
}

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Product[]>(loadWishlist);
  const { showToast } = useToast();

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const isWishlisted = (productId: string) => items.some((p) => p._id === productId);

  const toggle = (product: Product) => {
    setItems((prev) => {
      const exists = prev.some((p) => p._id === product._id);
      if (exists) {
        showToast(`Removed ${product.name} from wishlist`, "wishlist");
        return prev.filter((p) => p._id !== product._id);
      }
      showToast(`Added ${product.name} to wishlist`, "wishlist");
      return [...prev, product];
    });
  };

  return <WishlistContext.Provider value={{ items, isWishlisted, toggle }}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within a WishlistProvider");
  return ctx;
}
