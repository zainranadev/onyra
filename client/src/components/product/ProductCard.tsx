import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, ShoppingBag } from "lucide-react";
import { Product } from "@/types";
import { Rating } from "../common/Rating";
import { Badge } from "../common/Badge";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";

export function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const { addItem } = useCart();
  const { isWishlisted, toggle } = useWishlist();
  const wishlisted = isWishlisted(product._id);

  const outOfStock = product.stock <= 0;
  const lowStock = !outOfStock && product.stock <= 5;
  const discounted = product.compareAtPrice && product.compareAtPrice > product.price;
  const discountPct = discounted
    ? Math.round((1 - product.price / (product.compareAtPrice as number)) * 100)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4, delay: Math.min(index, 6) * 0.04 }}
      className="group relative flex flex-col overflow-hidden rounded-xl2 bg-white shadow-card transition-shadow duration-300 hover:shadow-lift"
    >
      <Link to={`/products/${product.slug}`} className="relative block aspect-square overflow-hidden bg-mist">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.06]"
        />
        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          {discounted && <Badge tone="orange">-{discountPct}%</Badge>}
          {lowStock && <Badge tone="red">Only {product.stock} left</Badge>}
          {outOfStock && <Badge tone="gray">Out of stock</Badge>}
        </div>
        <button
          onClick={(e) => {
            e.preventDefault();
            toggle(product);
          }}
          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
          aria-pressed={wishlisted}
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-ink shadow-sm backdrop-blur transition-transform hover:scale-110"
        >
          <Heart size={16} className={wishlisted ? "fill-purple text-purple" : ""} />
        </button>
      </Link>

      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-brown">{product.category}</span>
        <Link to={`/products/${product.slug}`} className="font-display text-[15px] leading-snug text-ink hover:text-brown">
          {product.name}
        </Link>
        <Rating value={product.rating} count={product.reviewCount} />

        <div className="mt-1 flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="font-semibold text-ink">${product.price.toFixed(2)}</span>
            {discounted && (
              <span className="text-xs text-graphite line-through">${product.compareAtPrice!.toFixed(2)}</span>
            )}
          </div>
          <button
            onClick={() => addItem(product, 1)}
            disabled={outOfStock}
            aria-label={`Add ${product.name} to cart`}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-ink text-white transition-transform hover:scale-105 hover:bg-orange disabled:cursor-not-allowed disabled:bg-black/10 disabled:hover:scale-100"
          >
            <ShoppingBag size={15} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
