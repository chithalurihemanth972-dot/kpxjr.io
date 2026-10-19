import { useEffect, useState } from "react";
import { scrollToId } from "./hooks";

/* ═══════════════════════════════════════════════════════════════
   Tiny hash router — works on any static host (Vercel, Netlify,
   GitHub Pages, file://) without server rewrites.

   Routes
     /                     → main single-page site
     /kpx-jr               → KPX Jr program (gated)
     /kpx-jr/level-1..4    → one page per level (gated)
     anything else         → not-found page
   ═══════════════════════════════════════════════════════════════ */

export interface Route {
  path: string;
  name: "home" | "kpx" | "level" | "notfound";
  level?: number;
}

/** Normalise the current hash into a clean path ("/", "/kpx-jr", …). */
export function readPath(): string {
  if (typeof window === "undefined") return "/";
  const raw = window.location.hash.replace(/^#/, "").split("?")[0];
  if (!raw || raw === "/") return "/";
  const withSlash = raw.startsWith("/") ? raw : `/${raw}`;
  return withSlash.replace(/\/+$/, "") || "/";
}

export function parseRoute(path: string): Route {
  if (path === "/") return { path, name: "home" };
  if (path === "/kpx-jr") return { path, name: "kpx" };
  const m = path.match(/^\/kpx-jr\/level-([1-4])$/);
  if (m) return { path, name: "level", level: Number(m[1]) };
  return { path, name: "notfound" };
}

/** React hook: re-renders on hash navigation. */
export function usePath(): string {
  const [path, setPath] = useState<string>(() => readPath());

  useEffect(() => {
    const onHash = () => setPath(readPath());
    window.addEventListener("hashchange", onHash);
    /* Ensure a canonical "#/" so back/forward always has an entry. */
    if (!window.location.hash) window.history.replaceState(null, "", "#/");
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  return path;
}

/** Navigate to a route. Same-route calls just reset scroll. */
export function navigate(path: string) {
  const target = path.startsWith("/") ? path : `/${path}`;
  if (readPath() === target) {
    window.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }
  window.location.hash = target;
}

/* ── Cross-page section links (About / Technology / Projects) ── */
let pendingAnchor: string | null = null;

export function setPendingAnchor(id: string) {
  pendingAnchor = id;
}

export function consumePendingAnchor(): string | null {
  const a = pendingAnchor;
  pendingAnchor = null;
  return a;
}

/** Jump to a home-page section from ANY page. */
export function goHomeSection(id: string) {
  if (readPath() === "/") {
    scrollToId(id);
    return;
  }
  setPendingAnchor(id);
  navigate("/");
}
