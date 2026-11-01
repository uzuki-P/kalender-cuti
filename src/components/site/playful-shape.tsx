import type { CSSProperties } from "react"

import { Shape, type ShapeName, type ShapeProps } from "@/components/m3e/shape"
import { shapeClipPath } from "@/lib/m3e/shape-library"
import { cn } from "@/lib/m3e/cn"

/**
 * A badge whose silhouette sits behind its content, so dates and icons stay
 * upright. It rests still; pointing at it (or its `.group` card) morphs it
 * into `hoverName` with a quarter turn, and it eases back on leave. Every
 * library polygon has the same point count, so any pair morphs cleanly.
 */
export function PlayfulShape({
  name = "flower",
  hoverName = "sunny",
  className,
  style,
  children,
  ...props
}: ShapeProps & { hoverName?: ShapeName }) {
  return (
    <Shape
      {...props}
      className={cn("shape-host isolate !overflow-visible !bg-transparent", className)}
      style={{ ...style, clipPath: "none" }}
    >
      <span
        aria-hidden
        className="shape-fill pointer-events-none absolute inset-0 -z-10"
        style={
          {
            "--shape-rest": shapeClipPath(name),
            "--shape-hover": shapeClipPath(hoverName),
          } as CSSProperties
        }
      />
      {children}
    </Shape>
  )
}
