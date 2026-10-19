import { useState } from "react";
import { ArrowRight, ChevronRight, Lock, Menu, X } from "lucide-react";
import { useSite } from "../context/SiteContext";
import { KPX, NAV_LINKS } from "../data/content";
import { useScrolled } from "../lib/hooks";
import { goHomeSection, navigate, parseRoute, usePath } from "../lib/router";
import { LEVEL_THEME } from "./kpx/theme";
import { cn } from "../utils/cn";

/* ═══════════════════════════════════════════════════════════════
   Logo — hex "K" mark + "KProject" (white) + "XX" (electric)
   ═══════════════════════════════════════════════════════════════ */
export function Logo({ onClick, size = "md" }: { onClick?: () => void; size?: "md" | "lg" }) {
  return (
    <button onClick={onClick} className="flex items-center group cursor-pointer" aria-label="KProjectXX — back to home">
      <img
        src="/kprojectxx-logo.png"
        alt="KProjectXX"
        width={485}
        height={512}
        className={cn("w-auto transition-transform duration-300 group-hover:scale-105 drop-shadow-[0_6px_18px_rgba(255,200,87,0.35)]", size === "lg" ? "h-24" : "h-[3.4rem]")}
      />
    </button>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Navbar — fixed, transparent → blurred on scroll.
   Route-aware: home sections navigate home, KPX Jr goes to its page.
   ═══════════════════════════════════════════════════════════════ */
export default function Navbar() {
  const scrolled = useScrolled(30);
  const [open, setOpen] = useState(false);
  const { exploreKpx, unlocked, goToLevel } = useSite();
  const route = parseRoute(usePath());
  const onKpxPage = route.name === "kpx" || route.name === "level";

  const go = (href: string) => {
    setOpen(false);
    if (href === "#kpxjr") {
      exploreKpx();
      return;
    }
    goHomeSection(href.replace("#", ""));
  };

  return (
    <header
      className={cn(
        "fixed top-0 inset-x-0 z-40 transition-all duration-500",
        scrolled ? "bg-abyss/90 backdrop-blur-xl border-b border-electric/15 shadow-[0_8px_30px_rgba(0,0,0,0.35)]" : "bg-transparent"
      )}
    >
      <nav className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 h-[4.4rem]" aria-label="Primary">
        <Logo
          onClick={() => {
            setOpen(false);
            if (route.name === "home") window.scrollTo({ top: 0, behavior: "smooth" });
            else navigate("/");
          }}
        />

        {/* Desktop links */}
        <ul className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((l) => {
            const isKpx = l.href === "#kpxjr";
            const active = isKpx && onKpxPage;
            return (
              <li key={l.href}>
                <button
                  onClick={() => go(l.href)}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "relative px-4 py-2 text-sm font-semibold transition-colors rounded-md cursor-pointer",
                    isKpx ? "text-amber hover:text-white" : "text-mist hover:text-white",
                    active && "text-white"
                  )}
                >
                  {l.label}
                  {isKpx && (
                    <span
                      className={cn(
                        "absolute left-4 right-4 -bottom-0.5 h-px bg-amber transition-opacity",
                        active ? "opacity-100" : "opacity-0"
                      )}
                      aria-hidden="true"
                    />
                  )}
                </button>
              </li>
            );
          })}
        </ul>

        <div className="flex items-center gap-3">
          <button
            onClick={exploreKpx}
            className="btn-glow hidden sm:inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-[13px] font-bold font-head text-white cursor-pointer"
          >
            {unlocked ? "Open KPX Jr" : "Explore KPX Jr"}
            <ArrowRight size={15} strokeWidth={2.5} />
          </button>

          <button
            className="md:hidden text-white p-2 cursor-pointer"
            onClick={() => setOpen(!open)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      <div
        className={cn(
          "md:hidden overflow-hidden overflow-y-auto transition-[max-height] duration-500 ease-out bg-abyss/95 backdrop-blur-xl border-b border-electric/15",
          open ? "max-h-[32rem]" : "max-h-0"
        )}
      >
        <div className="px-6 py-4">
          <ul className="space-y-1">
            {NAV_LINKS.map((l) => (
              <li key={l.href}>
                <button
                  onClick={() => go(l.href)}
                  className={cn(
                    "flex items-center justify-between w-full text-left py-3 text-sm font-semibold border-b border-electric/10 cursor-pointer",
                    l.href === "#kpxjr" ? "text-amber" : "text-mist",
                    l.href === "#kpxjr" && onKpxPage && "text-white"
                  )}
                >
                  {l.label}
                  <ChevronRight size={15} className="text-mist/40" aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>

          {/* level shortcuts → each is its own page */}
          <div className="mt-4">
            <p className="text-xs text-mist/70 mb-2">KPX Jr levels</p>
            <div className="grid grid-cols-2 gap-2">
              {KPX.levels.map((lvl, i) => {
                const t = LEVEL_THEME[lvl.id];
                const active = route.name === "level" && route.level === i + 1;
                return (
                  <button
                    key={lvl.id}
                    onClick={() => {
                      setOpen(false);
                      goToLevel(i + 1);
                    }}
                    className={cn(
                      "flex items-center justify-between gap-2 rounded-lg border bg-navy/50 px-3 py-2 text-left cursor-pointer",
                      active ? "border-white/40" : "border-electric/20"
                    )}
                    aria-current={active ? "page" : undefined}
                  >
                    <span className="text-[11px] font-bold text-white">{lvl.name}</span>
                    {unlocked ? (
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: t.hexColor }} aria-hidden="true" />
                    ) : (
                      <Lock size={10} className="text-mist/50" aria-hidden="true" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <button
            onClick={() => {
              setOpen(false);
              exploreKpx();
            }}
            className="btn-glow mt-4 w-full inline-flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-bold font-head text-white cursor-pointer"
          >
            {unlocked ? "Open KPX Jr" : "Explore KPX Jr"} <ArrowRight size={15} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </header>
  );
}
