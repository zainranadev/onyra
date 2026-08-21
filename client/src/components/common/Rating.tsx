import { Star } from "lucide-react";

export function Rating({ value, count, size = 14 }: { value: number; count?: number; size?: number }) {
  return (
    <div className="flex items-center gap-1" aria-label={`Rated ${value} out of 5`}>
      <div className="flex items-center">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            size={size}
            className={i < Math.round(value) ? "fill-orange text-orange" : "fill-black/10 text-black/10"}
          />
        ))}
      </div>
      {typeof count === "number" && <span className="text-xs text-graphite">({count})</span>}
    </div>
  );
}
