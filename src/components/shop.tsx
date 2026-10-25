"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Heart, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { products, type Product } from "@/lib/data";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ types */
export type Panel = "cart" | "wishlist" | "account" | null;

type Line = { id: string; qty: number };
type Toast = { id: number; message: string };

type ShopValue = {
  cart: Line[];
  wishlist: string[];
  query: string;
  panel: Panel;
  cartCount: number;
  subtotal: number;
  wishlistCount: number;
  inWishlist: (id: string) => boolean;
  inCart: (id: string) => boolean;
  addToCart: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  removeFromCart: (id: string) => void;
  toggleWishlist: (id: string) => void;
  setQuery: (q: string) => void;
  openPanel: (p: Panel) => void;
  notify: (message: string) => void;
};

const ShopCtx = createContext<ShopValue | null>(null);

export function useShop(): ShopValue {
  const v = useContext(ShopCtx);
  if (!v) throw new Error("useShop must be used inside <ShopProvider>");
  return v;
}

/* --------------------------------------------------------------- helpers */
const BY_ID = new Map(products.map((p) => [p.id, p]));
const byId = (id: string): Product | undefined => BY_ID.get(id);

/**
 * Smooth-scroll to a section. Prefers Lenis (which honours the target's
 * `scroll-mt-*`) and falls back to native scrolling if it hasn't mounted yet.
 * Mirrors the cast style used in smooth-scroll.tsx.
 */
export function scrollToSection(id: string) {
  if (typeof document === "undefined") return;
  const el = document.getElementById(id);
  if (!el) return;
  const w = window as unknown as {
    lenis?: { scrollTo: (t: Element | string | number) => void };
  };
  if (w.lenis) w.lenis.scrollTo(el);
  else el.scrollIntoView({ behavior: "smooth" });
}

export const money = (n: number) => `₹${n.toLocaleString("en-IN")}`;

/* -------------------------------------------------------------- provider */
export function ShopProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Line[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [panel, setPanel] = useState<Panel>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const notify = useCallback((message: string) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, message }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2800);
  }, []);

  const addToCart = useCallback(
    (id: string) => {
      const p = byId(id);
      setCart((c) => {
        const hit = c.find((l) => l.id === id);
        return hit
          ? c.map((l) => (l.id === id ? { ...l, qty: l.qty + 1 } : l))
          : [...c, { id, qty: 1 }];
      });
      notify(p ? `Added ${p.name} to bag` : "Added to bag");
    },
    [notify],
  );

  const setQty = useCallback((id: string, qty: number) => {
    setCart((c) =>
      qty <= 0
        ? c.filter((l) => l.id !== id)
        : c.map((l) => (l.id === id ? { ...l, qty } : l)),
    );
  }, []);

  const removeFromCart = useCallback(
    (id: string) => {
      setCart((c) => c.filter((l) => l.id !== id));
      const p = byId(id);
      notify(p ? `Removed ${p.name}` : "Removed from bag");
    },
    [notify],
  );

  const toggleWishlist = useCallback(
    (id: string) => {
      setWishlist((w) => (w.includes(id) ? w.filter((x) => x !== id) : [...w, id]));
      const p = byId(id);
      const adding = !wishlist.includes(id);
      notify(p ? `${adding ? "Saved" : "Removed"} ${p.name}` : "Wishlist updated");
    },
    [notify, wishlist],
  );

  const value = useMemo<ShopValue>(
    () => ({
      cart,
      wishlist,
      query,
      panel,
      cartCount: cart.reduce((n, l) => n + l.qty, 0),
      wishlistCount: wishlist.length,
      subtotal: cart.reduce((n, l) => n + (byId(l.id)?.price ?? 0) * l.qty, 0),
      inWishlist: (id) => wishlist.includes(id),
      inCart: (id) => cart.some((l) => l.id === id),
      addToCart,
      setQty,
      removeFromCart,
      toggleWishlist,
      setQuery,
      openPanel: setPanel,
      notify,
    }),
    [cart, wishlist, query, panel, addToCart, setQty, removeFromCart, toggleWishlist, notify],
  );

  return (
    <ShopCtx.Provider value={value}>
      {children}
      <ShopPanels />
      <Toaster toasts={toasts} />
    </ShopCtx.Provider>
  );
}

/* ---------------------------------------------------------------- toaster */
function Toaster({ toasts }: { toasts: Toast[] }) {
  return (
    <div
      aria-live="polite"
      aria-atomic="false"
      className="pointer-events-none fixed bottom-4 right-4 z-[80] flex w-[min(20rem,calc(100vw-2rem))] flex-col gap-2"
    >
      <AnimatePresence initial={false}>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            layout
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
            className="pointer-events-auto flex items-center gap-2.5 rounded-xl bg-ink px-3.5 py-2.5 text-[13px] text-white shadow-e3"
          >
            <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[#7bf7a5]">
              <svg viewBox="0 0 12 12" className="h-3 w-3" aria-hidden="true">
                <path
                  d="M2.5 6.4 4.8 8.7 9.5 4"
                  fill="none"
                  stroke="#001325"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <span className="min-w-0 flex-1 truncate">{t.message}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

/* ----------------------------------------------------------------- panels */
function ShopPanels() {
  const { panel, openPanel } = useShop();
  return (
    <>
      <CartPanel open={panel === "cart"} onOpenChange={(o) => openPanel(o ? "cart" : null)} />
      <WishlistPanel open={panel === "wishlist"} onOpenChange={(o) => openPanel(o ? "wishlist" : null)} />
      <AccountPanel open={panel === "account"} onOpenChange={(o) => openPanel(o ? "account" : null)} />
    </>
  );
}

function PanelFrame({
  title,
  subtitle,
  onGoShopping,
}: {
  title: string;
  subtitle?: string;
  onGoShopping: () => void;
}) {
  return (
    <header className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
      <div>
        <h2 className="text-base font-semibold text-ink">{title}</h2>
        {subtitle && <p className="mt-0.5 text-[12px] text-mute">{subtitle}</p>}
      </div>
      <button
        onClick={onGoShopping}
        className="shrink-0 rounded-full px-3 py-1.5 text-[12px] font-medium text-mute transition-colors hover:bg-surface hover:text-ink"
      >
        Shop
      </button>
    </header>
  );
}

function Empty({ icon, text }: { icon: ReactNode; text: string }) {
  return (
    <div className="flex flex-col items-center gap-3 px-5 py-14 text-center">
      <span className="grid h-12 w-12 place-items-center rounded-full bg-surface text-mute">
        {icon}
      </span>
      <p className="text-sm text-mute">{text}</p>
    </div>
  );
}

function Thumb({ p, size = 56 }: { p: Product; size?: number }) {
  return (
    <span
      className="relative block shrink-0 overflow-hidden rounded-lg bg-surface"
      style={{ width: size, height: Math.round((size * 4) / 3) }}
    >
      <Image src={p.image} alt="" fill sizes={`${size}px`} className="object-cover" />
    </span>
  );
}

function CartPanel({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const { cart, subtotal, cartCount, setQty, removeFromCart, notify, openPanel } = useShop();

  return (
    <CartDialog open={open} onOpenChange={onOpenChange}>
      <PanelFrame
        title="Your bag"
        subtitle={cartCount ? `${cartCount} item${cartCount > 1 ? "s" : ""}` : "Nothing here yet"}
        onGoShopping={() => {
          onOpenChange(false);
          scrollToSection("edit");
        }}
      />
      {cart.length === 0 ? (
        <Empty icon={<ShoppingBag className="h-5 w-5" />} text="Your bag is empty." />
      ) : (
        <>
          <ul className="max-h-[46vh] divide-y divide-line overflow-y-auto px-5">
            {cart.map((l) => {
              const p = byId(l.id);
              if (!p) return null;
              return (
                <li key={l.id} className="flex gap-3 py-3.5">
                  <Thumb p={p} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-medium text-ink">{p.name}</p>
                    <p className="mt-0.5 text-[11px] uppercase tracking-wide text-mute">{p.brand}</p>
                    <div className="mt-2 flex items-center gap-3">
                      <span className="flex items-center rounded-full border border-line">
                        <button
                          aria-label={`Decrease ${p.name} quantity`}
                          onClick={() => setQty(p.id, l.qty - 1)}
                          className="grid h-7 w-7 place-items-center rounded-full text-ink transition-colors hover:bg-surface"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="w-6 text-center text-[13px] tabular-nums text-ink">{l.qty}</span>
                        <button
                          aria-label={`Increase ${p.name} quantity`}
                          onClick={() => setQty(p.id, l.qty + 1)}
                          className="grid h-7 w-7 place-items-center rounded-full text-ink transition-colors hover:bg-surface"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </span>
                      <span className="text-[13px] font-semibold text-ink">{money(p.price * l.qty)}</span>
                    </div>
                  </div>
                  <button
                    aria-label={`Remove ${p.name}`}
                    onClick={() => removeFromCart(p.id)}
                    className="h-7 w-7 shrink-0 place-items-center rounded-full text-mute transition-colors hover:bg-surface hover:text-wine"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              );
            })}
          </ul>
          <footer className="mt-auto border-t border-line px-5 py-4">
            <div className="mb-3 flex items-center justify-between text-sm">
              <span className="text-mute">Subtotal</span>
              <span className="font-semibold text-ink">{money(subtotal)}</span>
            </div>
            <button
              onClick={() => {
                notify("Checkout is disabled in this demo");
                onOpenChange(false);
              }}
              className="w-full rounded-lg bg-ink py-3 text-sm font-semibold text-white shadow-e1 transition-shadow hover:shadow-e3"
            >
              Checkout
            </button>
            <button
              onClick={() => {
                onOpenChange(false);
                openPanel("wishlist");
              }}
              className="mt-2 w-full rounded-lg border border-line py-2.5 text-[13px] font-medium text-ink transition-colors hover:bg-surface"
            >
              View wishlist
            </button>
          </footer>
        </>
      )}
    </CartDialog>
  );
}

function WishlistPanel({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const { wishlist, toggleWishlist, addToCart } = useShop();

  return (
    <CartDialog open={open} onOpenChange={onOpenChange}>
      <PanelFrame
        title="Wishlist"
        subtitle={wishlist.length ? `${wishlist.length} saved` : "Save items for later"}
        onGoShopping={() => {
          onOpenChange(false);
          scrollToSection("edit");
        }}
      />
      {wishlist.length === 0 ? (
        <Empty icon={<Heart className="h-5 w-5" />} text="Nothing saved yet." />
      ) : (
        <ul className="max-h-[52vh] divide-y divide-line overflow-y-auto px-5">
          {wishlist.map((id) => {
            const p = byId(id);
            if (!p) return null;
            return (
              <li key={id} className="flex items-center gap-3 py-3.5">
                <Thumb p={p} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-medium text-ink">{p.name}</p>
                  <p className="mt-0.5 text-[12px] font-semibold text-ink">{money(p.price)}</p>
                  <button
                    onClick={() => {
                      addToCart(p.id);
                      toggleWishlist(p.id);
                    }}
                    className="mt-1.5 text-[12px] font-semibold text-wine hover:underline"
                  >
                    Move to bag
                  </button>
                </div>
                <button
                  aria-label={`Remove ${p.name} from wishlist`}
                  onClick={() => toggleWishlist(p.id)}
                  className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-mute transition-colors hover:bg-surface hover:text-wine"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </CartDialog>
  );
}

function AccountPanel({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const { notify } = useShop();
  const links = ["Orders", "Addresses", "Coupons", "Gift cards", "Sign out"];

  return (
    <CartDialog open={open} onOpenChange={onOpenChange}>
      <header className="border-b border-line px-5 py-4">
        <h2 className="text-base font-semibold text-ink">Your account</h2>
      </header>
      <div className="px-5 py-5">
        <label className="block text-[12px] font-medium text-ink">
          Email or phone
          <input
            type="text"
            placeholder="you@example.com"
            className="mt-1.5 h-10 w-full rounded-lg border border-line bg-surface px-3 text-sm text-ink placeholder:text-mute focus:border-wine/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-wine/15"
          />
        </label>
        <button
          onClick={() => notify("Sign-in is disabled in this demo")}
          className="mt-3 w-full rounded-lg bg-ink py-3 text-sm font-semibold text-white shadow-e1 transition-shadow hover:shadow-e3"
        >
          Sign in
        </button>
      </div>
      <ul className="divide-y divide-line border-t border-line">
        {links.map((l) => (
          <li key={l}>
            <button
              onClick={() => notify(`${l} is disabled in this demo`)}
              className="w-full px-5 py-3 text-left text-[13px] text-ink transition-colors hover:bg-surface"
            >
              {l}
            </button>
          </li>
        ))}
      </ul>
    </CartDialog>
  );
}

/* Radix Dialog, restyled as a right-hand drawer. */
function CartDialog({
  open,
  onOpenChange,
  children,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  children: ReactNode;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="left-auto right-0 top-0 h-full max-h-none w-[min(24rem,100vw)] translate-x-0 translate-y-0
                   gap-0 rounded-none rounded-l-2xl border-0 p-0 sm:max-w-[24rem]
                   data-open:slide-in-from-right data-closed:slide-out-to-right"
      >
        <DialogTitle className="sr-only">Shop panel</DialogTitle>
        <DialogDescription className="sr-only">
          Review the items in your bag or wishlist.
        </DialogDescription>
        <div className={cn("flex h-full flex-col overflow-hidden bg-white")}>{children}</div>
      </DialogContent>
    </Dialog>
  );
}
