import { ArrowRight, Lock } from "lucide-react";
import Hero from "../components/Hero";
import JrGateway from "../components/JrGateway";
import Projects from "../components/Projects";
import TechEcosystem from "../components/TechEcosystem";
import WhoWeAre from "../components/WhoWeAre";
import { useSite } from "../context/SiteContext";
import { KPX, PAGES } from "../data/content";
import { scrollToId, useReveal } from "../lib/hooks";
import { LEVEL_THEME } from "../components/kpx/theme";

/* ═══════════════════════════════════════════════════════════════
   HOME — the main single-page site.
   KPX Jr details live on their own routes (#/kpx-jr, level pages);
   here we keep a gateway banner + a compact level index.
   ═══════════════════════════════════════════════════════════════ */
export default function HomePage() {
  const { exploreKpx, goToLevel, unlocked } = useSite();
  const strip = useReveal();

  return (
    <>
      <Hero onExplore={exploreKpx} onWork={() => scrollToId("projects")} />

      <WhoWeAre />

      <TechEcosystem onExplore={exploreKpx} />

      <Projects />

      <JrGateway onExplore={exploreKpx} />

      {/* ── Compact KPX Jr pathway index (full details on their pages) ── */}
      <section className="relative pb-24 md:pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div ref={strip} className="reveal">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-7">
              <div>
                <h2 className="font-head font-bold text-2xl md:text-3xl text-white tracking-tight">{PAGES.program.levelsTitle}</h2>
              </div>
              <button
                onClick={exploreKpx}
                className="btn-ghost inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 font-head font-bold text-[13px] text-white cursor-pointer shrink-0"
              >
                View full program <ArrowRight size={15} />
              </button>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {KPX.levels.map((lvl, i) => {
                const t = LEVEL_THEME[lvl.id];
                return (
                  <button
                    key={lvl.id}
                    onClick={() => goToLevel(i + 1)}
                    className="glass-card group relative text-left p-5 cursor-pointer"
                                        aria-label={`Open ${lvl.name} — ${lvl.title}${unlocked ? "" : " (unlock required)"}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-head font-semibold text-sm" style={{ color: t.hexColor }}>
                        {lvl.index}
                      </span>
                      {unlocked ? (
                        <ArrowRight size={13} className="text-mist/60 group-hover:text-white transition-colors" aria-hidden="true" />
                      ) : (
                        <Lock size={12} className="text-mist/50" aria-hidden="true" />
                      )}
                    </div>
                    <p className="mt-3 font-head font-bold text-base text-white leading-snug">{lvl.name}</p>
                    <p className="mt-1 text-sm text-mist leading-snug line-clamp-2">{lvl.title}</p>
                    <p className="mt-4 text-xs text-mist/70">{lvl.projects.length} projects</p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
