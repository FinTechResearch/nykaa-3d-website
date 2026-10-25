"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronDown,
  Headphones,
  HelpCircle,
  Heart,
  Menu,
  Search,
  ShoppingBag,
  Smartphone,
  User,
  X,
} from "lucide-react";
import { megaMenu } from "@/lib/data";
import { cn } from "@/lib/utils";
import { scrollToSection, useShop } from "./shop";

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState<string | null>(null);
  const [mobile, setMobile] = useState(false);
  const [mobileSearch, setMobileSearch] = useState(false);
  const barRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const hovered = useRef<string | null>(null);

  const { cartCount, wishlistCount, query, setQuery, openPanel, notify } = useShop();

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 8);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  // Escape closes the mega menu; a click outside it closes it too. Without
  // this, the hover-only open had no keyboard or touch escape route.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
    };
    const onDown = (e: MouseEvent) => {
      if (barRef.current && !barRef.current.contains(e.target as Node)) setOpen(null);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onDown);
    };
  }, [open]);

  const go = (label: string) => {
    setOpen(null);
    setMobile(false);
    notify(`${label} — not part of this demo`);
  };

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    scrollToSection("edit");
  };

  return (
    <header className="sticky top-0 z-50">
      {/* announcement */}
      <div className="bg-ink text-white">
        <div className="mx-auto flex h-9 max-w-[1400px] items-center justify-between px-5 text-[12px] sm:px-8">
          <div className="flex items-center gap-5">
            <button
              onClick={() => notify("App download link is disabled in this demo")}
              className="hidden items-center gap-1.5 text-white/75 transition-colors hover:text-white sm:flex"
            >
              <Smartphone className="h-3.5 w-3.5" /> App Download
            </button>
            <button
              onClick={() => notify("Help centre is disabled in this demo")}
              className="flex items-center gap-1.5 text-white/75 transition-colors hover:text-white"
            >
              <HelpCircle className="h-3.5 w-3.5" /> Help
            </button>
          </div>
          {/* min-w-0 is required: as a flex child the <p> won't shrink below
              its content width without it, so `truncate` never engages and the
              copy overruns into "Help" on narrow viewports. */}
          <p className="min-w-0 truncate px-4 font-medium">
            Flat <span className="text-[#7bf7a5]">40–70% off</span> on festive edits · Extra 10%
            on first order
          </p>
          <button
            onClick={() => notify("24×7 support is disabled in this demo")}
            className="hidden items-center gap-1.5 text-white/75 transition-colors hover:text-white sm:flex"
          >
            <Headphones className="h-3.5 w-3.5" /> 24×7 Support
          </button>
        </div>
      </div>

      {/* main bar */}
      <div
        ref={barRef}
        className={cn(
          "border-b border-line bg-white/90 backdrop-blur-md transition-shadow duration-300",
          scrolled ? "shadow-e1" : "shadow-none",
        )}
        onMouseLeave={() => setOpen(null)}
      >
        <div className="mx-auto flex h-16 max-w-[1400px] items-center gap-6 px-5 sm:px-8">
          <button
            className="lg:hidden"
            aria-label={mobile ? "Close menu" : "Menu"}
            aria-expanded={mobile}
            onClick={() => setMobile((v) => !v)}
          >
            {mobile ? <X className="h-5 w-5 text-ink" /> : <Menu className="h-5 w-5 text-ink" />}
          </button>

          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="flex shrink-0 items-baseline gap-1.5 text-left"
          >
            <span className="text-[22px] font-bold leading-none tracking-tight text-ink">
              Nykaa
            </span>
            <span className="text-[15px] font-light leading-none tracking-[0.22em] text-wine">
              FASHION
            </span>
          </button>

          <nav className="hidden items-center gap-7 lg:flex">
            {megaMenu.map((m) => (
              <button
                key={m.label}
                onMouseEnter={() => {
                  hovered.current = m.label;
                  setOpen(m.label);
                }}
                onFocus={() => setOpen(m.label)}
                onClick={() => {
                  // The menu is already open because the pointer is hovering
                  // this trigger, so toggling here would shut the menu the
                  // instant it opens. Only treat the click as a toggle when it
                  // did *not* come from a hover — i.e. touch or keyboard.
                  if (hovered.current === m.label) return;
                  setOpen((v) => (v === m.label ? null : m.label));
                }}
                aria-expanded={open === m.label}
                aria-haspopup="true"
                className={cn(
                  "relative flex items-center gap-1 py-5 text-[14px] font-medium transition-colors",
                  open === m.label ? "text-wine" : "text-ink hover:text-wine",
                )}
              >
                {m.label}
                <ChevronDown
                  className={cn("h-3.5 w-3.5 transition-transform", open === m.label && "rotate-180")}
                />
                <span
                  className={cn(
                    "absolute -bottom-0 left-0 h-[2px] w-full origin-left bg-wine transition-transform duration-300",
                    open === m.label ? "scale-x-100" : "scale-x-0",
                  )}
                />
              </button>
            ))}
            <button
              onClick={() => scrollToSection("brands")}
              className="text-[14px] font-medium text-ink transition-colors hover:text-wine"
            >
              All Brands
            </button>
          </nav>

          <div className="ml-auto flex items-center gap-4">
            <form onSubmit={submitSearch} className="relative hidden items-center md:flex">
              <Search className="pointer-events-none absolute left-3 h-4 w-4 text-mute" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for sarees, sneakers, brands…"
                aria-label="Search products"
                className="h-10 w-64 rounded-lg border border-line bg-surface pl-9 pr-3 text-sm text-ink
                           placeholder:text-mute focus:w-80 focus:border-wine/40 focus:bg-white
                           focus:outline-none focus:ring-2 focus:ring-wine/15 transition-all duration-300"
              />
            </form>

            <button
              aria-label="Search"
              aria-expanded={mobileSearch}
              onClick={() => {
                setMobileSearch((v) => !v);
                setMobile(false);
                // Focus the field once it is on screen.
                setTimeout(() => searchRef.current?.focus(), 30);
              }}
              className="md:hidden"
            >
              <Search className="h-5 w-5 text-ink" />
            </button>
            <button
              aria-label="Account"
              onClick={() => openPanel("account")}
              className="hidden sm:block"
            >
              <User className="h-5 w-5 text-ink" />
            </button>
            <button aria-label="Wishlist" onClick={() => openPanel("wishlist")} className="relative">
              <Heart className="h-5 w-5 text-ink" />
              {wishlistCount > 0 && (
                <span className="absolute -right-1.5 -top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-hotpink px-1 text-[9px] font-bold text-white">
                  {wishlistCount}
                </span>
              )}
            </button>
            <button aria-label="Cart" onClick={() => openPanel("cart")} className="relative">
              <ShoppingBag className="h-5 w-5 text-ink" />
              {cartCount > 0 && (
                <span className="absolute -right-1.5 -top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-wine px-1 text-[9px] font-bold text-white">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* mobile search field */}
        <AnimatePresence>
          {mobileSearch && (
            <motion.form
              key="ms"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              onSubmit={submitSearch}
              className="overflow-hidden border-t border-line md:hidden"
            >
              <div className="relative flex items-center px-5 py-3">
                <Search className="pointer-events-none absolute left-5 h-4 w-4 text-mute" />
                <input
                  ref={searchRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search products…"
                  aria-label="Search products"
                  className="h-10 w-full rounded-lg border border-line bg-surface pl-9 pr-3 text-sm text-ink
                             placeholder:text-mute focus:border-wine/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-wine/15"
                />
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        {/* mega menu */}
        <AnimatePresence>
          {open && (
            <motion.div
              key={open}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
              className="absolute left-0 right-0 hidden border-b border-line bg-white shadow-e3 lg:block"
            >
              <div className="mx-auto grid max-w-[1400px] grid-cols-4 gap-8 px-8 py-8">
                {megaMenu
                  .find((m) => m.label === open)
                  ?.columns.map((col) => (
                    <div key={col.title}>
                      <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-wine">
                        {col.title}
                      </p>
                      <ul className="space-y-2">
                        {col.links.map((l) => (
                          <li key={l}>
                            <button
                              onClick={() => go(l)}
                              className="text-left text-sm text-ink/80 transition-colors hover:text-wine"
                            >
                              {l}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                <div className="rounded-xl bg-surface p-5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-mute">
                    Trending now
                  </p>
                  <p className="mt-2 text-lg font-semibold leading-snug text-ink">
                    Festive sparkle, up to 70% off
                  </p>
                  <button
                    onClick={() => {
                      setOpen(null);
                      scrollToSection("edit");
                    }}
                    className="mt-3 inline-flex rounded-full bg-wine px-4 py-2 text-xs font-semibold text-white transition-shadow hover:shadow-e2"
                  >
                    Shop the sale
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* mobile nav */}
        {mobile && (
          <div className="border-t border-line bg-white px-5 py-4 lg:hidden">
            <nav className="flex flex-col gap-3">
              {megaMenu.map((m) => (
                <button
                  key={m.label}
                  onClick={() => go(m.label)}
                  className="text-left text-sm font-medium text-ink"
                >
                  {m.label}
                </button>
              ))}
              <button
                onClick={() => {
                  setMobile(false);
                  scrollToSection("brands");
                }}
                className="text-left text-sm font-medium text-ink"
              >
                All Brands
              </button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
