import type { VercelRequest, VercelResponse } from "@vercel/node";
import nodemailer from "nodemailer";

/* ═══════════════════════════════════════════════════════════════
   KProjectXX — lead mailer (serverless SMTP relay)

   The website POSTs every lead here; this function validates it and
   emails the team over SMTP.

   WHY A SERVERLESS FUNCTION:
   the Gmail app password lives in Vercel server env vars. Anything in
   `src/` ships to every visitor in the browser bundle, so a password
   there would be public. Here it never leaves the server.

   Env vars (set with `vercel env add`, see SETUP.md):
     SMTP_HOST          smtp.gmail.com
     SMTP_PORT          465
     SMTP_USER          teamkprojectxx@gmail.com
     SMTP_PASS          <gmail app password>
     LEAD_NOTIFY_TO     teamkprojectxx@gmail.com   (defaults to SMTP_USER)
     LEAD_NOTIFY_FROM   KProjectXX Website <teamkprojectxx@gmail.com>
     LEAD_ALLOWED_ORIGINS  optional, comma-separated extra origins
   ═══════════════════════════════════════════════════════════════ */

const SMTP_HOST = process.env.SMTP_HOST || "smtp.gmail.com";
const SMTP_PORT = Number(process.env.SMTP_PORT || 465);
const SMTP_USER = process.env.SMTP_USER || "";
const SMTP_PASS = process.env.SMTP_PASS || "";
const NOTIFY_TO = process.env.LEAD_NOTIFY_TO || SMTP_USER;
const NOTIFY_FROM = process.env.LEAD_NOTIFY_FROM || `KProjectXX Website <${SMTP_USER}>`;

const TEAM_WHATSAPP = process.env.TEAM_WHATSAPP || "918008115595";

/* Optional safety net: if SMTP is down (or the app password is wrong),
   the lead is POSTed here instead. Point it at a Google Apps Script
   `/exec` URL (see lead-notifier.gs) and the lead lands in a Google
   Sheet and still gets emailed — with no password needed. */
const FALLBACK_URL = process.env.LEAD_FALLBACK_WEBHOOK_URL || "";

/* ── Limits ──────────────────────────────────────────────────── */
const MAX_NAME = 80;
const MAX_SCHOOL = 120;
const MIN_FILL_MS = 2000; // faster than this = bot
/* Per-IP rate limit. Generous on purpose: a school or college network
   shares one NAT IP, so many real parents can arrive from the same
   address. Still low enough to blunt a spam run. */
const RATE_LIMIT = Number(process.env.RATE_LIMIT_MAX || 20); // leads per IP
const RATE_WINDOW_MS = Number(process.env.RATE_LIMIT_WINDOW_MS || 10 * 60 * 1000);

const ROLES = ["Parent", "Guide", "School"] as const;
const SOURCES = ["kpx_unlock", "callback_request"] as const;

type Role = (typeof ROLES)[number];
type Source = (typeof SOURCES)[number];

/* ── In-memory rate limiter ────────────────────────────────────
   Per-instance, so it is approximate on serverless — enough to blunt
   casual abuse, not a substitute for a real quota. */
const hits = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < RATE_WINDOW_MS);
  if (recent.length >= RATE_LIMIT) {
    hits.set(ip, recent);
    return true;
  }
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear(); // keep the map from growing forever
  return false;
}

/* ── Helpers ─────────────────────────────────────────────────── */
const clean = (v: unknown, max: number): string =>
  String(v == null ? "" : v)
    .replace(/[\u0000-\u001f]/g, " ")
    .trim()
    .slice(0, max);

const esc = (v: string): string =>
  v
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

function clientIp(req: VercelRequest): string {
  const fwd = req.headers["x-forwarded-for"];
  if (typeof fwd === "string" && fwd.length) return fwd.split(",")[0].trim();
  if (Array.isArray(fwd) && fwd.length) return String(fwd[0]).split(",")[0].trim();
  return req.socket.remoteAddress || "unknown";
}

/** Reject cross-site posts: the lead form only ever runs on our own domain. */
function originAllowed(req: VercelRequest): boolean {
  const origin = req.headers.origin;
  if (!origin) return true; // non-browser client (curl, server-side) — rate limit still applies
  const host = req.headers.host;
  const extras = (process.env.LEAD_ALLOWED_ORIGINS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const allowed = new Set(extras);
  if (host) {
    allowed.add(`https://${host}`);
    allowed.add(`http://${host}`);
  }
  return allowed.has(origin);
}

interface ParsedLead {
  name: string;
  mobile: string;
  type: Role;
  school: string;
  source: Source;
  timestamp: string;
}

function parseLead(body: unknown): { lead?: ParsedLead; error?: string } {
  let raw: any = body;
  if (typeof raw === "string") {
    try {
      raw = JSON.parse(raw);
    } catch {
      return { error: "Body is not valid JSON" };
    }
  }
  if (!raw || typeof raw !== "object") return { error: "Body must be a JSON object" };

  const name = clean(raw.name, MAX_NAME);
  if (name.length < 2) return { error: "Invalid name" };

  /* Indian mobile: 10 digits starting 6-9, with optional 91 prefix. */
  const digits = clean(raw.mobile, 20).replace(/\D/g, "");
  const local = digits.length === 12 && digits.startsWith("91") ? digits.slice(2) : digits;
  if (!/^[6-9]\d{9}$/.test(local)) return { error: "Invalid mobile number" };

  const type = clean(raw.type, 20) as Role;
  if (!ROLES.includes(type)) return { error: "Invalid role" };

  const source = clean(raw.source, 30) as Source;
  if (!SOURCES.includes(source)) return { error: "Invalid source" };

  const school = clean(raw.school, MAX_SCHOOL);

  return {
    lead: {
      name,
      mobile: `+91${local}`,
      type,
      school,
      source,
      timestamp: clean(raw.timestamp, 40) || new Date().toISOString(),
    },
  };
}

/* ── Email ───────────────────────────────────────────────────── */
function buildEmail(lead: ParsedLead) {
  const isCallback = lead.source === "callback_request";
  const waDigits = lead.mobile.replace(/\D/g, "");
  const wa = `https://wa.me/${waDigits.length === 10 ? "91" + waDigits : waDigits}`;
  const call = `tel:${lead.mobile.replace("+", "")}`;
  const teamWa = `https://wa.me/${TEAM_WHATSAPP}?text=${encodeURIComponent(
    [
      `New KPX Jr lead — ${lead.name}`,
      `Mobile: ${lead.mobile}`,
      `I am a: ${lead.type}${lead.school ? ` (${lead.school})` : ""}`,
      `Source: ${isCallback ? "Callback request" : "Website unlock"}`,
    ].join("\n"),
  )}`;

  const row = (label: string, value: string) =>
    `<tr><td style="padding:7px 18px 7px 0;color:#8b93a7;font-size:13px;white-space:nowrap;vertical-align:top">${label}</td>` +
    `<td style="padding:7px 0;font-size:14px;color:#f2f4f8">${value}</td></tr>`;

  const html = `<!doctype html>
<html><body style="margin:0;padding:24px 12px;background:#070a14;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif">
  <div style="max-width:520px;margin:0 auto;background:#10141f;border:1px solid #26304a;border-radius:16px;overflow:hidden">
    <div style="background:linear-gradient(135deg,#5b7cff 0%,#3d5bd9 100%);padding:20px 26px">
      <div style="color:#c9d4ff;font-size:11px;letter-spacing:2px;font-weight:700">KPROJECTXX · LEAD ALERT</div>
      <h1 style="margin:6px 0 0;color:#fff;font-size:19px;font-weight:800">${
        isCallback ? "Someone requested a callback" : "New KPX Jr lead"
      }</h1>
    </div>
    <div style="padding:22px 26px 8px">
      <table style="border-collapse:collapse;width:100%">
        ${row("Name", esc(lead.name))}
        ${row("Mobile", `<a href="${call}" style="color:#8fb0ff;text-decoration:none;font-weight:600">${esc(lead.mobile)}</a>`)}
        ${row("I am a", esc(lead.type))}
        ${row("School", lead.school ? esc(lead.school) : "—")}
        ${row("Source", isCallback ? "Callback request" : "Website unlock")}
        ${row("Time", esc(lead.timestamp))}
      </table>
    </div>
    <div style="padding:14px 26px 24px">
      <a href="${wa}" style="display:inline-block;background:#25D366;color:#fff;padding:11px 20px;border-radius:9px;text-decoration:none;font-weight:700;font-size:14px">WhatsApp them</a>
      <a href="${call}" style="display:inline-block;margin-left:8px;background:#1c2334;border:1px solid #2c3852;color:#c9d4ff;padding:11px 20px;border-radius:9px;text-decoration:none;font-weight:700;font-size:14px">Call now</a>
      <a href="${teamWa}" style="display:inline-block;margin-left:8px;background:#1c2334;border:1px solid #2c3852;color:#c9d4ff;padding:11px 20px;border-radius:9px;text-decoration:none;font-weight:700;font-size:14px">Share to team</a>
    </div>
  </div>
  <p style="max-width:520px;margin:14px auto 0;color:#5c6478;font-size:11px;text-align:center">Sent automatically by the KPX Jr website lead form.</p>
</body></html>`;

  const text = [
    isCallback ? "CALLBACK REQUEST — KProjectXX" : "NEW KPX JR LEAD — KProjectXX",
    "",
    `Name: ${lead.name}`,
    `Mobile: ${lead.mobile}`,
    `I am a: ${lead.type}`,
    `School: ${lead.school || "-"}`,
    `Source: ${isCallback ? "Callback request" : "Website unlock"}`,
    `Time: ${lead.timestamp}`,
    "",
    `WhatsApp: ${wa}`,
    `Call: ${call}`,
  ].join("\n");

  return { subject: `${isCallback ? "Callback request" : "New KPX Jr lead"} — ${lead.name} (${lead.type})`, html, text };
}

/**
 * Safety net for a failed SMTP send: hand the lead to the fallback
 * webhook. Apps Script answers with the plain text "ok" on success.
 */
async function postFallback(lead: ParsedLead): Promise<boolean> {
  if (!FALLBACK_URL) return false;
  try {
    const res = await fetch(FALLBACK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(lead),
    });
    const text = (await res.text()).trim().toLowerCase();
    return res.ok && text === "ok";
  } catch (err) {
    console.error("[lead-mailer] fallback webhook failed:", err);
    return false;
  }
}

/* ── Handler ─────────────────────────────────────────────────── */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === "GET") {
    return res.status(200).json({
      ok: true,
      service: "kpx-lead-mailer",
      smtpConfigured: Boolean(SMTP_USER && SMTP_PASS),
      notifyTo: NOTIFY_TO || null,
    });
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST, GET");
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  if (!SMTP_USER || !SMTP_PASS) {
    console.error("[lead-mailer] SMTP_USER / SMTP_PASS are not set on the server.");
    return res.status(503).json({ ok: false, error: "Mailer not configured" });
  }

  if (!originAllowed(req)) {
    return res.status(403).json({ ok: false, error: "Forbidden" });
  }

  if (rateLimited(clientIp(req))) {
    return res.status(429).json({ ok: false, error: "Too many requests" });
  }

  const { lead, error } = parseLead(req.body);
  if (!lead) return res.status(400).json({ ok: false, error });

  /* Honeypot: a real visitor never fills the hidden field. */
  const raw = typeof req.body === "string" ? safeParse(req.body) : req.body;
  if (raw && typeof raw === "object" && clean((raw as any).hp, 200)) {
    return res.status(200).json({ ok: true });
  }

  /* Bot-speed guard on the unlock form only (the callback form has no timer). */
  const elapsed = Number(raw && typeof raw === "object" ? (raw as any).elapsedMs : NaN);
  if (lead.source === "kpx_unlock" && Number.isFinite(elapsed) && elapsed < MIN_FILL_MS) {
    return res.status(400).json({ ok: false, error: "Submitted too fast" });
  }

  try {
    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    });
    const { subject, html, text } = buildEmail(lead);
    const info = await transporter.sendMail({
      from: NOTIFY_FROM,
      to: NOTIFY_TO,
      subject,
      text,
      html,
    });
    console.log("[lead-mailer] delivered:", info.messageId, "|", info.response);
    return res.status(200).json({ ok: true });
  } catch (err) {
    /* Never leak SMTP internals to the caller — log server-side only. */
    console.error("[lead-mailer] send failed:", err);

    /* The lead still matters more than the email. Try the fallback
       (Apps Script → Google Sheet + MailApp) before giving up. */
    if (await postFallback(lead)) {
      return res.status(200).json({ ok: true, delivered: false, fallback: true });
    }
    return res.status(502).json({ ok: false, error: "Could not send notification" });
  }
}

function safeParse(v: string): unknown {
  try {
    return JSON.parse(v);
  } catch {
    return null;
  }
}
