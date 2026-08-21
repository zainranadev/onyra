interface BadgeProps {
  children: React.ReactNode;
  tone?: "orange" | "purple" | "ink" | "gray" | "red";
}

const TONES: Record<string, string> = {
  orange: "bg-orange/10 text-orange",
  purple: "bg-purple/10 text-purple",
  ink: "bg-ink text-white",
  gray: "bg-black/5 text-graphite",
  red: "bg-red-50 text-red-600",
};

export function Badge({ children, tone = "gray" }: BadgeProps) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${TONES[tone] ?? TONES.gray}`}>
      {children}
    </span>
  );
}
