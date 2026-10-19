import { lazy, Suspense } from "react";
import { PROJECTS } from "../data/content";
import { useReveal } from "../lib/hooks";
import { SectionHead } from "./HudFrame";
import type { RoverKind } from "./Rover3D";

const Rover3D = lazy(() => import("./Rover3D"));
const KINDS: RoverKind[] = ["vajra", "mafiya"];

/* ═══════════════════════════════════════════════════════════════
   PROJECTS — each build is shown as a live 3D model.
   Set `image` in content.ts to a real photo to replace the model.
   ═══════════════════════════════════════════════════════════════ */
export default function Projects() {
  const cards = useReveal();
  const timeline = useReveal();

  return (
    <section id="projects" className="relative py-24 md:py-36 bg-navy/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <SectionHead kicker={PROJECTS.kicker} title={PROJECTS.title} sub={PROJECTS.sub} align="left" />

        <div ref={cards} className="reveal grid md:grid-cols-2 gap-6">
          {PROJECTS.items.map((p, i) => (
            <article key={p.name} className="glass-card overflow-hidden" style={{ ["--reveal-delay" as string]: `${i * 120}ms` }}>
              {p.image ? (
                <img src={p.image} alt={`${p.name} rover`} className="w-full aspect-[16/10] object-cover" loading="lazy" />
              ) : (
                <div
                  className="relative aspect-[16/10] border-b border-white/5"
                  style={{ background: "radial-gradient(60% 70% at 50% 55%, rgba(91,124,255,0.28), transparent 75%)" }}
                >
                  <Suspense fallback={null}>
                    <Rover3D kind={KINDS[i % KINDS.length]} className="absolute inset-0" />
                  </Suspense>
                </div>
              )}

              <div className="p-7">
                <h3 className="font-head font-bold text-3xl text-white tracking-tight">{p.name}</h3>
                <p className="mt-2.5 text-mist leading-relaxed">{p.desc}</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {p.tags.map((t) => (
                    <span key={t} className="rounded-full border border-white/10 bg-white/5 px-3.5 py-1 text-sm font-medium text-electric-soft">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* process: this one is a real sequence, so the steps are numbered */}
        <div ref={timeline} className="reveal mt-24">
          <h3 className="font-head font-bold text-2xl md:text-3xl text-white tracking-tight mb-10">{PROJECTS.process.title}</h3>
          <ol className="grid gap-5 md:grid-cols-5">
            {PROJECTS.process.steps.map((s, i) => (
              <li key={s.n} className="relative pt-5 border-t-2" style={{ borderColor: i === 0 ? "#5B7CFF" : "rgba(157,178,255,0.2)" }}>
                <span className="font-head font-bold text-sm text-electric-soft">{s.n}</span>
                <p className="mt-2 font-head font-semibold text-lg text-white leading-snug">{s.title}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
