"use client";

import { Suspense, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  ContactShadows,
  Environment,
  Lightformer,
  RoundedBox,
  useTexture,
} from "@react-three/drei";
import * as THREE from "three";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { type RailItem } from "@/lib/data";

/* ------------------------------------------------------------- geometry
 * Cards sit on a cylinder of radius R around the origin; the camera looks
 * down -Z. Rotating the group brings each card round to face the lens.
 *
 * R is not a free aesthetic knob — it is bounded from below by the cards
 * themselves. Two adjacent cards are tangent planes `step` apart, so they
 * cross each other at a distance `(R + faceOffset) * tan(step / 2)` from the
 * cylinder. If a card is wider than twice that, its outer edge crosses its
 * neighbour's *face* and pokes through it: with R = 5 and 14 cards the
 * crossing sat at 0.60 while the card half-width was 0.97, so ~39% of every
 * card cut through the next one (it showed up as brand-card textures
 * slicing through product photos).
 *
 * R = 9 pushes the crossing out to 1.07 > 0.975, so cards now clear each
 * other. It also pushes the visible arc wider, and camera z = 15 keeps the
 * front card at exactly the framing R = 5 / z = 11 gave (front card sits
 * ~6 units from the lens either way).
 */
const R = 9;
const CAMERA_Z = 15;
const TOTAL_SPAN = THREE.MathUtils.degToRad(176);
const SCRUB = new THREE.Vector3();

type Props = { items: RailItem[] };

/* --------------------------------------------------------- brand texture
 * Drawn on a 2D canvas so we never pull a webfont over the network.
 */
function makeBrandTexture(title: string) {
  if (typeof document === "undefined") return null;
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 352;
  const ctx = c.getContext("2d");
  if (!ctx) return null;

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, c.width, c.height);

  ctx.textAlign = "center";
  ctx.fillStyle = "#5c6873";
  ctx.font = "600 19px ui-sans-serif, system-ui, sans-serif";
  ctx.fillText("O F F I C I A L   S T O R E", 256, 112);

  ctx.fillStyle = "#001325";
  ctx.font = "700 44px ui-sans-serif, system-ui, sans-serif";
  ctx.fillText(title, 256, 192);

  ctx.fillStyle = "#e0e3e6";
  ctx.fillRect(206, 220, 100, 2);

  ctx.fillStyle = "#a61c54";
  ctx.font = "600 26px ui-sans-serif, system-ui, sans-serif";
  ctx.fillText("Up to 60% off", 256, 278);

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

/* ------------------------------------------------------------- placement */
function usePlacement(index: number, count: number) {
  return useMemo(() => {
    const a = (index - (count - 1) / 2) * (TOTAL_SPAN / Math.max(count - 1, 1));
    return {
      position: [Math.sin(a) * R, 0, Math.cos(a) * R] as [number, number, number],
      rotation: [0, a, 0] as [number, number, number],
      angle: a,
    };
  }, [index, count]);
}

function Shell({
  place,
  w,
  h,
  map,
}: {
  place: ReturnType<typeof usePlacement>;
  w: number;
  h: number;
  map: THREE.Texture | null;
}) {
  return (
    <group position={place.position} rotation={place.rotation}>
      {/* body — the visible thickness that catches the light */}
      <RoundedBox args={[w, h, 0.07]} radius={0.05} smoothness={4}>
        <meshStandardMaterial color="#ffffff" roughness={0.34} metalness={0.02} />
      </RoundedBox>
      <mesh position={[0, 0, 0.0371]}>
        <planeGeometry args={[w - 0.07, h - 0.07]} />
        <meshStandardMaterial
          map={map ?? undefined}
          color={map ? "#ffffff" : "#f3f4f5"}
          roughness={0.58}
          metalness={0}
        />
      </mesh>
    </group>
  );
}

/* Product cards suspend on the texture; brand cards don't. Keeping them in
 * separate components means the hook order never depends on `kind`. */
function ProductCard({
  item,
  index,
  count,
}: {
  item: Extract<RailItem, { kind: "product" }>;
  index: number;
  count: number;
}) {
  const place = usePlacement(index, count);
  // Configure in the loader callback (a layout effect inside drei), so the
  // texture is sRGB + anisotropic *before* three uploads it to the GPU.
  // Mutating a hook's return value directly would trip the React Compiler.
  const tex = useTexture(item.image, (t) => {
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
  });
  return <Shell place={place} w={1.95} h={2.7} map={tex} />;
}

function BrandCard({
  title,
  index,
  count,
}: {
  title: string;
  index: number;
  count: number;
}) {
  const place = usePlacement(index, count);
  const tex = useMemo(() => makeBrandTexture(title), [title]);
  if (!tex) return null;
  return <Shell place={place} w={2.05} h={1.42} map={tex} />;
}

function Card(props: { item: RailItem; index: number; count: number }) {
  return (
    <Suspense fallback={null}>
      {props.item.kind === "brand" ? (
        <BrandCard title={props.item.title} index={props.index} count={props.count} />
      ) : (
        <ProductCard item={props.item} index={props.index} count={props.count} />
      )}
    </Suspense>
  );
}

/* --------------------------------------------------------------- scene
 * Lives INSIDE <Canvas>. `useFrame` reads from the Canvas store, so it
 * throws if called in the wrapper component that merely *contains* <Canvas>.
 */
/* --------------------------------------------------------------- scene
 * Lives INSIDE <Canvas>. `useFrame` reads from the Canvas store, so it
 * throws if called in the component that merely *contains* <Canvas>.
 */
function Scene({
  items,
  wrapRef,
  drag,
}: {
  items: RailItem[];
  wrapRef: React.RefObject<HTMLDivElement | null>;
  drag: React.RefObject<number>;
}) {
  const n = items.length;
  const group = useRef<THREE.Group>(null);
  const spin = useRef(TOTAL_SPAN / 2); // eased rotation
  const stepRad = TOTAL_SPAN / Math.max(n - 1, 1);

  useFrame((_, dt) => {
    const el = wrapRef.current;
    const g = group.current;
    if (!el || !g) return;

    // Scroll-scrub: 0 as the section enters from below, 1 as it leaves the top.
    const r = el.getBoundingClientRect();
    const vh = window.innerHeight || 1;
    const prog = Math.min(Math.max((vh - r.top) / (vh + r.height), 0), 1);

    const target = TOTAL_SPAN * (0.5 - prog) + drag.current;
    const k = Math.min(1, dt * 5);
    spin.current += (target - spin.current) * k;
    g.rotation.y = spin.current;

    // focus falloff — cards near the lens grow, edge cards recede
    for (let i = 0; i < g.children.length; i++) {
      const child = g.children[i];
      const a = (i - (n - 1) / 2) * stepRad;
      const focus = Math.max(Math.cos(a + spin.current), 0);
      const s = 0.8 + focus * 0.25;
      SCRUB.set(s, s, s);
      child.scale.lerp(SCRUB, Math.min(1, dt * 6));
    }
  });

  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[4, 7, 6]} intensity={1.5} />
      <directionalLight position={[-6, 3, 4]} intensity={0.5} color="#ffe9f2" />

      {/* studio environment built in-scene — never fetched from a CDN */}
      <Environment resolution={128} frames={1}>
        <Lightformer intensity={2.4} position={[0, 5, -8]} scale={[12, 6, 1]} />
        <Lightformer intensity={3} position={[-7, 2, 2]} scale={[7, 7, 1]} rotation-y={Math.PI / 2} />
        <Lightformer intensity={3} position={[7, 2, 2]} scale={[7, 7, 1]} rotation-y={-Math.PI / 2} />
        <Lightformer intensity={1.6} position={[0, -6, 3]} scale={[12, 6, 1]} rotation-x={Math.PI / 2} />
      </Environment>

      <group ref={group}>
        {items.map((it, i) => (
          <Card key={it.id} item={it} index={i} count={n} />
        ))}
      </group>

      <ContactShadows
        position={[0, -2.1, 0]}
        opacity={0.4}
        scale={34}
        blur={2.8}
        far={6}
        resolution={512}
        color="#0b1420"
      />
    </>
  );
}

/* ------------------------------------------------------- DOM wrapper */
function Arc({ items }: Props) {
  const n = items.length;
  const wrap = useRef<HTMLDivElement>(null);
  const drag = useRef(0); // user offset, radians
  const down = useRef<{ x: number; d: number } | null>(null);

  const stepRad = TOTAL_SPAN / Math.max(n - 1, 1);

  const step = (dir: -1 | 1) => {
    drag.current += dir * stepRad;
  };

  const onDown = (e: React.PointerEvent) => {
    down.current = { x: e.clientX, d: drag.current };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onMove = (e: React.PointerEvent) => {
    if (!down.current) return;
    drag.current = down.current.d + (e.clientX - down.current.x) * 0.004;
  };
  const onUp = () => {
    down.current = null;
  };

  return (
    <div
      ref={wrap}
      data-testid="arc-webgl"
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onUp}
      className="relative h-[520px] w-full cursor-grab touch-pan-y select-none bg-sunken active:cursor-grabbing sm:h-[560px]"
    >
      <Canvas
        dpr={[1, 1.75]}
        camera={{ position: [0, 0.35, CAMERA_Z], fov: 40 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      >
        <Scene items={items} wrapRef={wrap} drag={drag} />
      </Canvas>

      <p className="pointer-events-none absolute bottom-5 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-full bg-white/85 px-3 py-1.5 text-[11px] font-medium text-mute shadow-e1 backdrop-blur">
        Drag — or just scroll, the arc scrubs with the page
      </p>

      <div className="absolute right-5 top-1/2 z-10 flex -translate-y-1/2 flex-col gap-2">
        <button
          onClick={() => step(1)}
          aria-label="Rotate to previous card"
          className="grid h-10 w-10 place-items-center rounded-full bg-white text-ink shadow-e2 transition-shadow hover:shadow-e3"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          onClick={() => step(-1)}
          aria-label="Rotate to next card"
          className="grid h-10 w-10 place-items-center rounded-full bg-white text-ink shadow-e2 transition-shadow hover:shadow-e3"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------- fallback */
function StaticRail({ items }: Props) {
  return (
    <div className="flex gap-4 overflow-x-auto bg-sunken p-8">
      {items.map((it) => (
        <div
          key={it.id}
          className="h-[300px] w-[220px] shrink-0 overflow-hidden rounded-2xl bg-white shadow-e2"
        >
          {it.kind === "product" ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={it.image} alt={it.title} className="h-[70%] w-full object-cover" />
          ) : (
            <div className="grid h-full place-items-center px-4 text-center text-lg font-semibold text-ink">
              {it.title}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default function ArcRail3D(props: Props) {
  /* Probing with `canvas.getContext("webgl")` would burn one of the browser's
   * ~16 live contexts before the real one is even created, so we only check
   * the interface exists and let the Canvas fail gracefully if it doesn't. */
  const [supported] = useState(() =>
    typeof window === "undefined" ? true : !!window.WebGLRenderingContext,
  );

  if (!supported) return <StaticRail {...props} />;
  return <Arc {...props} />;
}
