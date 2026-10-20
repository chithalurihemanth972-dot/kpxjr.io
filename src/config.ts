/* ═══════════════════════════════════════════════════════════════
   KProjectXX — SITE CONFIGURATION (edit me!)
   ─────────────────────────────────────────────────────────────
   1) LEAD CAPTURE BACKEND
      The site POSTs a JSON payload to LEAD_WEBHOOK_URL on every
      lead / callback request:
        { name, mobile, type, school, source, timestamp }

      Default: "/api/send-lead" — the serverless function in
      `api/send-lead.ts`, which emails the team over SMTP. The SMTP
      user + app password are Vercel server env vars (SMTP_USER /
      SMTP_PASS), so they never reach the browser.

      Google Apps Script (see lead-notifier.gs), Supabase, Firebase
      and any webhook that accepts a JSON POST work too — just paste
      that URL here.

      If the URL is left empty the site still works — leads are
      stored in the visitor's browser and logged to the console.

   2) TEAM NOTIFICATIONS
      TEAM_WHATSAPP is used for the WhatsApp chat buttons and for
      the optional "notify the team" deep-link shown after a lead
      is captured. Format: country code + number, digits only.
      ═══════════════════════════════════════════════════════════════ */

export const CONFIG = {
  /**
   * Where leads are POSTed.
   *
   * "/api/send-lead" → the bundled serverless function (`api/send-lead.ts`)
   * that emails the team over SMTP. The SMTP credentials live in server
   * env vars, so nothing secret is ever shipped to the browser.
   *
   * You can also paste an external URL here (Google Apps Script / Supabase /
   * Firebase) to use that instead.
   */
  LEAD_WEBHOOK_URL: "/api/send-lead",

  /** Team WhatsApp number (digits only, with country code) — used for wa.me links */
  TEAM_WHATSAPP: "918008115595",

  /** Public contact placeholders shown in the footer */
  CONTACT: {
    phone: "+91 80081 15595",
    email: "teamkprojectxx@gmail.com",
    instagram: "https://instagram.com/kprojectxx",
    linkedin: "https://linkedin.com/company/kprojectxx",
    location: "Hyderabad, Telangana, India",
  },
} as const;

/** localStorage keys (so the unlock persists across visits) */
export const STORAGE_KEYS = {
  lead: "kpx_lead_v1",
  unlocked: "kpx_unlocked_v1",
} as const;
