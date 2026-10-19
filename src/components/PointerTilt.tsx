import { useEffect } from "react";
import { prefersReducedMotion } from "../lib/hooks";

/* One delegated listener: any `.glass-card` leans toward the pointer
   by a few degrees (sets --rx / --ry, consumed in index.css). */
export default function PointerTilt() {
  useEffect(() => {
    if (prefersReducedMotion() || !window.matchMedia("(hover: hover)").matches) return;
    let active: HTMLElement | null = null;

    const reset = () => {
      active?.style.removeProperty("--rx");
      active?.style.removeProperty("--ry");
      active = null;
    };

    const move = (e: PointerEvent) => {
      const card = (e.target as HTMLElement | null)?.closest?.(".glass-card") as HTMLElement | null;
      if (card !== active) reset();
      if (!card) return;
      active = card;
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      card.style.setProperty("--ry", `${(px * 7).toFixed(2)}deg`);
      card.style.setProperty("--rx", `${(-py * 7).toFixed(2)}deg`);
    };

    document.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("pointerleave", reset);
    return () => {
      document.removeEventListener("pointermove", move);
      document.removeEventListener("pointerleave", reset);
      reset();
    };
  }, []);
  return null;
}
