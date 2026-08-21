import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function Pagination({
  page,
  totalPages,
  onChange,
}: {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;
  const pages = Array.from({ length: totalPages }).map((_, i) => i + 1).slice(0, 7);

  return (
    <nav className="mt-10 flex items-center justify-center gap-1.5" aria-label="Pagination">
      <motion.button
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
        aria-label="Previous page"
        whileHover={page > 1 ? { scale: 1.08 } : undefined}
        whileTap={page > 1 ? { scale: 0.9 } : undefined}
        transition={{ type: "spring", stiffness: 500, damping: 26 }}
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-black/10 bg-white text-graphite disabled:opacity-30 hover:enabled:border-violet-300 hover:enabled:text-violet-600"
      >
        <motion.span
          key={page <= 1 ? "at-start" : "can-go"}
          initial={{ x: 0 }}
          whileHover={page > 1 ? { x: -2 } : undefined}
          className="inline-flex"
        >
          <ChevronLeft size={16} />
        </motion.span>
      </motion.button>

      {pages.map((p) => {
        const isActive = p === page;
        return (
          <motion.button
            key={p}
            onClick={() => onChange(p)}
            aria-current={isActive ? "page" : undefined}
            whileHover={!isActive ? { y: -2 } : undefined}
            whileTap={{ scale: 0.92 }}
            transition={{ type: "spring", stiffness: 500, damping: 26 }}
            className={`relative h-9 min-w-9 rounded-lg px-3 text-sm font-medium transition-colors ${
              isActive
                ? "text-white"
                : "border border-black/10 bg-white text-graphite hover:border-violet-300 hover:text-violet-600"
            }`}
          >
            {isActive && (
              <motion.span
                layoutId="pagination-active-pill"
                transition={{ type: "spring", stiffness: 450, damping: 32 }}
                className="absolute inset-0 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 shadow-lg shadow-violet-500/30"
              />
            )}
            <span className="relative">{p}</span>
          </motion.button>
        );
      })}

      <motion.button
        disabled={page >= totalPages}
        onClick={() => onChange(page + 1)}
        aria-label="Next page"
        whileHover={page < totalPages ? { scale: 1.08 } : undefined}
        whileTap={page < totalPages ? { scale: 0.9 } : undefined}
        transition={{ type: "spring", stiffness: 500, damping: 26 }}
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-black/10 bg-white text-graphite disabled:opacity-30 hover:enabled:border-violet-300 hover:enabled:text-violet-600"
      >
        <motion.span
          key={page >= totalPages ? "at-end" : "can-go"}
          initial={{ x: 0 }}
          whileHover={page < totalPages ? { x: 2 } : undefined}
          className="inline-flex"
        >
          <ChevronRight size={16} />
        </motion.span>
      </motion.button>
    </nav>
  );
}