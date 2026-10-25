"use client";

import { Smartphone, ShieldCheck, Truck } from "lucide-react";
import { Year } from "./year";
import { scrollToSection, useShop } from "./shop";

type Column = {
  title: string;
  /** null = real in-page destination; string = toast copy for stub links */
  links: { label: string; to?: string }[];
};

const COLUMNS: Column[] = [
  {
    title: "Shop",
    links: [
      { label: "Women", to: "edit" },
      { label: "Men", to: "edit" },
      { label: "Kids", to: "edit" },
      { label: "Home", to: "edit" },
      { label: "Footwear", to: "edit" },
      { label: "Jewellery", to: "edit" },
    ],
  },
  {
    title: "Luxe & Gems",
    links: [
      { label: "Nykaa Fashion Luxe" },
      { label: "Hidden Gems" },
      { label: "The Responsible Collection" },
      { label: "All Brands", to: "brands" },
    ],
  },
  {
    title: "Help",
    links: [
      { label: "Track Order" },
      { label: "Returns & Exchange" },
      { label: "Shipping Info" },
      { label: "Contact Us" },
      { label: "FAQs" },
    ],
  },
  {
    title: "About",
    links: [
      { label: "Our Story" },
      { label: "Careers" },
      { label: "Press" },
      { label: "Terms of Use" },
      { label: "Privacy Policy" },
    ],
  },
];

export function SiteFooter() {
  const { notify } = useShop();

  return (
    <footer className="bg-ink text-white">
      <div className="mx-auto max-w-[1400px] px-5 py-14 sm:px-8">
        <div className="grid gap-10 border-b border-white/10 pb-10 md:grid-cols-2 lg:grid-cols-6">
          <div className="lg:col-span-2">
            <div className="flex items-baseline gap-1.5">
              <span className="text-[22px] font-bold leading-none tracking-tight text-white">
                Nykaa
              </span>
              <span className="text-[15px] font-light leading-none tracking-[0.22em] text-blush">
                FASHION
              </span>
            </div>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/60">
              Online shopping for designer clothes, accessories and lifestyle products
              from India&apos;s finest labels.
            </p>

            <div className="mt-6 grid gap-3 text-[13px] text-white/70">
              <span className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-blush" /> Free shipping over ₹799
              </span>
              <span className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-blush" /> 100% authentic products
              </span>
              <button
                onClick={() => notify("App download link is disabled in this demo")}
                className="flex items-center gap-2 text-left transition-colors hover:text-white"
              >
                <Smartphone className="h-4 w-4 text-blush" /> Shop on the app, get extra 10%
              </button>
            </div>
          </div>

          {COLUMNS.map((c) => (
            <div key={c.title}>
              <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/45">
                {c.title}
              </p>
              <ul className="space-y-2.5">
                {c.links.map((l) => (
                  <li key={l.label}>
                    <button
                      onClick={() =>
                        l.to ? scrollToSection(l.to) : notify(`${l.label} — not part of this demo`)
                      }
                      className="text-left text-sm text-white/75 transition-colors hover:text-white"
                    >
                      {l.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col items-start justify-between gap-4 pt-6 sm:flex-row sm:items-center">
          <p className="text-xs text-white/45">
            © <Year /> Nykaa Fashion recreation — a design/engineering demo.
            Not affiliated with FSN E-Commerce Ventures Ltd.
          </p>
          <div className="flex flex-wrap gap-2">
            {["Visa", "Mastercard", "UPI", "Rupay", "COD"].map((p) => (
              <span
                key={p}
                className="rounded border border-white/15 px-2.5 py-1 text-[11px] text-white/60"
              >
                {p}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
