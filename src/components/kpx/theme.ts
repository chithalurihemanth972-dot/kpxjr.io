import type { LevelColor } from "../../data/content";

/* ═══════════════════════════════════════════════════════════════
   Level visual themes — literal Tailwind classes (safe for JIT).
   Level colors are used consistently across every route.
   ═══════════════════════════════════════════════════════════════ */
export interface LevelTheme {
  text: string;
  bg: string;
  ring: string;
  chip: string;
  tabActive: string;
  hexColor: string;
  /** rgba helpers for inline glows */
  soft: string;
  glow: string;
}

export const LEVEL_THEME: Record<LevelColor, LevelTheme> = {
  jr1: {
    text: "text-jr1",
    bg: "bg-jr1/10",
    ring: "border-jr1/50",
    chip: "border-jr1/30 bg-jr1/8 text-jr1",
    tabActive: "border-jr1/70 bg-jr1/10 text-white shadow-[0_0_26px_rgba(255,200,87,0.25)]",
    hexColor: "#FFC857",
    soft: "rgba(255,200,87,0.12)",
    glow: "rgba(255,200,87,0.35)",
  },
  jr2: {
    text: "text-jr2",
    bg: "bg-jr2/10",
    ring: "border-jr2/50",
    chip: "border-jr2/30 bg-jr2/8 text-jr2",
    tabActive: "border-jr2/70 bg-jr2/10 text-white shadow-[0_0_26px_rgba(34,211,238,0.3)]",
    hexColor: "#22D3EE",
    soft: "rgba(34,211,238,0.12)",
    glow: "rgba(34,211,238,0.4)",
  },
  jr3: {
    text: "text-jr3",
    bg: "bg-jr3/10",
    ring: "border-jr3/50",
    chip: "border-jr3/30 bg-jr3/8 text-jr3",
    tabActive: "border-jr3/70 bg-jr3/10 text-white shadow-[0_0_26px_rgba(74,222,128,0.25)]",
    hexColor: "#4ADE80",
    soft: "rgba(74,222,128,0.12)",
    glow: "rgba(74,222,128,0.35)",
  },
  jr4: {
    text: "text-jr4",
    bg: "bg-jr4/10",
    ring: "border-jr4/50",
    chip: "border-jr4/30 bg-jr4/8 text-jr4",
    tabActive: "border-jr4/70 bg-jr4/10 text-white shadow-[0_0_26px_rgba(167,139,250,0.3)]",
    hexColor: "#A78BFA",
    soft: "rgba(167,139,250,0.12)",
    glow: "rgba(167,139,250,0.4)",
  },
};

export const themeFor = (levelNumber: number): LevelTheme =>
  LEVEL_THEME[`jr${levelNumber}` as LevelColor] ?? LEVEL_THEME.jr1;
