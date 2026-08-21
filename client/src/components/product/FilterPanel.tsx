import { Category } from "@/types";

interface FilterPanelProps {
  categories: Category[];
  activeCategory: string;
  onCategoryChange: (slug: string) => void;
  sort: string;
  onSortChange: (sort: string) => void;
}

const SORT_OPTIONS = [
  { value: "featured", label: "Featured" },
  { value: "price_asc", label: "Price: Low → High" },
  { value: "price_desc", label: "Price: High → Low" },
  { value: "newest", label: "Newest" },
  { value: "rating", label: "Highest Rated" },
];

export function CategoryList({ categories, activeCategory, onCategoryChange }: Omit<FilterPanelProps, "sort" | "onSortChange">) {
  return (
    <div className="space-y-1">
      <button
        onClick={() => onCategoryChange("all")}
        className={`block w-full rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors ${activeCategory === "all" ? "bg-ink text-white" : "text-graphite hover:bg-black/5"
          }`}
      >
        All products
      </button>
      {categories.map((c) => (
        <button
          key={c.slug}
          onClick={() => onCategoryChange(c.slug)}
          className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors ${activeCategory === c.slug ? "bg-ink text-white" : "text-graphite hover:bg-black/5"
            }`}
        >
          <span>{c.name}</span>
          <span className={activeCategory === c.slug ? "text-white/60" : "text-graphite/50"}>{c.productCount}</span>
        </button>
      ))}
    </div>
  );
}

export function SortSelect({ sort, onSortChange }: Pick<FilterPanelProps, "sort" | "onSortChange">) {
  return (
    <select
      value={sort}
      onChange={(e) => onSortChange(e.target.value)}
      aria-label="Sort products"
      className="rounded-lg border border-black/10 bg-white px-3 py-2 text-sm font-medium text-ink focus:border-purple"
    >
      {SORT_OPTIONS.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
