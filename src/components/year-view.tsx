import { useEffect, useState, type CSSProperties, type FocusEvent, type PointerEvent } from "react"

import { holidayLabel } from "@/data/years"
import { DAY_NAMES, MONTH_NAMES, fmtDm, parseIso, type YearView as View } from "@/lib/calendar"
import { WEEK_HEAD, monthGrid, pasaran, type BreakIndex } from "@/lib/breaks"
import { cn } from "@/lib/cn"
import { SHEET, withTransition } from "@/lib/transition"

import { dayStatus, rangeText } from "@/lib/day-text"

type Tip = { iso: string; x: number; y: number; below: boolean }

/**
 * Twelve months in the same language as the month view: red blocks for
 * breaks, highlighter for leave. Hover or keyboard focus on a day shows a
 * tooltip; choosing a month or a day zooms that month open.
 */
export function YearView({
  view,
  idx,
  today,
  month,
  onSelect,
  onMonthChange,
}: {
  view: View
  idx: BreakIndex
  today: string | null
  month: number
  onSelect: (iso: string) => void
  onMonthChange: (m: number) => void
}) {
  const [tip, setTip] = useState<Tip | null>(null)
  // hovering a suggested leave day sweeps the highlighter across its long weekend
  const preview = tip ? idx.leave.get(tip.iso) : undefined
  const swipe = new Map(preview?.run.map((d, i) => [d.iso, i]) ?? [])

  // a fixed tooltip would drift from its day while the page scrolls
  useEffect(() => {
    if (!tip) return
    const hide = () => setTip(null)
    window.addEventListener("scroll", hide, { passive: true })
    window.addEventListener("resize", hide)
    return () => {
      window.removeEventListener("scroll", hide)
      window.removeEventListener("resize", hide)
    }
  }, [tip])

  const show = (iso: string, el: HTMLElement) => {
    const r = el.getBoundingClientRect()
    const below = r.top < 150
    setTip({ iso, x: Math.min(Math.max(r.left + r.width / 2, 140), window.innerWidth - 140), y: below ? r.bottom + 8 : r.top - 8, below })
  }

  /** zoom the chosen month's thumbnail into the month view */
  const open = (m: number, action: () => void) => {
    setTip(null)
    for (const el of document.querySelectorAll<HTMLElement>("[data-sheet]"))
      el.style.viewTransitionName = Number(el.dataset.sheet) === m ? SHEET : "none"
    withTransition(action)
  }

  return (
    <section aria-label={`Kalender setahun ${view.year}`} className="grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-10 sm:gap-y-10 lg:grid-cols-3">
      {MONTH_NAMES.map((name, m) => {
        const grid = monthGrid(view.year, m)
        const reds = view.holidays.filter((h) => Number(h.date.slice(5, 7)) - 1 === m).length
        return (
          <div key={name} data-sheet={m} style={{ viewTransitionName: m === month ? SHEET : "none" }} className="min-w-0">
            <button
              type="button"
              onClick={() => open(m, () => onMonthChange(m))}
              className="group mb-2 flex w-full items-baseline justify-between gap-2 rounded-md text-left focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ink"
            >
              <span className="display text-[24px] leading-none transition-colors group-hover:text-merah-ink sm:text-[30px]">{name}</span>
              {reds > 0 && <span className="shrink-0 text-[14px] font-bold whitespace-nowrap text-muted">{reds} merah</span>}
            </button>
            <div role="grid" aria-label={`${name} ${view.year}`} className="grid grid-cols-7">
              {WEEK_HEAD.map((w, i) => (
                <abbr key={w} title={w} className={cn("pb-1 text-center text-[13px] font-bold no-underline", i === 6 ? "text-merah-ink" : "text-muted")}>
                  <span className="sm:hidden">{w[0]}</span>
                  <span className="max-sm:hidden">{w.slice(0, 3)}</span>
                </abbr>
              ))}
              {grid.map((d, i) => {
                if (d.month !== m) return <span key={d.iso} aria-hidden />
                const col = i % 7
                const b = idx.byIso.get(d.iso)
                const sameMonth = (k: number) => grid[k]?.month === m
                const joinL = col > 0 && !!b && sameMonth(i - 1) && idx.byIso.get(grid[i - 1].iso) === b
                const joinR = col < 6 && !!b && sameMonth(i + 1) && idx.byIso.get(grid[i + 1].iso) === b
                const leave = idx.leave.get(d.iso)
                const lL = col > 0 && !!leave && sameMonth(i - 1) && idx.leave.get(grid[i - 1].iso) === leave
                const lR = col < 6 && !!leave && sameMonth(i + 1) && idx.leave.get(grid[i + 1].iso) === leave
                const h = view.special.get(d.iso)
                const isTip = tip?.iso === d.iso
                const sw = swipe.get(d.iso)
                const swL = col > 0 && sameMonth(i - 1) && swipe.has(grid[i - 1].iso)
                const swR = col < 6 && sameMonth(i + 1) && swipe.has(grid[i + 1].iso)
                return (
                  <button
                    key={d.iso}
                    type="button"
                    role="gridcell"
                    aria-label={`${DAY_NAMES[d.dow]}, ${fmtDm(d)}${h ? `, ${holidayLabel(h)}` : b ? ", libur" : leave ? ", saran cuti" : ""}`}
                    aria-describedby={isTip ? "year-tip" : undefined}
                    aria-current={d.iso === today ? "date" : undefined}
                    onPointerEnter={(e: PointerEvent<HTMLButtonElement>) => e.pointerType === "mouse" && show(d.iso, e.currentTarget)}
                    onPointerLeave={() => setTip(null)}
                    onFocus={(e: FocusEvent<HTMLButtonElement>) => e.currentTarget.matches(":focus-visible") && show(d.iso, e.currentTarget)}
                    onBlur={() => setTip(null)}
                    onClick={() => open(m, () => onSelect(d.iso))}
                    className="group relative h-9 min-w-0 text-[13px] font-bold outline-none sm:h-10 sm:text-[15px]"
                  >
                    {sw !== undefined && (
                      <span
                        aria-hidden
                        style={{ "--i": sw } as CSSProperties}
                        className={cn("absolute inset-y-0 animate-swipe bg-stabilo", swL ? "-left-px" : "left-0 rounded-l-xl", swR ? "-right-px" : "right-0 rounded-r-xl")}
                      />
                    )}
                    {b && <span aria-hidden className={cn("absolute inset-y-1 bg-merah", joinL ? "-left-px" : "left-0.5 rounded-l-lg", joinR ? "-right-px" : "right-0.5 rounded-r-lg")} />}
                    {leave && !b && <span aria-hidden className={cn("stabilo absolute inset-y-1", lL ? "-left-px rounded-l-none" : "left-0.5", lR ? "-right-px rounded-r-none" : "right-0.5")} />}
                    <span
                      className={cn(
                        "relative inline-grid h-6 min-w-6 place-items-center rounded-full px-0.5 transition-transform group-hover:scale-125",
                        b ? "text-on-merah" : leave ? "text-on-stabilo" : d.dow === 0 && "text-merah-ink",
                        d.iso === today && (b ? "bg-on-merah !text-merah" : "bg-ink !text-paper"),
                        "group-focus-visible:outline-3 group-focus-visible:outline-offset-1 group-focus-visible:outline-ink"
                      )}
                    >
                      {d.day}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        )
      })}
      {tip && <YearTip tip={tip} view={view} idx={idx} />}
    </section>
  )
}

function YearTip({ tip, view, idx }: { tip: Tip; view: View; idx: BreakIndex }) {
  const d = parseIso(tip.iso)
  const h = view.special.get(tip.iso)
  const b = idx.byIso.get(tip.iso)
  const leave = idx.leave.get(tip.iso)
  return (
    <div
      id="year-tip"
      role="tooltip"
      style={{ left: tip.x, top: tip.y }}
      className={cn("pointer-events-none fixed z-50 w-max max-w-[260px] -translate-x-1/2", !tip.below && "-translate-y-full")}
    >
      <div className="animate-pop rounded-2xl bg-ink px-4 py-3 text-paper shadow-[0_10px_30px_rgb(0_0_0/0.25)]">
        <p className="text-[13px] font-semibold opacity-80">{DAY_NAMES[d.dow]} {pasaran(d)}</p>
        <p className="text-[17px] leading-tight font-extrabold">{fmtDm(d)}</p>
        <p className="mt-1 text-[14px] leading-snug font-semibold">{h ? holidayLabel(h) : dayStatus(tip.iso, view, idx)}</p>
        {h?.kind === "cuti" && idx.cutiIsLeave && <p className="text-[14px] leading-snug opacity-90">Memotong cuti tahunan</p>}
        {b && <p className="mt-1 text-[14px] leading-snug opacity-90">Libur {b.days.length} hari: {rangeText(b.days)}</p>}
        {leave && (
          <p className="mt-2 inline-block rounded-md bg-stabilo px-2 py-0.5 text-[14px] font-bold text-on-stabilo">
            Ambil cuti → libur {leave.run.length} hari
          </p>
        )}
      </div>
    </div>
  )
}
