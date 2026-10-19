import { Crosshair, Telescope } from "lucide-react";
import { ABOUT } from "../data/content";
import { useReveal } from "../lib/hooks";
import { HexIcon } from "./HudFrame";

/* ═══════════════════════════════════════════════════════════════
   WHO WE ARE — statement on the left, mission and vision stacked right
   ═══════════════════════════════════════════════════════════════ */
export default function WhoWeAre() {
  const text = useReveal();
  const cards = useReveal();

  return (
    <section id="about" className="relative py-24 md:py-36 bg-navy/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 grid lg:grid-cols-[1.1fr_1fr] gap-12 lg:gap-20 items-start">
        <div ref={text} className="reveal">
          <p className="font-head font-semibold text-sm text-electric-soft mb-3">Who we are</p>
          <h2 className="font-head font-bold text-3xl md:text-5xl leading-[1.06] tracking-[-0.025em] text-white text-balance">
            Turning ideas into engineered solutions.
          </h2>
          <p className="mt-7 text-mist text-lg leading-relaxed max-w-xl">{ABOUT.body}</p>
        </div>

        <div ref={cards} className="reveal grid gap-5" style={{ ["--reveal-delay" as string]: "120ms" }}>
          {[
            { Icon: Crosshair, data: ABOUT.mission, amber: false },
            { Icon: Telescope, data: ABOUT.vision, amber: true },
          ].map(({ Icon, data, amber }) => (
            <article key={data.title} className="glass-card p-7 flex gap-5 items-start">
              <HexIcon size={56} amber={amber} className="shrink-0">
                <Icon size={24} className={amber ? "text-amber" : "text-electric-soft"} strokeWidth={1.8} />
              </HexIcon>
              <div>
                <h3 className="font-head font-bold text-xl text-white tracking-tight">{data.title}</h3>
                <p className="mt-2 text-mist leading-relaxed">{data.text}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
