import { motion } from "framer-motion";

/**
 * Shared shimmer base — a soft pulse plus a diagonal violet sheen that sweeps
 * across the block. Drop onto any element in place of the old flat `skeleton`
 * class for a livelier loading state.
 */
function Shimmer({ className = "" }: { className?: string }) {
  return (
    <div className={`relative overflow-hidden bg-violet-50/80 ${className}`}>
      <motion.div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(105deg, transparent 20%, rgba(139,92,246,0.16) 45%, rgba(217,70,239,0.14) 55%, transparent 80%)",
        }}
        animate={{ x: ["-100%", "100%"] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}

export function ProductCardSkeleton({ delay = 0 }: { delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay, ease: "easeOut" }}
      className="overflow-hidden rounded-xl2 bg-white shadow-card"
    >
      <Shimmer className="aspect-square w-full" />
      <div className="space-y-2 p-4">
        <Shimmer className="h-3 w-1/3 rounded" />
        <Shimmer className="h-4 w-4/5 rounded" />
        <Shimmer className="h-4 w-1/4 rounded" />
      </div>
    </motion.div>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} delay={i * 0.04} />
      ))}
    </div>
  );
}

export function TableRowSkeleton({ cols = 6 }: { cols?: number }) {
  return (
    <tr className="border-b border-black/5">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-4">
          <Shimmer className="h-4 w-full rounded" />
        </td>
      ))}
    </tr>
  );
}