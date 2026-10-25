"use client";

import type { PointerEvent, ReactNode } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * Flipkart-style depth card.
 *
 * Three layers do the work:
 *  1. `shadow-e2` -> `shadow-e4` on hover   (elevation)
 *  2. rotateX / rotateY under perspective    (physical tilt)
 *  3. a radial "specular" layer that follows  (material)
 *
 * The inner content sits in a `translateZ(40px)` island so it lifts off the
 * card face instead of riding the tilt — that parallax is what sells the depth.
 */
export function TiltCard({
  children,
  className,
  intensity = 1,
}: {
  children: ReactNode;
  className?: string;
  intensity?: number;
}) {
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const spring = { stiffness: 240, damping: 24, mass: 0.4 };

  const rotateX = useSpring(useTransform(my, [0, 1], [10 * intensity, -10 * intensity]), spring);
  const rotateY = useSpring(useTransform(mx, [0, 1], [-12 * intensity, 12 * intensity]), spring);
  const glareX = useSpring(useTransform(mx, [0, 1], ["15%", "85%"]), spring);
  const glareY = useSpring(useTransform(my, [0, 1], ["10%", "90%"]), spring);
  const lift = useSpring(0, { stiffness: 280, damping: 22 });

  const INTERACTIVE = "button, a, input, select, textarea, [role='button']";

  const onEnter = (e: PointerEvent<HTMLDivElement>) => {
    // Hovering a control inside the card must not tilt the card. The tilt is a
    // feedback loop — moving the card moves the cursor's relative position,
    // which changes the tilt again — and it settles ~16px of displacement. That
    // is more than half of a 32px icon button, so the target slides out from
    // under the cursor and the click lands beside it. Neutralise the tilt
    // whenever the pointer is over something clickable.
    if ((e.target as HTMLElement).closest(INTERACTIVE)) return;
    lift.set(-9);
  };

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest(INTERACTIVE)) {
      mx.set(0.5);
      my.set(0.5);
      lift.set(0);
      return;
    }
    const r = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width);
    my.set((e.clientY - r.top) / r.height);
  };

  const reset = () => {
    mx.set(0.5);
    my.set(0.5);
    lift.set(0);
  };

  return (
    <div className="[perspective:1200px]">
      <motion.div
        onPointerMove={onMove}
        onPointerEnter={onEnter}
        onPointerLeave={reset}
        style={{ rotateX, rotateY, y: lift, transformStyle: "preserve-3d" }}
        className={cn(
          "group relative overflow-hidden rounded-xl bg-white shadow-e2",
          "transition-shadow duration-300 will-change-transform hover:shadow-e4",
          className,
        )}
      >
        {/* Content island — floats above the card face.
            Note: `preserve-3d` is deliberately NOT set here. None of its
            children have their own 3D transforms, so it bought nothing
            visually, but it did place the small overlay controls (the wishlist
            heart) inside a 3D sorting context where Chromium's input
            hit-testing disagreed with elementFromPoint — a real click on the
            32px heart resolved to the full-bleed button underneath it, leaving
            the control effectively unclickable. Flattening the island keeps
            the translateZ lift and makes hit-testing deterministic. */}
        <div className="[transform:translateZ(38px)]">{children}</div>

        {/* specular sweep */}
        <motion.div
          aria-hidden
          style={{ left: glareX, top: glareY }}
          className="pointer-events-none absolute -inset-1/2 z-20 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        >
          <div className="absolute h-full w-full -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(circle,rgb(255_255_255/0.5),transparent_58%)]" />
        </motion.div>
      </motion.div>
    </div>
  );
}
