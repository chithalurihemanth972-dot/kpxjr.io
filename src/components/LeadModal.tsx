import { useEffect, useRef, useState } from "react";
import { AlertTriangle, GraduationCap, Loader2, Radar, Users, X } from "lucide-react";
import { LEAD_FORM } from "../data/content";
import { useLockBody } from "../lib/hooks";
import { isValidIndianMobile, persistUnlock, queueLead, sanitizeMobile, sendLeadToBackend, teamNotifyMessage, whatsappLink, type LeadPayload, type LeadRole } from "../lib/lead";
import { HudCorners } from "./HudFrame";
import { cn } from "../utils/cn";

/* ── Role pill meta ─────────────────────────────────────────── */
const ROLE_META: { role: LeadRole; hint: string; icon: typeof Users }[] = [
  { role: "Parent", hint: "For my child", icon: Users },
  { role: "Guide", hint: "Mentor / educator", icon: Radar },
  { role: "School", hint: "For our students", icon: GraduationCap },
];

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: (lead: LeadPayload) => void;
}

/* ═══════════════════════════════════════════════════════════════
   LEAD-CAPTURE MODAL — gates the KPX Jr program.
   Includes: +91 validation, role pills, honeypot spam guard,
   min-fill-time guard, loading + error states, success screen.
   ═══════════════════════════════════════════════════════════════ */
export default function LeadModal({ open, onClose, onSuccess }: Props) {
  useLockBody(open);

  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [role, setRole] = useState<LeadRole | "">("");
  const [school, setSchool] = useState("");
  const [consent, setConsent] = useState(false);
  const [honey, setHoney] = useState(""); // honeypot — invisible to humans
  const [queued, setQueued] = useState(false); // delivery failed → retry later
  const [openedAt, setOpenedAt] = useState(() => Date.now());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [phase, setPhase] = useState<"form" | "sending" | "success">("form");

  const panelRef = useRef<HTMLDivElement | null>(null);

  /* Close on Escape */
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && phase === "form" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose, phase]);

  /* Autofocus first field */
  useEffect(() => {
    if (open) {
      setOpenedAt(Date.now()); // restart the bot-speed timer on every open
      setTimeout(() => panelRef.current?.querySelector<HTMLInputElement>("input")?.focus(), 350);
    } else {
      // reset when closed so a second open starts fresh
      setPhase("form");
      setErrors({});
      setQueued(false);
    }
  }, [open]);

  if (!open) return null;

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (name.trim().length < 2) e.name = LEAD_FORM.errors.name;
    if (!isValidIndianMobile(mobile)) e.mobile = LEAD_FORM.errors.mobile;
    if (!role) e.role = LEAD_FORM.errors.role;
    if (!consent) e.consent = LEAD_FORM.errors.consent;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();

    /* Spam guard 1: honeypot filled → silently "succeed" */
    if (honey) {
      setPhase("success");
      setTimeout(onClose, 1800);
      return;
    }
    /* Field validation first, so people always get helpful errors. */
    if (!validate()) return;
    /* Spam guard 2: impossibly fast fill (< 2.5 s) → reject quietly */
    if (Date.now() - openedAt < 2500) {
      setErrors({ submit: LEAD_FORM.errors.submit });
      return;
    }

    const lead: LeadPayload = {
      name: name.trim(),
      mobile: `+91${mobile}`,
      type: role as LeadRole,
      school: role === "School" ? school.trim() : "",
      source: "kpx_unlock",
      timestamp: new Date().toISOString(),
    };

    setPhase("sending");
    try {
      await sendLeadToBackend(lead, { hp: honey, elapsedMs: Date.now() - openedAt });
      persistUnlock(lead);
      setPhase("success");
      /* Let the success animation play, then hand over to the app. */
      setTimeout(() => onSuccess(lead), 2100);
    } catch {
      /* Our mail server is unreachable — that is our problem, not the
         visitor's. Keep the lead, unlock the content, and retry delivery
         on the next visit instead of locking them out. */
      queueLead(lead);
      persistUnlock(lead);
      setQueued(true);
      setPhase("success");
      setTimeout(() => onSuccess(lead), 2100);
    }
  };

  const err = (k: string) => errors[k];

  return (
    <div
      className="modal-backdrop fixed inset-0 z-[60] flex items-center justify-center p-4 bg-abyss/80 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-labelledby="lead-modal-title"
      onClick={(e) => e.target === e.currentTarget && phase === "form" && onClose()}
    >
      <div
        ref={panelRef}
        className="modal-panel relative w-full max-w-md rounded-2xl border border-electric/35 bg-gradient-to-b from-panel to-abyss blueprint-grid-fine shadow-[0_0_80px_rgba(91,124,255,0.25)] max-h-[92vh] overflow-y-auto"
      >
        <HudCorners color="rgba(255,200,87,0.7)" size={18} thickness={2.5} />

        {/* ── SUCCESS SCREEN ── */}
        {phase === "success" ? (
          <div className="p-10 text-center">
            <svg className="check-draw mx-auto" width="92" height="92" viewBox="0 0 56 56" aria-hidden="true">
              <circle cx="28" cy="28" r="26" fill="none" stroke="#34D17F" strokeWidth="2" />
              <path d="M16 29l8 8 16-18" fill="none" stroke="#34D17F" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <h2 id="lead-modal-title" className="mt-6 font-head font-black text-2xl text-white tracking-tight">
              {LEAD_FORM.successTitle}
            </h2>
            <p className="mt-2 text-mist text-sm">
              Welcome to KPX Jr <span aria-hidden="true">—</span> decrypting the program…
            </p>
            {queued && (
              <p className="mt-2 text-[11px] text-amber/90">
                Our mail server is slow right now — your details are saved and we will retry automatically.
              </p>
            )}
            <p className="mt-5 tech-label text-[10px] text-electric-soft">
              {name.trim().toUpperCase()} · +91 {mobile}
            </p>
            <a
              href={whatsappLink(teamNotifyMessage({ name: name.trim(), mobile: `+91${mobile}`, type: (role || "Parent") as LeadRole, school, source: "kpx_unlock", timestamp: "" }))}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-block text-[11px] font-semibold text-jr3 underline underline-offset-4 hover:text-white transition-colors"
            >
              One-tap: notify the KProjectXX team on WhatsApp →
            </a>
            <div className="mt-6 h-1 w-full rounded-full bg-electric/15 overflow-hidden" aria-hidden="true">
              <div className="h-full w-1/3 bg-electric rounded-full animate-[dataScan_1.2s_ease-in-out_infinite]" />
            </div>
          </div>
        ) : (
          /* ── FORM SCREEN ── */
          <form onSubmit={submit} className="p-6 sm:p-8" noValidate>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="tech-label text-[9px] text-electric mb-2 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-jr3 animate-pulse inline-block" aria-hidden="true" />
                  SECURE ACCESS // KPX-JR
                </p>
                <h2 id="lead-modal-title" className="font-head font-black text-2xl text-white tracking-tight">
                  {LEAD_FORM.title}
                </h2>
                <p className="mt-1.5 text-mist text-[13px] leading-relaxed">{LEAD_FORM.sub}</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-2 text-mist hover:text-white transition-colors cursor-pointer shrink-0"
                aria-label="Close dialog"
              >
                <X size={19} />
              </button>
            </div>

            <div className="mt-6 space-y-4">
              {/* Full name */}
              <div>
                <label htmlFor="kpx-name" className="block text-[12px] font-bold text-white mb-1.5 tech-label !text-[9px]">
                  {LEAD_FORM.nameLabel} *
                </label>
                <input
                  id="kpx-name"
                  type="text"
                  autoComplete="name"
                  className={cn("field-input", err("name") && "field-input--error")}
                  placeholder={LEAD_FORM.namePlaceholder}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  aria-invalid={!!err("name")}
                />
                {err("name") && <p className="mt-1.5 text-[11px] text-red-300">{err("name")}</p>}
              </div>

              {/* Mobile with +91 prefix */}
              <div>
                <label htmlFor="kpx-mobile" className="block text-[12px] font-bold text-white mb-1.5 tech-label !text-[9px]">
                  {LEAD_FORM.mobileLabel} *
                </label>
                <div className="flex">
                  <span className="inline-flex items-center rounded-l-[0.65rem] border border-r-0 border-electric/25 bg-electric/10 px-3.5 font-tech text-sm text-electric-soft">
                    +91
                  </span>
                  <input
                    id="kpx-mobile"
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel-national"
                    maxLength={10}
                    className={cn("field-input !rounded-l-none", err("mobile") && "field-input--error")}
                    placeholder={LEAD_FORM.mobilePlaceholder}
                    value={mobile}
                    onChange={(e) => setMobile(sanitizeMobile(e.target.value))}
                    aria-invalid={!!err("mobile")}
                  />
                </div>
                {err("mobile") && <p className="mt-1.5 text-[11px] text-red-300">{err("mobile")}</p>}
              </div>

              {/* Role pills */}
              <fieldset>
                <legend className="text-[12px] font-bold text-white mb-2 tech-label !text-[9px]">{LEAD_FORM.roleLabel} *</legend>
                <div className="grid grid-cols-3 gap-2.5">
                  {ROLE_META.map(({ role: r, hint, icon: Icon }) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRole(r)}
                      aria-pressed={role === r}
                      className={cn(
                        "rounded-xl border px-2 py-3 text-center transition-all duration-300 cursor-pointer",
                        role === r
                          ? "border-amber/70 bg-amber/10 shadow-[0_0_20px_rgba(255,200,87,0.2)]"
                          : "border-electric/20 bg-abyss/50 hover:border-electric/50"
                      )}
                    >
                      <Icon size={18} className={cn("mx-auto mb-1.5", role === r ? "text-amber" : "text-electric-soft")} aria-hidden="true" />
                      <span className={cn("block font-head font-bold text-[13px]", role === r ? "text-white" : "text-mist")}>{r}</span>
                      <span className="block text-[9px] text-mist/70 mt-0.5">{hint}</span>
                    </button>
                  ))}
                </div>
                {err("role") && <p className="mt-1.5 text-[11px] text-red-300">{err("role")}</p>}
              </fieldset>

              {/* Conditional: school name */}
              {role === "School" && (
                <div className="modal-panel">
                  <label htmlFor="kpx-school" className="block text-[12px] font-bold text-white mb-1.5 tech-label !text-[9px]">
                    {LEAD_FORM.schoolLabel}
                  </label>
                  <input
                    id="kpx-school"
                    type="text"
                    autoComplete="organization"
                    className="field-input"
                    placeholder={LEAD_FORM.schoolPlaceholder}
                    value={school}
                    onChange={(e) => setSchool(e.target.value)}
                  />
                </div>
              )}

              {/* Consent */}
              <div>
                <label className={cn("flex items-start gap-3 rounded-xl border p-3.5 cursor-pointer transition-colors", err("consent") ? "border-red-400/60" : "border-electric/20 hover:border-electric/40")}>
                  <input
                    type="checkbox"
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                    className="mt-0.5 w-4 h-4 shrink-0 accent-[#5B7CFF] cursor-pointer"
                    aria-invalid={!!err("consent")}
                  />
                  <span className="text-[12px] text-mist leading-relaxed">{LEAD_FORM.consent}</span>
                </label>
                {err("consent") && <p className="mt-1.5 text-[11px] text-red-300">{err("consent")}</p>}
              </div>

              {/* Honeypot — hidden from humans, bots love it */}
              <input
                type="text"
                value={honey}
                onChange={(e) => setHoney(e.target.value)}
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                className="!absolute !-left-[9999px] !w-px !h-px opacity-0"
                name="company_website"
              />

              {/* Global error */}
              {err("submit") && (
                <p className="flex items-center gap-2 text-[12px] text-red-300 rounded-lg border border-red-400/40 bg-red-400/10 px-3.5 py-2.5">
                  <AlertTriangle size={14} aria-hidden="true" /> {err("submit")}
                </p>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={phase === "sending"}
                className="btn-glow w-full inline-flex items-center justify-center gap-2.5 rounded-xl px-6 py-4 font-head font-extrabold text-sm text-white cursor-pointer disabled:opacity-75"
              >
                {phase === "sending" ? (
                  <>
                    <Loader2 size={17} className="animate-spin" /> Establishing uplink…
                  </>
                ) : (
                  <>
                    {LEAD_FORM.submit} <span aria-hidden="true">→</span>
                  </>
                )}
              </button>

              <p className="text-center text-[10px] text-mist/60 tech-label !tracking-[0.14em]">
                ENCRYPTED TRANSMISSION · NO SPAM, EVER
              </p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
