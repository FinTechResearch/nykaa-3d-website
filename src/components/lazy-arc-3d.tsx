"use client";

import dynamic from "next/dynamic";

/**
 * WebGL must never be part of the server render — `next build` prerenders
 * this page and a stray `getContext("webgl")` during SSG is how you get a
 * "window is not defined" build failure.
 */
const ArcRail3D = dynamic(() => import("./arc-rail-3d"), {
  ssr: false,
  loading: () => <div className="h-[520px] animate-pulse bg-sunken sm:h-[560px]" />,
});

export default ArcRail3D;
