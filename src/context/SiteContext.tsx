import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { getSavedLead, isUnlocked, type LeadPayload } from "../lib/lead";
import { navigate, readPath } from "../lib/router";
import { scrollToId } from "../lib/hooks";

/* ═══════════════════════════════════════════════════════════════
   SiteContext — owns the KPX Jr unlock gate + the global lead modal
   so every page (home, program, level pages) shares one state.

   Flow:
     locked   → CTA opens the lead modal (remembering destination)
     unlocked → CTA navigates straight to the destination page
   The unlock persists in localStorage (src/lib/lead.ts).
   ═══════════════════════════════════════════════════════════════ */

interface SiteValue {
  unlocked: boolean;
  lead: LeadPayload | null;
  highlight: boolean;
  modalOpen: boolean;
  /** Open the lead modal, optionally remembering where to land after unlock. */
  openLead: (destination?: string) => void;
  closeLead: () => void;
  /** Navbar / hero / gateway CTA — gate-aware. */
  exploreKpx: () => void;
  /** Level card / level nav — gate-aware. */
  goToLevel: (level: number) => void;
  onLeadSuccess: (lead: LeadPayload) => void;
}

const SiteCtx = createContext<SiteValue | null>(null);

export function SiteProvider({ children }: { children: ReactNode }) {
  const [unlocked, setUnlocked] = useState<boolean>(() => isUnlocked());
  const [lead, setLead] = useState<LeadPayload | null>(() => getSavedLead());
  const [modalOpen, setModalOpen] = useState(false);
  const [highlight, setHighlight] = useState(false);
  const [pendingDest, setPendingDest] = useState<string | null>(null);

  const openLead = useCallback((destination?: string) => {
    setPendingDest(destination ?? null);
    setModalOpen(true);
  }, []);

  const closeLead = useCallback(() => {
    setModalOpen(false);
    setPendingDest(null);
  }, []);

  const exploreKpx = useCallback(() => {
    if (isUnlocked()) navigate("/kpx-jr");
    else openLead("/kpx-jr");
  }, [openLead]);

  const goToLevel = useCallback(
    (level: number) => {
      const dest = `/kpx-jr/level-${level}`;
      if (isUnlocked()) navigate(dest);
      else openLead(dest);
    },
    [openLead]
  );

  const onLeadSuccess = useCallback(
    (newLead: LeadPayload) => {
      setLead(newLead);
      setUnlocked(true);
      setModalOpen(false);

      /* Land on the page the visitor was trying to open (or the program). */
      const destination = pendingDest ?? (readPath() === "/" ? "/kpx-jr" : readPath());
      setPendingDest(null);
      navigate(destination);

      /* Reveal with a glowing pulse, clear of the sticky navbar. */
      setHighlight(true);
      window.setTimeout(() => {
        const el = document.getElementById("kpx-main");
        if (el) scrollToId("kpx-main");
        else window.scrollTo({ top: 0, behavior: "smooth" });
      }, 350);
      window.setTimeout(() => setHighlight(false), 5200);
    },
    [pendingDest]
  );

  /* Keep the gate in sync across tabs / manual localStorage edits. */
  useEffect(() => {
    const sync = () => {
      setUnlocked(isUnlocked());
      setLead(getSavedLead());
    };
    window.addEventListener("storage", sync);
    /* Re-read the gate on navigation so deep links always reflect storage. */
    window.addEventListener("hashchange", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("hashchange", sync);
    };
  }, []);

  return (
    <SiteCtx.Provider
      value={{ unlocked, lead, highlight, modalOpen, openLead, closeLead, exploreKpx, goToLevel, onLeadSuccess }}
    >
      {children}
    </SiteCtx.Provider>
  );
}

export function useSite(): SiteValue {
  const ctx = useContext(SiteCtx);
  if (!ctx) throw new Error("useSite must be used inside <SiteProvider>");
  return ctx;
}
