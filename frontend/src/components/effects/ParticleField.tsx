"use client";

import { useEffect, useRef } from "react";

/**
 * Neural-network particle field: drifting nodes, proximity links,
 * and a mouse-reactive glow. Canvas 2D — fast everywhere, no WebGL dependency.
 */
export function ParticleField({ density = 0.00008 }: { density?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d");
    if (!ctx || reduced) return;

    let w = 0, h = 0, raf = 0;
    const mouse = { x: -9999, y: -9999 };
    let nodes: { x: number; y: number; vx: number; vy: number }[] = [];

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.offsetWidth;
      h = canvas.offsetHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.min(120, Math.floor(w * h * density));
      nodes = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
      }));
    };

    const onMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };
    const onLeave = () => { mouse.x = -9999; mouse.y = -9999; };

    const LINK = 130;
    const draw = () => {
      ctx.clearRect(0, 0, w, h);

      // Mouse-reactive lighting
      if (mouse.x > -999) {
        const g = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 260);
        g.addColorStop(0, "rgba(139,92,246,0.08)");
        g.addColorStop(1, "rgba(139,92,246,0)");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, h);
      }

      for (const n of nodes) {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > w) n.vx *= -1;
        if (n.y < 0 || n.y > h) n.vy *= -1;
        // gentle attraction to cursor
        const dx = mouse.x - n.x, dy = mouse.y - n.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < 200 * 200 && d2 > 1) {
          n.x += dx * 0.0012;
          n.y += dy * 0.0012;
        }
      }

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i], b = nodes[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const dist = Math.hypot(dx, dy);
          if (dist < LINK) {
            ctx.strokeStyle = `rgba(139,92,246,${(1 - dist / LINK) * 0.14})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      for (const n of nodes) {
        ctx.fillStyle = "rgba(196,181,253,0.55)";
        ctx.beginPath();
        ctx.arc(n.x, n.y, 1.4, 0, Math.PI * 2);
        ctx.fill();
      }

      raf = requestAnimationFrame(draw);
    };

    resize();
    draw();
    window.addEventListener("resize", resize);
    canvas.addEventListener("mousemove", onMove, { passive: true });
    canvas.addEventListener("mouseleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("mousemove", onMove);
      canvas.removeEventListener("mouseleave", onLeave);
    };
  }, [density]);

  return <canvas ref={canvasRef} aria-hidden className="absolute inset-0 h-full w-full" />;
}
