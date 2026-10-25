"use client";

import { useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useAnimationFrame, useMotionValue } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { heroSlides } from "@/lib/data";

/** seconds per slide */
const DURATION = 6.5;

export function Hero() {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);

  /* One clock drives both the auto-advance and the indicator bar, so pausing
   * on hover freezes the bar exactly where it is instead of restarting it. */
  const progress = useMotionValue(0);
  useAnimationFrame((_, delta) => {
    if (paused) return;
    const next = progress.get() + delta / (DURATION * 1000);
    if (next >= 1) {
      progress.set(0);
      setI((v) => (v + 1) % heroSlides.length);
    } else {
      progress.set(next);
    }
  });

  const s = heroSlides[i];

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Featured collections"
      className="relative isolate h-[440px] w-full overflow-hidden bg-ink sm:h-[560px] lg:h-[620px]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <AnimatePresence initial={false}>
        <motion.div
          key={s.id}
          initial={{ opacity: 0, scale: 1.06 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ opacity: { duration: 0.8 }, scale: { duration: 7, ease: "linear" } }}
          className="absolute inset-0"
        >
          <Image
            src={s.image}
            alt={s.title}
            fill
            priority={i === 0}
            sizes="100vw"
            className="object-cover object-center"
          />
        </motion.div>
      </AnimatePresence>

      {/* tint — left-weighted so the copy always has contrast */}
      <div className={`absolute inset-0 bg-gradient-to-r ${s.tint} via-60% to-transparent`} />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-ink/70 to-transparent" />

      <div className="relative mx-auto flex h-full max-w-[1400px] items-center px-5 sm:px-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={s.id}
            initial={{ opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -14 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-xl"
          >
            <p className="mb-3 inline-block rounded-full border border-white/25 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-white backdrop-blur">
              {s.eyebrow}
            </p>
            <h1 className="text-4xl font-semibold leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl">
              {s.title}
            </h1>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-white/80 sm:text-base">
              {s.subtitle}
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <a
                href="#edit"
                className="group inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-ink shadow-e3 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-e4"
              >
                {s.cta}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </a>
              <a
                href="#brands"
                className="inline-flex items-center rounded-full border border-white/40 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
              >
                Explore brands
              </a>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* indicators with a progress bar */}
      <div className="absolute bottom-6 right-5 z-10 flex items-center gap-2 sm:right-8">
        {heroSlides.map((h, idx) => (
          <button
            key={h.id}
            onClick={() => setI(idx)}
            aria-label={`Slide ${idx + 1}`}
            className="group relative h-1.5 overflow-hidden rounded-full bg-white/30 transition-all duration-300"
            style={{ width: idx === i ? 56 : 20 }}
          >
            {idx === i && (
              <motion.span
                style={{ scaleX: progress }}
                className="absolute inset-0 origin-left bg-white"
              />
            )}
          </button>
        ))}
      </div>

      <div className="absolute bottom-6 left-5 z-10 hidden gap-2 sm:left-8 md:flex">
        {["Free Shipping", "7-Day Returns", "100% Authentic"].map((t) => (
          <span
            key={t}
            className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[11px] font-medium text-white/85 backdrop-blur"
          >
            {t}
          </span>
        ))}
      </div>
    </section>
  );
}

export function TrustStrip() {
  const items = [
    ["Original products", "100% authentic, always"],
    ["Free shipping", "On orders above ₹799"],
    ["Easy returns", "7-day no-questions window"],
    ["Secure payments", "UPI · Cards · COD"],
  ];
  return (
    <div className="border-b border-line bg-white">
      <div className="mx-auto grid max-w-[1400px] grid-cols-2 gap-4 px-5 py-5 sm:px-8 lg:grid-cols-4">
        {items.map(([t, s]) => (
          <div key={t} className="flex items-start gap-3">
            <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-surface text-wine">
              <span className="h-2 w-2 rounded-full bg-wine" />
            </span>
            <div>
              <p className="text-[13px] font-semibold text-ink">{t}</p>
              <p className="text-[12px] text-mute">{s}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
