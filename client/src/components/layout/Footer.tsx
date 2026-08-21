import { useState } from "react";
import { Link } from "react-router-dom";
import { Instagram, Twitter, Youtube, ArrowRight, Mail, Check } from "lucide-react";

export function Footer() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const subscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes("@")) return;
    setSubmitted(true);
  };

  return (
    <footer className="relative mt-24 overflow-hidden border-t border-white/10 bg-ink text-white">
      {/* Ambient glow accents */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 left-[8%] h-72 w-72 rounded-full bg-violet-600/20 blur-[100px]" />
        <div className="absolute -top-20 right-[12%] h-64 w-64 rounded-full bg-fuchsia-500/10 blur-[110px]" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-400/50 to-transparent" />
      </div>

      <div className="container-page relative py-20">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-5">
          <div className="col-span-2">
            <span className="font-display text-2xl font-semibold tracking-tight bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
              ONYRA
            </span>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-white/50">
              Considered, well-made objects for the way you actually live and work.
            </p>
            <div className="mt-6 flex gap-3">
              {[Instagram, Twitter, Youtube].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  aria-label="Social link"
                  className="group flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] transition-all duration-300 hover:-translate-y-0.5 hover:border-violet-400/40 hover:bg-violet-500/15"
                >
                  <Icon size={15} className="text-white/60 transition-colors group-hover:text-violet-300" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-[0.15em] text-white/35">Shop</h4>
            <ul className="mt-5 space-y-3 text-sm text-white/60">
              <li><Link to="/shop" className="transition-colors hover:text-violet-300">All products</Link></li>
              <li><Link to="/shop?category=audio" className="transition-colors hover:text-violet-300">Audio</Link></li>
              <li><Link to="/shop?category=workspace" className="transition-colors hover:text-violet-300">Workspace</Link></li>
              <li><Link to="/shop?category=carry" className="transition-colors hover:text-violet-300">Carry</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-[0.15em] text-white/35">Support</h4>
            <ul className="mt-5 space-y-3 text-sm text-white/60">
              <li><Link to="/contact" className="transition-colors hover:text-violet-300">Contact us</Link></li>
              <li><Link to="/account/orders" className="transition-colors hover:text-violet-300">Track an order</Link></li>
              <li><Link to="/about" className="transition-colors hover:text-violet-300">About Onyra</Link></li>
            </ul>
          </div>

          <div className="col-span-2 md:col-span-1">
            <h4 className="text-xs font-semibold uppercase tracking-[0.15em] text-white/35">Stay in the loop</h4>
            <p className="mt-3 text-sm text-white/50">New drops, first look, no spam.</p>

            {submitted ? (
              <div className="mt-4 flex items-center gap-2 rounded-lg border border-violet-400/30 bg-violet-500/10 px-3.5 py-3 text-sm text-violet-200">
                <Check size={15} className="shrink-0" />
                You're subscribed. Welcome to Onyra.
              </div>
            ) : (
              <form onSubmit={subscribe} className="mt-4">
                <div className="flex items-center gap-2 overflow-hidden rounded-lg border border-white/15 bg-white/[0.04] pl-3 transition-colors focus-within:border-violet-400/50 focus-within:bg-white/[0.06]">
                  <Mail size={14} className="shrink-0 text-white/30" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@email.com"
                    className="w-full bg-transparent py-2.5 text-sm outline-none placeholder:text-white/30"
                  />
                  <button
                    type="submit"
                    aria-label="Subscribe"
                    className="flex h-9 w-10 shrink-0 items-center justify-center bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white transition-opacity hover:opacity-90"
                  >
                    <ArrowRight size={16} />
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        <div className="mt-16 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-7 text-xs text-white/35 sm:flex-row">
          <span>© {new Date().getFullYear()} Onyra. All rights reserved.</span>
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-violet-400" />
            Demo store — no real payments are processed.
          </span>
        </div>
      </div>
    </footer>
  );
}