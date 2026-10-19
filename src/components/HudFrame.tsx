import { cn } from "../utils/cn";

/* ═══════════════════════════════════════════════════════════════
   HudCorners — HUD-style corner brackets for cards & panels.
   ═══════════════════════════════════════════════════════════════ */
export function HudCorners(_props: { color?: string; size?: number; thickness?: number; className?: string }) {
  return null; // retired: depth now comes from lighting and shadow, not drawn brackets
}

/* ═══════════════════════════════════════════════════════════════
   HexIcon — glowing hexagon icon chip.
   ═══════════════════════════════════════════════════════════════ */
export function HexIcon({
  children,
  size = 64,
  amber = false,
  className,
  style,
}: {
  children: React.ReactNode;
  size?: number;
  amber?: boolean;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={cn("hex-chip hex-glow flex items-center justify-center", amber && "hex-amber", className)}
      style={{ width: size, height: size, ...style }}
      aria-hidden="true"
    >
      {children}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SectionHead — consistent kicker + title block per section.
   ═══════════════════════════════════════════════════════════════ */
export function SectionHead({
  kicker,
  title,
  sub,
  align = "center",
  accent,
}: {
  kicker: string;
  title: string;
  sub?: string;
  align?: "center" | "left";
  accent?: string;
}) {
  const label = kicker.replace(/^\/\/\s*(\d+\s*—\s*)?/, "");
  return (
    <div className={cn("mb-12 md:mb-16", align === "center" ? "text-center" : "text-left")}>
      <p className="font-head font-semibold text-sm text-electric-soft mb-3">{label}</p>
      <h2 className="font-head font-bold text-3xl md:text-[2.75rem] leading-[1.08] tracking-[-0.02em] text-white text-balance">
        {title} {accent && <span className="text-mist font-medium">{accent}</span>}
      </h2>
      {sub && (
        <p className={cn("mt-4 text-mist max-w-2xl text-base md:text-lg", align === "center" && "mx-auto")}>{sub}</p>
      )}
    </div>
  );
}
