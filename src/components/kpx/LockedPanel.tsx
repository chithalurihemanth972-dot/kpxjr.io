import { ArrowRight, Fingerprint, Lock } from "lucide-react";
import { HudCorners } from "../HudFrame";

/* ═══════════════════════════════════════════════════════════════
   LockedPanel — the gated state used on every KPX Jr route.
   Decorative scaffold is blurred + aria-hidden; only the real
   unlock button is focusable.
   ═══════════════════════════════════════════════════════════════ */
export default function LockedPanel({
  title,
  sub,
  cta,
  onUnlock,
  rows = 4,
}: {
  title: string;
  sub: string;
  cta: string;
  onUnlock: () => void;
  rows?: number;
}) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-electric/25 bg-navy/50">
      {/* blurred data scaffold */}
      <div className="p-6 sm:p-10 grid sm:grid-cols-2 gap-5 blur-[6px] select-none" aria-hidden="true">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-electric/20 bg-panel/50 p-6 space-y-3">
            <div className="flex items-center justify-between">
              <span className="tech-label text-[10px] text-mist/60">LVL 0{i + 1} // ENCRYPTED</span>
              <Lock size={13} className="text-mist/50" />
            </div>
            <div className="data-bar h-4 w-3/4" style={{ ["--scan-delay" as string]: `${i * 350}ms` }} />
            <div className="data-bar h-3 w-1/2" style={{ ["--scan-delay" as string]: `${i * 450 + 200}ms` }} />
            <div className="grid grid-cols-3 gap-2 pt-2">
              {[0, 1, 2].map((n) => (
                <div key={n} className="data-bar h-8" style={{ ["--scan-delay" as string]: `${n * 300 + i * 150}ms` }} />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* lock overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-abyss/75 backdrop-blur-[3px] text-center px-6 py-14">
        <HudCorners color="rgba(255,200,87,0.7)" size={20} thickness={2} />
        <span className="sensor-pulse relative flex items-center justify-center w-20 h-20 rounded-full border border-electric/50 bg-abyss">
          <Lock size={30} className="text-electric" aria-hidden="true" />
        </span>
        <h2 className="mt-6 font-head font-extrabold text-xl md:text-2xl text-white tracking-tight">{title}</h2>
        <p className="mt-2 text-mist text-sm max-w-sm">{sub}</p>
        <button
          onClick={onUnlock}
          className="btn-glow mt-7 inline-flex items-center gap-2 rounded-xl px-7 py-3.5 font-head font-bold text-sm text-white cursor-pointer"
        >
          <Fingerprint size={17} /> {cta} <ArrowRight size={16} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}
