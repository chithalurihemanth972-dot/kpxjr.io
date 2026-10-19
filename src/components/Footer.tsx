import { Mail, MapPin, Phone } from "lucide-react";
import { CONFIG } from "../config";
import { useSite } from "../context/SiteContext";
import { BRAND, FOOTER, KPX, NAV_LINKS } from "../data/content";
import { goHomeSection, navigate, parseRoute, usePath } from "../lib/router";
import { Logo } from "./Navbar";
import { LEVEL_THEME } from "./kpx/theme";

/* Brand icons (lucide no longer ships brand glyphs) */
const InstagramIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="17" height="17" {...props}>
    <rect x="2" y="2" width="20" height="20" rx="5" />
    <path d="M16 11.37a4 4 0 1 1-7.914 1.173A4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);
const LinkedinIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="17" height="17" {...props}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

/* ═══════════════════════════════════════════════════════════════
   FOOTER — shared by every route
   ═══════════════════════════════════════════════════════════════ */
export default function Footer() {
  const { exploreKpx, goToLevel } = useSite();
  const route = parseRoute(usePath());

  const go = (href: string) => {
    if (href === "#kpxjr") return exploreKpx();
    goHomeSection(href.replace("#", ""));
  };

  return (
    <footer className="relative z-10 border-t border-white/10 bg-navy/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_0.8fr_0.9fr_1fr]">
          {/* brand */}
          <div>
            <Logo
              size="lg"
              onClick={() => {
                if (route.name === "home") window.scrollTo({ top: 0, behavior: "smooth" });
                else navigate("/");
              }}
            />
            <p className="mt-4 font-head font-bold text-sm text-white">{BRAND.tagline}</p>
            <p className="mt-1.5 text-mist text-[13px]">{BRAND.subline}</p>
            <p className="mt-5 inline-flex items-center gap-2 rounded-full border border-amber/30 bg-amber/8 px-4 py-1.5 text-[11px] font-semibold text-amber">
              {FOOTER.kpxNote}
            </p>
          </div>

          {/* site nav */}
          <nav aria-label="Footer site links">
            <h3 className="font-head font-semibold text-sm text-white mb-4">Navigate</h3>
            <ul className="space-y-2.5">
              {NAV_LINKS.map((l) => (
                <li key={l.href}>
                  <button onClick={() => go(l.href)} className="text-mist text-sm hover:text-white transition-colors cursor-pointer">
                    {l.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          {/* dedicated KPX pages */}
          <nav aria-label="KPX Jr pages">
            <h3 className="font-head font-semibold text-sm text-white mb-4">KPX Jr pages</h3>
            <ul className="space-y-2.5">
              <li>
                <a href="#/kpx-jr" className="text-mist text-sm hover:text-white transition-colors">
                  Program overview
                </a>
              </li>
              {KPX.levels.map((lvl, i) => (
                <li key={lvl.id}>
                  <button onClick={() => goToLevel(i + 1)} className="inline-flex items-center gap-2 text-mist text-sm hover:text-white transition-colors cursor-pointer">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: LEVEL_THEME[lvl.id].hexColor }} aria-hidden="true" />
                    {lvl.name} — {lvl.title}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          {/* contact placeholders */}
          <div>
            <h3 className="font-head font-semibold text-sm text-white mb-4">Contact</h3>
            <ul className="space-y-3 text-sm text-mist">
              <li className="flex items-center gap-3">
                <Phone size={15} className="text-electric shrink-0" aria-hidden="true" />
                <a href={`tel:${CONFIG.CONTACT.phone.replace(/\s/g, "")}`} className="hover:text-white transition-colors">
                  {CONFIG.CONTACT.phone}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={15} className="text-electric shrink-0" aria-hidden="true" />
                <a href={`mailto:${CONFIG.CONTACT.email}`} className="hover:text-white transition-colors">
                  {CONFIG.CONTACT.email}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <MapPin size={15} className="text-electric shrink-0" aria-hidden="true" />
                {CONFIG.CONTACT.location}
              </li>
            </ul>
            <div className="mt-5 flex gap-3">
              {[
                { href: CONFIG.CONTACT.instagram, label: "Instagram", Icon: InstagramIcon },
                { href: CONFIG.CONTACT.linkedin, label: "LinkedIn", Icon: LinkedinIcon },
              ].map(({ href, label, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex items-center justify-center w-10 h-10 rounded-lg border border-electric/25 bg-electric/8 text-electric-soft hover:text-white hover:border-electric/60 transition-all"
                >
                  <Icon />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-electric/10 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[12px] text-mist/70">{FOOTER.copyright}</p>
          <p className="text-xs text-mist/60">Hyderabad, India</p>
        </div>
      </div>
    </footer>
  );
}
