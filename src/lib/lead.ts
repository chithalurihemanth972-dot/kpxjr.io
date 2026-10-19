import { CONFIG, STORAGE_KEYS } from "../config";

/* ═══════════════════════════════════════════════════════════════
   Lead capture — storage, validation & transport
   ═══════════════════════════════════════════════════════════════ */

export type LeadRole = "Parent" | "Guide" | "School";
export type LeadSource = "kpx_unlock" | "callback_request";

export interface LeadPayload {
  name: string;
  mobile: string; // E.164-ish: +91XXXXXXXXXX
  type: LeadRole;
  school: string; // "" when not applicable
  source: LeadSource;
  timestamp: string; // ISO
}

/* ── Validation ─────────────────────────────────────────────── */

/** Indian mobile: exactly 10 digits, starting 6–9. */
export const isValidIndianMobile = (digits: string) => /^[6-9]\d{9}$/.test(digits);

export const sanitizeMobile = (raw: string) => raw.replace(/\D/g, "").replace(/^91(?=\d{10}$)/, "").slice(0, 10);

/* ── Persistence ────────────────────────────────────────────── */

export function getSavedLead(): LeadPayload | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.lead);
    return raw ? (JSON.parse(raw) as LeadPayload) : null;
  } catch {
    return null;
  }
}

export function isUnlocked(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEYS.unlocked) === "1" && !!getSavedLead();
  } catch {
    return false;
  }
}

export function persistUnlock(lead: LeadPayload) {
  try {
    localStorage.setItem(STORAGE_KEYS.lead, JSON.stringify(lead));
    localStorage.setItem(STORAGE_KEYS.unlocked, "1");
  } catch {
    /* private mode — non-fatal */
  }
}

/* ── Transport ──────────────────────────────────────────────── */

/**
 * POSTs the lead to the configured webhook (Apps Script / Supabase /
 * Firebase / any JSON endpoint). Uses `text/plain` + `no-cors` so the
 * request reaches Google Apps Script without a CORS preflight.
 */
export async function sendLeadToBackend(payload: LeadPayload): Promise<void> {
  if (!CONFIG.LEAD_WEBHOOK_URL) {
    console.info("[KProjectXX] LEAD_WEBHOOK_URL not configured — lead payload:", payload);
    return;
  }
  await fetch(CONFIG.LEAD_WEBHOOK_URL, {
    method: "POST",
    mode: "no-cors",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify(payload),
  });
}

/* ── Team notification helpers ──────────────────────────────── */

/** wa.me chat link (optionally pre-filled with a message). */
export function whatsappLink(message?: string): string {
  const base = `https://wa.me/${CONFIG.TEAM_WHATSAPP}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

/** Pre-filled "new lead" notification the visitor can one-tap send to the team. */
export function teamNotifyMessage(lead: LeadPayload): string {
  return [
    "New KPX Jr lead!",
    `Name: ${lead.name}`,
    `Mobile: ${lead.mobile}`,
    `Type: ${lead.type}${lead.school ? ` (${lead.school})` : ""}`,
    `Source: ${lead.source === "callback_request" ? "Callback request" : "Website unlock"}`,
  ].join("\n");
}
