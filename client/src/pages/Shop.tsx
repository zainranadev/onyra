import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { SlidersHorizontal, X, PackageSearch, Search } from "lucide-react";
import { productService, categoryService } from "@/services/productService";
import { Category, PaginatedProducts } from "@/types";
import { ProductGrid } from "@/components/product/ProductGrid";
import { CategoryList, SortSelect } from "@/components/product/FilterPanel";
import { ProductGridSkeleton } from "@/components/common/Skeleton";
import { ErrorState } from "@/components/common/ErrorState";
import { EmptyState } from "@/components/common/EmptyState";
import { Pagination } from "@/components/common/Pagination";
import { toApiError } from "@/services/api";

export default function Shop() {
  const [params, setParams] = useSearchParams();
  const search = params.get("search") || "";
  const category = params.get("category") || "all";
  const sort = params.get("sort") || "featured";
  const page = parseInt(params.get("page") || "1", 10);

  const [categories, setCategories] = useState<Category[]>([]);
  const [result, setResult] = useState<PaginatedProducts | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  useEffect(() => {
    categoryService.list().then(setCategories).catch(() => {});
  }, []);

  const fetchProducts = () => {
    setError(null);
    setResult(null);
    productService
      .list({ search: search || undefined, category, sort, page, limit: 12 })
      .then(setResult)
      .catch((err) => setError(toApiError(err).message));
  };

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, category, sort, page]);

  const updateParam = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value && value !== "all") next.set(key, value);
    else next.delete(key);
    if (key !== "page") next.delete("page");
    setParams(next);
  };

  const heading = useMemo(() => {
    if (search) return `Results for "${search}"`;
    if (category !== "all") return categories.find((c) => c.slug === category)?.name || "Shop";
    return "All products";
  }, [search, category, categories]);

  const activeCategoryName = category !== "all" ? categories.find((c) => c.slug === category)?.name : null;
  const hasActiveFilters = Boolean(search || activeCategoryName);

  return (
    <div className="container-page py-10">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="mb-8"
      >
        {search && (
          <span className="mb-2 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-violet-500">
            <Search size={12} /> Search
          </span>
        )}
        <h1 className="font-display text-3xl text-ink">{heading}</h1>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          {result && (
            <p className="text-sm text-graphite">
              {result.pagination.total} {result.pagination.total === 1 ? "product" : "products"}
            </p>
          )}
          {hasActiveFilters && (
            <>
              {result && <span className="text-graphite/40">·</span>}
              {activeCategoryName && (
                <button
                  onClick={() => updateParam("category", "all")}
                  className="inline-flex items-center gap-1 rounded-full bg-violet-500/10 px-2.5 py-1 text-xs font-medium text-violet-600 hover:bg-violet-500/20 transition-colors"
                >
                  {activeCategoryName} <X size={11} />
                </button>
              )}
              {search && (
                <button
                  onClick={() => setParams({})}
                  className="inline-flex items-center gap-1 rounded-full bg-violet-500/10 px-2.5 py-1 text-xs font-medium text-violet-600 hover:bg-violet-500/20 transition-colors"
                >
                  "{search}" <X size={11} />
                </button>
              )}
            </>
          )}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[220px_1fr]">
        {/* Desktop sidebar */}
        <aside className="hidden lg:block">
          <div className="sticky top-24 rounded-xl2 border border-violet-100 bg-white/60 p-5 shadow-card backdrop-blur-sm">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-graphite">Categories</h3>
            <CategoryList categories={categories} activeCategory={category} onCategoryChange={(c) => updateParam("category", c)} />
          </div>
        </aside>

        <div>
          <div className="mb-6 flex items-center justify-between gap-3">
            <button
              onClick={() => setMobileFilterOpen(true)}
              className="flex items-center gap-2 rounded-lg border border-violet-200 bg-white px-3.5 py-2 text-sm font-medium text-violet-700 transition-colors hover:bg-violet-50 lg:hidden"
            >
              <SlidersHorizontal size={15} /> Filters
              {hasActiveFilters && <span className="h-1.5 w-1.5 rounded-full bg-fuchsia-500" />}
            </button>
            <div className="ml-auto">
              <SortSelect sort={sort} onSortChange={(s) => updateParam("sort", s)} />
            </div>
          </div>

          {error && <ErrorState message={error} onRetry={fetchProducts} />}

          {!error && !result && <ProductGridSkeleton />}

          {!error && result && result.items.length === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
              <EmptyState
                icon={<PackageSearch size={22} />}
                title="No products found"
                description={search ? `Nothing matches "${search}". Try a different search term.` : "Try a different category or clear your filters."}
                actionLabel="Clear filters"
                onAction={() => setParams({})}
              />
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            {!error && result && result.items.length > 0 && (
              <motion.div
                key={`${category}-${sort}-${page}-${search}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
              >
                <ProductGrid products={result.items} />
                <Pagination page={result.pagination.page} totalPages={result.pagination.totalPages} onChange={(p) => updateParam("page", String(p))} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Mobile filter drawer */}
      <AnimatePresence>
        {mobileFilterOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-violet-950/30 backdrop-blur-sm lg:hidden"
            onClick={() => setMobileFilterOpen(false)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="absolute bottom-0 left-0 right-0 max-h-[75vh] overflow-y-auto rounded-t-2xl border-t border-violet-100 bg-white p-6 shadow-[0_-20px_50px_-15px_rgba(139,92,246,0.35)]"
            >
              <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-violet-100" />
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-display text-lg text-ink">Filters</h3>
                <button
                  onClick={() => setMobileFilterOpen(false)}
                  aria-label="Close filters"
                  className="rounded-full p-1.5 text-graphite hover:bg-violet-50 hover:text-violet-600"
                >
                  <X size={20} />
                </button>
              </div>
              <CategoryList
                categories={categories}
                activeCategory={category}
                onCategoryChange={(c) => {
                  updateParam("category", c);
                  setMobileFilterOpen(false);
                }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}