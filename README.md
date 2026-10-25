# Nykaa Fashion — 3D Shadow Rebuild

A recreation of [nykaafashion.com](https://www.nykaafashion.com/) built with a
modern **Flipkart-style elevated-shadow / 3D** aesthetic, plus the signature
feature: a **3D curved horizontal rail showing products and brands together**.

> **Not affiliated with Nykaa.** This is a design/engineering demo. Product
> photography is from Unsplash and is used as placeholder imagery.

---

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
```

```bash
npm run lint
npx tsc --noEmit
npm run build && npm start
```

---

## Stack

| Concern | Tool |
| --- | --- |
| Framework | Next.js 16 (App Router, Turbopack, TS, `src/`) |
| Styling | Tailwind v4 + shadcn/ui (radix base) |
| Motion | `framer-motion` (springs, drag, `useAnimationFrame`) |
| Scroll | `lenis` (smooth scroll) + `gsap` / `ScrollTrigger` (reveals) |
| 3D | `three` + `@react-three/fiber` + `@react-three/drei` |

---

## What's on the page

```
SiteHeader        announcement strip · sticky bar · mega-menu · mobile nav
Hero              cross-fading carousel, Ken-Burns zoom, story-style progress
TrustStrip        four service promises
CategoryRail      10 circular category tiles, scroll-snapped, hover-lift
Editorial         6 occasion tiles + an "Explore More" promo tile
ArcRail (CSS 3D)  ← the signature rail, implementation A
ProductGrid       28 products, category filters, tilt cards
ArcRail (WebGL)   ← the same rail, implementation B (React Three Fiber)
SiteFooter        4 link columns, payment chips, client-side year
```

Everything is wrapped in `<SmoothScroll>` (Lenis + GSAP ticker) in
`src/app/layout.tsx`.

---

## The 3D card system

### 1. A shared elevation scale

`src/app/globals.css` ships a Tailwind v4 `@theme` block with a five-step
shadow scale. Every step is a **two-stop shadow** — a tight, dark inner shadow
for contact plus a wide, soft outer one for lift. That pairing is what makes
shadows read as *depth* rather than as a grey blur.

```css
--shadow-e0: 0 1px 2px rgb(17 19 20 / 0.06);
--shadow-e1: 0 2px 4px -2px rgb(17 19 20 / 0.12), 0 2px 8px rgb(17 19 20 / 0.12);
--shadow-e2: 0 2px 8px -2px rgb(17 19 20 / 0.16), 0 8px 24px -2px rgb(17 19 20 / 0.08);
--shadow-e3: 0 8px 16px -4px rgb(17 19 20 / 0.18), 0 24px 48px -8px rgb(17 19 20 / 0.16);
--shadow-e4: 0 16px 32px -8px rgb(17 19 20 / 0.22), 0 40px 80px -12px rgb(17 19 20 / 0.20);
```

`e1`/`e2` are the values Nykaa actually ships in production CSS; `e3`/`e4` are
reserved for hover and for the rail.

**Rule of thumb: cards must be `bg-white` on `bg-sunken`.** A white card on a
white page has nothing for its shadow to fall onto, so the whole system is
invisible. `bg-sunken` is `#f3f4f5`, `bg-surface` is `#f9fafa`.

The palette (`--color-ink`, `--color-wine`, `--color-hotpink`, `--color-mute`,
`--color-save`, …) is also in `globals.css`, as are the matching shadcn
`--primary` / `--muted` / `--border` variables.

### 2. `TiltCard` — the DOM card

`src/components/tilt-card.tsx`

Three layers do the work:

1. `shadow-e2 → shadow-e4` on hover (elevation)
2. `rotateX` / `rotateY` springs under `perspective` (physical tilt)
3. a radial "specular" layer that follows the pointer (material)

The inner content sits in a `translateZ(38px)` island so it lifts off the card
face rather than riding the tilt — that parallax is what sells the depth.

---

## The arc rail

The same 14-item list of interleaved products and brands is rendered twice.

### A. `ArcRail` — CSS 3D (default)

`src/components/arc-rail.tsx`

A real CSS cylinder. Each card is placed with

```css
transform: translate(-50%,-50%) rotateY(θ) translateZ(R) scale(k);
```

and the parent carries `transform-style: preserve-3d` plus a `rotateY` driven by
a framer-motion spring, which is itself the transform of the drag position.

**Transform order matters.** `translate(-50%,-50%)` must come first, then
`rotateY`, then `translateZ(R)`. Swap any of them and the cylinder axis drifts
off-centre and the arc visibly wobbles.

**Geometry.** Cards are tangent planes on a cylinder, so two neighbours' planes
cross at `R·tan(STEP/2)`. Interpenetration (which renders as cards slicing
through each other) is exactly the case `R·tan(STEP/2) < halfWidth`. With
`n = 14` over 176°, `STEP = 13.54°` and `tan(STEP/2) = 0.1187`, so the crossing
sits at `0.1187·R`: `RADIUS = 1200` puts it at 142px against a 132px card
half-width. `PERSPECTIVE = 3400` is paired with that radius to hold the front
card's magnification `P/(P−R)` to 1.55× — a 352px card renders 544px, which is
what the stage has to clear.

**Responsive sizing.** The card box scales at the `sm` breakpoint (`198×264` →
`264×352`) rather than the perspective being retuned. Shrinking the box lowers
the on-screen size 1:1 while *increasing* headroom under the crossing
constraint, since half-width drops and `R` does not; flattening `PERSPECTIVE`
for mobile would have cost the curve its depth everywhere.

**No `x` on the wrapper.** The drag writes a motion value that only feeds
`rotateY`; it is deliberately *not* bound to the wrapper's `x`. Binding it
composes to `translateX(dragX) rotateY(θ)`, and because the cards sit at
`z = R·cos θ` the perspective magnifies that translation by `P/(P−R)` — the
front card lands `P·dragX/(P−R)` ≈ 74px off-centre (measured), which on a
390px viewport is enough to clip the price row off the card. Rotation alone
centres the active card, since `screen_x = 0` whenever `θ_card + θ_wrap = 0`.

- `TOTAL_SPAN` is fixed at **176°** and `STEP = 176° / (n - 1)`, so the arc is
  always just under a half-circle regardless of how many items you pass in.
  Past ±90° a card turns edge-on and disappears — which is exactly what you want
  at the far edges of the curve, and why 176° is the number.
- Drag, arrow keys, prev/next buttons, dots, and horizontal trackpad wheel all
  drive the same motion value. Vertical wheel is deliberately left alone so it
  keeps flowing to Lenis.
- **Pointer drag is hand-rolled, not framer's `drag`.** Two reasons: framer
  can't write `dragX` without also translating the element (see above), and an
  `<a href>` is natively draggable, so pressing a card starts the browser's
  link-drag, fires `pointercancel`, and severs the pointer stream after ~1 move
  — which silently capped a 600px drag at ~25px. The cards set
  `draggable={false}`, the handler `preventDefault()`s on pointerdown, and
  release snaps to the nearest detent via `goto()` so the rail never parks
  between cards (a mid-detent rest leaves the ring on a card that is still
  degrees from facing the camera — 126px of visible offset).
- Depth sorting is left to the browser. Setting `z-index` inside a
  `preserve-3d` context fights the 3D sort, so the cards don't set one.

> `overflow: hidden` on an element that also has `transform-style: preserve-3d`
> computes to `flat` and silently kills the whole effect. The `overflow-hidden`
> clipping lives on the *stage* (which owns `perspective`); the card container
> that carries `preserve-3d` has no overflow.

No GPU cost, crisp text, real links, fully keyboard-accessible. This is the one
you'd ship everywhere.

### B. `ArcRail3D` — React Three Fiber

`src/components/arc-rail-3d.tsx`, loaded through `src/components/lazy-arc-3d.tsx`

The same geometry in WebGL: cards on a cylinder of radius `R`, the whole group
rotating against **page scroll position**, so the arc scrubs as you scroll. A
baked studio environment lights the card faces and `ContactShadows` grounds the
row.

A few things worth knowing:

- **`useFrame` must live inside `<Canvas>`.** It reads from the Canvas store and
  throws `R3F: Hooks can only be used within the Canvas component!` if called in
  the component that merely *contains* `<Canvas>`. Hence the separate `<Scene>`
  component.
- **The environment is built in-scene** with `<Lightformer>` children rather than
  `preset="studio"`, because the presets fetch an HDR from a CDN at runtime.
  Nothing here touches the network.
- **Brand faces are drawn to a 2D canvas** (`CanvasTexture`) so no webfont is
  ever fetched.
- **Textures are configured via drei's `onLoad` callback**, not by mutating the
  hook's return value — React Compiler's `react-hooks/immutability` rule rejects
  `tex.colorSpace = …` even inside an effect, and the callback (a layout effect
  inside drei) runs before three uploads the texture to the GPU.
- It is loaded with `dynamic(..., { ssr: false })`. `next build` prerenders this
  page, and a WebGL call during SSG is how you get a `window is not defined`
  build failure.
- Falls back to a plain horizontal scroller if `WebGLRenderingContext` is
  missing. The probe deliberately does **not** call `getContext("webgl")` — that
  would burn one of the browser's ~16 live contexts before the real one exists.

---

## Shop state — making the chrome actually work

`src/components/shop.tsx`

The header and footer are where a static mock-up falls apart fastest: badge
counters, magnifiers and account glyphs that do nothing. `ShopProvider` (mounted
once in `page.tsx`) holds the state that lets those controls do real work:

- **Bag / wishlist** open side panels built on the shadcn `dialog`, so focus
  trapping, `Escape`, and the scrim come from Radix rather than being
  hand-rolled. Lines carry a quantity stepper, and the header badges read from
  `cartCount` / `wishlistCount` instead of hardcoded digits.
- **Search** writes to context and `ProductGrid` filters name + brand +
  category against it, so submitting the field actually narrows the grid and
  scrolls to it.
- **Toasts** (`aria-live="polite"`) cover the destinations that don't exist in a
  single-page demo — footer stubs, account actions, checkout. They're
  deliberately explicit ("not part of this demo") rather than silently doing
  nothing, which is what the old `href="#"` did.

Three bugs worth remembering, all found by measuring rather than by looking:

- **Hover-open + click-toggle fights itself.** The mega menu opened on
  `mouseenter` but also toggled on `click`, so on desktop it opened and closed
  within one gesture. A `hovered` ref now tells the click handler whether the
  menu was already open from a hover; only touch and keyboard toggle.
- **`TiltCard` moved its own buttons out from under the cursor.** The tilt is a
  feedback loop — moving the card changes the cursor's relative position, which
  changes the tilt again — settling around 16px of displacement. On a 32px heart
  button that is more than half the target. `onPointerMove`/`onPointerEnter` now
  neutralise the tilt whenever the pointer is over an interactive child.
- **`preserve-3d` on the card content island broke hit-testing.** None of the
  island's children have 3D transforms, so `preserve-3d` bought nothing
  visually, but it placed the overlay controls inside a 3D sorting context where
  Chromium's *input* hit-testing disagreed with `elementFromPoint` — a real click
  at the exact centre of the heart resolved to the full-bleed button underneath
  it, while a synthetic `.click()` on the same element worked fine. Dropping
  `preserve-3d` keeps the `translateZ` lift and makes hit-testing deterministic.

The product card was restructured too: the wishlist `<button>` used to be nested
*inside* an `<a href="#">`, which is invalid HTML and leaves the anchor and the
button competing for the same click target. It's an `<article>` now, with the
heart and "Add to bag" as sibling buttons.

---

## Notes on the implementation

A few Next.js 16 / React 19 specifics that cost time and are easy to re-hit:

- **`new Date()` in a server component** fails prerendering with *"unstable
  value"*. Reading it in an effect instead triggers a lint error
  (`react-hooks/set-state-in-effect`). `src/components/year.tsx` resolves it with
  `useSyncExternalStore`, whose server snapshot is a constant.
- **shadcn v5's `-b` flag is now the component base** (`radix` / `base` /
  `aria`), not a colour preset. Colours come from `-p`.
- **`--font-sans: var(--font-sans)`** (shadcn's generated theme) is circular and
  silently drops the whole page to Times. Point it at Next's font variable:
  `--font-sans: var(--font-geist-sans)`.
- **Lenis `smoothWheel` and a horizontal rail share the page carefully.** The
  CSS rail only consumes `deltaX` and returns early when `|deltaX| <= |deltaY|`,
  so vertical wheel keeps flowing to Lenis instead of being swallowed. Its
  pointer drag uses `setPointerCapture`, which also keeps a drag that leaves the
  stage from re-triggering scroll.
- **Lenis 1.3's `anchors: true` double-scrolls.** Its `onClick` calls
  `scrollTo(hash)` but never `preventDefault()`, so the browser *also* performs
  the native jump, and the page snaps back after the ease. The smooth-scroll
  provider instead registers its own bubble-phase click handler that
  `preventDefault()`s, does `history.replaceState`, and calls
  `lenis.scrollTo(target)`. Landing offset comes from the sections' `scroll-mt-*`
  — Lenis reads `scroll-margin-top` off the target, so passing a JS offset too
  applies it twice.

## Design source

The section map (announcement strip → header/mega-menu → hero → category rail →
editorial blocks → SEO blocks → footer) and the shadow values were taken from
the live site. Nykaa itself has no real 3D today — it's flat CSS with layered
shadows — so the depth here is an *addition*, not a recreation. The PLP and PDP
are intentionally left in the DOM; WebGL is confined to a single showcase rail.

## Extending

- **Swap in real brand logos.** `BrandFace` currently renders a typographic
  wordmark, and the WebGL twin draws the same thing to a canvas. Both take a
  single `title` string — point them at a `/public/brands/*.svg` instead.
- **Add a product page.** The cards already render as real `<a>` elements with
  `href`s; wire them to an `/product/[id]` route and the tilt + elevation will
  carry straight over.
- **Swap in `Lenis` + `ScrollTrigger` for the WebGL scrub.** The arc currently
  reads `getBoundingClientRect()` in `useFrame`; a `ScrollTrigger` proxy would
  be more precise on very tall sections.
