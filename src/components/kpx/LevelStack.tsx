import { useRef } from "react";
import { KPX } from "../../data/content";
import { LEVEL_THEME } from "./theme";

/* ═══════════════════════════════════════════════════════════════
   LevelStack — the four KPX Jr levels as slabs stacked in CSS 3D.
   Floats gently, leans with the pointer, fans apart on hover.
   ═══════════════════════════════════════════════════════════════ */
export default function LevelStack({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  const onMove = (e: React.PointerEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--px", (((e.clientX - r.left) / r.width - 0.5) * 2).toFixed(3));
    el.style.setProperty("--py", (((e.clientY - r.top) / r.height - 0.5) * 2).toFixed(3));
  };
  const onLeave = () => {
    ref.current?.style.setProperty("--px", "0");
    ref.current?.style.setProperty("--py", "0");
  };

  return (
    <div
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className={`level-stack relative mx-auto w-full max-w-[460px] aspect-[1/0.95] ${className}`}
      aria-label="Four KPX Jr levels, stacked"
      role="img"
    >
      <div className="level-stack__float absolute inset-0">
        <div className="level-stack__scene absolute inset-0">
          {KPX.levels.map((lvl, i) => {
            const t = LEVEL_THEME[lvl.id];
            return (
              <div key={lvl.id} className="level-slab" style={{ ["--i" as string]: i, ["--c" as string]: t.hexColor }}>
                <span className="font-head font-bold text-base text-[#0A0D1A]">{lvl.name}</span>
                <span className="font-head font-medium text-sm text-[#0A0D1A]/75">{lvl.title}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
