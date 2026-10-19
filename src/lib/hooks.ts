import { useCallback, useEffect, useRef, useState } from "react";

/* ── Detect reduced-motion preference once ──────────────────── */
export const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ═══════════════════════════════════════════════════════════════
   useReveal — adds `.reveal--in` (or a custom class) when the
   element scrolls into view. Also works for circuit-draw SVGs.
   ═══════════════════════════════════════════════════════════════ */
export function useReveal<T extends HTMLElement = HTMLDivElement>(inClass = "reveal--in", threshold = 0.15) {
  const cleanupRef = useRef<(() => void) | null>(null);

  /* A CALLBACK ref (not a ref object) so setup runs the moment the node
     actually mounts. This matters for gated content: after unlocking in
     place, the cards mount later than the page and must still observe. */
  const revealRef = useCallback(
    (el: T | null) => {
      cleanupRef.current?.();
      cleanupRef.current = null;
      if (!el) return;

      const reveal = () => el.classList.add(inClass);

      if (prefersReducedMotion() || typeof IntersectionObserver === "undefined") {
        reveal();
        return;
      }

      let raf = 0;
      let safety = 0;
      let done = false;

      const io = new IntersectionObserver(
        (entries) => {
          if (entries.some((e) => e.isIntersecting)) {
            reveal();
            cleanup();
          }
        },
        { threshold: Math.min(threshold, 0.05), rootMargin: "0px 0px -4% 0px" }
      );

      const inView = () => {
        const r = el.getBoundingClientRect();
        return r.top < window.innerHeight * 0.95 && r.bottom > -40;
      };

      const check = () => {
        if (!done && inView()) {
          reveal();
          cleanup();
        }
      };

      const fallback = () => check();

      function cleanup() {
        if (done) return;
        done = true;
        io.disconnect();
        window.removeEventListener("scroll", fallback);
        window.removeEventListener("resize", fallback);
        window.clearTimeout(safety);
        cancelAnimationFrame(raf);
      }

      /* Already visible at mount? Reveal next frame so the transition plays. */
      raf = requestAnimationFrame(check);
      io.observe(el);
      window.addEventListener("scroll", fallback, { passive: true });
      window.addEventListener("resize", fallback);

      /* Last-resort guard for content that is on/near screen. */
      safety = window.setTimeout(() => {
        const r = el.getBoundingClientRect();
        if (r.top < window.innerHeight * 1.15 && r.bottom > -120) {
          reveal();
          cleanup();
        }
      }, 3000);

      cleanupRef.current = cleanup;
    },
    [inClass, threshold]
  );

  /* Tear down if the component unmounts while still observing. */
  useEffect(() => () => cleanupRef.current?.(), []);

  return revealRef;
}

/* ═══════════════════════════════════════════════════════════════
   useCountUp — animates a number from 0 → target on first view.
   ═══════════════════════════════════════════════════════════════ */
export function useCountUp(target: number, duration = 1700) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLSpanElement | null>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const run = () => {
      if (started.current) return;
      started.current = true;
      if (prefersReducedMotion()) {
        setValue(target);
        return;
      }
      const t0 = performance.now();
      const tick = (now: number) => {
        const p = Math.min((now - t0) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 4); // easeOutQuart
        setValue(Math.round(target * eased));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };

    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && (run(), io.disconnect())),
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [target, duration]);

  return { ref, value };
}

/* ═══════════════════════════════════════════════════════════════
   useScramble — "decoding" typewriter: characters resolve from
   random glyphs into the final string. Robotics-terminal feel.
   ═══════════════════════════════════════════════════════════════ */
const GLYPHS = "01<>[]{}=/\\|=+*#Δ";

export function useScramble(text: string, startDelay = 350, speed = 26) {
  const [output, setOutput] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (prefersReducedMotion()) {
      setOutput(text);
      setDone(true);
      return;
    }
    let frame = 0;
    let raf = 0;
    let resolved = 0;
    let timeout = 0;

    const step = () => {
      frame++;
      // resolve a new character every `speed/16` frames
      if (frame % Math.max(1, Math.round(speed / 16)) === 0 && resolved < text.length) resolved++;
      const scrambled = text
        .split("")
        .map((ch, i) => {
          if (ch === " " || ch === "." || ch === "'") return ch;
          if (i < resolved) return ch;
          return GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
        })
        .join("");
      setOutput(scrambled);
      if (resolved >= text.length) {
        setOutput(text);
        setDone(true);
        return;
      }
      raf = requestAnimationFrame(step);
    };

    timeout = window.setTimeout(() => (raf = requestAnimationFrame(step)), startDelay);
    return () => {
      clearTimeout(timeout);
      cancelAnimationFrame(raf);
    };
  }, [text, startDelay, speed]);

  return { output, done };
}

/* ═══════════════════════════════════════════════════════════════
   useTypewriter — simple character-by-character typing.
   ═══════════════════════════════════════════════════════════════ */
export function useTypewriter(text: string, startDelay = 0, speed = 34) {
  const [output, setOutput] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (prefersReducedMotion()) {
      setOutput(text);
      setDone(true);
      return;
    }
    let i = 0;
    let interval = 0;
    const timeout = window.setTimeout(() => {
      interval = window.setInterval(() => {
        i++;
        setOutput(text.slice(0, i));
        if (i >= text.length) {
          window.clearInterval(interval);
          setDone(true);
        }
      }, speed);
    }, startDelay);
    return () => {
      clearTimeout(timeout);
      window.clearInterval(interval);
    };
  }, [text, startDelay, speed]);

  return { output, done };
}

/* ── Smooth-scroll to a section by id ───────────────────────── */
export const scrollToId = (id: string) => {
  document.getElementById(id)?.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "start" });
};

/* ── useScrolled — true once the page is scrolled past `px` ─── */
export function useScrolled(px = 24) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > px);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [px]);
  return scrolled;
}

/* ── Lock body scroll (for the modal) ───────────────────────── */
export function useLockBody(locked: boolean) {
  useEffect(() => {
    if (!locked) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [locked]);
}

/* ── Stable callback helper for canvases ────────────────────── */
export const useRafLoop = (cb: () => void, active = true) => {
  const saved = useRef(cb);
  saved.current = cb;
  useEffect(() => {
    if (!active) return;
    let raf = 0;
    const loop = () => {
      saved.current();
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [active]);
};


