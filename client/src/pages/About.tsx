import { useEffect, useRef, useState } from "react";
import { motion, useInView, Variants } from "framer-motion";
import { ShieldCheck, Leaf, VolumeX } from "lucide-react";

const STATS = [
  { value: "10K+", label: "Happy customers" },
  { value: "250+", label: "Products shipped" },
  { value: "98%", label: "Positive reviews" },
  { value: "6", label: "Years designing" },
];

const VALUES = [
  { icon: ShieldCheck, title: "Durability first.", copy: "If it can't survive daily use, it doesn't ship." },
  { icon: Leaf, title: "Honest materials.", copy: "No finishes that hide what something is made of." },
  { icon: VolumeX, title: "Quiet design.", copy: "Function leads; branding stays out of the way." },
];

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" } },
};

const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};

/** Animates a stat like "10K+" or "98%" by counting up the numeric portion in view. */
function CountUpStat({ value }: { value: string }) {
  const match = value.match(/^([\d.]+)(.*)$/);
  const target = match ? parseFloat(match[1]) : 0;
  const suffix = match ? match[2] : "";
  const ref = useRef<HTMLParagraphElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const duration = 1200;
    const start = performance.now();
    let frame: number;
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(target * eased);
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, target]);

  const formatted = Number.isInteger(target) ? Math.round(display) : display.toFixed(1);

  return (
    <p ref={ref} className="font-display text-3xl text-transparent bg-gradient-to-br from-violet-600 to-fuchsia-500 bg-clip-text sm:text-4xl">
      {formatted}
      {suffix}
    </p>
  );
}

export default function About() {
  return (
    <div className="overflow-x-clip">
      {/* Hero */}
      <section className="relative overflow-hidden bg-ink py-24 text-center text-white">
        <motion.div
          className="pointer-events-none absolute -top-24 left-1/4 h-80 w-80 rounded-full opacity-40 blur-3xl"
          style={{ background: "radial-gradient(circle, #8B5CF6 0%, transparent 70%)" }}
          animate={{ scale: [1, 1.15, 1], opacity: [0.35, 0.5, 0.35] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="pointer-events-none absolute -bottom-20 right-1/4 h-72 w-72 rounded-full opacity-30 blur-3xl"
          style={{ background: "radial-gradient(circle, #D946EF 0%, transparent 70%)" }}
          animate={{ scale: [1, 1.2, 1], opacity: [0.25, 0.4, 0.25] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
        {/* Dotted pattern */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.15]"
          style={{
            backgroundImage: "radial-gradient(white 1px, transparent 1px)",
            backgroundSize: "26px 26px",
            maskImage: "radial-gradient(ellipse at 50% 30%, black 0%, transparent 75%)",
          }}
        />

        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="container-page relative"
        >
          <motion.span
            variants={fadeUp}
            className="inline-flex items-center gap-2 rounded-full border border-violet-400/25 bg-violet-500/10 px-3 py-1 text-xs font-semibold text-violet-300"
          >
            Two-person studio, est. six years ago
          </motion.span>
          <motion.h1 variants={fadeUp} className="mt-5 font-display text-4xl sm:text-5xl">
            We make fewer things, <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">better.</span>
          </motion.h1>
          <motion.p variants={fadeUp} className="mx-auto mt-4 max-w-xl text-white/60">
            Onyra started as a two-person studio frustrated by tech that looked disposable. Every product we ship
            goes through the same question: would we still want this on our desk in five years?
          </motion.p>
        </motion.div>
      </section>

      {/* Mission + values */}
      <section className="container-page grid grid-cols-1 gap-14 py-16 md:grid-cols-2 md:py-24">
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-violet-500">
            <span className="h-1.5 w-1.5 rounded-full bg-violet-500" />
            Our mission
          </span>
          <h2 className="mt-2 font-display text-2xl text-ink sm:text-3xl">Build objects worth keeping.</h2>
          <p className="mt-4 leading-relaxed text-graphite">
            We design in small batches, test materials past their spec sheets, and skip trend cycles entirely.
            That means fewer product drops than most brands our size, but every one earns its place in a daily
            routine instead of a drawer.
          </p>
          <div className="mt-6 h-px w-24 bg-gradient-to-r from-violet-400 to-transparent" />
        </motion.div>

        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
        >
          <motion.span
            variants={fadeUp}
            className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-violet-500"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-violet-500" />
            Our values
          </motion.span>
          <motion.ul variants={stagger} className="mt-4 space-y-3">
            {VALUES.map((v) => (
              <motion.li
                key={v.title}
                variants={fadeUp}
                whileHover={{ x: 4 }}
                className="group flex items-start gap-3 rounded-xl2 border border-transparent p-3 transition-colors duration-300 hover:border-violet-100 hover:bg-violet-50/50"
              >
                <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-violet-50 text-violet-600 transition-colors duration-300 group-hover:bg-gradient-to-br group-hover:from-violet-500 group-hover:to-fuchsia-500 group-hover:text-white">
                  <v.icon size={16} />
                </div>
                <p className="text-graphite">
                  <strong className="text-ink">{v.title}</strong> {v.copy}
                </p>
              </motion.li>
            ))}
          </motion.ul>
        </motion.div>
      </section>

      {/* Stats */}
      <section className="relative overflow-hidden border-t border-violet-100 bg-gradient-to-b from-white to-violet-50/40 py-16">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.4]"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(139,92,246,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(139,92,246,0.06) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          className="container-page relative grid grid-cols-2 gap-6 text-center md:grid-cols-4"
        >
          {STATS.map((s) => (
            <motion.div
              key={s.label}
              variants={fadeUp}
              whileHover={{ y: -4 }}
              className="rounded-xl2 border border-violet-100/70 bg-white/70 py-6 shadow-[0_10px_30px_-15px_rgba(139,92,246,0.25)] backdrop-blur-sm transition-shadow duration-300 hover:shadow-[0_20px_45px_-15px_rgba(139,92,246,0.4)]"
            >
              <CountUpStat value={s.value} />
              <p className="mt-1 text-sm text-graphite">{s.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>
    </div>
  );
}