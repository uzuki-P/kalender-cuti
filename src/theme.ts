import type { M3Theme } from "@/components/m3e/m3-theme-provider"

/**
 * One seed, the original kalenderku.id holiday red, in the calm tonal-spot
 * variant: a dusty brick primary, an ochre tertiary, warm low-chroma
 * surfaces (charcoal rather than maroon in dark mode). The 2021 spec keeps
 * wider steps between surface containers, so nested surfaces stay apart.
 *
 *   libur nasional  primary (filled)
 *   cuti bersama    primary-container
 *   selected day    app selection blue
 *   today           primary outline
 */
export const THEME = {
  source: { primary: "#f73b3b" },
  variant: "tonalSpot",
  contrast: "standard",
  spec: "2021",
  motion: "expressive",
} satisfies Partial<M3Theme>

/** Seeds generate paired light and dark palettes through the M3 provider. */
export const COLOR_THEMES = [
  { label: "Merah", seed: "#f73b3b" },
  { label: "Hijau", seed: "#008577" },
  { label: "Ungu", seed: "#8056b3" },
  { label: "Jingga", seed: "#b96620" },
] as const
