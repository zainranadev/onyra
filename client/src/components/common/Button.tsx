import { ButtonHTMLAttributes, forwardRef, useState, MouseEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";

type Variant = "primary" | "secondary" | "ghost" | "outline";
type Size = "sm" | "md" | "lg";

// Omit all native HTML event handlers that Framer Motion overrides with incompatible signatures
type SafeButtonHTMLAttributes = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  | "onDrag" | "onDragEnd" | "onDragEnter" | "onDragExit"
  | "onDragLeave" | "onDragOver" | "onDragStart"
  | "onAnimationStart" | "onAnimationEnd" | "onAnimationIteration"
  | "onPointerDown" | "onPointerMove" | "onPointerUp"
  | "onPointerCancel" | "onPointerEnter" | "onPointerLeave" | "onPointerOver" | "onPointerOut"
>;

interface ButtonProps extends SafeButtonHTMLAttributes {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

const VARIANTS: Record<Variant, string> = {
  primary: "bg-orange text-white hover:bg-orange/90 shadow-card",
  secondary: "bg-ink text-white hover:bg-ink/90",
  outline: "border border-ink/15 text-ink hover:border-ink/40 bg-white",
  ghost: "text-ink hover:bg-black/5",
};

// Variants that get the animated light-sweep on hover — reserved for
// solid, high-emphasis buttons so it doesn't feel noisy on ghost/outline.
const SHEEN_VARIANTS: Variant[] = ["primary", "secondary"];

const SIZES: Record<Size, string> = {
  sm: "text-sm px-3.5 py-2 rounded-lg",
  md: "text-sm px-5 py-2.5 rounded-xl",
  lg: "text-base px-7 py-3.5 rounded-xl",
};

interface Ripple {
  id: number;
  x: number;
  y: number;
  size: number;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", loading, disabled, className = "", children, onClick, ...props }, ref) => {
    const [ripples, setRipples] = useState<Ripple[]>([]);
    const isDisabled = disabled || loading;

    const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
      const el = e.currentTarget;
      const rect = el.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height) * 2;
      const id = Date.now();
      setRipples((prev) => [
        ...prev,
        { id, x: e.clientX - rect.left - size / 2, y: e.clientY - rect.top - size / 2, size },
      ]);
      window.setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== id));
      }, 650);
      onClick?.(e);
    };

    return (
      <motion.button
        ref={ref}
        disabled={isDisabled}
        onClick={handleClick}
        whileHover={isDisabled ? undefined : { y: -2, scale: 1.015 }}
        whileTap={isDisabled ? undefined : { scale: 0.96, y: 0 }}
        transition={{ type: "spring", stiffness: 420, damping: 24 }}
        className={`group relative inline-flex select-none items-center justify-center gap-2 overflow-hidden font-semibold transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-50 ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
        {...props}
      >
        {/* Light sweep on hover */}
        {SHEEN_VARIANTS.includes(variant) && !isDisabled && (
          <span className="pointer-events-none absolute inset-0 -translate-x-full skew-x-[-20deg] bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full" />
        )}

        {/* Click ripples */}
        <AnimatePresence>
          {ripples.map((r) => (
            <motion.span
              key={r.id}
              initial={{ opacity: 0.35, scale: 0 }}
              animate={{ opacity: 0, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="pointer-events-none absolute rounded-full bg-white"
              style={{ left: r.x, top: r.y, width: r.size, height: r.size }}
            />
          ))}
        </AnimatePresence>

        {/* Icon / label swap between idle and loading */}
        <span className="relative inline-flex items-center gap-2">
          <AnimatePresence mode="popLayout" initial={false}>
            {loading && (
              <motion.span
                key="spinner"
                initial={{ opacity: 0, scale: 0.6, width: 0 }}
                animate={{ opacity: 1, scale: 1, width: "auto" }}
                exit={{ opacity: 0, scale: 0.6, width: 0 }}
                transition={{ duration: 0.2 }}
                className="inline-flex"
              >
                <Loader2 size={16} className="animate-spin" />
              </motion.span>
            )}
          </AnimatePresence>
          <motion.span
            animate={{ opacity: loading ? 0.75 : 1 }}
            transition={{ duration: 0.15 }}
            className="inline-flex items-center gap-2"
          >
            {children}
          </motion.span>
        </span>
      </motion.button>
    );
  }
);
Button.displayName = "Button";