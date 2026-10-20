import { useState } from "react";
import { ArrowRight, CheckCircle2, Lock, Loader2, MessageCircle, PhoneCall } from "lucide-react";
import { KPX, PAGES, type JrLevel } from "../../data/content";
import { useReveal } from "../../lib/hooks";
import { queueLead, sendLeadToBackend, whatsappLink, type LeadPayload } from "../../lib/lead";
import { useSite } from "../../context/SiteContext";
import { DynIcon } from "../IconMap";
import { HexIcon, HudCorners } from "../HudFrame";
import { LEVEL_THEME, themeFor } from "./theme";
import { cn } from "../../utils/cn";

/* ═══════════════════════════════════════════════════════════════
   BUILD → PROGRAM → CONNECT → CREATE
   ═══════════════════════════════════════════════════════════════ */
export function IntroFlow({ sub = KPX.intro.sub }: { sub?: string }) {
  const ref = useReveal();
  return (
    <div ref={ref} className="reveal text-center">
      <h2 className="font-head font-extrabold text-2xl md:text-3xl text-white tracking-tight">{KPX.intro.title}</h2>
      <p className="mt-3 text-mist text-sm md:text-base">{sub}</p>

      <div className="relative mt-10 max-w-3xl mx-auto">
        <svg className="hidden sm:block absolute top-8 left-[12%] w-[76%] h-2" aria-hidden="true">
          <line x1="0" y1="4" x2="100%" y2="4" stroke="rgba(91,124,255,0.45)" strokeWidth="1.5" className="flow-line" />
        </svg>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-3">
          {KPX.intro.flow.map((f, i) => (
            <div key={f.label} className="flex flex-col items-center" style={{ ["--reveal-delay" as string]: `${i * 110}ms` }}>
              <HexIcon size={64} amber={i === 3} className="relative z-10 !bg-abyss">
                <DynIcon name={f.icon} size={24} className={i === 3 ? "text-amber" : "text-electric-soft"} strokeWidth={1.8} />
              </HexIcon>
              <span className="mt-3 tech-label text-[10px] text-white">{f.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Why KPX Jr — 8 points
   ═══════════════════════════════════════════════════════════════ */
export function WhyKpx() {
  const ref = useReveal();
  return (
    <div ref={ref} className="reveal">
      <h2 className="font-head font-extrabold text-2xl md:text-3xl text-white tracking-tight text-center mb-10">{KPX.why.title}</h2>
      <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {KPX.why.items.map((w, i) => (
          <li
            key={w.text}
            className="glass-card !rounded-xl flex items-center gap-3.5 px-5 py-4"
            style={{ ["--reveal-delay" as string]: `${(i % 4) * 80}ms` }}
          >
            <span className="flex items-center justify-center w-10 h-10 rounded-lg bg-electric/12 border border-electric/30 shrink-0">
              <DynIcon name={w.icon} size={18} className="text-electric-soft" aria-hidden="true" />
            </span>
            <span className="text-[13px] font-semibold text-white leading-snug">{w.text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Progress path — one journey, four engineering levels
   ═══════════════════════════════════════════════════════════════ */
export function LevelPath({ active, compact = false }: { active?: number; compact?: boolean }) {
  const { goToLevel, unlocked } = useSite();
  return (
    <div className="relative max-w-3xl mx-auto">
      {!compact && <p className="text-center text-mist text-sm mb-8 max-w-xl mx-auto">{KPX.levelsSub}</p>}
      <div className="relative">
        <svg className="hidden md:block absolute top-7 left-[12%] w-[76%] h-2" aria-hidden="true">
          <line x1="0" y1="4" x2="100%" y2="4" stroke="rgba(91,124,255,0.4)" strokeWidth="1.5" className="flow-line" />
        </svg>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-y-7">
          {KPX.levels.map((lvl, i) => {
            const t = LEVEL_THEME[lvl.id];
            const isActive = active === i + 1;
            return (
              <button
                key={lvl.id}
                onClick={() => goToLevel(i + 1)}
                className="flex flex-col items-center gap-2.5 cursor-pointer group"
                aria-current={isActive ? "page" : undefined}
                aria-label={`Open ${lvl.name} — ${lvl.title}${unlocked ? "" : " (unlock required)"}`}
              >
                <span
                  className="relative z-10 w-14 h-14 rounded-full border-2 bg-abyss flex items-center justify-center font-tech font-bold text-sm transition-all duration-300 group-hover:scale-110"
                  style={{
                    borderColor: isActive ? t.hexColor : "rgba(91,124,255,0.25)",
                    color: isActive ? t.hexColor : "#b9cbe4",
                    boxShadow: isActive ? `0 0 24px ${t.hexColor}55` : undefined,
                  }}
                >
                  {i + 1}
                  {!unlocked && (
                    <Lock size={10} className="absolute -top-0.5 -right-0.5 text-mist/70" aria-hidden="true" />
                  )}
                </span>
                <span className={cn("tech-label text-[9px] transition-colors text-center", isActive ? "text-white" : "text-mist/70 group-hover:text-white")}>
                  {lvl.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Level card — used on the KPX Jr program page
   ═══════════════════════════════════════════════════════════════ */
export function LevelCard({ level, index }: { level: JrLevel; index: number }) {
  const t = themeFor(index + 1);
  const { goToLevel } = useSite();

  return (
    <article
      className="relative glass-card p-6 md:p-7 overflow-hidden flex flex-col h-full"
      style={{ ["--reveal-delay" as string]: `${index * 90}ms`, borderColor: `${t.hexColor}45` }}
    >
      <HudCorners color={`${t.hexColor}99`} size={14} />
      <div
        className="absolute -top-20 -right-16 w-48 h-48 rounded-full blur-[80px] opacity-20 pointer-events-none"
        style={{ background: t.hexColor }}
        aria-hidden="true"
      />

      <div className="flex items-start justify-between gap-3">
        <span className="tech-label text-[10px] rounded-full border px-3 py-1" style={{ borderColor: `${t.hexColor}55`, background: `${t.hexColor}14`, color: t.hexColor }}>
          {level.index}
        </span>
        <span className="font-tech font-black text-3xl leading-none opacity-25" style={{ color: t.hexColor }} aria-hidden="true">
          0{index + 1}
        </span>
      </div>

      <h3 className="mt-4 font-head font-extrabold text-lg text-white tracking-tight">{level.name}</h3>
      <p className="mt-1 font-head font-bold text-[13px] leading-snug" style={{ color: t.hexColor }}>
        {level.title}
      </p>
      <p className="mt-3 text-mist text-[13px] leading-relaxed line-clamp-2 min-h-[2.6rem]">
        {level.tagline ? `“${level.tagline}”` : level.objective ?? ""}
      </p>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {level.focus.slice(0, 3).map((f) => (
          <span key={f} className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-semibold text-mist">
            {f}
          </span>
        ))}
        {level.focus.length > 3 && (
          <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-semibold text-mist">
            +{level.focus.length - 3}
          </span>
        )}
      </div>

      <div className="mt-auto pt-4 border-t border-white/10 flex items-center justify-between gap-3">
        <span className="tech-label text-[9px] text-mist/70">{level.projects.length} PROJECTS</span>
        <button
          onClick={() => goToLevel(index + 1)}
          className="inline-flex items-center gap-1.5 font-head font-bold text-[12px] cursor-pointer hover:gap-2.5 transition-all"
          style={{ color: t.hexColor }}
        >
          {PAGES.program.openLevel} <ArrowRight size={14} strokeWidth={2.5} />
        </button>
      </div>
    </article>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Core Kit + Project Kit
   ═══════════════════════════════════════════════════════════════ */
export function Kits({ hideTitle = false }: { hideTitle?: boolean }) {
  const ref = useReveal();
  return (
    <div ref={ref} className="reveal">
      {!hideTitle && (
        <div className="text-center mb-10">
          <h2 className="font-head font-extrabold text-2xl md:text-3xl text-white tracking-tight">{KPX.kits.title}</h2>
          <p className="mt-3 text-mist text-sm md:text-base">{KPX.kits.sub}</p>
        </div>
      )}
      <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {[KPX.kits.core, KPX.kits.project].map((k, i) => (
          <article key={k.name} className="glass-card p-7 text-center" style={{ ["--reveal-delay" as string]: `${i * 120}ms` }}>
            <HudCorners color={i === 0 ? "rgba(91,124,255,0.6)" : "rgba(255,200,87,0.6)"} />
            <div className="flex justify-center">
              <HexIcon size={66} amber={i === 1}>
                <DynIcon name={k.icon} size={26} className={i === 1 ? "text-amber" : "text-electric-soft"} strokeWidth={1.7} />
              </HexIcon>
            </div>
            <h3 className="mt-5 font-head font-extrabold text-lg text-white tracking-tight">{k.name}</h3>
            <p className="mt-2 text-mist text-sm leading-relaxed">{k.desc}</p>
          </article>
        ))}
      </div>
      <div className="mt-8 flex flex-wrap justify-center gap-2.5 max-w-3xl mx-auto">
        {KPX.kits.extras.map((e) => (
          <span key={e} className="tech-label !normal-case !tracking-[0.12em] rounded-full border border-electric/25 bg-navy/60 px-4 py-2 text-[10px] text-mist">
            + {e}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Why Schools Partner / Why Parents Choose KPX Jr.
   ═══════════════════════════════════════════════════════════════ */
export function Partners() {
  const ref = useReveal();
  return (
    <div ref={ref} className="reveal grid lg:grid-cols-2 gap-6">
      <div className="glass-card p-7 md:p-9">
        <HudCorners />
        <h2 className="font-head font-extrabold text-xl md:text-2xl text-white tracking-tight">{KPX.partners.schools.title}</h2>
        <ul className="mt-7 space-y-5">
          {KPX.partners.schools.items.map((s) => (
            <li key={s.title} className="flex gap-4">
              <span className="flex items-center justify-center w-11 h-11 rounded-lg bg-electric/12 border border-electric/30 shrink-0">
                <DynIcon name={s.icon} size={19} className="text-electric-soft" aria-hidden="true" />
              </span>
              <div>
                <p className="font-head font-bold text-[15px] text-white">{s.title}</p>
                <p className="text-mist text-[13px] mt-1 leading-relaxed">{s.desc}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="glass-card p-7 md:p-9 !border-amber/30 bg-gradient-to-b from-amber/[0.05] to-navy/50">
        <HudCorners color="rgba(255,200,87,0.6)" />
        <h2 className="font-head font-extrabold text-xl md:text-2xl text-white tracking-tight">{KPX.partners.parents.title}</h2>
        <ul className="mt-7 space-y-5">
          {KPX.partners.parents.items.map((p) => (
            <li key={p.verb} className="flex gap-4 items-start">
              <span className="flex items-center justify-center w-11 h-11 rounded-lg bg-amber/12 border border-amber/30 shrink-0">
                <DynIcon name={p.icon} size={19} className="text-amber" aria-hidden="true" />
              </span>
              <div>
                <p className="font-head font-bold text-[15px] text-white">
                  <span className="tech-label !text-[11px] text-amber mr-2">{p.verb}</span>
                </p>
                <p className="text-mist text-[13px] mt-1 leading-relaxed">{p.desc}</p>
              </div>
            </li>
          ))}
        </ul>
        <p className="mt-7 pt-5 border-t border-amber/20 text-center font-head font-bold text-sm text-amber">
          “{KPX.partners.parents.tagline}”
        </p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Final CTA — callback request (reuses saved lead) + WhatsApp
   ═══════════════════════════════════════════════════════════════ */
export function FinalCta({ lead }: { lead: LeadPayload | null }) {
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const requestCallback = async () => {
    if (!lead || state === "sending" || state === "sent") return;
    setState("sending");
    try {
      await sendLeadToBackend({ ...lead, source: "callback_request", timestamp: new Date().toISOString() });
      setState("sent");
    } catch {
      /* Mail server hiccup — park the lead and retry on the next visit. */
      queueLead({ ...lead, source: "callback_request", timestamp: new Date().toISOString() });
      setState("error");
    }
  };

  return (
    <div className="relative overflow-hidden rounded-3xl border border-electric/30 bg-gradient-to-br from-panel via-navy to-abyss blueprint-grid-fine p-8 sm:p-14 text-center">
      <HudCorners color="rgba(255,200,87,0.65)" size={20} thickness={2.5} />
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[480px] h-[300px] rounded-full bg-electric/15 blur-[100px] pointer-events-none" aria-hidden="true" />

      <p className="tech-label text-[10px] text-electric mb-4">FINAL TRANSMISSION</p>
      <h2 className="font-head font-black text-3xl md:text-4xl text-white tracking-tight">{KPX.finalCta.title}</h2>
      <p className="mt-4 text-mist text-sm md:text-base max-w-md mx-auto">{KPX.finalCta.sub}</p>

      <div className="mt-9 flex flex-col sm:flex-row justify-center gap-4">
        <button
          onClick={requestCallback}
          disabled={state === "sending" || state === "sent"}
          className="btn-glow inline-flex items-center justify-center gap-2.5 rounded-xl px-8 py-4 font-head font-extrabold text-sm text-white cursor-pointer disabled:opacity-80 disabled:cursor-default"
        >
          {state === "sending" ? (
            <>
              <Loader2 size={17} className="animate-spin" /> Transmitting…
            </>
          ) : state === "sent" ? (
            <>
              <CheckCircle2 size={17} className="text-jr3" /> Callback requested ✓
            </>
          ) : (
            <>
              <PhoneCall size={17} /> {KPX.finalCta.callback}
            </>
          )}
        </button>
        <a
          href={whatsappLink("Hi KProjectXX! I just unlocked KPX Jr and would like to know more.")}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-ghost inline-flex items-center justify-center gap-2.5 rounded-xl px-8 py-4 font-head font-extrabold text-sm text-white"
          style={{ borderColor: "rgba(52,209,127,0.5)", background: "rgba(52,209,127,0.08)" }}
        >
          <MessageCircle size={17} className="text-jr3" /> {KPX.finalCta.whatsapp}
        </a>
      </div>
      {state === "error" && <p className="mt-4 text-[12px] text-red-300">Could not send — please use WhatsApp instead.</p>}
      {lead && state !== "sent" && (
        <p className="mt-4 tech-label text-[9px] text-mist/70">
          REGISTERED: {lead.name.toUpperCase()} · {lead.mobile}
        </p>
      )}
    </div>
  );
}
