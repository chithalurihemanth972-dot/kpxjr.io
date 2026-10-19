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
`LEAD_WEBHOOK_URL` in **`src/config.ts`**. The script in **`lead-notifier.gs`**
turns that URL into a Google Sheet of leads **and** an instant email for every
form fill. It runs inside your Google account, so it needs no password.

> **Never put a Gmail app password in the website code.** Everything in `src/`
> is downloaded by every visitor, so a password there is public. Use the Apps
> Script below instead.

1. Create a Google Sheet named `KPX Leads` (sign in with the Gmail that should send the alerts).
2. **Extensions → Apps Script**, delete the template, paste the whole of `lead-notifier.gs`.
3. Optional: set `NOTIFY_EMAIL` at the top to send alerts to a different address
   (left blank, alerts go to the account that deploys the script).
4. Pick **`testLead`** in the function dropdown, press **Run**, and approve the permissions.
   You should get a test email and a new row in the `Leads` tab.
5. **Deploy → New deployment → Web app** → *Execute as: Me*, *Who has access: Anyone* → Deploy.
6. Copy the `/exec` URL into `LEAD_WEBHOOK_URL` in `src/config.ts`, then rebuild/redeploy.

> The site posts with `no-cors` + `text/plain`, which Apps Script accepts with no CORS
> setup. Leads also persist in the visitor's `localStorage`, and the success screen
> offers a one-tap WhatsApp message to the team (`TEAM_WHATSAPP` in `src/config.ts`).

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

### Netlify
1. Push the repo.
2. Netlify → **Add new site → Import an existing project**.
3. Build command: `npm run build` · Publish directory: `dist`. Deploy.

(SPA needs no redirects here — it's a single page.)

---

## Notes

- Returning visitors skip the form (unlock stored in `localStorage`, keys in `src/config.ts`).
  To reset while testing: DevTools → Application → Local Storage → clear `kpx_*` keys.
- The form validates Indian 10-digit mobiles (starts 6–9), includes a honeypot
  and a min-fill-time spam guard, and disables nothing for keyboard users.
