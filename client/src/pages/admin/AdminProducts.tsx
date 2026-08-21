import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Search, PackageX } from "lucide-react";
import { productService, categoryService } from "@/services/productService";
import { Product, Category } from "@/types";
import { Button } from "@/components/common/Button";
import { Badge } from "@/components/common/Badge";
import { TableRowSkeleton } from "@/components/common/Skeleton";
import { ErrorState } from "@/components/common/ErrorState";
import { EmptyState } from "@/components/common/EmptyState";
import { useToast } from "@/context/ToastContext";
import { toApiError } from "@/services/api";
import { ProductFormModal } from "./ProductFormModal";

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[] | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Product | null | "new">(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const { showToast } = useToast();

  const load = () => {
    setError(null);
    setProducts(null);
    productService
      .list({ search: search || undefined, limit: 48, sort: "newest" })
      .then((r) => setProducts(r.items))
      .catch((err) => setError(toApiError(err).message));
  };

  useEffect(() => {
    load();
  }, [search]);
  useEffect(() => {
    categoryService.list().then(setCategories).catch(() => { });
  }, []);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await productService.remove(deleteTarget._id);
      showToast("Product deleted successfully", "success");
      setDeleteTarget(null);
      load();
    } catch (err) {
      showToast(toApiError(err).message, "error");
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl text-ink">Products</h1>
          <p className="text-sm text-graphite">Manage catalog, pricing, and stock.</p>
        </div>
        <Button onClick={() => setEditing("new")}>
          <Plus size={16} /> Add product
        </Button>
      </div>

      <div className="mb-4 flex items-center gap-2 rounded-lg border border-black/10 bg-white px-3.5 py-2.5">
        <Search size={16} className="text-graphite" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products..."
          className="w-full bg-transparent text-sm outline-none"
        />
      </div>

      <div className="overflow-x-auto rounded-xl2 bg-white shadow-card">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-black/5 text-xs uppercase tracking-wide text-graphite">
              <th className="px-4 py-3 font-medium">Product</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">Price</th>
              <th className="px-4 py-3 font-medium">Stock</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Featured</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {!products && !error && Array.from({ length: 6 }).map((_, i) => <TableRowSkeleton key={i} cols={7} />)}
            {products &&
              products.map((p) => (
                <tr key={p._id} className="border-b border-black/5 last:border-none hover:bg-black/[0.02]">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img src={p.image} alt={p.name} className="h-10 w-10 rounded-lg object-cover" />
                      <span className="font-medium text-ink">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 capitalize text-graphite">{p.category}</td>
                  <td className="px-4 py-3 text-ink">${p.price.toFixed(2)}</td>
                  <td className="px-4 py-3 text-graphite">{p.stock}</td>
                  <td className="px-4 py-3">
                    {p.stock === 0 ? <Badge tone="gray">Out of stock</Badge> : p.stock <= 5 ? <Badge tone="red">Low stock</Badge> : <Badge tone="orange">In stock</Badge>}
                  </td>
                  <td className="px-4 py-3">{p.featured ? <Badge tone="purple">Featured</Badge> : <span className="text-graphite">—</span>}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => setEditing(p)} aria-label={`Edit ${p.name}`} className="rounded-lg p-2 text-graphite hover:bg-black/5 hover:text-ink">
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => setDeleteTarget(p)} aria-label={`Delete ${p.name}`} className="rounded-lg p-2 text-graphite hover:bg-red-50 hover:text-red-500">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {error && <ErrorState message={error} onRetry={load} />}
      {!error && products && products.length === 0 && (
        <EmptyState icon={<PackageX size={22} />} title="No products found" description="Try a different search, or add your first product." actionLabel="Add product" onAction={() => setEditing("new")} />
      )}

      {editing && (
        <ProductFormModal
          product={editing === "new" ? null : editing}
          categories={categories}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            load();
          }}
        />
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-4" onClick={() => setDeleteTarget(null)}>
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-sm rounded-xl2 bg-white p-6 shadow-lift">
            <h3 className="font-display text-lg text-ink">Delete "{deleteTarget.name}"?</h3>
            <p className="mt-2 text-sm text-graphite">This action can't be undone.</p>
            <div className="mt-6 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
              <Button variant="primary" className="bg-red-500 hover:bg-red-600" onClick={handleDelete}>Delete</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
