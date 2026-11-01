import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from "react"

import { YEARS, holidayLabel } from "@/data/years"
import { DAY_NAMES, MONTH_NAMES, fmtDm, parseIso, type Bridge, type YearView } from "@/lib/calendar"
import { WEEK_HEAD, addDays, monthWeeks, type BreakIndex } from "@/lib/breaks"
import { cn } from "@/lib/cn"
import { SHEET } from "@/lib/transition"

import { ChevronLeft, ChevronRight } from "./icons"

const MONTH_ABBR = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"]
const ring = "focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ink"
const iso = (y: number, m: number, d = 1) => `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`

type Props = {
  view: YearView
  idx: BreakIndex
  today: string | null
  selected: string
  month: number
  /** the suggestion whose long weekend the highlighter shows */
  preview: Bridge | null
  onPreview: (b: Bridge | null) => void
  onSelect: (iso: string) => void
  onMonthChange: (month: number) => void
}

export function MonthView(p: Props) {
  const { view, month, today } = p

  // step months across year boundaries when the next year has data
  const step = (delta: number) => {
    const m = month + delta
    if (m >= 0 && m <= 11) return p.onMonthChange(m)
    const y = view.year + Math.sign(delta)
    if (y in YEARS) p.onSelect(iso(y, m < 0 ? 11 : 0))
  }
  const canStep = (delta: number) => {
    const m = month + delta
    return (m >= 0 && m <= 11) || view.year + Math.sign(delta) in YEARS
  }

  return (
    <section aria-labelledby="month-title">
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3 px-1">
        <h2 id="month-title" aria-live="polite" className="display text-[48px] leading-[0.9] sm:text-[88px]">
          {MONTH_NAMES[month]} <span className="text-merah-ink">{view.year}</span>
        </h2>
        <div className="flex gap-2 pb-1 sm:pb-2">
          <button type="button" aria-label="Bulan sebelumnya" disabled={!canStep(-1)} onClick={() => step(-1)} className={cn("grid size-12 place-items-center rounded-full border-2 border-ink transition-colors hover:bg-ink hover:text-paper active:scale-95 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-ink", ring)}>
            <ChevronLeft />
          </button>
          <button type="button" aria-label="Bulan berikutnya" disabled={!canStep(1)} onClick={() => step(1)} className={cn("grid size-12 place-items-center rounded-full border-2 border-ink transition-colors hover:bg-ink hover:text-paper active:scale-95 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-ink", ring)}>
            <ChevronRight />
          </button>
          {today && (
            <button type="button" onClick={() => p.onSelect(today)} className={cn("h-12 rounded-full border-2 border-ink px-5 text-[15px] font-bold transition-colors hover:bg-ink hover:text-paper active:scale-95", ring)}>
              Hari ini
            </button>
          )}
        </div>
      </div>
      <MonthStrip view={view} month={month} onMonthChange={p.onMonthChange} />
      <MonthGrid {...p} step={step} />
      <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-2 px-1 text-[14px] font-semibold text-muted">
        <li className="flex items-center gap-2"><i className="h-4 w-7 rounded-md bg-merah" />Libur, termasuk akhir pekan yang menyambung</li>
        <li className="flex items-center gap-2"><i className="stabilo h-4 w-7" />{p.idx.cutiIsLeave ? "Saran cuti & cuti bersama (memakai jatah cuti)" : "Saran cuti"}</li>
        <li className="flex items-center gap-2"><i className="grid size-5 place-items-center rounded-full bg-ink text-[11px] font-bold text-paper not-italic">1</i>Hari ini</li>
      </ul>
    </section>
  )
}

function MonthStrip({ view, month, onMonthChange }: { view: YearView; month: number; onMonthChange: (m: number) => void }) {
  const ref = useRef<HTMLDivElement>(null)
  // keep the current month in view on narrow screens, without moving the page
  useEffect(() => {
    const box = ref.current
    const active = box?.querySelector<HTMLElement>("[aria-current=page]")
    if (!box || !active) return
    box.scrollTo({ left: active.offsetLeft - (box.clientWidth - active.clientWidth) / 2, behavior: "smooth" })
  }, [month])

  return (
    <nav aria-label="Bulan" className="-mx-3 mt-5 sm:mx-0">
      <div ref={ref} className="flex snap-x gap-1 overflow-x-auto px-3 pb-1 [scrollbar-width:none] sm:px-0 lg:justify-between">
        {MONTH_ABBR.map((m, i) => {
          const n = view.holidays.filter((h) => Number(h.date.slice(5, 7)) - 1 === i).length
          return (
            <button
              key={m}
              type="button"
              onClick={() => onMonthChange(i)}
              aria-current={i === month ? "page" : undefined}
              aria-label={`${MONTH_NAMES[i]}, ${n} tanggal merah`}
              className={cn(
                "flex min-w-15 shrink-0 snap-center flex-col items-center gap-1 rounded-xl px-3 py-2 text-[15px] font-bold transition-colors",
                i === month ? "bg-ink text-paper" : "hover:bg-panel",
                ring
              )}
            >
              {m}
              <span aria-hidden className="flex h-1.5 gap-0.5">
                {Array.from({ length: n }, (_, k) => <i key={k} className="size-1.5 rounded-full bg-merah" />)}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}

function MonthGrid({ view, idx, today, selected, month, preview, onPreview, onSelect, step }: Props & { step: (d: number) => void }) {
  const days = monthWeeks(view.year, month)
  const swipe = new Map(preview?.run.map((d, i) => [d.iso, i]) ?? [])
  const gridRef = useRef<HTMLDivElement>(null)
  const keyNav = useRef(false)
  const touch = useRef<{ x: number; y: number } | null>(null)

  // slide in from the side we moved toward; no slide on first mount
  const pos = view.year * 12 + month
  const prev = useRef(pos)
  const [dir, setDir] = useState(0)
  useLayoutEffect(() => {
    if (prev.current !== pos) setDir(Math.sign(pos - prev.current))
    prev.current = pos
  }, [pos])

  // keyboard navigation keeps focus on the newly selected day
  useEffect(() => {
    if (!keyNav.current) return
    keyNav.current = false
    gridRef.current?.querySelector<HTMLElement>(`[data-iso="${selected}"]`)?.focus()
  }, [selected])

  const onKeyDown = (e: KeyboardEvent) => {
    const d = parseIso(selected)
    const moves: Record<string, () => string> = {
      ArrowLeft: () => addDays(d, -1).iso,
      ArrowRight: () => addDays(d, 1).iso,
      ArrowUp: () => addDays(d, -7).iso,
      ArrowDown: () => addDays(d, 7).iso,
      Home: () => addDays(d, -((d.dow + 6) % 7)).iso,
      End: () => addDays(d, 6 - ((d.dow + 6) % 7)).iso,
    }
    if (e.key === "PageUp" || e.key === "PageDown") {
      e.preventDefault()
      return step(e.key === "PageUp" ? -1 : 1)
    }
    const move = moves[e.key]
    if (!move) return
    e.preventDefault()
    keyNav.current = true
    onSelect(move())
  }

  // the focusable day: the selection when it is in this month, else the 1st
  const focusIso = selected.startsWith(iso(view.year, month).slice(0, 7)) ? selected : iso(view.year, month)

  return (
    <div
      ref={gridRef}
      role="grid"
      aria-label={`${MONTH_NAMES[month]} ${view.year}`}
      onKeyDown={onKeyDown}
      onMouseLeave={() => onPreview(null)}
      onTouchStart={(e) => (touch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY })}
      onTouchEnd={(e) => {
        const t = touch.current
        touch.current = null
        if (!t) return
        const dx = e.changedTouches[0].clientX - t.x
        const dy = e.changedTouches[0].clientY - t.y
        if (Math.abs(dx) > 60 && Math.abs(dy) < 40) step(dx < 0 ? 1 : -1)
      }}
      className="mt-3"
      style={{ viewTransitionName: SHEET }}
    >
      <div role="row" className="grid grid-cols-7 pb-2">
        {WEEK_HEAD.map((w, i) => (
          <span key={w} role="columnheader" className={cn("px-1 text-[14px] font-bold sm:px-3", i === 6 ? "text-merah-ink" : "text-muted")}>
            <abbr title={w} className="no-underline sm:hidden">{w.slice(0, 3)}</abbr>
            <span className="max-sm:hidden">{w}</span>
          </span>
        ))}
      </div>
      <div
        key={pos}
        className={cn("grid grid-cols-7 border-t-2 border-ink", dir !== 0 && "animate-slide")}
        style={{ "--dir": dir } as CSSProperties}
      >
        {days.map((d, i) => {
          const col = i % 7
          const prevIso = days[i - 1]?.iso ?? ""
          const next = days[i + 1]?.iso ?? ""
          const h = view.special.get(d.iso)
          const b = idx.byIso.get(d.iso)
          const joinL = col > 0 && !!b && idx.byIso.get(prevIso) === b
          const joinR = col < 6 && !!b && idx.byIso.get(next) === b
          const leave = idx.leave.get(d.iso)
          const leaveL = col > 0 && !!leave && idx.leave.get(prevIso) === leave
          const leaveR = col < 6 && !!leave && idx.leave.get(next) === leave
          const sw = swipe.get(d.iso)
          const swL = col > 0 && swipe.has(prevIso)
          const swR = col < 6 && swipe.has(next)
          const out = d.month !== month
          const isSel = d.iso === selected
          const isToday = d.iso === today
          // the stroke under the number: out-of-month leave is drawn soft, the swipe preview sits under red blocks
          const onSoft = !b && !!leave && out
          const onStabilo = !b && !onSoft && (!!leave || sw !== undefined)
          const status = h ? `, ${holidayLabel(h)}` : b ? ", libur akhir pekan" : leave ? ", saran cuti" : ""
          return (
            <button
              key={d.iso}
              data-iso={d.iso}
              type="button"
              role="gridcell"
              tabIndex={d.iso === focusIso ? 0 : -1}
              aria-selected={isSel}
              aria-current={isToday ? "date" : undefined}
              aria-label={`${DAY_NAMES[d.dow]}, ${fmtDm(d)}${status}`}
              onClick={() => onSelect(d.iso)}
              onMouseEnter={() => onPreview(leave ?? null)}
              onFocus={() => onPreview(leave ?? null)}
              className="group relative min-h-[60px] border-b border-line text-left outline-none sm:min-h-[112px]"
            >
              {sw !== undefined && (
                <span
                  aria-hidden
                  style={{ "--i": sw } as CSSProperties}
                  className={cn("absolute inset-y-1 z-0 animate-swipe bg-stabilo", swL ? "-left-px" : "left-0.5 rounded-l-[14px]", swR ? "-right-px" : "right-0.5 rounded-r-[14px]")}
                />
              )}
              {b && (
                <span
                  aria-hidden
                  style={{ "--i": col + Math.floor(i / 7) } as CSSProperties}
                  className={cn(
                    "absolute inset-y-2 z-10 animate-wipe sm:inset-y-2.5",
                    out ? "bg-merah-soft" : "bg-merah",
                    joinL ? "-left-px" : "left-1 rounded-l-xl sm:left-1.5",
                    joinR ? "-right-px" : "right-1 rounded-r-xl sm:right-1.5"
                  )}
                />
              )}
              {leave && !b && (
                <span
                  aria-hidden
                  className={cn(
                    "absolute inset-y-2 z-10 transition-transform group-hover:-rotate-1 sm:inset-y-2.5",
                    out ? "rounded-xl bg-stabilo-soft" : "stabilo",
                    leaveL ? "-left-px rounded-l-none" : "left-1 sm:left-1.5",
                    leaveR ? "-right-px rounded-r-none" : "right-1 sm:right-1.5"
                  )}
                />
              )}
              <span className="relative z-10 flex h-full flex-col items-center gap-1 px-1 py-3.5 sm:items-start sm:px-3.5 sm:py-4">
                <span
                  className={cn(
                    "grid h-8 min-w-8 place-items-center rounded-full px-1 text-[17px] leading-none sm:text-[24px]",
                    out ? "font-semibold" : "font-extrabold",
                    b ? (out ? "text-on-merah-soft" : "text-on-merah") : onSoft ? "text-on-stabilo-soft" : onStabilo ? "text-on-stabilo" : out ? "text-muted" : d.dow === 0 ? "text-merah-ink" : "",
                    isToday && (b && !out ? "bg-on-merah !text-merah" : onStabilo ? "bg-on-stabilo !text-stabilo" : "bg-ink !text-paper"),
                    isSel && "ring-3 ring-ink ring-offset-2 ring-offset-paper",
                    isSel && b && !out && "ring-on-merah ring-offset-merah",
                    "group-focus-visible:outline-3 group-focus-visible:outline-offset-4",
                    onStabilo ? "group-focus-visible:outline-on-stabilo" : "group-focus-visible:outline-ink"
                  )}
                >
                  {d.day}
                </span>
                {h && !out && (
                  <span className={cn("line-clamp-3 text-[14px] leading-tight font-bold max-sm:hidden", b ? "text-on-merah" : "text-on-stabilo")}>
                    {h.kind === "cuti" && (
                      <span className="mb-0.5 block text-[13px] font-semibold">{b ? "Cuti bersama" : "Cuti bersama · potong cuti"}</span>
                    )}
                    {h.name}
                  </span>
                )}
                {leave && !b && !h && !out && <span className="text-[14px] font-extrabold text-on-stabilo max-sm:hidden">Ambil cuti?</span>}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
