import { ArrowRight } from "lucide-react";
import { GATEWAY } from "../data/content";
import { useReveal } from "../lib/hooks";
import LevelStack from "./kpx/LevelStack";

export default function JrGateway({ onExplore }: { onExplore: () => void }) {
  const banner = useReveal();

  return (
    <section id="gateway" className="relative py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div
          ref={banner}
          className="reveal relative overflow-hidden rounded-[2rem] border border-white/10"
          style={{
            background: "radial-gradient(70% 90% at 85% 40%, rgba(91,124,255,0.35), transparent 70%), linear-gradient(160deg, #161c40, #0c1030)",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.14), 0 50px 90px -40px rgba(30,50,200,0.55)",
          }}
        >
          <div className="grid lg:grid-cols-[1fr_1.05fr] items-center gap-10 p-8 sm:p-12 lg:p-16">
            <div>
              <p className="font-head font-semibold text-sm text-amber mb-4">{GATEWAY.kicker.replace(/^\/\/\s*/, "")}</p>
              <h2 className="font-head font-bold text-4xl sm:text-5xl lg:text-[3.4rem] leading-[1.04] tracking-[-0.03em] text-white text-balance">
                Build robots. Program ideas. Connect the world.
              </h2>
              <p className="mt-5 text-mist text-lg max-w-md">{GATEWAY.sub}</p>
              <button
                onClick={onExplore}
                className="btn-glow mt-9 inline-flex items-center gap-2.5 rounded-2xl px-8 py-4 font-head font-bold text-base text-white cursor-pointer"
              >
                {GATEWAY.cta} <ArrowRight size={19} strokeWidth={2.6} />
              </button>
              <p className="mt-6 text-sm text-mist/80">4 levels · 24 project kits · 36 hours per level</p>
            </div>

            <LevelStack />
          </div>
        </div>
      </div>
    </section>
  );
}
