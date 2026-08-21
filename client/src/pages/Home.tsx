import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, Variants } from "framer-motion";
import { ArrowRight, Truck, ShieldCheck, RotateCcw, ShoppingCart, Gift, Tag, Package, Sparkles } from "lucide-react";
import { productService, categoryService } from "@/services/productService";
import { Product, Category } from "@/types";
import { ProductGrid } from "@/components/product/ProductGrid";
import { ProductGridSkeleton } from "@/components/common/Skeleton";
import { ErrorState } from "@/components/common/ErrorState";
import { Button } from "@/components/common/Button";
import { toApiError } from "@/services/api";

const BENEFITS = [
  { icon: Truck, title: "Fast delivery", copy: "Most orders ship within 24 hours and arrive in 2–4 days." },
  { icon: ShieldCheck, title: "Secure shopping", copy: "Checkout is encrypted end-to-end, every time." },
  { icon: RotateCcw, title: "Easy returns", copy: "30 days to change your mind, no questions asked." },
  { icon: Sparkles, title: "Premium quality", copy: "Every product is tested for durability before it ships." },
];

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};

const sectionHeader: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

export default function Home() {
  const [featured, setFeatured] = useState<Product[] | null>(null);
  const [categories, setCategories] = useState<Category[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    setError(null);
    setFeatured(null);
    Promise.all([productService.featured(), categoryService.list()])
      .then(([p, c]) => {
        setFeatured(p);
        setCategories(c);
      })
      .catch((err) => setError(toApiError(err).message));
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="overflow-x-clip">
      {/* Hero */}
      <section className="relative overflow-hidden bg-ink">
        <motion.div
          className="pointer-events-none absolute -right-40 -top-40 h-[520px] w-[520px] rounded-full opacity-40 blur-3xl"
          style={{ background: "radial-gradient(circle, #8B5CF6 0%, transparent 70%)" }}
          animate={{ scale: [1, 1.12, 1], opacity: [0.4, 0.55, 0.4] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="pointer-events-none absolute -left-32 bottom-0 h-[420px] w-[420px] rounded-full opacity-30 blur-3xl"
          style={{ background: "radial-gradient(circle, #D946EF 0%, transparent 70%)" }}
          animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.45, 0.3] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
        {/* Fine grid texture for depth */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
            backgroundSize: "48px 48px",
            maskImage: "radial-gradient(ellipse at 50% 0%, black 0%, transparent 70%)",
          }}
        />

        <div className="container-page relative grid grid-cols-1 items-center gap-12 py-20 md:grid-cols-2 md:py-28">
          <motion.div variants={stagger} initial="hidden" animate="show">
            <motion.span
              variants={fadeUp}
              className="inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-500/10 px-3 py-1 text-xs font-semibold text-violet-300"
            >
              <motion.span
                className="h-1.5 w-1.5 rounded-full bg-violet-400"
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              New season, considered goods
            </motion.span>
            <motion.h1 variants={fadeUp} className="mt-5 font-display text-4xl leading-[1.1] text-white sm:text-5xl md:text-6xl">
              Discover products <br className="hidden sm:block" /> designed for the way <br className="hidden sm:block" /> you live.
            </motion.h1>
            <motion.p variants={fadeUp} className="mt-5 max-w-md text-base text-white/60">
              Onyra makes everyday tech and carry goods with the kind of restraint you'd expect from something twice the price — built to last, not just to launch.
            </motion.p>
            <motion.div variants={fadeUp} className="mt-8 flex flex-wrap gap-3">
              <Link to="/shop">
                <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}>
                  <Button size="lg" className="bg-gradient-to-r from-violet-500 to-fuchsia-500 border-0 shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40">
                    Shop now <ArrowRight size={16} />
                  </Button>
                </motion.div>
              </Link>
              <Link to="/shop?sort=featured">
                <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}>
                  <Button size="lg" variant="outline" className="border-white/20 bg-transparent text-purple hover:border-violet-300/60 hover:bg-violet-500/10">
                    Explore collection
                  </Button>
                </motion.div>
              </Link>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.92, rotate: -1.5 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ rotate: 0.5, scale: 1.015 }}
            className="relative mx-auto aspect-square w-full max-w-md overflow-hidden rounded-xl2 shadow-[0_30px_80px_-20px_rgba(139,92,246,0.45)]"
          >
            <div className="absolute -inset-px rounded-xl2 bg-gradient-to-br from-violet-400/40 via-transparent to-fuchsia-400/30 opacity-0 transition-opacity duration-500 hover:opacity-100" />
            <img
              src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1200"
              alt="Onyra Nova Wireless Headphones"
              className="h-full w-full object-cover"
            />
          </motion.div>
        </div>

        {/* Scroll cue */}
        <motion.div
          className="pointer-events-none absolute bottom-6 left-1/2 hidden -translate-x-1/2 sm:block"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="h-9 w-5 rounded-full border border-white/20 p-1">
            <div className="h-1.5 w-1.5 rounded-full bg-violet-300" />
          </div>
        </motion.div>
      </section>

      {/* Featured categories */}
      <section className="container-page py-16 sm:py-20">
        <motion.div
          variants={sectionHeader}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          className="mb-8 flex items-end justify-between"
        >
          <h2 className="font-display text-2xl text-ink sm:text-3xl">Shop by category</h2>
          <Link to="/shop" className="hidden items-center gap-1 text-sm font-semibold text-violet-600 transition-colors hover:text-fuchsia-500 sm:flex">
            View all <ArrowRight size={14} />
          </Link>
        </motion.div>
        {!categories ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="skeleton aspect-[4/5] rounded-xl2" />
            ))}
          </div>
        ) : (
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-60px" }}
            className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6"
          >
            {categories.map((c) => (
              <motion.div key={c.slug} variants={fadeUp}>
                <Link
                  to={`/shop?category=${c.slug}`}
                  className="group relative block aspect-[4/5] overflow-hidden rounded-xl2 bg-mist shadow-card transition-shadow duration-300 hover:shadow-[0_20px_45px_-15px_rgba(139,92,246,0.4)]"
                >
                  <img
                    src={c.image}
                    alt={c.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/10 to-transparent" />
                  <div className="absolute inset-0 opacity-0 ring-1 ring-inset ring-violet-300/50 transition-opacity duration-300 group-hover:opacity-100" />
                  <div className="absolute inset-x-0 bottom-0 p-3.5">
                    <div className="flex items-center justify-between text-white">
                      <div>
                        <p className="font-display text-sm leading-tight">{c.name}</p>
                        <p className="text-[11px] text-white/60">{c.productCount} products</p>
                      </div>
                      <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-1 group-hover:text-violet-300" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </section>

      {/* Featured products */}
      <section className="container-page py-8 sm:py-10">
        <motion.div
          variants={sectionHeader}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          className="mb-8 flex items-end justify-between"
        >
          <h2 className="font-display text-2xl text-ink sm:text-3xl">Featured products</h2>
          <Link to="/shop" className="hidden items-center gap-1 text-sm font-semibold text-violet-600 transition-colors hover:text-fuchsia-500 sm:flex">
            View all <ArrowRight size={14} />
          </Link>
        </motion.div>
        {error && <ErrorState message={error} onRetry={load} />}
        {!error && !featured && <ProductGridSkeleton />}
        {!error && featured && (
          <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-60px" }}>
            <ProductGrid products={featured} />
          </motion.div>
        )}
      </section>

      {/* Promo banner */}
      <section className="container-page py-8 sm:py-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative overflow-hidden rounded-xl2 bg-gradient-to-br from-violet-700 via-violet-800 to-fuchsia-900 px-8 py-14 text-center sm:px-16 sm:py-20"
        >
          <motion.div
            className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full opacity-40 blur-3xl"
            style={{ background: "radial-gradient(circle, #F472B6 0%, transparent 70%)" }}
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="pointer-events-none absolute -left-16 -bottom-24 h-64 w-64 rounded-full opacity-30 blur-3xl"
            style={{ background: "radial-gradient(circle, #A78BFA 0%, transparent 70%)" }}
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          />

          {/* Floating decorative icons — purely ambient, sit behind the copy */}
          <div className="pointer-events-none absolute inset-0 hidden sm:block">
            <motion.div
              className="absolute left-[8%] top-[18%] text-white/15"
              animate={{ y: [0, -14, 0], rotate: [0, -8, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            >
              <ShoppingCart size={40} strokeWidth={1.5} />
            </motion.div>
            <motion.div
              className="absolute right-[10%] top-[22%] text-white/15"
              animate={{ y: [0, 12, 0], rotate: [0, 10, 0] }}
              transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
            >
              <Gift size={34} strokeWidth={1.5} />
            </motion.div>
            <motion.div
              className="absolute left-[16%] bottom-[16%] text-white/10"
              animate={{ y: [0, 10, 0], rotate: [0, -6, 0] }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1.4 }}
            >
              <Tag size={30} strokeWidth={1.5} />
            </motion.div>
            <motion.div
              className="absolute right-[14%] bottom-[20%] text-white/15"
              animate={{ y: [0, -10, 0], rotate: [0, 8, 0] }}
              transition={{ duration: 6.5, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
            >
              <Package size={36} strokeWidth={1.5} />
            </motion.div>
            <motion.div
              className="absolute left-[42%] top-[10%] text-white/10"
              animate={{ opacity: [0.3, 0.7, 0.3], scale: [1, 1.15, 1] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
            >
              <Sparkles size={22} strokeWidth={1.5} />
            </motion.div>
            <motion.div
              className="absolute right-[38%] bottom-[12%] text-white/10"
              animate={{ opacity: [0.2, 0.6, 0.2], scale: [1, 1.2, 1] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            >
              <Sparkles size={16} strokeWidth={1.5} />
            </motion.div>
          </div>

          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="relative font-display text-3xl text-white sm:text-4xl"
          >
            Upgrade your everyday.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative mx-auto mt-3 max-w-md text-white/70"
          >
            Free shipping on every order over $100, plus 30 days to return anything that doesn't earn its place on your desk.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="relative mt-7 inline-block"
          >
            <Link to="/shop">
              <motion.div whileHover={{ y: -2, scale: 1.02 }} whileTap={{ scale: 0.97 }}>
                <Button size="lg" className="bg-white text-purple-700 hover:bg-white/90">
                  Shop the collection
                </Button>
              </motion.div>
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Why choose us */}
      <section className="container-page py-16 sm:py-20">
        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="mb-10 text-center font-display text-2xl text-ink sm:text-3xl"
        >
          Why shop with Onyra
        </motion.h2>
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
        >
          {BENEFITS.map((b) => (
            <motion.div
              key={b.title}
              variants={fadeUp}
              whileHover={{ y: -4 }}
              className="group rounded-xl2 border border-transparent bg-white p-6 text-center shadow-card transition-colors duration-300 hover:border-violet-200/60 hover:shadow-[0_20px_45px_-20px_rgba(139,92,246,0.35)]"
            >
              <motion.div
                className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-violet-50 text-violet-600 transition-colors duration-300 group-hover:bg-gradient-to-br group-hover:from-violet-500 group-hover:to-fuchsia-500 group-hover:text-white"
              >
                <b.icon size={20} />
              </motion.div>
              <h3 className="font-display text-base text-ink">{b.title}</h3>
              <p className="mt-1.5 text-sm text-graphite">{b.copy}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>
    </div>
  );
}