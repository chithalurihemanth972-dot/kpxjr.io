import { lazy, Suspense } from "react";
import { ArrowRight, ChevronDown } from "lucide-react";
import { HERO } from "../data/content";
import { scrollToId, useCountUp } from "../lib/hooks";

const Robot3D = lazy(() => import("./Robot3D"));

function Counter({ value, suffix, label }: { value: number; suffix: string; label: string }) {
  const { ref, value: v } = useCountUp(value);
  return (
    <div>
      <p className="font-head font-bold text-4xl sm:text-5xl text-white leading-none tracking-tight">
        <span ref={ref}>{v.toLocaleString("en-IN")}</span>
        <span className="text-amber">{suffix}</span>
      </p>
      <p className="mt-2 text-sm text-mist max-w-[12rem] leading-snug">{label}</p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   HERO — headline on the left, a live 3D robot on the right
   ═══════════════════════════════════════════════════════════════ */
export default function Hero({ onExplore, onWork }: { onExplore: () => void; onWork: () => void }) {
  return (
    <section id="top" className="relative min-h-[100svh] overflow-hidden">
      {/* light pooled behind the robot */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(60% 55% at 74% 48%, rgba(91,124,255,0.34), transparent 70%), radial-gradient(30% 30% at 88% 82%, rgba(255,200,87,0.10), transparent 70%)",
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 min-h-[100svh] grid lg:grid-cols-[1.05fr_1fr] items-center gap-4 pt-28 pb-16 lg:pt-20 lg:pb-12">
        <div>
          <p className="font-head font-semibold text-sm sm:text-base text-electric-soft mb-5">
            Robotics and engineering studio · Hyderabad
          </p>

          <h1 className="font-head font-bold text-[2.7rem] leading-[1.02] sm:text-6xl lg:text-[4.6rem] tracking-[-0.03em] text-white text-balance">
            {HERO.headlineA}
            <span className="block text-mist/90">{HERO.headlineB}</span>
          </h1>

          <p className="mt-6 max-w-md text-lg text-mist leading-relaxed">
            We design robots, embedded systems and the classes that teach students to build them.
          </p>

          <div className="mt-9 flex flex-col sm:flex-row sm:items-center gap-4">
            <button
              onClick={onExplore}
              className="btn-glow inline-flex items-center justify-center gap-2 rounded-2xl px-7 py-4 font-head font-bold text-base text-white cursor-pointer"
            >
              {HERO.ctaPrimary} <ArrowRight size={18} strokeWidth={2.5} />
            </button>
            <button
              onClick={onWork}
              className="btn-ghost inline-flex items-center justify-center gap-2 rounded-2xl px-7 py-4 font-head font-semibold text-base text-white cursor-pointer"
            >
              {HERO.ctaSecondary} <ChevronDown size={18} />
            </button>
          </div>

          <div className="mt-14 flex flex-wrap gap-x-12 gap-y-6 border-t border-white/10 pt-8 max-w-xl">
            {HERO.counters.map((c) => (
              <Counter key={c.label} {...c} />
            ))}
            <p className="basis-full text-sm text-mist/80">
              Workshops run at {HERO.chips.map((c) => `${c.label} (${c.detail})`).join(" and ")}.
            </p>
          </div>
        </div>

        <div className="relative h-[420px] sm:h-[520px] lg:h-[720px] -mx-4 sm:mx-0">
          <Suspense fallback={null}>
            <Robot3D className="absolute inset-0" />
          </Suspense>
          {/* floating glass badges, parallaxed against the robot */}
          <div className="float-badge absolute left-2 sm:left-6 top-[14%] rounded-2xl px-4 py-3 hidden sm:block" style={{ ["--fd" as string]: "-1s" }}>
            <p className="font-head font-bold text-2xl text-white leading-none">
              {HERO.counters[0].value.toLocaleString("en-IN")}
              {HERO.counters[0].suffix}
            </p>
            <p className="mt-1 text-xs text-mist">students trained</p>
          </div>
          <div className="float-badge absolute right-2 sm:right-4 bottom-[16%] rounded-2xl px-4 py-3" style={{ ["--fd" as string]: "-3.5s" }}>
            <p className="font-head font-bold text-base text-white leading-none">KPX Jr</p>
            <p className="mt-1 text-xs text-amber">4 levels · 24 kits</p>
          </div>
        </div>
      </div>

      <button
        onClick={() => scrollToId("about")}
        className="absolute bottom-5 left-1/2 -translate-x-1/2 z-10 hidden lg:flex items-center gap-2 text-sm text-mist/70 hover:text-white transition-colors cursor-pointer"
        aria-label="Scroll to the next section"
      >
        <ChevronDown size={18} className="animate-bounce" />
      </button>
    </section>
  );
}
