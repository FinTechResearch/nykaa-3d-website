"use client";

import { useEffect, type ReactNode } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * Lenis owns the scroll; GSAP's ticker drives it so ScrollTrigger stays in
 * sync. Never add `scroll-behavior: smooth` — the two fight each other.
 *
 * Lenis's own `anchors: true` is unusable here: in 1.3.x its click handler
 * calls `scrollTo(hash)` but never `preventDefault()`, so the browser also
 * performs its native jump. The result is a jump to the target, then a snap
 * back to the top while Lenis re-animates. We intercept the click ourselves
 * and only call `preventDefault()`, leaving propagation alone.
 *
 * Landing offset comes from the sections' `scroll-mt-28` — Lenis reads
 * `scroll-margin-top` off the target itself (see scrollTo in lenis dist), so
 * passing a JS offset here as well would apply it twice.
 */

function onAnchorClick(e: MouseEvent, lenis: Lenis) {
  if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
    return;
  }
  const link = (e.composedPath() as EventTarget[]).find(
    (n): n is HTMLAnchorElement =>
      n instanceof HTMLAnchorElement && n.getAttribute("href")?.startsWith("#") === true,
  );
  if (!link) return;

  const hash = link.getAttribute("href")!;
  if (hash === "#") return; // bare placeholder link

  const target = document.getElementById(decodeURIComponent(hash.slice(1)));
  if (!target) return;

  // Stops the browser's native jump. No need to stop propagation: with
  // `anchors` left off, Lenis never registers a click listener of its own, and
  // killing the event here would starve React's handlers downstream.
  e.preventDefault();
  // Keep the URL shareable without triggering the browser's own jump.
  history.replaceState(null, "", hash);
  lenis.scrollTo(target);
}

export default function SmoothScroll({ children }: { children: ReactNode }) {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const lenis = new Lenis({
      lerp: 0.1,
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.6,
    });

    const onClick = (e: MouseEvent) => onAnchorClick(e, lenis);
    // Bubble phase, so any React onClick on the link runs first.
    document.addEventListener("click", onClick);

    const onScroll = () => ScrollTrigger.update();
    lenis.on("scroll", onScroll);

    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    // Expose for debugging / imperative control from devtools.
    (window as unknown as { lenis?: Lenis }).lenis = lenis;

    return () => {
      gsap.ticker.remove(raf);
      lenis.off("scroll", onScroll);
      lenis.destroy();
      document.removeEventListener("click", onClick);
      delete (window as unknown as { lenis?: Lenis }).lenis;
    };
  }, []);

  return <>{children}</>;
}
