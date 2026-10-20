# KProjectXX — Setup Guide

Everything you need to (1) understand the page structure, (2) connect the lead-capture
backend and (3) deploy.

---

## 0. Page structure (multi-page)

The main site stays a single page; KPX Jr and each level are dedicated pages.
Routing uses URL hashes, so **deep links work on any static host with no server setup**.

| URL | Page | Gated? |
| --- | --- | --- |
| `/#/` | Main single-page site (Hero, Who We Are, Technology, Projects, Gateway) | No |
| `/#/kpx-jr` | KPX Jr program overview (why, level cards, kits, schools/parents, CTA) | Yes |
| `/#/kpx-jr/level-1` | KPX Jr 1 — Robotics Fundamentals | Yes |
| `/#/kpx-jr/level-2` | KPX Jr 2 — Arduino & Embedded Robotics | Yes |
| `/#/kpx-jr/level-3` | KPX Jr 3 — IoT & Connected Robotics | Yes |
| `/#/kpx-jr/level-4` | KPX Jr 4 — Robotics Project Lab | Yes |
| any other hash | Styled 404 page | — |

**The gate:** every "Explore KPX Jr" button and every level card opens the lead modal
for new visitors. After unlock (saved in `localStorage`), those buttons navigate
straight to `/kpx-jr` or the chosen level. If someone deep-links to a gated page,
they see the locked state; unlocking takes them to the page they asked for.

Routes are defined in `src/lib/router.ts`; page copy is in `src/data/content.ts`
under `PAGES`; shared unlock state is in `src/context/SiteContext.tsx`.

> Using Vercel/Netlify with hash routes needs **no** rewrite rules. If you later
> prefer clean paths (`/kpx-jr` without `#`), add a rewrite of all paths to
> `index.html` and switch the router in `src/lib/router.ts` to the History API.

---

---

## 1. Lead capture + email alerts

The site POSTs each lead (name, mobile, type, school, source, time) to **one URL**:
`LEAD_WEBHOOK_URL` in **`src/config.ts`**.

By default that URL is **`/api/send-lead`** — the serverless function in
**`api/send-lead.ts`**. It validates the lead and emails you over SMTP, so
every form fill lands in your inbox automatically.

> **Never put a Gmail app password in the website code.** Everything in `src/`
> is downloaded by every visitor, so a password there is public. The app
> password below lives in a **server env var** instead, and is never sent to
> the browser.

### Option A — the bundled SMTP relay (default, recommended)

The function reads these **server** env vars (set them in Vercel, not in `src/`):

| Var | Value |
| --- | --- |
| `SMTP_HOST` | `smtp.gmail.com` |
| `SMTP_PORT` | `465` |
| `SMTP_USER` | the Gmail that owns the app password (`vbuildit8@gmail.com`) |
| `SMTP_PASS` | that Gmail's **app password** (16 chars, no spaces) |
| `LEAD_NOTIFY_TO` | where the alerts should go (defaults to `SMTP_USER`) |
| `LEAD_NOTIFY_FROM` | display name of the sender, e.g. `KProjectXX Website <vbuildit8@gmail.com>` |
| `TEAM_WHATSAPP` | team number (digits with country code) for the "Share to team" button |

Set them from a terminal:

```bash
vercel env add SMTP_HOST production --value smtp.gmail.com
vercel env add SMTP_PORT production --value 465
vercel env add SMTP_USER production --value vbuildit8@gmail.com
vercel env add SMTP_PASS production --value <your-app-password> --sensitive
vercel env add LEAD_NOTIFY_TO production --value vbuildit8@gmail.com
vercel env add LEAD_NOTIFY_FROM production --value "KProjectXX Website <vbuildit8@gmail.com>"
vercel env add TEAM_WHATSAPP production --value 918008115595
```

Repeat with `preview` instead of `production` if you want preview deployments
to send mail too. Then deploy (`vercel --prod`) — env var changes alone do not
rebuild the site.

To create the app password: Google Account → **Security** → **2-Step
Verification** → **App passwords** → generate one for "Mail". You need 2-Step
Verification switched on for that.

**Anti-spam** (all server-side): per-IP rate limit (5 leads / 10 min),
origin check, honeypot field, and a minimum fill time on the unlock form.

### Option B — Google Apps Script (no password at all)

The script in **`lead-notifier.gs`** turns an Apps Script URL into a Google
Sheet of leads **and** an instant email for every form fill. It runs inside
your Google account, so it needs no password.

1. Create a Google Sheet named `KPX Leads` (sign in with the Gmail that should send the alerts).
2. **Extensions → Apps Script**, delete the template, paste the whole of `lead-notifier.gs`.
3. Optional: set `NOTIFY_EMAIL` at the top to send alerts to a different address
   (left blank, alerts go to the account that deploys the script).
4. Pick **`testLead`** in the function dropdown, press **Run**, and approve the permissions.
   You should get a test email and a new row in the `Leads` tab.
5. **Deploy → New deployment → Web app** → *Execute as: Me*, *Who has access: Anyone* → Deploy.
6. Copy the `/exec` URL into `LEAD_WEBHOOK_URL` in `src/config.ts`, then rebuild/redeploy.

> The site posts with `no-cors` + `text/plain` when `LEAD_WEBHOOK_URL` is an
> absolute URL, which Apps Script accepts with no CORS setup. Leads also
> persist in the visitor's `localStorage`, and the success screen offers a
> one-tap WhatsApp message to the team (`TEAM_WHATSAPP` in `src/config.ts`).

### Supabase alternative

Create a `leads` table (`name, mobile, type, school, source, timestamp`),
enable an anon insert policy, and set `LEAD_WEBHOOK_URL` to your
`/rest/v1/leads` endpoint (add your `apikey` header logic in `src/lib/lead.ts → sendLeadToBackend`).

---

## 2. Edit content

- **All copy** lives in `src/data/content.ts` (headlines, levels, projects, footer…).
- **Contact details / WhatsApp number** live in `src/config.ts`.
- **Project photos**: drop files in `public/images/`, then set `image: "/images/vajra.jpg"`
  on the project in `src/data/content.ts` — the "Add project photo" slot is replaced automatically.

---

## 3. Run & build

```bash
npm install
npm run dev      # local dev
npm run build    # production build → dist/
```

---

## 4. Deploy

### Vercel
1. Push the repo to GitHub/GitLab.
2. Vercel → **Add New Project** → import the repo.
3. Framework: **Vite** (auto-detected). Build: `npm run build`, output: `dist`. Deploy.
4. Set the SMTP env vars from **Option A** above (Project → Settings → Environment
   Variables), then redeploy so the functions pick them up.

> The **`api/`** folder is deployed automatically as a serverless function
> (`/api/send-lead`). Keep it out of the browser bundle — that is why the
> app password belongs in env vars and not in `src/`.

### Netlify
1. Push the repo.
2. Netlify → **Add new site → Import an existing project**.
3. Build command: `npm run build` · Publish directory: `dist`. Deploy.

(SPA needs no redirects here — it's a single page.)

> Netlify does not run the `api/` folder as-is. On Netlify, use **Option B**
> (Apps Script) instead and point `LEAD_WEBHOOK_URL` at the `/exec` URL.

---

## Notes

- Returning visitors skip the form (unlock stored in `localStorage`, keys in `src/config.ts`).
  To reset while testing: DevTools → Application → Local Storage → clear `kpx_*` keys.
- The form validates Indian 10-digit mobiles (starts 6–9), includes a honeypot
  and a min-fill-time spam guard, and disables nothing for keyboard users.
- Check the mailer is alive: `GET /api/send-lead` returns
  `{"ok":true,"smtpConfigured":true}`.
