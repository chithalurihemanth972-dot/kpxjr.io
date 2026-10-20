/* ═══════════════════════════════════════════════════════════════
   KProjectXX — SITE CONFIGURATION (edit me!)
   ─────────────────────────────────────────────────────────────
   1) LEAD CAPTURE BACKEND
      Paste your endpoint into LEAD_WEBHOOK_URL below. The site
      POSTs a JSON payload to it on every lead / callback request:
        { name, mobile, type, school, source, timestamp }

      Easiest option — Google Sheets via Apps Script:
        a. Create a Google Sheet → Extensions → Apps Script
        b. Paste the ready-made script from SETUP.md (in this repo)
        c. Deploy as Web App (access: "Anyone") → copy the URL here

      Also works with Supabase / Firebase / any webhook that
      accepts a JSON POST.

      If the URL is left empty the site still works — leads are
      stored in the visitor's browser and logged to the console.

   2) TEAM NOTIFICATIONS
      TEAM_WHATSAPP is used for the WhatsApp chat buttons and for
      the optional "notify the team" deep-link shown after a lead
      is captured. Format: country code + number, digits only.
      ═══════════════════════════════════════════════════════════════ */

export const CONFIG = {
  /** ← PASTE YOUR GOOGLE APPS SCRIPT / SUPABASE / FIREBASE WEBHOOK URL HERE */
  LEAD_WEBHOOK_URL: "",

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
