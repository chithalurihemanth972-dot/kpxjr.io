import { ArrowDown, ArrowRight, ChevronRight, Fingerprint, Layers } from "lucide-react";
import { FinalCta, IntroFlow, Kits, LevelCard, LevelPath, Partners, WhyKpx } from "../components/kpx/blocks";
import LevelStack from "../components/kpx/LevelStack";
import LockedPanel from "../components/kpx/LockedPanel";
import { useSite } from "../context/SiteContext";
import { KPX, PAGES } from "../data/content";
import { scrollToId, useReveal } from "../lib/hooks";
import { navigate } from "../lib/router";

/* ═══════════════════════════════════════════════════════════════
   PAGE — /kpx-jr
   Program overview: gated before unlock, full pathway after.
   ═══════════════════════════════════════════════════════════════ */
export default function KpxJrPage() {
  const { unlocked, highlight, lead, openLead, goToLevel } = useSite();
  const levels = useReveal();

  return (
    <div id="kpx-main" className={highlight ? "kpx-highlight" : undefined}>
      {/* ── page hero ─────────────────────────────────────────── */}
      <section className="relative pt-28 md:pt-36 pb-16 md:pb-20 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true" style={{ background: "radial-gradient(55% 60% at 75% 40%, rgba(91,124,255,0.30), transparent 70%)" }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
          {/* breadcrumb */}
          <nav aria-label="Breadcrumb" className="mb-8">
            <ol className="flex items-center gap-2 text-[11px] font-semibold text-mist/70">
              <li>
                <a href="#/" className="hover:text-white transition-colors">Home</a>
              </li>
              <ChevronRight size={11} aria-hidden="true" />
              <li className="text-amber" aria-current="page">KPX Jr</li>
            </ol>
          </nav>

          <div className="grid lg:grid-cols-[1.15fr_0.85fr] items-center gap-10">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-amber/30 bg-amber/8 px-4 py-1.5 mb-6">
                <Layers size={13} className="text-amber" aria-hidden="true" />
                <span className="font-head font-semibold text-sm text-amber">Four levels · One pathway</span>
              </div>

              <h1 className="font-head font-bold text-[2.4rem] leading-[1.04] sm:text-5xl lg:text-[3.6rem] text-white tracking-[-0.03em]">
                KPX Jr — Build robots.
                <span className="block text-electric">Program ideas.</span>
                <span className="block text-amber">Connect the world.</span>
              </h1>

              <p className="mt-5 text-mist text-sm md:text-base max-w-xl leading-relaxed">{PAGES.program.sub}</p>

              <div className="mt-8 flex flex-col sm:flex-row gap-3.5">
                {unlocked ? (
                  <button
                    onClick={() => goToLevel(1)}
                    className="btn-glow inline-flex items-center justify-center gap-2 rounded-xl px-7 py-3.5 font-head font-bold text-sm text-white cursor-pointer"
                  >
                    Start with Level 1 <ArrowRight size={17} strokeWidth={2.5} />
                  </button>
                ) : (
                  <button
                    onClick={() => openLead("/kpx-jr")}
                    className="btn-glow inline-flex items-center justify-center gap-2 rounded-xl px-7 py-3.5 font-head font-bold text-sm text-white cursor-pointer"
                  >
                    <Fingerprint size={17} /> {PAGES.program.lockedCta}
                  </button>
                )}
                <button
                  onClick={() => scrollToId("levels")}
                  className="btn-ghost inline-flex items-center justify-center gap-2 rounded-xl px-7 py-3.5 font-head font-bold text-sm text-white cursor-pointer"
                >
                  {PAGES.program.levelsTitle} <ArrowDown size={16} />
                </button>
              </div>

              <p className="mt-6 text-sm text-mist/70">{PAGES.program.gatewayNote}</p>
            </div>

            <div className="relative">
              <LevelStack />
              {!unlocked && (
                <span className="absolute top-2 right-2 inline-flex items-center gap-1.5 rounded-full border border-electric/30 bg-abyss/80 px-3 py-1.5 text-sm font-semibold text-electric-soft backdrop-blur-sm">
                  <Fingerprint size={12} /> Access locked
                </span>
              )}
            </div>
          </div>

          {/* level path */}
          <div className="mt-14 md:mt-16 glass-card p-6 md:p-8">
            <LevelPath compact />
          </div>
        </div>
      </section>

      {/* ── gated body ────────────────────────────────────────── */}
      <section id="levels" className="relative py-16 md:py-24 scroll-mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {!unlocked ? (
            <div className="space-y-16">
              <div className="text-center max-w-xl mx-auto">
                <p className="tech-label text-[10px] text-electric mb-3">{PAGES.program.kicker}</p>
                <h2 className="font-head font-extrabold text-2xl md:text-3xl text-white tracking-tight">{PAGES.program.levelsTitle}</h2>
                <p className="mt-3 text-mist text-sm">{PAGES.program.levelsSub}</p>
              </div>
              <LockedPanel
                title={PAGES.program.lockedTitle}
                sub={PAGES.program.lockedSub}
                cta={PAGES.program.lockedCta}
                onUnlock={() => openLead("/kpx-jr")}
              />
            </div>
          ) : (
            <div className="space-y-20 md:space-y-24">
              <IntroFlow />
              <WhyKpx />

              <div>
                <div className="text-center max-w-xl mx-auto mb-10">
                  <p className="tech-label text-[10px] text-electric mb-3">Levels 01 – 04</p>
                  <h2 className="font-head font-extrabold text-2xl md:text-3xl text-white tracking-tight">{PAGES.program.levelsTitle}</h2>
                  <p className="mt-3 text-mist text-sm">{PAGES.program.levelsSub}</p>
                </div>
                <div ref={levels} className="reveal grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  {KPX.levels.map((lvl, i) => (
                    <LevelCard key={lvl.id} level={lvl} index={i} />
                  ))}
                </div>
                <p className="mt-6 text-center text-[12px] text-mist/70">
                  Each level opens as its own page — projects, objective and kit format.{" "}
                  <button onClick={() => navigate("/")} className="text-electric-soft hover:text-white underline underline-offset-4 cursor-pointer">
                    Back to home
                  </button>
                </p>
              </div>

              <Kits />
              <Partners />
              <FinalCta lead={lead} />
            </div>
          )}
        </div>
      </section>

    </div>
  );
}
