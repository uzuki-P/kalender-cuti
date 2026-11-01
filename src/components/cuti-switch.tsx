import { useId } from "react"

import type { YearView } from "@/lib/calendar"
import { cn } from "@/lib/cn"

/** Lets the visitor say their workplace takes cuti bersama from annual leave. */
export function CutiSwitch({
  view,
  on,
  onChange,
}: {
  view: YearView
  on: boolean
  onChange: (on: boolean) => void
}) {
  const label = useId()
  const hint = useId()
  return (
    <div className="mx-auto flex max-w-[1320px] items-start gap-3 px-3 pt-4 sm:items-center sm:px-8">
      <button
        type="button"
        role="switch"
        aria-checked={on}
        aria-labelledby={label}
        aria-describedby={hint}
        onClick={() => onChange(!on)}
        className={cn(
          "relative mt-0.5 h-7 w-12 shrink-0 rounded-full transition-colors duration-200 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ink sm:mt-0",
          on ? "bg-ink" : "bg-line"
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
        <span id={label} className="cursor-pointer font-bold" onClick={() => onChange(!on)}>
          Cuti bersama memotong cuti tahunan
        </span>{" "}
        <span id={hint} className="text-muted">
          {on
            ? `· ${view.nCuti} hari cuti bersama ${view.year} ditandai stabilo, karena memakai jatah cutimu.`
            : "· nyalakan jika kantormu menghitungnya sebagai cuti."}
        </span>
      </p>
    </div>
  )
}
