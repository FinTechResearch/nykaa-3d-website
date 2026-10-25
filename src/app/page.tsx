import { SiteHeader } from "@/components/site-header";
import { Hero, TrustStrip } from "@/components/hero";
import { CategoryRail } from "@/components/category-rail";
import { Editorial } from "@/components/editorial";
import { ArcRail } from "@/components/arc-rail";
import { ProductGrid } from "@/components/product-grid";
import ArcRail3D from "@/components/lazy-arc-3d";
import { SiteFooter } from "@/components/site-footer";
import { Reveal } from "@/components/reveal";
import { ShopProvider } from "@/components/shop";
import { railItems } from "@/lib/data";

export default function Home() {
  return (
    <ShopProvider>
      <SiteHeader />

      <main>
        <Hero />
        <TrustStrip />
        <CategoryRail />
        <Editorial />

        {/* 1 — CSS 3D arc. Crisp text, no GPU cost, fully accessible. */}
        <ArcRail
          items={railItems}
          eyebrow="Iconic Brands, Unreal Savings"
          title="The Curve — products & brands, side by side"
        />

        <ProductGrid />

        {/* 2 — WebGL arc. Scroll-scrubbed, lit, with a contact shadow. */}
        <section className="bg-sunken pb-16 pt-4 sm:pb-24">
          <Reveal className="mx-auto mb-6 flex max-w-[1400px] flex-col gap-3 px-5 sm:px-8">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-wine">
              React Three Fiber · scroll-scrubbed
            </p>
            <h2 className="text-xl font-semibold tracking-tight text-ink sm:text-3xl">
              Same rail — rebuilt in WebGL
            </h2>
            <p className="max-w-2xl text-sm leading-relaxed text-mute">
              Cards sit on a real cylinder. The group rotates against scroll position, a baked
              studio environment lights the card faces, and a contact shadow grounds the whole
              row. Rotate the page to fly the camera around the curve.
            </p>
          </Reveal>

          <div className="px-5 sm:px-8">
            <div className="mx-auto max-w-[1400px] overflow-hidden rounded-2xl bg-sunken shadow-e2">
              <ArcRail3D items={railItems} />
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </ShopProvider>
  );
}
