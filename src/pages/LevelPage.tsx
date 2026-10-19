import { ArrowLeft, ArrowRight, ChevronRight, Clock, Fingerprint, House, Package } from "lucide-react";
import { FinalCta, Kits, LevelPath } from "../components/kpx/blocks";
import LockedPanel from "../components/kpx/LockedPanel";
import { lazy, Suspense } from "react";
import { DynIcon } from "../components/IconMap";
import { HudCorners } from "../components/HudFrame";
import { useSite } from "../context/SiteContext";
import { KPX, PAGES, type JrLevel } from "../data/content";
import { useReveal } from "../lib/hooks";
import { themeFor } from "../components/kpx/theme";
import { cn } from "../utils/cn";

const LevelScene3D = lazy(() => import("../components/LevelScene3D"));

/* ═══════════════════════════════════════════════════════════════
   PAGE — /kpx-jr/level-1 … /level-4
   One level per page, gated before unlock.
   ═══════════════════════════════════════════════════════════════ */
export default function LevelPage({ levelNumber }: { levelNumber: number }) {
  const level = KPX.levels[levelNumber - 1] as JrLevel | undefined;
  const { unlocked, highlight, lead, openLead, goToLevel } = useSite();
  const projectsRef = useReveal();

  if (!level) return null;

  const t = themeFor(levelNumber);
  const prev = levelNumber > 1 ? levelNumber - 1 : null;
  const next = levelNumber < KPX.levels.length ? levelNumber + 1 : null;

  return (
    <div id="kpx-main" className={highlight ? "kpx-highlight" : undefined}>
      {/* ── level hero ────────────────────────────────────────── */}
      <section className="relative pt-28 md:pt-36 pb-14 md:pb-20 overflow-hidden">
        <div
          className="absolute -top-24 right-0 w-[760px] h-[760px] rounded-full blur-[130px] opacity-25 pointer-events-none"
          style={{ background: t.hexColor }}
          aria-hidden="true"
        />
        <span
          className="hidden lg:block absolute top-24 right-[6%] font-head font-bold text-[13rem] leading-none opacity-[0.05] select-none pointer-events-none"
          aria-hidden="true"
        >
          0{levelNumber}
        </span>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
          {/* breadcrumb */}
          <nav aria-label="Breadcrumb" className="mb-8">
            <ol className="flex flex-wrap items-center gap-2 text-[11px] font-semibold text-mist/70">
              <li><a href="#/" className="hover:text-white transition-colors">Home</a></li>
              <ChevronRight size={11} aria-hidden="true" />
              <li><a href="#/kpx-jr" className="hover:text-white transition-colors">KPX Jr</a></li>
              <ChevronRight size={11} aria-hidden="true" />
              <li style={{ color: t.hexColor }} aria-current="page">{level.name}</li>
            </ol>
          </nav>

          <div className="grid lg:grid-cols-[1.25fr_0.75fr] gap-10 items-start">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <span
                  className="font-head font-semibold text-sm rounded-full border px-3.5 py-1.5"
                  style={{ borderColor: `${t.hexColor}66`, background: t.soft, color: t.hexColor }}
                >
                  {level.index}
                </span>
                
              </div>

              <h1 className="mt-5 font-head font-bold text-[2.4rem] leading-[1.04] sm:text-5xl lg:text-[3.6rem] text-white tracking-[-0.03em]">
                {level.name}
                <span className="block" style={{ color: t.hexColor }}>{level.title}</span>
              </h1>

              {level.tagline && (
                <p className="mt-4 font-head font-bold text-sm md:text-base max-w-xl" style={{ color: t.hexColor }}>
                  “{level.tagline}”
                </p>
              )}

              <div className="mt-5 flex flex-wrap gap-2">
                {level.focus.map((f) => (
                  <span key={f} className="rounded-full border border-white/12 bg-white/5 px-3 py-1.5 text-[11px] font-semibold text-mist">
                    {f}
                  </span>
                ))}
              </div>

              <div className="mt-8 flex flex-col sm:flex-row gap-3.5">
                {!unlocked && (
                  <button
                    onClick={() => openLead(`/kpx-jr/level-${levelNumber}`)}
                    className="btn-glow inline-flex items-center justify-center gap-2 rounded-xl px-7 py-3.5 font-head font-bold text-sm text-white cursor-pointer"
                  >
                    <Fingerprint size={17} /> {PAGES.level.lockedCta}
                  </button>
                )}
                <a
                  href="#/kpx-jr"
                  className="btn-ghost inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 font-head font-bold text-[13px] text-white"
                >
                  <ArrowLeft size={15} /> {PAGES.level.backToProgram}
                </a>
              </div>
            </div>

            {/* floating 3D object + level stats card */}
            <div>
            <div className="relative h-[300px] sm:h-[340px] -mx-4 sm:mx-0 mb-2">
              <Suspense fallback={null}>
                <LevelScene3D level={levelNumber} color={t.hexColor} className="absolute inset-0" />
              </Suspense>
            </div>
            <div className="relative glass-card p-6" style={{ borderColor: `${t.hexColor}40` }}>
              <HudCorners color={`${t.hexColor}99`} size={14} />
              <p className="tech-label text-[9px] text-mist/70">{PAGES.level.formatTitle}</p>
              <ul className="mt-4 space-y-3.5">
                {[
                  { icon: Clock, label: PAGES.level.formatSessions },
                  { icon: Clock, label: PAGES.level.formatHours },
                  { icon: House, label: PAGES.level.formatTakeHome },
                  { icon: Package, label: `${level.projects.length} project kits` },
                ].map(({ icon: Icon, label }) => (
                  <li key={label} className="flex items-center gap-3 text-[12.5px] font-semibold text-white">
                    <span className="flex items-center justify-center w-8 h-8 rounded-md border shrink-0" style={{ borderColor: `${t.hexColor}40`, background: t.soft }}>
                      <Icon size={14} style={{ color: t.hexColor }} aria-hidden="true" />
                    </span>
                    {label}
                  </li>
                ))}
              </ul>
            </div>
            </div>
          </div>

          {/* pathway visual */}
          <div className="mt-12 glass-card p-6 md:p-8">
            <LevelPath active={levelNumber} compact />
          </div>
        </div>
      </section>

      {/* ── level body ────────────────────────────────────────── */}
      <section className="relative py-14 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {!unlocked ? (
            <LockedPanel
              title={PAGES.level.lockedTitle}
              sub={PAGES.level.lockedSub}
              cta={PAGES.level.lockedCta}
              onUnlock={() => openLead(`/kpx-jr/level-${levelNumber}`)}
              rows={2}
            />
          ) : (
            <div className="space-y-16 md:space-y-20">
              {/* objective / description */}
              <div className="grid lg:grid-cols-2 gap-6">
                <article className="relative glass-card p-7 md:p-8" style={{ borderColor: `${t.hexColor}40` }}>
                  <HudCorners color={`${t.hexColor}99`} />
                  <p className="tech-label text-[9px]" style={{ color: t.hexColor }}>
                    {PAGES.level.objectiveTitle}
                  </p>
                  <p className="mt-3 text-mist text-[14.5px] leading-relaxed">
                    {level.objective ?? level.description}
                  </p>
                  {level.description && level.objective && (
                    <p className="mt-4 text-mist text-[14.5px] leading-relaxed">{level.description}</p>
                  )}
                </article>

                <article className="relative glass-card p-7 md:p-8">
                  <HudCorners />
                  <p className="tech-label text-[9px] text-electric">
                    {level.projects.length} PROJECTS · {level.projects.map((p) => p.kit.split(" ")[1]).join(" / ")} KITS
                  </p>
                  <h2 className="mt-3 font-head font-extrabold text-xl text-white tracking-tight">{PAGES.level.projectsTitle}</h2>
                  <div className="mt-5 flex items-center gap-4">
                    <span className="font-tech font-black text-4xl leading-none" style={{ color: t.hexColor }}>
                      {String(level.projects.length).padStart(2, "0")}
                    </span>
                    <p className="text-mist text-[13px] leading-relaxed">
                      Built with the {KPX.kits.core.name.toLowerCase()} plus one mission-specific project kit per build.
                    </p>
                  </div>
                  {level.projectNote && (
                    <p className="mt-4 pt-4 border-t border-white/10 text-mist text-[12.5px] leading-relaxed">{level.projectNote}</p>
                  )}
                </article>
              </div>

              {/* project grid */}
              <div ref={projectsRef} className="reveal">
                <div className="flex items-end justify-between gap-4 mb-6">
                  <h2 className="font-head font-extrabold text-xl md:text-2xl text-white tracking-tight">{PAGES.level.projectsTitle}</h2>
                  <span className="tech-label text-[9px] text-mist/60 hidden sm:block">KITS 01 – 06</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {level.projects.map((p, i) => (
                    <article
                      key={p.code}
                      className="relative glass-card p-5 flex items-center gap-4"
                      >
                      <span
                        className="flex items-center justify-center w-12 h-12 rounded-lg shrink-0 border"
                        style={{ background: t.soft, borderColor: `${t.hexColor}55` }}
                      >
                        <DynIcon name={p.icon} size={21} style={{ color: t.hexColor }} aria-hidden="true" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="tech-label text-[8px] text-mist/60">
                          {p.code} · {p.kit}
                        </p>
                        <h3 className="font-head font-bold text-[13.5px] text-white leading-snug mt-0.5">{p.name}</h3>
                      </div>
                      <span className="font-tech font-bold text-[10px]" style={{ color: `${t.hexColor}80` }} aria-hidden="true">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                    </article>
                  ))}
                </div>
              </div>

              {/* kit note */}
              <div>
                <div className="text-center mb-8">
                  <h2 className="font-head font-extrabold text-xl md:text-2xl text-white tracking-tight">{PAGES.level.kitTitle}</h2>
                  <a href="#/kpx-jr" className="mt-2 inline-flex items-center gap-1.5 text-[12px] font-semibold text-electric-soft hover:text-white transition-colors">
                    {PAGES.level.kitLink} <ArrowRight size={13} />
                  </a>
                </div>
                <Kits hideTitle />
              </div>

              <FinalCta lead={lead} />

              {/* prev / next level */}
              <nav aria-label="Level navigation" className="grid sm:grid-cols-2 gap-4">
                {prev ? (
                  <button
                    onClick={() => goToLevel(prev)}
                    className="group flex items-center gap-4 glass-card p-5 text-left hover:border-electric/60 transition-colors cursor-pointer"
                  >
                    <ArrowLeft size={18} className="text-electric shrink-0 group-hover:-translate-x-1 transition-transform" aria-hidden="true" />
                    <span>
                      <span className="tech-label block text-[8px] text-mist/60">{PAGES.level.prev}</span>
                      <span className="mt-1 block font-head font-bold text-sm text-white">
                        {KPX.levels[prev - 1].name} — {KPX.levels[prev - 1].title}
                      </span>
                    </span>
                  </button>
                ) : (
                  <a
                    href="#/kpx-jr"
                    className="group flex items-center gap-4 glass-card p-5 hover:border-electric/60 transition-colors"
                  >
                    <ArrowLeft size={18} className="text-electric shrink-0 group-hover:-translate-x-1 transition-transform" aria-hidden="true" />
                    <span>
                      <span className="tech-label block text-[8px] text-mist/60">Back</span>
                      <span className="mt-1 block font-head font-bold text-sm text-white">KPX Jr — Full program</span>
                    </span>
                  </a>
                )}

                {next ? (
                  <button
                    onClick={() => goToLevel(next)}
                    className="group flex items-center justify-end gap-4 glass-card p-5 text-right hover:border-electric/60 transition-colors cursor-pointer sm:text-right"
                  >
                    <span>
                      <span className="tech-label block text-[8px] text-mist/60">{PAGES.level.next}</span>
                      <span className="mt-1 block font-head font-bold text-sm text-white">
                        {KPX.levels[next - 1].name} — {KPX.levels[next - 1].title}
                      </span>
                    </span>
                    <ArrowRight size={18} className="text-electric shrink-0 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
                  </button>
                ) : (
                  <a
                    href="#/kpx-jr"
                    className="group flex items-center justify-end gap-4 glass-card p-5 text-right hover:border-electric/60 transition-colors"
                  >
                    <span>
                      <span className="tech-label block text-[8px] text-mist/60">Program complete</span>
                      <span className="mt-1 block font-head font-bold text-sm text-white">All KPX Jr levels</span>
                    </span>
                    <ArrowRight size={18} className="text-electric shrink-0 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
                  </a>
                )}
              </nav>
            </div>
          )}
        </div>
      </section>

      {/* theme accent hairline */}
      <div className={cn("h-px w-full")} style={{ background: `linear-gradient(90deg, transparent, ${t.hexColor}66, transparent)` }} aria-hidden="true" />
    </div>
  );
}
