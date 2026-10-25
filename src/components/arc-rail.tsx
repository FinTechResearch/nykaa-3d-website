"use client";

import {
  useCallback,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import {
  animate,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useSpring,
  useTransform,
} from "framer-motion";
import { ChevronLeft, ChevronRight, Heart } from "lucide-react";
import { discount, type RailItem } from "@/lib/data";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ tuning
 * TOTAL_SPAN is kept just under 180° so every card stays in the front
 * hemisphere — past ±90° a card goes edge-on and disappears, which is
 * exactly what you want at the far edges of the curve.
 *
 * RADIUS vs card width: every card is a flat plane tangent to a cylinder of
 * radius R, so two neighbours' planes cross at R*tan(step/2) from a card's
 * centre. When that distance is smaller than the card's half-width the planes
 * intersect and the browser has to split them, which renders as cards slicing
 * through one another. With n=14 over 176°, step = 13.54° and tan(step/2) =
 * 0.1187, so the crossing sits at 0.1187*R. The old RADIUS of 760 put it at
 * 90px against a 132px product half-width — hence the slicing. RADIUS 1200
 * puts it at 142px, clear of the 132px half-width every card now shares
 * with ~8% to spare.
 *
 * perspective has to rise alongside RADIUS or the larger translateZ
 * magnifies every card: scale = p / (p - R). At p=1500 the front of the curve
 * reached 2.03x, making a 352px card render 714px tall — taller than the
 * stage, so the card body (title + price) was clipped away. p=3400 gives
 * 1.55x, i.e. 544px, which is what the stage has to clear (its responsive
 * classes are h-[480px] sm:h-[600px], sized against the 408px mobile and
 * 544px desktop front cards).
 */
const DRAG = 620; // px of horizontal drag = full sweep
const RADIUS = 1200; // cylinder radius in px — see the note above
const PERSPECTIVE = 3400; // px, paired with RADIUS for a 1.55x front card
const TOTAL_SPAN = 176; // degrees, adaptive: STEP = SPAN / (n - 1)

export function ArcRail({
  items,
  title,
  eyebrow,
}: {
  items: RailItem[];
  title: string;
  eyebrow?: string;
}) {
  const n = items.length;
  const step = n > 1 ? TOTAL_SPAN / (n - 1) : 0;

  // Park the rail on a whole card, not on the gap between two of them.
  const start = Math.floor((n - 1) / 2);
  const startX = n > 1 ? DRAG * (1 - (2 * start) / (n - 1)) : 0;

  const dragX = useMotionValue(startX);
  const eased = useSpring(useTransform(dragX, [-DRAG, DRAG], [1, 0]), {
    stiffness: 70,
    damping: 24,
    mass: 0.8,
  });
  // progress 0 (first card centred) -> 1 (last card centred) becomes
  // a rotation that brings that card round to face the camera.
  const rotateY = useTransform(eased, [0, 1], [TOTAL_SPAN / 2, -TOTAL_SPAN / 2]);

  const [active, setActive] = useState(start);
  useMotionValueEvent(eased, "change", (v) => {
    setActive(Math.round(v * (n - 1)));
  });

  const goto = useCallback(
    (i: number) => {
      if (n < 2) return;
      const c = Math.min(Math.max(i, 0), n - 1);
      animate(dragX, DRAG * (1 - (2 * c) / (n - 1)), {
        type: "spring",
        stiffness: 90,
        damping: 26,
      });
    },
    [dragX, n],
  );

  // Horizontal (trackpad) wheel only — vertical keeps flowing to Lenis.
  const onWheel = useMemo(
    () => (e: React.WheelEvent) => {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
      dragX.set(Math.min(Math.max(dragX.get() - e.deltaX, -DRAG), DRAG));
    },
    [dragX],
  );

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowRight") { e.preventDefault(); goto(active + 1); }
    if (e.key === "ArrowLeft") { e.preventDefault(); goto(active - 1); }
  };

  /* Pointer drag.
   *
   * This deliberately does *not* use framer-motion's `drag="x"`. That binds
   * dragX to the wrapper's `x`, composing to `translateX(dragX) rotateY(r)`,
   * and because the cards sit at z = R*cos(theta) the perspective magnifies
   * the translation by P/(P-R): the front card lands at
   *
   *     screen_x = P * dragX / (P - R) = 3400 * 47.7 / 2200 = 73.7px
   *
   * off-centre — measured to the pixel on both breakpoints, and enough to
   * shove the 306px mobile card past the stage's right edge. Omitting `x`
   * from style is no help: framer invents its own motion value and still
   * moves the element.
   *
   * The rotation already centres the active card on its own (screen_x = 0
   * whenever angle + rotateY = 0, which the eased mapping guarantees), so
   * the drag only needs to *write* dragX. Pointer handlers do exactly that,
   * matching the path onWheel and goto already take.
   */
  const drag = useRef<{ id: number; x0: number; base: number; moved: boolean } | null>(null);

  const onPointerDown = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      // Belt-and-braces with draggable={false} on the cards: if any child
      // still starts a native drag, pointercancel severs the stream.
      e.preventDefault();
      e.currentTarget.setPointerCapture(e.pointerId);
      drag.current = { id: e.pointerId, x0: e.clientX, base: dragX.get(), moved: false };
    },
    [dragX],
  );

  const onPointerMove = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      const d = drag.current;
      if (!d || d.id !== e.pointerId) return;
      const dx = e.clientX - d.x0;
      if (Math.abs(dx) > 3) d.moved = true;
      // Sign: goto(i) targets DRAG * (1 - 2i/(n-1)), which *falls* as i grows,
      // so advancing the rail needs dragX to decrease — i.e. base + dx, since
      // dragging left makes dx negative.
      dragX.set(Math.min(Math.max(d.base + dx, -DRAG), DRAG));
    },
    [dragX],
  );

  const onPointerUp = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      const d = drag.current;
      if (!d || d.id !== e.pointerId) return;
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
      drag.current = null;
      // A drag must not also fire the card's <a> navigation on release.
      if (!d.moved) return;
      e.preventDefault();
      // Snap to the nearest detent. A raw drag parks dragX wherever the
      // finger lifted, and since active is only *round(eased*(n-1))* the ring
      // can end up tracking a card that is still degrees away from facing the
      // camera — measured at 126px of screen offset after a full sweep. goto()
      // animates to the exact per-card value, so the drag now lands on a
      // detent exactly like the buttons and arrow keys already do.
      const easedNow = (DRAG - dragX.get()) / (2 * DRAG);
      goto(Math.min(Math.max(Math.round(easedNow * (n - 1)), 0), n - 1));
    },
    [dragX, goto, n],
  );

  return (
    <section
      data-testid="arc-css"
      id="brands"
      aria-roledescription="carousel"
      aria-label={title}
      className="relative scroll-mt-28 overflow-hidden bg-sunken py-14 sm:py-20"
    >
      {/* grounding glow — sells the "floating above a surface" read */}
      <div className="pointer-events-none absolute left-1/2 top-[58%] h-40 w-[78%] -translate-x-1/2 rounded-[100%] bg-ink/10 blur-[90px]" />

      <header className="relative mx-auto mb-6 flex max-w-[1400px] items-end justify-between gap-6 px-5 sm:px-8">
        <div>
          {eyebrow && (
            <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-wine">
              {eyebrow}
            </p>
          )}
          <h2 className="text-xl font-semibold tracking-tight text-ink sm:text-3xl">{title}</h2>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button
            onClick={() => goto(active - 1)}
            disabled={active === 0}
            aria-label="Previous"
            className="grid h-10 w-10 place-items-center rounded-full bg-white text-ink shadow-e1 transition-shadow hover:shadow-e3 disabled:pointer-events-none disabled:opacity-35"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={() => goto(active + 1)}
            disabled={active === n - 1}
            aria-label="Next"
            className="grid h-10 w-10 place-items-center rounded-full bg-white text-ink shadow-e1 transition-shadow hover:shadow-e3 disabled:pointer-events-none disabled:opacity-35"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* ---------------- the stage ---------------- */}
      <div
        role="group"
        tabIndex={0}
        onKeyDown={onKeyDown}
        onWheel={onWheel}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        style={{ perspective: PERSPECTIVE }}
        className="relative h-[480px] cursor-grab overflow-hidden outline-none
                   focus-visible:ring-2 focus-visible:ring-wine/40 active:cursor-grabbing
                   sm:h-[600px]"
      >
        <motion.div
          style={{ rotateY, transformStyle: "preserve-3d" }}
          className="absolute inset-0 touch-pan-y select-none"
        >
          {items.map((item, i) => {
            const t = Math.min(Math.abs(i - active), 8);
            const scale = 1 - t * 0.045;
            const opacity = Math.max(1 - t * 0.12, 0.32);
            const angle = (i - (n - 1) / 2) * step;
            const isBrand = item.kind === "brand";

            return (
              <a
                key={item.id}
                href={item.href}
                tabIndex={t <= 2 ? 0 : -1}
                aria-hidden={t > 3}
                onClick={(e) => {
                  if (i !== active) {
                    e.preventDefault();
                    goto(i);
                  }
                }}
                className={cn(
                  // Responsive box (pure CSS → SSR-safe). Shrinking the box
                  // is the right lever on narrow viewports: it lowers the
                  // on-screen size 1:1 while *increasing* the headroom under
                  // the crossing constraint, since half-width drops and R
                  // (which sets R·tan(step/2)) does not. Retuning PERSPECTIVE
                  // instead would have flattened the whole curve.
                  "absolute left-1/2 top-1/2 block overflow-hidden rounded-2xl bg-white",
                  "w-[198px] sm:w-[264px]",
                  isBrand ? "h-[112px] sm:h-[150px]" : "h-[264px] sm:h-[352px]",
                  "shadow-e2 will-change-transform",
                  i === active && "shadow-e3 ring-2 ring-wine/35",
                )}
                // Critical: an <a href> is draggable by default, so pressing
                // one starts the browser's native link-drag, which fires
                // pointercancel and severs the pointer stream after ~1 move.
                // That silently capped a 600px drag at ~25px of rotation.
                draggable={false}
                style={{
                  transform: `translate(-50%,-50%) rotateY(${angle}deg) translateZ(${RADIUS}px) scale(${scale})`,
                  opacity,
                  transition:
                    "transform .5s cubic-bezier(.22,1,.36,1), opacity .4s ease, box-shadow .3s ease, ring .3s ease",
                }}
              >
                {isBrand ? (
                  <BrandFace title={item.title} />
                ) : (
                  <ProductFace item={item} />
                )}
              </a>
            );
          })}
        </motion.div>
      </div>

      {/* ---------------- progress ---------------- */}
      <div className="relative mt-8 flex items-center justify-center gap-2">
        <span className="mr-2 text-[11px] font-medium tabular-nums text-mute">
          {String(active + 1).padStart(2, "0")} / {String(n).padStart(2, "0")}
        </span>
        {items.map((it, i) => (
          <button
            key={it.id}
            onClick={() => goto(i)}
            aria-label={`Go to item ${i + 1}`}
            className={cn(
              "h-1.5 rounded-full transition-all duration-300",
              i === active ? "w-6 bg-wine" : "w-1.5 bg-line hover:bg-mute",
            )}
          />
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ faces */
function ProductFace({ item }: { item: Extract<RailItem, { kind: "product" }> }) {
  return (
    <div className="flex h-full flex-col">
      <div className="relative h-[70%] shrink-0 overflow-hidden bg-surface">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={item.image}
          alt={item.title}
          draggable={false}
          loading="lazy"
          className="h-full w-full object-cover"
        />
        {item.tag && (
          <span className="absolute left-2 top-2 rounded bg-white/95 px-2 py-[3px] text-[10px] font-semibold text-wine shadow-e0">
            {item.tag}
          </span>
        )}
        <span className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-white/92 shadow-e0">
          <Heart className="h-3.5 w-3.5 text-ink" />
        </span>
      </div>

      <div className="flex flex-1 flex-col justify-center gap-1 px-3 py-2">
        <p className="truncate text-[13px] font-medium leading-snug text-ink">{item.title}</p>
        <p className="truncate text-[11px] text-mute">{item.sub}</p>
        <div className="mt-0.5 flex flex-wrap items-baseline gap-x-1.5">
          <span className="text-sm font-semibold text-ink">
            ₹{item.price.toLocaleString("en-IN")}
          </span>
          <span className="text-[11px] text-mute line-through">
            ₹{item.mrp.toLocaleString("en-IN")}
          </span>
          <span className="text-[11px] font-semibold text-save">
            {discount(item.price, item.mrp)}% off
          </span>
        </div>
      </div>
    </div>
  );
}

function BrandFace({ title }: { title: string }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 bg-white px-4 text-center">
      <span className="text-[9px] font-semibold uppercase tracking-[0.32em] text-mute">
        Official Store
      </span>
      <span className="text-[17px] font-semibold leading-tight tracking-tight text-ink">
        {title}
      </span>
      <span className="h-px w-8 bg-line" />
      <span className="text-[11px] font-semibold text-wine">Up to 60% off</span>
    </div>
  );
}
