"use client";

import { useRef } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { categories } from "@/lib/data";

export function CategoryRail() {
  const rail = useRef<HTMLDivElement>(null);

  const nudge = (dir: -1 | 1) => {
    rail.current?.scrollBy({ left: dir * 340, behavior: "smooth" });
  };

  return (
    <section className="bg-white py-10 sm:py-14">
      <div className="mx-auto max-w-[1400px]">
        <div className="mb-6 flex items-end justify-between gap-4 px-5 sm:px-8">
          <div>
            <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-wine">
              Find your fit
            </p>
            <h2 className="text-xl font-semibold tracking-tight text-ink sm:text-3xl">
              Celebration-ready Categories
            </h2>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => nudge(-1)}
              aria-label="Scroll left"
              className="grid h-9 w-9 place-items-center rounded-full border border-line text-ink transition-shadow hover:shadow-e2"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => nudge(1)}
              aria-label="Scroll right"
              className="grid h-9 w-9 place-items-center rounded-full border border-line text-ink transition-shadow hover:shadow-e2"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div
          ref={rail}
          className="no-scrollbar flex snap-x snap-mandatory gap-6 overflow-x-auto px-5 pb-4 sm:px-8"
        >
          {categories.map((c) => (
            <a
              key={c.id}
              href="#"
              className="group w-[104px] shrink-0 snap-start text-center sm:w-[124px]"
            >
              <div className="relative mx-auto h-[104px] w-[104px] overflow-hidden rounded-full
                              shadow-e1 transition-all duration-300
                              group-hover:-translate-y-1.5 group-hover:shadow-e4 sm:h-[124px] sm:w-[124px]">
                <Image
                  src={c.image}
                  alt={c.name}
                  width={124}
                  height={124}
                  sizes="124px"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <span className="absolute inset-0 rounded-full ring-1 ring-inset ring-ink/10" />
              </div>
              <p className="mt-3 text-[13px] font-medium text-ink transition-colors group-hover:text-wine">
                {c.name}
              </p>
              <p className="text-[11px] text-mute">
                {c.count.toLocaleString("en-IN")} styles
              </p>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
