"use client";

import { useEffect, useRef, useState } from "react";

/** Glowing dot + trailing ring cursor. Fine pointers only; not rendered at all
 * on touch devices or for reduced-motion users. */
export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (fine && !reduced) setEnabled(true);
  }, []);

  useEffect(() => {
    if (!enabled) return;

    document.body.classList.add("custom-cursor");
    const dot = dotRef.current!;
    const ring = ringRef.current!;

    let x = -100, y = -100, rx = -100, ry = -100;
    let raf = 0;

    const onMove = (e: MouseEvent) => {
      x = e.clientX;
      y = e.clientY;
      dot.style.transform = `translate(${x - 3}px, ${y - 3}px)`;
      const t = e.target as HTMLElement;
      const interactive = !!t.closest("a, button, [role=button], input, textarea, select, [data-cursor=hover]");
      const light = document.documentElement.dataset.theme === "light";
      ring.style.width = interactive ? "44px" : "28px";
      ring.style.height = interactive ? "44px" : "28px";
      ring.style.borderColor = interactive
        ? "rgba(124,58,237,0.9)"
        : light
          ? "rgba(20,22,28,0.4)"
          : "rgba(255,255,255,0.45)";
    };

    const loop = () => {
      rx += (x - rx) * 0.16;
      ry += (y - ry) * 0.16;
      const size = parseFloat(ring.style.width || "28") / 2;
      ring.style.transform = `translate(${rx - size}px, ${ry - size}px)`;
      raf = requestAnimationFrame(loop);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    raf = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
      document.body.classList.remove("custom-cursor");
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <>
      <div
        ref={dotRef}
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[100] h-1.5 w-1.5 rounded-full bg-(--color-cyan) shadow-[0_0_12px_2px_rgba(34,211,238,0.8)]"
      />
      <div
        ref={ringRef}
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[100] h-7 w-7 rounded-full border transition-[width,height,border-color] duration-200"
        style={{ borderColor: "rgba(255,255,255,0.45)" }}
      />
    </>
  );
}
