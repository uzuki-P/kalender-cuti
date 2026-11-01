import type { CSSProperties } from "react"

import type { ShapeName } from "@/components/m3e/shape"
import { shapeClipPath } from "@/lib/m3e/shape-library"
import { cn } from "@/lib/m3e/cn"

const PIECES: ShapeName[] = ["flower", "4-leaf-clover", "sunny", "puffy", "soft-burst", "12-sided-cookie", "pill"]
const TONES = [
  "bg-primary-container",
  "bg-secondary-container",
  "bg-tertiary-container",
  "bg-tertiary/40",
  "bg-primary/25",
]

const BURST_TONES = ["bg-primary", "bg-tertiary", "bg-secondary", "bg-error"]

// Deterministic, so the prerendered HTML matches the hydrated page.
const rand = (seed: number) => {
  const x = Math.sin(seed * 9301 + 49297) * 233280
  return x - Math.floor(x)
}

/**
 * Slow drifting shapes behind a section, spread across the whole viewport
 * width. The parent needs `relative isolate`; the app root clips the overflow.
 */
export function FloatingShapes({ seed = 1, count = 6, className }: { seed?: number; count?: number; className?: string }) {
  return (
    <div aria-hidden className={cn("pointer-events-none absolute inset-y-0 left-1/2 -z-10 w-screen -translate-x-1/2", className)}>
      {Array.from({ length: count }, (_, i) => {
        const r = (k: number) => rand(seed * 31 + i * 7 + k)
        const size = 28 + Math.round(r(1) * 72)
        return (
          <span
            key={i}
            className={cn("float-shape absolute", TONES[(seed + i) % TONES.length])}
            style={
              {
                width: size,
                height: size,
                left: `${Math.round(r(2) * 92)}%`,
                top: `${Math.round(r(3) * 88)}%`,
                clipPath: shapeClipPath(PIECES[(seed * 3 + i) % PIECES.length]),
                "--dur": `${14 + r(4) * 12}s`,
                "--delay": `${-r(5) * 20}s`,
                "--dx": `${(r(6) - 0.5) * 80}px`,
                "--dy": `${(r(7) - 0.5) * 70}px`,
                "--spin": `${r(8) > 0.5 ? 1 : -1}turn`,
              } as CSSProperties
            }
          />
        )
      })}
    </div>
  )
}

/** A one-shot pop of confetti from the centre. Re-key it to fire again. */
export function Burst({ pieces = 10, className }: { pieces?: number; className?: string }) {
  return (
    <span aria-hidden className={cn("pointer-events-none absolute inset-0 grid place-items-center", className)}>
      {Array.from({ length: pieces }, (_, i) => (
        <span
          key={i}
          className={cn("burst-piece col-start-1 row-start-1 size-3", BURST_TONES[i % BURST_TONES.length])}
          style={
            {
              clipPath: shapeClipPath(PIECES[i % PIECES.length]),
              "--a": `${(360 / pieces) * i + rand(i) * 20}deg`,
              "--d": `${52 + rand(i + 3) * 30}px`,
            } as CSSProperties
          }
        />
      ))}
    </span>
  )
}
