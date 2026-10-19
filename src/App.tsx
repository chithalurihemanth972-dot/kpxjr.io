import { useEffect } from "react";
import { ArrowLeft, RadioTower } from "lucide-react";
import PointerTilt from "./components/PointerTilt";
import Footer from "./components/Footer";
import LeadModal from "./components/LeadModal";
import Navbar from "./components/Navbar";
import { SiteProvider, useSite } from "./context/SiteContext";
import HomePage from "./pages/HomePage";
import KpxJrPage from "./pages/KpxJrPage";
import LevelPage from "./pages/LevelPage";
import { KPX, PAGES } from "./data/content";
import { scrollToId } from "./lib/hooks";
import { consumePendingAnchor, parseRoute, usePath, type Route } from "./lib/router";

/* ═══════════════════════════════════════════════════════════════
   KProjectXX — routing shell
     #/                    → main single-page site
     #/kpx-jr              → KPX Jr program page
     #/kpx-jr/level-1..4   → one page per level
   Unlock state + lead modal live in SiteProvider, so the gate is
   shared across every route and survives refresh (localStorage).
   ═══════════════════════════════════════════════════════════════ */

/* Per-route document title + description (SEO-friendly SPA). */
function applyMeta(route: Route) {
  let title = "KProjectXX — Engineering Tomorrow. Building What's Next. | Hyderabad";
  let desc =
    "KProjectXX is an engineering and robotics venture from Hyderabad, India — robotics, mechatronics, embedded systems, drones, automation and KPX Jr.";

  if (route.name === "kpx") {
    title = "KPX Jr — Four-Level Robotics Program | KProjectXX";
    desc =
      "KPX Jr is a four-level robotics pathway for young innovators: Robotics Fundamentals, Arduino & Embedded Robotics, IoT & Connected Robotics and Robotics Project Lab.";
  } else if (route.name === "level" && route.level) {
    const lvl = KPX.levels[route.level - 1];
    title = `${lvl.name} — ${lvl.title} | KPX Jr by KProjectXX`;
    desc = `${lvl.name} (${lvl.title}) — ${lvl.projects.length} projects, focus areas and kit details in the KPX Jr robotics pathway by KProjectXX, Hyderabad.`;
  } else if (route.name === "notfound") {
    title = "Page not found | KProjectXX";
  }

  document.title = title;
  document.querySelector('meta[name="description"]')?.setAttribute("content", desc);
  document.querySelector('meta[property="og:title"]')?.setAttribute("content", title);
  document.querySelector('meta[property="og:description"]')?.setAttribute("content", desc);
}

/* The global lead modal, rendered once for every route. */
function LeadModalHost() {
  const { modalOpen, closeLead, onLeadSuccess } = useSite();
  return <LeadModal open={modalOpen} onClose={closeLead} onSuccess={onLeadSuccess} />;
}

function NotFoundPage() {
  return (
    <section className="relative min-h-[70vh] flex items-center justify-center px-6 pt-24 ">
      <div className="text-center max-w-md">
        <div className="mx-auto flex items-center justify-center w-16 h-16 rounded-full border border-electric/40 bg-electric/10">
          <RadioTower size={26} className="text-electric" aria-hidden="true" />
        </div>
        <p className="mt-6 tech-label text-[10px] text-amber">{PAGES.notFound.code}</p>
        <h1 className="mt-3 font-head font-black text-3xl md:text-4xl text-white tracking-tight">{PAGES.notFound.title}</h1>
        <p className="mt-3 text-mist text-sm">{PAGES.notFound.sub}</p>
        <a
          href="#/"
          className="btn-glow mt-8 inline-flex items-center gap-2 rounded-xl px-7 py-3.5 font-head font-bold text-sm text-white"
        >
          <ArrowLeft size={16} /> {PAGES.notFound.cta}
        </a>
      </div>
    </section>
  );
}

function Shell() {
  const path = usePath();
  const route = parseRoute(path);

  /* Reset scroll on page change — or jump to a requested home section. */
  useEffect(() => {
    const anchor = consumePendingAnchor();
    if (anchor) {
      const timer = window.setTimeout(() => scrollToId(anchor), 120);
      return () => window.clearTimeout(timer);
    }
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [path]);

  useEffect(() => applyMeta(route), [route]);

  return (
    <div className="relative font-body text-white bg-abyss min-h-screen">
      {/* page-wide light: two soft pools of colour, fixed behind everything */}
      <div
        aria-hidden="true"
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(70% 50% at 15% 0%, rgba(91,124,255,0.16), transparent 70%), radial-gradient(50% 40% at 100% 100%, rgba(255,200,87,0.06), transparent 70%)",
        }}
      />
      <PointerTilt />

      <Navbar />

      <main key={path} className="page-enter relative z-10">
        {route.name === "home" && <HomePage />}
        {route.name === "kpx" && <KpxJrPage />}
        {route.name === "level" && route.level && <LevelPage levelNumber={route.level} />}
        {route.name === "notfound" && <NotFoundPage />}
      </main>

      <Footer />

      <LeadModalHost />

    </div>
  );
}

export default function App() {
  return (
    <SiteProvider>
      <Shell />
    </SiteProvider>
  );
}
