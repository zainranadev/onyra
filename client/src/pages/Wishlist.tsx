import { Heart } from "lucide-react";
import { useWishlist } from "@/context/WishlistContext";
import { ProductGrid } from "@/components/product/ProductGrid";
import { EmptyState } from "@/components/common/EmptyState";

export default function Wishlist() {
  const { items } = useWishlist();

  return (
    <div className="container-page py-10">
      <h1 className="mb-8 font-display text-3xl text-ink">Your wishlist</h1>
      {items.length === 0 ? (
        <EmptyState
          icon={<Heart size={22} />}
          title="Your wishlist is empty"
          description="Tap the heart on any product to save it here for later."
          actionLabel="Browse products"
          actionTo="/shop"
        />
      ) : (
        <ProductGrid products={items} />
      )}
    </div>
  );
}
