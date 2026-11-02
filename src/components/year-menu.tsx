import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react"

import { YEARS } from "@/data/years"
import { cn } from "@/lib/cn"
import { withTransition } from "@/lib/transition"

import { Check, ChevronDown } from "./icons"

// newest first
const YEAR_LIST = Object.keys(YEARS).map(Number).sort((a, b) => b - a)

/**
 * The year in a calendar title, as a dropdown of the years with data. It
 * takes the title's font and colour; the menu follows the theme menu's keys:
 * arrows, Home/End move, Enter or Space picks, Escape, Tab or a click outside
 * closes.
 */
export function YearMenu({ year, onYearChange, className }: { year: number; onYearChange: (year: number) => void; className?: string }) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLSpanElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const itemsRef = useRef<(HTMLButtonElement | null)[]>([])
  const menuId = useId()
  const current = Math.max(0, YEAR_LIST.indexOf(year))

  useEffect(() => {
    if (!open) return
    const onDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("pointerdown", onDown)
    return () => document.removeEventListener("pointerdown", onDown)
  }, [open])

  const focusItem = (i: number) => itemsRef.current[(i + YEAR_LIST.length) % YEAR_LIST.length]?.focus()

  const openAt = (i: number) => {
    setOpen(true)
    requestAnimationFrame(() => focusItem(i))
  }

  const close = (refocus = true) => {
    setOpen(false)
    if (refocus) buttonRef.current?.focus()
  }

  const pick = (y: number) => {
    close()
    if (y !== year) withTransition(() => onYearChange(y))
  }

  const onButtonKey = (e: KeyboardEvent) => {
    if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      openAt(current)
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      openAt(YEAR_LIST.length - 1)
    }
  }

  const onMenuKey = (e: KeyboardEvent) => {
    const i = itemsRef.current.indexOf(document.activeElement as HTMLButtonElement)
    const moves: Record<string, number> = { ArrowDown: i + 1, ArrowUp: i - 1, Home: 0, End: YEAR_LIST.length - 1 }
    if (e.key in moves) {
      e.preventDefault()
      focusItem(moves[e.key])
    } else if (e.key === "Escape") {
      e.preventDefault()
      close()
    } else if (e.key === "Tab") {
      close(false)
    }
  }

  return (
    <span ref={rootRef} className="relative inline-block">
      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        aria-label={`Tahun ${year}, pilih tahun lain`}
        onClick={() => (open ? close() : openAt(current))}
        onKeyDown={onButtonKey}
        className={cn(
          "group inline-flex items-center gap-[0.08em] rounded-[0.12em] text-merah-ink decoration-[0.05em] underline-offset-[0.1em] hover:underline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ink",
          className
        )}
      >
        {year}
        <ChevronDown aria-hidden width="0.4em" height="0.4em" strokeWidth={3} className={cn("transition-transform duration-200", open && "rotate-180")} />
      </button>

      {open && (
        <span
          id={menuId}
          role="menu"
          aria-label="Tahun"
          onKeyDown={onMenuKey}
          className="absolute top-full right-0 z-50 mt-2 flex w-44 origin-top-right animate-pop flex-col rounded-2xl border border-line bg-paper p-1.5 font-sans text-[17px] leading-normal font-bold tracking-normal text-ink shadow-[0_12px_32px_rgb(0_0_0/0.18)]"
        >
          {YEAR_LIST.map((y, i) => {
            const checked = y === year
            return (
              <button
                key={y}
                ref={(el) => {
                  itemsRef.current[i] = el
                }}
                type="button"
                role="menuitemradio"
                aria-checked={checked}
                tabIndex={-1}
                onClick={() => pick(y)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left outline-none hover:bg-panel focus-visible:bg-panel focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ink",
                  checked ? "font-extrabold" : "font-semibold"
                )}
              >
                <span className="flex-1">{y}</span>
                {checked && <Check className="text-merah-ink" />}
              </button>
            )
          })}
        </span>
      )}
    </span>
  )
}
