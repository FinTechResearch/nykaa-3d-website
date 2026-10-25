"use client";

import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { editorials } from "@/lib/data";
import { Reveal } from "./reveal";
import { cn } from "@/lib/utils";

export function Editorial() {
  return (
    <section className="bg-white py-14 sm:py-20">
      <div className="mx-auto max-w-[1400px] px-5 sm:px-8">
        <Reveal className="mb-8">
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-wine">
            Curated edits
          </p>
          <h2 className="text-xl font-semibold tracking-tight text-ink sm:text-3xl">
            Build your festive wardrobe
          </h2>
        </Reveal>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {editorials.map((e, i) => (
            <Reveal
              key={e.id}
              delay={Math.min(i, 4) * 0.06}
              y={36}
              className={cn(e.span && "lg:col-span-2")}
            >
              <a
                href="#"
                className="group relative block w-full overflow-hidden rounded-2xl bg-ink shadow-e2
                           transition-all duration-400 hover:-translate-y-1 hover:shadow-e4"
                style={{ aspectRatio: e.span ? "16 / 10" : "4 / 5" }}
              >
                <Image
                  src={e.image}
                  alt={e.title}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.07]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/25 to-transparent" />

                <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
                  <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/70">
                    {e.eyebrow}
                  </p>
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-lg font-semibold leading-tight text-white sm:text-2xl">
                      {e.title}
                    </h3>
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/15 backdrop-blur transition-all duration-300 group-hover:bg-white group-hover:text-ink">
                      <ArrowUpRight className="h-4 w-4 text-white transition-colors group-hover:text-ink" />
                    </span>
                  </div>
                </div>
              </a>
            </Reveal>
          ))}

          {/* 9th tile — Nykaa's "Explore More" block */}
          <Reveal delay={0.3} y={36}>
            <div
              className="flex h-full flex-col justify-between rounded-2xl bg-gradient-to-br from-wine to-[#640013] p-6 shadow-e2 sm:p-7"
              style={{ aspectRatio: "4 / 5" }}
            >
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/70">
                  Explore More
                </p>
                <h3 className="mt-2 text-2xl font-semibold leading-tight text-white">
                  Find everything for your every need
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-white/75">
                  Gadgets, home décor, luxe, hidden gems and the Responsible Collection —
                  all under one roof.
                </p>
              </div>
              <div className="mt-6 flex flex-wrap gap-2">
                {["Gadgets", "Home Décor", "Luxe", "Hidden Gems", "Sustainable"].map((t) => (
                  <span
                    key={t}
                    className="rounded-full border border-white/30 px-3 py-1.5 text-[11px] font-medium text-white/90 transition-colors hover:bg-white/15"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
