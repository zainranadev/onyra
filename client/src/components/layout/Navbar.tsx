import { useEffect, useState, useRef } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Search, Heart, ShoppingBag, User as UserIcon, Menu, X, Shield, LogOut, Package, Settings, LogIn } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useAuth } from "@/context/AuthContext";

const LINKS = [
  { to: "/", label: "Home" },
  { to: "/shop", label: "Shop" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

export function Navbar() {
  const { itemCount, openDrawer } = useCart();
  const { items: wishlistItems } = useWishlist();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  // Close user dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/shop?search=${encodeURIComponent(query)}`);
    setSearchOpen(false);
    setMenuOpen(false);
  };

  const handleLogout = () => {
    setUserDropdownOpen(false);
    logout();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-violet-200/40 bg-gradient-to-r from-violet-50/50 via-fuchsia-50/40 to-violet-50/50 backdrop-blur-xl backdrop-saturate-150 shadow-[0_8px_30px_-8px_rgba(139,92,246,0.15)]">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <button
            className="md:hidden text-violet-900"
            aria-label="Open menu"
            onClick={() => setMenuOpen(true)}
          >
            <Menu size={22} />
          </button>
          <Link to="/" className="font-display text-xl font-semibold tracking-tight bg-gradient-to-r from-violet-700 to-fuchsia-600 bg-clip-text text-transparent">
            ONYRA
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            {LINKS.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === "/"}
                className={({ isActive }) =>
                  `rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? "text-violet-700 bg-violet-500/10"
                      : "text-violet-950/70 hover:text-violet-700 hover:bg-violet-500/5"
                  }`
                }
              >
                {l.label}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          {/* Search bar */}
          <div className="hidden sm:block">
            {searchOpen ? (
              <form onSubmit={submitSearch} className="flex items-center overflow-hidden rounded-full border border-violet-200/60 bg-white/40 backdrop-blur-md">
                <input
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onBlur={() => !query && setSearchOpen(false)}
                  placeholder="Search products..."
                  className="w-56 bg-transparent px-4 py-2 text-sm text-violet-950 placeholder:text-violet-400 outline-none"
                />
                <button type="submit" className="px-3 text-violet-500" aria-label="Search">
                  <Search size={16} />
                </button>
              </form>
            ) : (
              <button onClick={() => setSearchOpen(true)} aria-label="Open search" className="rounded-full p-2.5 text-violet-700 hover:bg-violet-500/10">
                <Search size={19} />
              </button>
            )}
          </div>

          <button onClick={() => navigate("/shop?search=")} className="p-2.5 text-violet-700 hover:bg-violet-500/10 rounded-full sm:hidden" aria-label="Search">
            <Search size={19} />
          </button>

          {/* Wishlist — hidden for admin */}
          {!isAdmin && (
            <Link to="/wishlist" className="relative rounded-full p-2.5 text-violet-700 hover:bg-violet-500/10" aria-label={`Wishlist (${wishlistItems.length})`}>
              <Heart size={19} />
              {wishlistItems.length > 0 && (
                <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-fuchsia-500 text-[10px] font-bold text-white shadow-sm shadow-fuchsia-500/40">
                  {wishlistItems.length}
                </span>
              )}
            </Link>
          )}

          {/* Cart — hidden for admin */}
          {!isAdmin && (
            <button onClick={openDrawer} className="relative rounded-full p-2.5 text-violet-700 hover:bg-violet-500/10" aria-label={`Cart (${itemCount})`}>
              <ShoppingBag size={19} />
              {itemCount > 0 && (
                <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-violet-500 text-[10px] font-bold text-white shadow-sm shadow-violet-500/40">
                  {itemCount}
                </span>
              )}
            </button>
          )}

          {/* Admin shortcut pill — visible only for admin */}
          {isAdmin && (
            <Link
              to="/admin"
              className="hidden sm:flex items-center gap-1.5 rounded-full bg-white/40 backdrop-blur-md border border-violet-300/50 px-3 py-1.5 text-xs font-semibold text-violet-700 hover:bg-violet-500/10 transition-colors"
            >
              <Shield size={14} />
              Admin Panel
            </Link>
          )}

          {/* User Account / Dropdown */}
          <div className="relative hidden sm:block" ref={dropdownRef}>
            {isAuthenticated && user ? (
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className={`flex items-center gap-1.5 rounded-full p-1 pl-2 hover:bg-violet-500/10 transition-colors border ${
                  isAdmin ? "border-violet-300/60 bg-white/30" : "border-violet-200/50 bg-white/20"
                }`}
                aria-label="User menu"
              >
                <span className="text-xs font-medium text-violet-950 max-w-[90px] truncate">{user.name.split(" ")[0]}</span>
                <div className={`flex h-7 w-7 items-center justify-center rounded-full font-display text-xs font-bold ${
                  isAdmin ? "bg-gradient-to-br from-violet-400 to-fuchsia-400 text-white" : "bg-violet-100 text-violet-700"
                }`}>
                  {user.name.charAt(0).toUpperCase()}
                </div>
              </button>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-1.5 rounded-full p-2.5 text-violet-700 hover:bg-violet-500/10 transition-colors"
                aria-label="Sign in"
              >
                <UserIcon size={19} />
              </Link>
            )}

            {/* Dropdown Menu */}
            {userDropdownOpen && isAuthenticated && user && (
              <div className="absolute right-0 top-full mt-2 w-56 rounded-2xl border border-violet-200/50 bg-white/70 backdrop-blur-xl p-2 shadow-[0_20px_50px_-15px_rgba(139,92,246,0.35)] animate-fadeUp z-50">
                <div className="border-b border-violet-100 px-3 py-2.5 mb-1">
                  <p className="text-xs font-semibold text-violet-950 truncate">{user.name}</p>
                  <p className="text-[11px] text-violet-500 truncate">{user.email}</p>
                  <span
                    className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider ${
                      isAdmin ? "bg-violet-500/15 text-violet-700" : "bg-fuchsia-500/10 text-fuchsia-600"
                    }`}
                  >
                    {user.role}
                  </span>
                </div>

                <div className="space-y-0.5">
                  {isAdmin ? (
                    // Admin-only menu items
                    <>
                      <Link
                        to="/admin"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-violet-700 hover:bg-violet-500/10 transition-colors"
                      >
                        <Shield size={14} /> Dashboard
                      </Link>
                      <Link
                        to="/admin/products"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-violet-900/70 hover:text-violet-900 hover:bg-violet-500/5 transition-colors"
                      >
                        <Package size={14} /> Products
                      </Link>
                      <Link
                        to="/admin/orders"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-violet-900/70 hover:text-violet-900 hover:bg-violet-500/5 transition-colors"
                      >
                        <Settings size={14} /> Orders
                      </Link>
                    </>
                  ) : (
                    // Customer-only menu items
                    <>
                      <Link
                        to="/account"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-violet-900/70 hover:text-violet-900 hover:bg-violet-500/5 transition-colors"
                      >
                        <Settings size={14} /> My Account
                      </Link>
                      <Link
                        to="/account/orders"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-violet-900/70 hover:text-violet-900 hover:bg-violet-500/5 transition-colors"
                      >
                        <Package size={14} /> Order History
                      </Link>
                    </>
                  )}

                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <LogOut size={14} /> Sign out
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 bg-violet-950/30 backdrop-blur-sm md:hidden" onClick={() => setMenuOpen(false)}>
          <div
            onClick={(e) => e.stopPropagation()}
            className="flex h-full w-[82%] max-w-sm flex-col bg-white/80 backdrop-blur-2xl p-6 shadow-[0_0_60px_-10px_rgba(139,92,246,0.4)] animate-fadeUp justify-between border-r border-violet-200/40"
          >
            <div>
              <div className="mb-6 flex items-center justify-between">
                <span className="font-display text-lg font-semibold bg-gradient-to-r from-violet-700 to-fuchsia-600 bg-clip-text text-transparent">ONYRA</span>
                <button aria-label="Close menu" className="text-violet-700" onClick={() => setMenuOpen(false)}>
                  <X size={22} />
                </button>
              </div>

              {isAuthenticated && user && (
                <div className="mb-6 rounded-xl bg-white/50 backdrop-blur-md p-3.5 border border-violet-200/50 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-violet-400 to-fuchsia-400 text-white font-display text-sm font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="overflow-hidden">
                    <p className="font-medium text-xs text-violet-950 truncate">{user.name}</p>
                    <p className="text-[11px] text-violet-500 truncate">{user.email}</p>
                  </div>
                </div>
              )}

              <form onSubmit={submitSearch} className="mb-6 flex items-center rounded-full border border-violet-200/60 bg-white/50 backdrop-blur-md px-4 py-2.5">
                <Search size={16} className="text-violet-400" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search products..."
                  className="ml-2 w-full bg-transparent text-sm text-violet-950 placeholder:text-violet-400 outline-none"
                />
              </form>

              <nav className="flex flex-col gap-1">
                {LINKS.map((l) => (
                  <NavLink
                    key={l.to}
                    to={l.to}
                    end={l.to === "/"}
                    onClick={() => setMenuOpen(false)}
                    className={({ isActive }) =>
                      `rounded-lg px-3 py-2.5 text-sm font-medium ${isActive ? "bg-violet-500/10 text-violet-700" : "text-violet-950/80"}`
                    }
                  >
                    {l.label}
                  </NavLink>
                ))}
                <Link to="/wishlist" onClick={() => setMenuOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-medium text-violet-950/80">
                  Wishlist ({wishlistItems.length})
                </Link>
                {isAuthenticated ? (
                  <>
                    <Link to="/account" onClick={() => setMenuOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-medium text-violet-950/80">
                      My Account
                    </Link>
                    <Link to="/account/orders" onClick={() => setMenuOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-medium text-violet-950/80">
                      My Orders
                    </Link>
                    {isAdmin && (
                      <Link to="/admin" onClick={() => setMenuOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-medium text-violet-700">
                        Admin Dashboard
                      </Link>
                    )}
                  </>
                ) : (
                  <Link to="/login" onClick={() => setMenuOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-medium text-violet-700 flex items-center gap-1.5">
                    <LogIn size={16} /> Sign In / Register
                  </Link>
                )}
              </nav>
            </div>

            {isAuthenticated && (
              <button
                onClick={() => {
                  setMenuOpen(false);
                  logout();
                }}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 py-2.5 text-xs font-medium text-red-600"
              >
                <LogOut size={14} /> Sign Out
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}