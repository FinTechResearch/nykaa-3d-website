"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { Heart, ShoppingBag, Star, X } from "lucide-react";
import { discount, products } from "@/lib/data";
import { TiltCard } from "./tilt-card";
import { Reveal } from "./reveal";
import { cn } from "@/lib/utils";
import { money, useShop } from "./shop";

const FILTERS = ["All", "Indianwear", "Westernwear", "Footwear", "Jewellery", "Watches"];

export function ProductGrid() {
  const [filter, setFilter] = useState("All");
  const { query, setQuery, inWishlist, addToCart, toggleWishlist, notify } = useShop();

  const q = query.trim().toLowerCase();

  const list = useMemo(() => {
    let out = filter === "All" ? products : products.filter((p) => p.category === filter);
    if (q) {
      out = out.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q),
      );
    }
    return out;
  }, [filter, q]);

  return (
    <section id="edit" className="scroll-mt-28 bg-sunken py-14 sm:py-20">
      <div className="mx-auto max-w-[1400px] px-5 sm:px-8">
        <Reveal className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-wine">
              Iconic Brands, Unreal Savings
            </p>
            <h2 className="text-xl font-semibold tracking-tight text-ink sm:text-3xl">
              {q ? `Results for “${query.trim()}”` : "Trending this week"}
            </h2>
          </div>

          <div className="flex flex-col items-start gap-3 sm:items-end">
            <div className="no-scrollbar -mx-5 flex max-w-full gap-2 overflow-x-auto px-5 sm:mx-0 sm:px-0">
              {FILTERS.map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  aria-pressed={filter === f}
                  className={cn(
                    "shrink-0 rounded-full border px-4 py-2 text-[13px] font-medium transition-all duration-200",
                    filter === f
                      ? "border-ink bg-ink text-white shadow-e2"
                      : "border-line bg-white text-ink hover:shadow-e1",
                  )}
                >
                  {f}
                </button>
              ))}
            </div>

            {q && (
              <button
                onClick={() => setQuery("")}
                className="flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-[12px] text-mute shadow-e1 transition-colors hover:text-ink"
              >
                <X className="h-3.5 w-3.5" /> Clear search
              </button>
            )}
          </div>
        </Reveal>

        <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
          {list.map((p, i) => {
            const saved = inWishlist(p.id);
            return (
              <Reveal key={p.id} delay={Math.min(i, 5) * 0.05} y={30}>
                <TiltCard className="h-full">
                  {/* Not an <a>: a <button> may not live inside an <a>, and the
                      card's controls each need their own click target. */}
                  <article className="group relative flex h-full flex-col overflow-hidden rounded-xl bg-white shadow-e1 transition-shadow hover:shadow-e3">
                    <div className="relative aspect-[3/4] w-full overflow-hidden bg-surface">
                      <button
                        onClick={() => notify(`${p.name} — product page not part of this demo`)}
                        className="block h-full w-full"
                        aria-label={`View ${p.name}`}
                      >
                        <Image
                          src={p.image}
                          alt={p.name}
                          fill
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 320px"
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </button>

                      {p.tag && (
                        <span className="absolute left-2 top-2 rounded bg-white/95 px-2 py-[3px] text-[10px] font-semibold text-wine shadow-e0">
                          {p.tag}
                        </span>
                      )}

                      <button
                        onClick={() => toggleWishlist(p.id)}
                        aria-label={saved ? `Remove ${p.name} from wishlist` : `Save ${p.name}`}
                        aria-pressed={saved}
                        className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full
                                   bg-white/92 shadow-e0 transition-all duration-200 hover:scale-110 hover:shadow-e2"
                      >
                        <Heart
                          className={cn(
                            "h-4 w-4 transition-colors",
                            saved ? "fill-hotpink text-hotpink" : "text-ink",
                          )}
                        />
                      </button>
                    </div>

                    <div className="flex flex-1 flex-col gap-1 p-3 sm:p-4">
                      <p className="text-[11px] font-medium uppercase tracking-wide text-mute">
                        {p.brand}
                      </p>
                      <button
                        onClick={() => notify(`${p.name} — product page not part of this demo`)}
                        className="line-clamp-1 text-left text-[13px] font-medium text-ink transition-colors hover:text-wine sm:text-sm"
                      >
                        {p.name}
                      </button>
                      <div className="flex items-center gap-1 text-[11px] text-mute">
                        <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                        {p.rating}
                      </div>
                      <div className="mt-auto flex flex-wrap items-baseline gap-x-1.5 pt-2">
                        <span className="text-[15px] font-semibold text-ink">{money(p.price)}</span>
                        <span className="text-[11px] text-mute line-through">
                          {money(p.mrp)}
                        </span>
                        <span className="text-[11px] font-semibold text-save">
                          {discount(p.price, p.mrp)}% off
                        </span>
                      </div>

                      <button
                        onClick={() => addToCart(p.id)}
                        className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg
                                   border border-line py-2 text-[12px] font-semibold text-ink
                                   transition-colors hover:border-ink hover:bg-ink hover:text-white"
                      >
                        <ShoppingBag className="h-3.5 w-3.5" /> Add to bag
                      </button>
                    </div>
                  </article>
                </TiltCard>
              </Reveal>
            );
          })}
        </div>

        {list.length === 0 && (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <p className="text-sm text-mute">
              {q ? <>Nothing matches “{query.trim()}”.</> : "Nothing in this edit yet."}
            </p>
            <button
              onClick={() => {
                setFilter("All");
                setQuery("");
              }}
              className="rounded-full border border-line bg-white px-4 py-2 text-[13px] font-medium text-ink shadow-e1 transition-colors hover:shadow-e2"
            >
              Reset filters
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
