"use client";

import createGlobe, { COBEOptions } from "cobe";
import { useMotionValue, useSpring } from "motion/react";
import { useEffect, useRef, type CSSProperties } from "react";

import { cn } from "@/lib/utils";

const MOVEMENT_DAMPING = 1400;

export type GlobePin = {
  /** Used for the cobe anchor name `--cobe-<id>`; letters, digits and dashes only. */
  id: string;
  label: string;
  /** [latitude, longitude] */
  location: [number, number];
  /** Side the label sits on; default right. */
  side?: "left" | "right";
};

export const GLOBE_PINS: GlobePin[] = [
  // 2° from Calgary; on touch screens both labels are always on, so this one goes left.
  { id: "yvr", label: "Vancouver, BC", location: [49.2827, -123.1207], side: "left" },
  { id: "yyc", label: "Calgary, AB", location: [51.0447, -114.0719] },
  { id: "den", label: "Denver, CO", location: [39.7392, -104.9903] },
  { id: "san", label: "San Diego, CA", location: [32.715736, -117.161087] },
];

const GLOBE_CONFIG: COBEOptions = {
  width: 800,
  height: 800,
  devicePixelRatio: 2,
  phi: 0,
  theta: 0.3,
  dark: 0,
  diffuse: 0.4,
  mapSamples: 16000,
  mapBrightness: 1.2,
  baseColor: [1, 1, 1],
  markerColor: [251 / 255, 100 / 255, 21 / 255],
  glowColor: [1, 1, 1],
  // cobe 2 raises markers into domes by default; keep them on the surface.
  markerElevation: 0,
};

export function Globe({
  className,
  config = GLOBE_CONFIG,
  pins = GLOBE_PINS,
}: {
  className?: string;
  config?: COBEOptions;
  /** Pass a stable reference; a new array each render recreates the globe. */
  pins?: GlobePin[];
}) {
  const phi = useRef(0);
  const width = useRef(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointerInteracting = useRef<number | null>(null);
  const pointerInteractionMovement = useRef(0);

  const r = useMotionValue(0);
  const rs = useSpring(r, {
    mass: 1,
    damping: 30,
    stiffness: 100,
  });

  const updatePointerInteraction = (value: number | null) => {
    pointerInteracting.current = value;
    if (canvasRef.current) {
      canvasRef.current.style.cursor = value !== null ? "grabbing" : "grab";
    }
  };

  const updateMovement = (clientX: number) => {
    if (pointerInteracting.current !== null) {
      const delta = clientX - pointerInteracting.current;
      pointerInteractionMovement.current = delta;
      r.set(r.get() + delta / MOVEMENT_DAMPING);
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const onResize = () => {
      width.current = canvas.offsetWidth;
    };
    window.addEventListener("resize", onResize);
    onResize();

    // cobe 2 has no onRender and no internal frame loop: the component asks for
    // each frame with update(). cobe 2 multiplies width/height by
    // devicePixelRatio itself, so pass CSS pixels.
    const host = canvas.parentElement;
    const globe = createGlobe(canvas, {
      ...config,
      // Flat, tiny markers: the DOM pins sit on top of them, and the dots are
      // all that shows in a browser without CSS anchor positioning. An explicit
      // config.markers still wins.
      markers:
        config.markers ??
        pins.map(({ id, location }) => ({ id, location, size: 0.02 })),
      width: width.current,
      height: width.current,
    });
    // cobe wraps the canvas in a div that destroy() leaves; unwrap so re-runs don't nest.
    const cobeWrapper =
      canvas.parentElement !== host ? canvas.parentElement : null;

    let frame = 0;
    let lastWidth = width.current;
    const tick = () => {
      if (!pointerInteracting.current) phi.current += 0.001;
      const next: Partial<COBEOptions> = { phi: phi.current + rs.get() };
      // update() reassigns canvas.width/height whenever it gets a size, which
      // can rebuild the drawing buffer, so only send the size when it changed.
      if (width.current !== lastWidth) {
        next.width = width.current;
        next.height = width.current;
        lastWidth = width.current;
      }
      globe.update(next);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);

    const fadeIn = setTimeout(() => {
      canvas.style.opacity = "1";
    }, 0);
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(fadeIn);
      globe.destroy();
      cobeWrapper?.replaceWith(canvas);
      window.removeEventListener("resize", onResize);
    };
  }, [rs, config, pins]);

  return (
    <div
      className={cn(
        "absolute inset-0 mx-auto aspect-[1/1] w-full max-w-[600px]",
        className,
      )}
    >
      <canvas
        aria-hidden="true"
        className={cn(
          "size-full opacity-0 transition-opacity duration-500 [contain:layout_paint_size] dark:invert",
        )}
        ref={canvasRef}
        onPointerDown={(e) => {
          // Capture so crossing a pin (its own hit target) does not fire
          // pointerout on the canvas and end the drag.
          e.currentTarget.setPointerCapture?.(e.pointerId);
          pointerInteracting.current = e.clientX;
          updatePointerInteraction(e.clientX);
        }}
        onPointerUp={() => updatePointerInteraction(null)}
        onPointerOut={() => updatePointerInteraction(null)}
        onMouseMove={(e) => updateMovement(e.clientX)}
        onTouchMove={(e) =>
          e.touches[0] && updateMovement(e.touches[0].clientX)
        }
      />
      {/*
        cobe 2 keeps a 1px anchor named --cobe-<id> for every marker with an id
        and, while that point faces the viewer, sets --cobe-visible-<id> on
        :root to a non-numeric token (it deletes it otherwise). Each pin gets
        the anchor name and the visibility as custom properties; globals.css
        registers --pin-visible as a <number> so the token normalises to 1 and
        the absent case to 0, then positions the pin with CSS anchor
        positioning. The list must stay an unpositioned sibling after cobe's
        wrapper so the anchors are inside the pins' containing block.
      */}
      <ul className="globe-pins" aria-label="Places I have worked">
        {pins.map(({ id, label, side }) => (
          <li
            key={id}
            className="globe-pin"
            data-side={side}
            style={
              {
                "--pin-anchor": `--cobe-${id}`,
                "--pin-visible": `var(--cobe-visible-${id}, 0)`,
              } as CSSProperties
            }
          >
            <svg className="globe-pin-icon" viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="#fb6415"
                d="M12 2a8 8 0 0 0-8 8c0 6 8 12 8 12s8-6 8-12a8 8 0 0 0-8-8Z"
              />
              <circle cx="12" cy="10" r="3" fill="#fff" />
            </svg>
            <svg className="globe-pin-lead" viewBox="0 0 64 36" aria-hidden="true">
              <path d="M8 36 L20 12 H60" fill="none" pathLength={100} />
            </svg>
            <span className="globe-pin-label">{label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
