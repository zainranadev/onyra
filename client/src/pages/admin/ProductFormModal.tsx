import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, ImageOff, Sparkles, DollarSign, Hash, Tag, AlignLeft, Layers, AlertCircle } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Product, Category } from "@/types";
import { productService } from "@/services/productService";
import { Button } from "@/components/common/Button";
import { useToast } from "@/context/ToastContext";
import { toApiError } from "@/services/api";

// ─── Validation schema ────────────────────────────────────────────────────────

const formSchema = z.object({
  name: z.string().min(2, "Name is required"),
  category: z.string().min(1, "Choose a category"),
  price: z.coerce.number().min(0, "Price must be 0 or more"),
  compareAtPrice: z.coerce.number().min(0).optional(),
  stock: z.coerce.number().int().min(0, "Stock must be 0 or more"),
  image: z.string().url("Enter a valid image URL"),
  shortDescription: z.string().min(5, "Short description is required").max(200),
  description: z.string().min(10, "Description is required"),
  tags: z.string().optional(),
  featured: z.boolean().optional(),
});
type FormValues = z.infer<typeof formSchema>;

// ─── Component ────────────────────────────────────────────────────────────────

export function ProductFormModal({
  product,
  categories,
  onClose,
  onSaved,
}: {
  product: Product | null;
  categories: Category[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const { showToast } = useToast();
  const [serverError, setServerError] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: product
      ? {
          name: product.name,
          category: product.category,
          price: product.price,
          compareAtPrice: product.compareAtPrice,
          stock: product.stock,
          image: product.image,
          shortDescription: product.shortDescription,
          description: product.description,
          tags: product.tags.join(", "),
          featured: product.featured,
        }
      : { featured: false },
  });

  const imageUrl = watch("image");
  const shortDescription = watch("shortDescription") || "";
  const tagsInput = watch("tags") || "";
  const tagChips = tagsInput.split(",").map((t) => t.trim()).filter(Boolean);

  useEffect(() => { setImageError(false); }, [imageUrl]);

  const onSubmit = async (values: FormValues) => {
    setServerError(null);
    const payload = {
      ...values,
      images: [values.image],
      tags: values.tags ? values.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
    };
    try {
      if (product) {
        await productService.update(product._id, payload);
        showToast("Product updated successfully", "success");
      } else {
        await productService.create(payload);
        showToast("Product created successfully", "success");
      }
      onSaved();
    } catch (err) {
      setServerError(toApiError(err).message);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "radial-gradient(ellipse at 50% 40%, rgba(139,92,246,0.18) 0%, rgba(0,0,0,0.55) 100%)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 28, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.97 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        onClick={(e) => e.stopPropagation()}
        className="relative flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-white/20 bg-white shadow-[0_40px_100px_-20px_rgba(109,40,217,0.45)]"
      >
        {/* Decorative gradient orbs — behind everything */}
        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-violet-400/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-12 -left-12 h-40 w-40 rounded-full bg-fuchsia-400/20 blur-3xl" />

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="relative flex items-center justify-between border-b border-violet-100/80 bg-gradient-to-r from-violet-600 via-violet-500 to-fuchsia-500 px-6 py-5">
          {/* Dot grid overlay */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.12]"
            style={{
              backgroundImage: "radial-gradient(white 1px, transparent 1px)",
              backgroundSize: "18px 18px",
            }}
          />
          <div className="relative flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
              <Layers size={18} className="text-white" />
            </div>
            <div>
              <h2 className="font-display text-lg text-white">
                {product ? "Edit Product" : "New Product"}
              </h2>
              <p className="text-xs text-white/70">
                {product ? "Update the details below to apply changes." : "Fill in all fields to publish a new listing."}
              </p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.08, rotate: 90 }}
            whileTap={{ scale: 0.92 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
            onClick={onClose}
            aria-label="Close"
            className="relative rounded-xl bg-white/15 p-2 text-white backdrop-blur-sm hover:bg-white/25"
          >
            <X size={18} />
          </motion.button>
        </div>

        {/* ── Scrollable body ─────────────────────────────────────────────── */}
        <form
          id="product-form"
          onSubmit={handleSubmit(onSubmit)}
          className="modal-scroll flex-1 space-y-6 overflow-y-auto bg-gradient-to-b from-violet-50/40 to-white px-6 py-6"
        >
          {/* Image preview + URL row */}
          <div className="flex gap-4">
            {/* Live image preview */}
            <motion.div
              layout
              className="relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-violet-200 bg-violet-50"
            >
              <AnimatePresence mode="wait">
                {imageUrl && !imageError ? (
                  <motion.img
                    key="img"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    src={imageUrl}
                    alt="Preview"
                    className="h-full w-full object-cover"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <motion.div
                    key="placeholder"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center gap-1"
                  >
                    <ImageOff size={20} className="text-violet-300" />
                    <span className="text-[10px] text-violet-300">Preview</span>
                  </motion.div>
                )}
              </AnimatePresence>
              {/* Shimmer border when URL is present */}
              {imageUrl && !imageError && (
                <div className="pointer-events-none absolute inset-0 rounded-2xl ring-2 ring-violet-400/40" />
              )}
            </motion.div>

            <div className="flex-1">
              <Field label="Image URL" icon={<AlignLeft size={13} />} error={errors.image?.message}>
                <input {...register("image")} className="modal-input" placeholder="https://images.example.com/product.jpg" />
              </Field>
            </div>
          </div>

          {/* ── Section: Basics ── */}
          <SectionDivider icon={<Tag size={12} />} label="Basics" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Product name" error={errors.name?.message} full>
              <input {...register("name")} className="modal-input" placeholder="Nova Wireless Headphones" />
            </Field>
            <Field label="Category" error={errors.category?.message}>
              <select {...register("category")} className="modal-input cursor-pointer">
                <option value="">Select category</option>
                {categories.map((c) => (
                  <option key={c.slug} value={c.slug}>{c.name}</option>
                ))}
              </select>
            </Field>
            <div className="sm:col-span-2">
              <Field label="Tags" hint="Comma-separated keywords" icon={<Hash size={13} />}>
                <input {...register("tags")} className="modal-input" placeholder="wireless, portable, noise-cancelling" />
              </Field>
              <AnimatePresence>
                {tagChips.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-2 flex flex-wrap gap-1.5"
                  >
                    {tagChips.map((tag) => (
                      <motion.span
                        key={tag}
                        initial={{ opacity: 0, scale: 0.75 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.75 }}
                        className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10 px-2.5 py-1 text-xs font-medium text-violet-600 ring-1 ring-violet-200"
                      >
                        <span className="h-1 w-1 rounded-full bg-violet-400" />
                        {tag}
                      </motion.span>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* ── Section: Pricing & Inventory ── */}
          <SectionDivider icon={<DollarSign size={12} />} label="Pricing & Inventory" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Field label="Price" error={errors.price?.message}>
              <div className="relative">
                <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-medium text-violet-400">$</span>
                <input type="number" step="0.01" min="0" {...register("price")} className="modal-input pl-7" placeholder="0.00" />
              </div>
            </Field>
            <Field label="Compare-at price" hint="Optional" error={errors.compareAtPrice?.message}>
              <div className="relative">
                <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-medium text-violet-300">$</span>
                <input type="number" step="0.01" min="0" {...register("compareAtPrice")} className="modal-input pl-7" placeholder="0.00" />
              </div>
            </Field>
            <Field label="Stock units" error={errors.stock?.message}>
              <div className="relative">
                <input type="number" min="0" {...register("stock")} className="modal-input pr-10" placeholder="0" />
                <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-graphite/50">qty</span>
              </div>
            </Field>
          </div>

          {/* ── Section: Descriptions ── */}
          <SectionDivider icon={<AlignLeft size={12} />} label="Descriptions" />
          <Field
            label="Short description"
            error={errors.shortDescription?.message}
            hint={`${shortDescription.length}/200 chars`}
          >
            <input
              {...register("shortDescription")}
              className="modal-input"
              placeholder="One-liner that sells the product"
            />
          </Field>
          <Field label="Full description" error={errors.description?.message}>
            <textarea
              rows={4}
              {...register("description")}
              className="modal-input resize-none leading-relaxed"
              placeholder="Materials, dimensions, what makes it worth keeping…"
            />
          </Field>

          {/* ── Featured toggle ── */}
          <Controller
            name="featured"
            control={control}
            render={({ field }) => (
              <motion.button
                type="button"
                onClick={() => field.onChange(!field.value)}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className={`flex w-full items-center justify-between rounded-xl border p-4 text-left transition-all duration-300 ${
                  field.value
                    ? "border-violet-300 bg-gradient-to-r from-violet-50 to-fuchsia-50 shadow-sm shadow-violet-200/50"
                    : "border-black/8 bg-white hover:border-violet-200 hover:bg-violet-50/30"
                }`}
              >
                <span className="flex items-center gap-3">
                  <span className={`flex h-9 w-9 items-center justify-center rounded-xl transition-all duration-300 ${
                    field.value
                      ? "bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white shadow-md shadow-violet-400/30"
                      : "bg-black/5 text-graphite"
                  }`}>
                    <Sparkles size={15} />
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-ink">Feature on homepage</span>
                    <span className="block text-xs text-graphite">Show in the featured products carousel</span>
                  </span>
                </span>
                {/* Toggle pill */}
                <span
                  className={`relative h-6 w-11 shrink-0 rounded-full transition-all duration-300 ${
                    field.value
                      ? "bg-gradient-to-r from-violet-500 to-fuchsia-500 shadow-md shadow-violet-400/40"
                      : "bg-black/12"
                  }`}
                >
                  <motion.span
                    layout
                    transition={{ type: "spring", stiffness: 550, damping: 32 }}
                    className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-md"
                    style={{ left: field.value ? "calc(100% - 22px)" : "2px" }}
                  />
                </span>
              </motion.button>
            )}
          />

          {/* Server error */}
          <AnimatePresence>
            {serverError && (
              <motion.div
                initial={{ opacity: 0, y: -6, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, y: -4, height: 0 }}
                className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-600"
              >
                <AlertCircle size={14} className="shrink-0 text-red-400" />
                {serverError}
              </motion.div>
            )}
          </AnimatePresence>
        </form>

        {/* ── Sticky footer ───────────────────────────────────────────────── */}
        <div className="flex items-center justify-between border-t border-violet-100/80 bg-white/90 px-6 py-4 backdrop-blur-sm">
          <p className="text-xs text-graphite">
            {product ? "Changes will be saved immediately." : "Published listing will appear in the shop."}
          </p>
          <div className="flex gap-2.5">
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={onClose}
              className="rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm font-medium text-graphite hover:border-violet-200 hover:text-violet-600 transition-colors"
            >
              Cancel
            </motion.button>
            <Button
              onClick={handleSubmit(onSubmit)}
              loading={isSubmitting}
              className="rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50 hover:opacity-95 transition-all"
            >
              {product ? "Save changes" : "Create product"}
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Helper: Section divider with icon ────────────────────────────────────────

function SectionDivider({ label, icon }: { label: string; icon: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="flex h-5 w-5 items-center justify-center rounded-md bg-violet-500/10 text-violet-500">
        {icon}
      </span>
      <span className="text-xs font-semibold uppercase tracking-[0.14em] text-violet-500">{label}</span>
      <span className="h-px flex-1 bg-gradient-to-r from-violet-100 to-transparent" />
    </div>
  );
}

// ─── Helper: Field wrapper ────────────────────────────────────────────────────

function Field({
  label,
  error,
  hint,
  icon,
  full,
  children,
}: {
  label: string;
  error?: string;
  hint?: string;
  icon?: React.ReactNode;
  full?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className={`block ${full ? "sm:col-span-2" : ""}`}>
      <span className="mb-1.5 flex items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 text-xs font-semibold text-graphite/80">
          {icon && <span className="text-violet-400">{icon}</span>}
          {label}
        </span>
        {hint && (
          <span className="text-[11px] font-normal text-graphite/50">{hint}</span>
        )}
      </span>
      {children}
      <AnimatePresence>
        {error && (
          <motion.span
            initial={{ opacity: 0, height: 0, y: -4 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-1.5 flex items-center gap-1 text-xs text-red-500"
          >
            <AlertCircle size={11} className="shrink-0" />
            {error}
          </motion.span>
        )}
      </AnimatePresence>
    </label>
  );
}