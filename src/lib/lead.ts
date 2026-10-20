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
 * Extra anti-spam signals the server can check. They are advisory:
 * the server validates them, but never trusts the client for anything
 * that matters.
 */
export interface LeadSpamSignals {
  /** Honeypot field value — must be empty for a genuine lead. */
  hp?: string;
  /** Milliseconds the visitor spent filling the form. */
  elapsedMs?: number;
}

/**
 * POSTs the lead to the configured endpoint.
 *
 * - Same-origin path (default "/api/send-lead"): plain JSON POST to our
 *   own serverless function — no CORS preflight, no secrets in the browser.
 * - Absolute URL (Apps Script / Supabase / Firebase): uses `no-cors` +
 *   `text/plain`, which Google Apps Script accepts without CORS setup.
 */
export async function sendLeadToBackend(payload: LeadPayload, signals: LeadSpamSignals = {}): Promise<void> {
  const url = CONFIG.LEAD_WEBHOOK_URL;
  if (!url) {
    console.info("[KProjectXX] LEAD_WEBHOOK_URL not configured — lead payload:", payload);
    return;
  }

  const sameOrigin = url.startsWith("/");
  const res = await fetch(url, {
    method: "POST",
    ...(sameOrigin ? {} : { mode: "no-cors" as const }),
    headers: { "Content-Type": sameOrigin ? "application/json" : "text/plain;charset=utf-8" },
    body: JSON.stringify({ ...payload, ...signals }),
  });

  /* A same-origin call can report failure — surface it so the form shows
     an error instead of pretending the lead was captured. */
  if (sameOrigin && !res.ok) {
    throw new Error(`Lead endpoint responded ${res.status}`);
  }
}

/* ── Offline / failed-send queue ────────────────────────────────
   If the mail server is unreachable when someone submits the form,
   the lead is parked in localStorage and retried on the next visit.
   A visitor is never lost because our mail server hiccuped. */

const MAX_PENDING = 20;

function readPending(): LeadPayload[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.pending);
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? (list as LeadPayload[]).slice(0, MAX_PENDING) : [];
  } catch {
    return [];
  }
}

function writePending(list: LeadPayload[]) {
  try {
    if (list.length) localStorage.setItem(STORAGE_KEYS.pending, JSON.stringify(list));
    else localStorage.removeItem(STORAGE_KEYS.pending);
  } catch {
    /* private mode — non-fatal */
  }
}

/** Remember a lead we could not deliver, so it can be retried later. */
export function queueLead(lead: LeadPayload) {
  const list = readPending().filter((l) => l.timestamp !== lead.timestamp);
  list.push(lead);
  writePending(list.slice(-MAX_PENDING));
}

/** Retry every parked lead. Returns how many were delivered. */
export async function flushPendingLeads(): Promise<number> {
  const list = readPending();
  if (!list.length) return 0;
  const remaining: LeadPayload[] = [];
  let sent = 0;
  for (const lead of list) {
    try {
      await sendLeadToBackend(lead);
      sent++;
    } catch {
      remaining.push(lead);
    }
  }
  writePending(remaining);
  return sent;
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
