"use client";

import createGlobe, { COBEOptions } from "cobe";
import { useMotionValue, useSpring } from "motion/react";
import { useEffect, useRef } from "react";

import { cn } from "@/lib/utils";

const MOVEMENT_DAMPING = 1400;

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
  markers: [
    { location: [51.0447, -114.0719], size: 0.1 },
    { location: [49.2827, -123.1207], size: 0.1 },
    { location: [32.715736, -117.161087], size: 0.1 },
    { location: [39.7392, -104.9903], size: 0.1 },
  ],
};

export function Globe({
  className,
  config = GLOBE_CONFIG,
}: {
  className?: string;
  config?: COBEOptions;
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
  }, [rs, config]);

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
          "size-full opacity-0 transition-opacity duration-500 [contain:layout_paint_size]",
        )}
        ref={canvasRef}
        onPointerDown={(e) => {
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
    </div>
  );
}
