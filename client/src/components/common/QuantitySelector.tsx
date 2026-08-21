import { Minus, Plus } from "lucide-react";

export function QuantitySelector({
  value,
  max,
  onChange,
  size = "md",
}: {
  value: number;
  max: number;
  onChange: (next: number) => void;
  size?: "sm" | "md";
}) {
  const dim = size === "sm" ? "h-8 w-8" : "h-10 w-10";
  return (
    <div className="inline-flex items-center rounded-lg border border-black/10 bg-white">
      <button
        type="button"
        aria-label="Decrease quantity"
        disabled={value <= 1}
        onClick={() => onChange(value - 1)}
        className={`flex items-center justify-center ${dim} text-graphite hover:text-ink disabled:opacity-30`}
      >
        <Minus size={14} />
      </button>
      <span className="w-8 text-center text-sm font-semibold" aria-live="polite">
        {value}
      </span>
      <button
        type="button"
        aria-label="Increase quantity"
        disabled={value >= max}
        onClick={() => onChange(value + 1)}
        className={`flex items-center justify-center ${dim} text-graphite hover:text-ink disabled:opacity-30`}
      >
        <Plus size={14} />
      </button>
    </div>
  );
}
