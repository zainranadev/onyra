import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Heart, ShoppingBag, ChevronRight, Truck, RotateCcw, Star } from "lucide-react";
import { productService } from "@/services/productService";
import { Product, Review } from "@/types";
import { Rating } from "@/components/common/Rating";
import { Badge } from "@/components/common/Badge";
import { QuantitySelector } from "@/components/common/QuantitySelector";
import { Button } from "@/components/common/Button";
import { ErrorState } from "@/components/common/ErrorState";
import { ProductGrid } from "@/components/product/ProductGrid";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { toApiError } from "@/services/api";

export default function ProductDetail() {
  const { slug = "" } = useParams();
  const [data, setData] = useState<{ product: Product; reviews: Review[]; related: Product[] } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeImage, setActiveImage] = useState(0);
  const [qty, setQty] = useState(1);
  const { addItem } = useCart();
  const { isWishlisted, toggle } = useWishlist();
  const { isAuthenticated, user } = useAuth();
  const { showToast } = useToast();

  // Review form state
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewHover, setReviewHover] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  const load = () => {
    setError(null);
    setData(null);
    setActiveImage(0);
    setQty(1);
    setReviewSubmitted(false);
    setReviewText("");
    setReviewRating(5);
    productService
      .getBySlug(slug)
      .then(setData)
      .catch((err) => setError(toApiError(err).message));
  };

  useEffect(() => {
    load();
  }, [slug]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (reviewText.trim().length < 10) {
      showToast("Review must be at least 10 characters.", "error");
      return;
    }
    setReviewSubmitting(true);
    try {
      const newReview = await productService.submitReview(slug, { rating: reviewRating, text: reviewText.trim() });
      // Optimistically prepend the new review
      setData((prev) => {
        if (!prev) return prev;
        return { ...prev, reviews: [newReview, ...prev.reviews] };
      });
      setReviewSubmitted(true);
      setReviewText("");
      showToast("Your review has been submitted!", "success");
    } catch (err) {
      const apiErr = toApiError(err);
      showToast(apiErr.message, "error");
    } finally {
      setReviewSubmitting(false);
    }
  };

  if (error) {
    return (
      <div className="container-page py-16">
        <ErrorState
          title="Product not found"
          message="The product you're looking for may have been removed or is no longer available."
        />
        <div className="mt-6 text-center">
          <Link to="/shop"><Button variant="outline">Back to shop</Button></Link>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="container-page grid grid-cols-1 gap-10 py-10 md:grid-cols-2">
        <div className="skeleton aspect-square rounded-xl2" />
        <div className="space-y-4">
          <div className="skeleton h-4 w-24 rounded" />
          <div className="skeleton h-8 w-3/4 rounded" />
          <div className="skeleton h-6 w-32 rounded" />
          <div className="skeleton h-24 w-full rounded" />
        </div>
      </div>
    );
  }

  const { product, reviews, related } = data;
  const images = product.images.length ? product.images : [product.image];
  const outOfStock = product.stock <= 0;
  const lowStock = !outOfStock && product.stock <= 5;
  const discounted = product.compareAtPrice && product.compareAtPrice > product.price;
  const wishlisted = isWishlisted(product._id);
  const avgFromReviews = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : product.rating;

  const ratingBuckets = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => Math.round(r.rating) === star).length,
  }));

  // Check if the logged-in user already left a review
  const alreadyReviewed = isAuthenticated && reviews.some((r) => r.userName === user?.name);

  return (
    <div className="container-page py-8">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-1.5 text-xs text-graphite">
        <Link to="/" className="hover:text-ink">Home</Link>
        <ChevronRight size={12} />
        <Link to="/shop" className="hover:text-ink">Shop</Link>
        <ChevronRight size={12} />
        <Link to={`/shop?category=${product.category}`} className="capitalize hover:text-ink">{product.category}</Link>
        <ChevronRight size={12} />
        <span className="text-ink">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
        {/* Gallery */}
        <div>
          <div className="aspect-square overflow-hidden rounded-xl2 bg-mist">
            <img src={images[activeImage]} alt={product.name} className="h-full w-full object-cover" />
          </div>
          {images.length > 1 && (
            <div className="mt-3 flex gap-2">
              {images.map((img, i) => (
                <button
                  key={img}
                  onClick={() => setActiveImage(i)}
                  className={`h-16 w-16 overflow-hidden rounded-lg border-2 ${activeImage === i ? "border-orange" : "border-transparent"}`}
                >
                  <img src={img} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info + sticky purchase panel */}
        <div className="md:sticky md:top-24 md:self-start">
          <span className="text-xs font-semibold uppercase tracking-wide text-brown">{product.category}</span>
          <h1 className="mt-1 font-display text-3xl text-ink">{product.name}</h1>
          <div className="mt-2 flex items-center gap-2">
            <Rating value={avgFromReviews} count={reviews.length || product.reviewCount} />
          </div>

          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-2xl font-semibold text-ink">${product.price.toFixed(2)}</span>
            {discounted && <span className="text-graphite line-through">${product.compareAtPrice!.toFixed(2)}</span>}
            {discounted && <Badge tone="orange">Save ${(product.compareAtPrice! - product.price).toFixed(2)}</Badge>}
          </div>

          <p className="mt-4 text-graphite">{product.shortDescription}</p>

          <div className="mt-4">
            {outOfStock && <Badge tone="gray">Out of stock</Badge>}
            {lowStock && <Badge tone="red">Only {product.stock} left</Badge>}
            {!outOfStock && !lowStock && <Badge tone="orange">In stock</Badge>}
          </div>

          <div className="mt-6 flex items-center gap-4">
            <QuantitySelector value={qty} max={Math.max(product.stock, 1)} onChange={setQty} />
            <Button size="lg" className="flex-1" disabled={outOfStock} onClick={() => addItem(product, qty)}>
              <ShoppingBag size={16} /> {outOfStock ? "Out of stock" : "Add to cart"}
            </Button>
            <button
              onClick={() => toggle(product)}
              aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-black/10 text-ink hover:border-purple"
            >
              <Heart size={18} className={wishlisted ? "fill-purple text-purple" : ""} />
            </button>
          </div>

          <div className="mt-6 space-y-3 rounded-xl2 border border-black/5 bg-white p-4">
            <div className="flex items-center gap-3 text-sm text-graphite">
              <Truck size={16} className="text-brown" /> Free shipping on orders over $100
            </div>
            <div className="flex items-center gap-3 text-sm text-graphite">
              <RotateCcw size={16} className="text-brown" /> 30-day returns, no questions asked
            </div>
          </div>

          <div className="mt-8 border-t border-black/5 pt-6">
            <h2 className="mb-2 font-display text-lg text-ink">Product details</h2>
            <p className="text-sm leading-relaxed text-graphite">{product.description}</p>
            {product.tags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-1.5">
                {product.tags.map((t) => (
                  <Badge key={t}>{t}</Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reviews */}
      <section className="mt-16 border-t border-black/5 pt-10">
        <h2 className="mb-6 font-display text-2xl text-ink">Reviews</h2>
        <div className="grid grid-cols-1 gap-10 md:grid-cols-[280px_1fr]">
          {/* Rating summary */}
          <div>
            <div className="flex items-baseline gap-2">
              <span className="font-display text-4xl">{avgFromReviews.toFixed(1)}</span>
              <Rating value={avgFromReviews} />
            </div>
            <p className="mt-1 text-sm text-graphite">Based on {reviews.length || product.reviewCount} reviews</p>
            <div className="mt-4 space-y-1.5">
              {ratingBuckets.map((b) => (
                <div key={b.star} className="flex items-center gap-2 text-xs text-graphite">
                  <span className="w-3">{b.star}</span>
                  <Star size={11} className="fill-orange text-orange" />
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-black/5">
                    <div
                      className="h-full bg-orange transition-all duration-500"
                      style={{ width: reviews.length ? `${(b.count / reviews.length) * 100}%` : "0%" }}
                    />
                  </div>
                  <span className="w-4 text-right">{b.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Review list + write-review form */}
          <div className="space-y-8">
            {/* ── Write a Review Form ── */}
            {isAuthenticated && !alreadyReviewed && !reviewSubmitted && (
              <form
                id="write-review-form"
                onSubmit={handleSubmitReview}
                className="rounded-xl2 border border-black/8 bg-white p-5 shadow-sm"
              >
                <h3 className="mb-4 font-display text-base text-ink">Write a Review</h3>

                {/* Star picker */}
                <div className="mb-4">
                  <p className="mb-2 text-xs font-medium text-graphite">Your Rating</p>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        id={`review-star-${star}`}
                        onClick={() => setReviewRating(star)}
                        onMouseEnter={() => setReviewHover(star)}
                        onMouseLeave={() => setReviewHover(0)}
                        className="p-0.5 transition-transform hover:scale-110 focus:outline-none"
                        aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
                      >
                        <Star
                          size={24}
                          className={
                            star <= (reviewHover || reviewRating)
                              ? "fill-orange text-orange"
                              : "fill-none text-black/20"
                          }
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Review text */}
                <div className="mb-4">
                  <label htmlFor="review-text" className="mb-1.5 block text-xs font-medium text-graphite">
                    Your Review
                  </label>
                  <textarea
                    id="review-text"
                    rows={4}
                    maxLength={2000}
                    required
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    placeholder="Share your thoughts about this product…"
                    className="w-full resize-none rounded-lg border border-black/10 bg-mist/50 px-3 py-2.5 text-sm text-ink placeholder:text-graphite/60 focus:border-orange focus:outline-none focus:ring-2 focus:ring-orange/20 transition-colors"
                  />
                  <p className="mt-1 text-right text-xs text-graphite">{reviewText.length}/2000</p>
                </div>

                <Button
                  type="submit"
                  id="submit-review-btn"
                  disabled={reviewSubmitting || reviewText.trim().length < 10}
                  size="sm"
                >
                  {reviewSubmitting ? "Submitting…" : "Submit Review"}
                </Button>
              </form>
            )}

            {/* Already reviewed notice */}
            {isAuthenticated && (alreadyReviewed || reviewSubmitted) && (
              <div className="rounded-xl2 border border-orange/20 bg-orange/5 px-4 py-3 text-sm text-brown">
                ✓ You've already reviewed this product. Thank you!
              </div>
            )}

            {/* Guest prompt */}
            {!isAuthenticated && (
              <div className="rounded-xl2 border border-black/8 bg-white px-5 py-4 text-sm text-graphite">
                <Link to="/login" className="font-medium text-orange hover:underline">Sign in</Link>
                {" "}to write a review for this product.
              </div>
            )}

            {/* Review list */}
            <div className="space-y-6">
              {reviews.length === 0 ? (
                <p className="text-sm text-graphite">No reviews yet — be the first to try this one.</p>
              ) : (
                reviews.map((r) => (
                  <div key={r._id} className="border-b border-black/5 pb-6 last:border-none">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-cream font-display text-sm text-brown">
                        {r.userName.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-ink">{r.userName}</p>
                        <p className="text-xs text-graphite">{new Date(r.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="ml-auto">
                        <Rating value={r.rating} size={12} />
                      </div>
                    </div>
                    <p className="mt-3 text-sm text-graphite">{r.text}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Related products */}
      {related.length > 0 && (
        <section className="mt-16 border-t border-black/5 pt-10">
          <h2 className="mb-6 font-display text-2xl text-ink">You might also like</h2>
          <ProductGrid products={related} />
        </section>
      )}
    </div>
  );
}

