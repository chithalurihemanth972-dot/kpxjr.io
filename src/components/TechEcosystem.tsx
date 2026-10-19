import { ArrowUpRight, Bot, Cpu, FlaskConical, GraduationCap, Rocket, SlidersHorizontal, Wrench } from "lucide-react";
import { ECOSYSTEM } from "../data/content";
import { useReveal } from "../lib/hooks";
import { HexIcon, SectionHead } from "./HudFrame";
import { cn } from "../utils/cn";

const ICONS = [Bot, Rocket, Cpu, SlidersHorizontal, Wrench, FlaskConical, GraduationCap];

/* Bento spans on a 6-column grid (desktop): wide + narrow, three thirds, narrow + wide. */
const SPANS = ["lg:col-span-4", "lg:col-span-2", "lg:col-span-2", "lg:col-span-2", "lg:col-span-2", "lg:col-span-2", "lg:col-span-4"];

/* ═══════════════════════════════════════════════════════════════
   TECHNOLOGY — seven disciplines as a bento grid
   ═══════════════════════════════════════════════════════════════ */
export default function TechEcosystem({ onExplore }: { onExplore: () => void }) {
  const grid = useReveal();

  return (
    <section id="technology" className="relative py-24 md:py-36">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <SectionHead kicker={ECOSYSTEM.kicker} title={ECOSYSTEM.title} sub={ECOSYSTEM.sub} align="left" />

        <div ref={grid} className="reveal grid sm:grid-cols-2 lg:grid-cols-6 gap-5">
          {ECOSYSTEM.items.map((item, i) => {
            const Icon = ICONS[i];
            const hl = item.highlight;
            return (
              <article
                key={item.title}
                className={cn("glass-card p-7 md:p-8 group flex flex-col", SPANS[i], i === 6 && "sm:col-span-2", hl && "!border-amber/40")}
                style={
                  hl
                    ? { background: "linear-gradient(180deg, rgba(255,255,255,0.07), transparent 40%), linear-gradient(150deg, #3a3012, #15152e 75%)" }
                    : undefined
                }
              >
                <HexIcon size={54} amber={hl}>
                  <Icon size={24} className={hl ? "text-amber" : "text-electric-soft"} strokeWidth={1.7} />
                </HexIcon>
                <h3 className="mt-6 font-head font-bold text-xl md:text-2xl text-white tracking-tight leading-snug">{item.title}</h3>
                <p className="mt-2.5 text-mist leading-relaxed max-w-md">{item.desc}</p>
                {hl && (
                  <button
                    onClick={onExplore}
                    className="mt-6 self-start inline-flex items-center gap-1.5 text-amber font-head font-bold cursor-pointer group-hover:gap-2.5 transition-all"
                  >
                    Explore KPX Jr <ArrowUpRight size={17} strokeWidth={2.5} />
                  </button>
                )}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
