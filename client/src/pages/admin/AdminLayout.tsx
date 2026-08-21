import { useEffect, useState, useRef } from "react";
import { NavLink, Outlet, Link, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  ClipboardList,
  ExternalLink,
  Bell,
  Check,
  Trash2,
  Volume2,
  VolumeX,
  ShoppingBag,
  ChevronRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { orderService } from "@/services/orderService";
import { Order } from "@/types";
import { useToast } from "@/context/ToastContext";

const LINKS = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/products", label: "Products", icon: Package, end: false },
  { to: "/admin/orders", label: "Orders", icon: ClipboardList, end: false },
];

export interface AdminNotification {
  id: string;
  orderId: string;
  orderNumber: string;
  customerName: string;
  total: number;
  itemsCount: number;
  createdAt: string;
  read: boolean;
}

// Synthetic chime using Web Audio API (no external asset needed)
function playChime() {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5

    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.4);
  } catch {
    // Ignore audio restrictions if user hasn't interacted with page
  }
}

export default function AdminLayout() {
  const [notifications, setNotifications] = useState<AdminNotification[]>(() => {
    const saved = localStorage.getItem("onyra_admin_notifications");
    return saved ? JSON.parse(saved) : [];
  });
  const [showNotifications, setShowNotifications] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const { showToast } = useToast();
  const navigate = useNavigate();
  const knownOrderIdsRef = useRef<Set<string>>(new Set());
  const initialFetchDone = useRef(false);

  // Sync notifications to localStorage
  useEffect(() => {
    localStorage.setItem("onyra_admin_notifications", JSON.stringify(notifications));
  }, [notifications]);

  // Live order polling for new orders (every 10 seconds)
  useEffect(() => {
    const fetchLatestOrders = async () => {
      try {
        const orders: Order[] = await orderService.list();
        if (!orders || !Array.isArray(orders)) return;

        if (!initialFetchDone.current) {
          // Seed known order IDs on initial load
          orders.forEach((o) => knownOrderIdsRef.current.add(o._id));
          initialFetchDone.current = true;
          return;
        }

        // Check for new orders that arrived after initial load
        const newOrders = orders.filter((o) => !knownOrderIdsRef.current.has(o._id));

        if (newOrders.length > 0) {
          const newNotifs: AdminNotification[] = newOrders.map((o) => ({
            id: `notif-${o._id}-${Date.now()}`,
            orderId: o._id,
            orderNumber: o.orderNumber,
            customerName: o.customer.fullName || "Customer",
            total: o.total,
            itemsCount: o.items.length,
            createdAt: o.createdAt,
            read: false,
          }));

          newOrders.forEach((o) => knownOrderIdsRef.current.add(o._id));

          setNotifications((prev) => [...newNotifs, ...prev]);

          if (soundEnabled) playChime();

          const latest = newOrders[0];
          showToast(
            `🛒 New Order Received! #${latest.orderNumber} ($${latest.total.toFixed(2)})`,
            "success"
          );
        }
      } catch {
        // Silent error handling for polling
      }
    };

    fetchLatestOrders();
    const interval = setInterval(fetchLatestOrders, 10000);
    return () => clearInterval(interval);
  }, [soundEnabled, showToast]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const removeNotification = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const handleNotificationClick = (notif: AdminNotification) => {
    markAsRead(notif.id);
    setShowNotifications(false);
    navigate("/admin/orders");
  };

  return (
    <div className="flex min-h-screen bg-violet-50/30">
      {/* Sidebar - Desktop */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-violet-900/20 bg-gradient-to-b from-ink via-ink to-[#1a1030] p-5 text-white md:flex">
        <Link to="/" className="mb-8 flex items-center justify-between font-display text-lg">
          <span>
            ONYRA <span className="font-sans text-xs text-white/40">Admin</span>
          </span>
          <span className="flex items-center gap-1 rounded-full bg-violet-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-violet-300">
            <span className="h-1.5 w-1.5 rounded-full bg-violet-400 animate-pulse" />
            Live
          </span>
        </Link>

        <nav className="flex flex-col gap-1">
          {LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) =>
                `relative flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors ${
                  isActive ? "text-white" : "text-white/60 hover:bg-white/5 hover:text-white/90"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.span
                      layoutId="admin-nav-active"
                      transition={{ type: "spring", stiffness: 420, damping: 32 }}
                      className="absolute inset-0 rounded-xl bg-gradient-to-r from-violet-600/40 to-fuchsia-600/20 shadow-inner shadow-violet-900/40"
                    />
                  )}
                  <l.icon size={17} className="relative" />
                  <span className="relative">{l.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto space-y-3 pt-6">
          <div className="rounded-xl border border-violet-400/15 bg-white/[0.04] p-3.5 backdrop-blur-sm">
            <div className="flex items-center justify-between text-xs text-white/70">
              <span className="flex items-center gap-1.5 font-medium">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                Order Watcher
              </span>
              <span className="text-[10px] text-white/40">10s poll</span>
            </div>
            <p className="mt-1 text-[11px] text-white/50">
              Auto-checks for new customer orders in real-time.
            </p>
          </div>

          <Link
            to="/"
            className="flex items-center justify-between rounded-lg px-3 py-2 text-xs text-white/40 transition-colors hover:text-violet-300"
          >
            <span className="flex items-center gap-2">
              <ExternalLink size={13} /> Back to store
            </span>
            <ChevronRight size={12} />
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-violet-100 bg-white/80 px-5 backdrop-blur-xl sm:px-8">
          <div className="flex items-center gap-3">
            <h1 className="font-display text-base font-semibold text-ink sm:text-lg">
              Admin Portal
            </h1>
            <span className="hidden items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-600 sm:inline-flex">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Connected
            </span>
          </div>

          {/* Right Header Controls: Sound & Notification Bell */}
          <div className="relative flex items-center gap-2">
            {/* Audio Toggle */}
            <button
              onClick={() => setSoundEnabled((prev) => !prev)}
              title={soundEnabled ? "Mute notification sound" : "Enable notification sound"}
              className="flex h-9 w-9 items-center justify-center rounded-xl text-graphite transition-colors hover:bg-violet-500/10"
            >
              {soundEnabled ? <Volume2 size={18} className="text-violet-600" /> : <VolumeX size={18} className="text-graphite/40" />}
            </button>

            {/* Notification Bell Dropdown Button */}
            <div className="relative">
              <motion.button
                onClick={() => setShowNotifications((prev) => !prev)}
                animate={unreadCount > 0 && !showNotifications ? { rotate: [0, -12, 10, -6, 0] } : { rotate: 0 }}
                transition={{ duration: 0.5, repeat: unreadCount > 0 && !showNotifications ? Infinity : 0, repeatDelay: 3.5 }}
                className={`relative flex h-10 w-10 items-center justify-center rounded-xl transition-all ${
                  showNotifications ? "bg-violet-50 text-violet-600 ring-2 ring-violet-400/30" : "text-ink hover:bg-violet-500/10"
                }`}
                aria-label="Notifications"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-gradient-to-r from-fuchsia-500 to-violet-600 px-1 text-[11px] font-bold text-white shadow-md shadow-violet-500/30 ring-2 ring-white"
                  >
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </motion.span>
                )}
              </motion.button>

              {/* Notification Popover Dropdown */}
              <AnimatePresence>
                {showNotifications && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowNotifications(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      className="absolute right-0 z-50 mt-2 w-80 rounded-2xl border border-violet-100 bg-white/95 p-4 shadow-[0_30px_70px_-20px_rgba(139,92,246,0.4)] backdrop-blur-xl sm:w-96"
                    >
                      {/* Dropdown Header */}
                      <div className="flex items-center justify-between border-b border-violet-100 pb-3">
                        <div className="flex items-center gap-2">
                          <h3 className="font-display text-sm font-semibold text-ink">
                            Notifications
                          </h3>
                          {unreadCount > 0 && (
                            <span className="rounded-full bg-violet-500/10 px-2 py-0.5 text-xs font-semibold text-violet-600">
                              {unreadCount} new
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {unreadCount > 0 && (
                            <button
                              onClick={markAllAsRead}
                              className="flex items-center gap-1 text-xs font-medium text-violet-600 hover:underline"
                            >
                              <Check size={12} /> Mark read
                            </button>
                          )}
                          {notifications.length > 0 && (
                            <button
                              onClick={clearAllNotifications}
                              className="text-xs text-graphite hover:text-red-500"
                              title="Clear all"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Notification Items List */}
                      <div className="modal-scroll mt-3 max-h-80 space-y-2 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="py-8 text-center">
                            <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-violet-50 text-violet-300">
                              <Bell size={18} />
                            </div>
                            <p className="text-xs font-medium text-graphite">No notifications yet</p>
                            <p className="mt-0.5 text-[11px] text-graphite/60">
                              New order alerts will pop up here in real-time.
                            </p>
                          </div>
                        ) : (
                          notifications.map((n) => (
                            <div
                              key={n.id}
                              onClick={() => handleNotificationClick(n)}
                              className={`group relative flex cursor-pointer items-start gap-3 rounded-xl p-3 transition-all ${
                                !n.read
                                  ? "border border-violet-200 bg-gradient-to-r from-violet-50 to-fuchsia-50/60"
                                  : "border border-black/5 hover:bg-violet-50/40"
                              }`}
                            >
                              {!n.read && (
                                <span className="absolute left-2 top-3.5 h-2 w-2 animate-pulse rounded-full bg-fuchsia-500" />
                              )}
                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 text-violet-600">
                                <ShoppingBag size={16} />
                              </div>

                              <div className="min-w-0 flex-1 pr-4">
                                <div className="flex items-center justify-between gap-1">
                                  <p className="truncate text-xs font-semibold text-ink">
                                    New Order #{n.orderNumber}
                                  </p>
                                  <span className="shrink-0 text-[10px] text-graphite">
                                    {new Date(n.createdAt).toLocaleTimeString([], {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                  </span>
                                </div>
                                <p className="mt-0.5 truncate text-xs text-graphite">
                                  {n.customerName} • {n.itemsCount} item{n.itemsCount !== 1 ? "s" : ""}
                                </p>
                                <p className="mt-1 text-xs font-semibold text-ink">
                                  ${n.total.toFixed(2)}
                                </p>
                              </div>

                              <button
                                onClick={(e) => removeNotification(n.id, e)}
                                className="rounded p-1 text-graphite opacity-0 transition-opacity hover:text-red-500 group-hover:opacity-100"
                                title="Dismiss"
                              >
                                <XIcon size={12} />
                              </button>
                            </div>
                          ))
                        )}
                      </div>

                      {/* Dropdown Footer */}
                      <div className="mt-3 border-t border-violet-100 pt-2 text-center">
                        <Link
                          to="/admin/orders"
                          onClick={() => setShowNotifications(false)}
                          className="inline-flex items-center gap-1 text-xs font-medium text-violet-600 hover:text-fuchsia-500"
                        >
                          View all orders <ChevronRight size={12} />
                        </Link>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Mobile secondary navigation */}
        <div className="flex gap-1 overflow-x-auto border-b border-violet-100 bg-white px-4 py-2 md:hidden">
          {LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) =>
                `whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  isActive ? "bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white" : "text-graphite"
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </div>

        {/* Main Route Content */}
        <main className="flex-1 p-5 sm:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function XIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  );
}