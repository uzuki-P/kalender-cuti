import { useId, type ReactNode } from "react"

import { cn } from "@/lib/cn"

/** A switch for one of the visitor's workplace leave rules. */
export function PolicySwitch({
  label,
  hint,
  on,
  onChange,
}: {
  label: ReactNode
  hint: ReactNode
  on: boolean
  onChange: (on: boolean) => void
}) {
  const labelId = useId()
  const hintId = useId()
  return (
    <div className="flex items-start gap-3 sm:items-center">
      <button
        type="button"
        role="switch"
        aria-checked={on}
        aria-labelledby={labelId}
        aria-describedby={hintId}
        onClick={() => onChange(!on)}
        className={cn(
          "relative mt-0.5 h-7 w-12 shrink-0 rounded-full transition-colors duration-200 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ink sm:mt-0",
          on ? "bg-ink" : "bg-muted"
        )}
      >
        <span
          aria-hidden
          className={cn(
            "absolute top-1 left-1 size-5 rounded-full shadow-[0_1px_3px_rgb(0_0_0/0.3)] transition-[translate,background-color] duration-200 ease-out-quint",
            on ? "translate-x-5 bg-stabilo" : "bg-paper"
          )}
        />
      </button>
      <p className="text-[15px] leading-snug">
        <span id={labelId} className="cursor-pointer font-bold" onClick={() => onChange(!on)}>
          {label}
        </span>{" "}
        <span id={hintId} className="text-muted">
          · {hint}
        </span>
      </p>
    </div>
  )
}
