import type { Holiday } from "@/data/years"
import { bridges, parseIso, type Bridge, type Day, type YearView } from "@/lib/calendar"

const DAY_MS = 86_400_000

export const addDays = (d: Day, n: number) =>
  parseIso(new Date(d.date.getTime() + n * DAY_MS).toISOString().slice(0, 10))

export const daysBetween = (a: string, b: string) =>
  Math.round((parseIso(b).date.getTime() - parseIso(a).date.getTime()) / DAY_MS)

export const isWeekend = (d: Day) => d.dow === 0 || d.dow === 6

/** column headers, Monday first; Sunday stays JS weekday 0 */
export const WEEK_HEAD = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"]

/** 42 days, Monday first, covering the month */
export function monthGrid(year: number, month: number): Day[] {
  const first = parseIso(`${year}-${String(month + 1).padStart(2, "0")}-01`)
  const start = addDays(first, -((first.dow + 6) % 7))
  return Array.from({ length: 42 }, (_, i) => addDays(start, i))
}

/** the rows a month needs: 4 to 6 weeks */
export function monthWeeks(year: number, month: number): Day[] {
  const grid = monthGrid(year, month)
  const rows = Math.ceil((grid.findLastIndex((d) => d.month === month) + 1) / 7)
  return grid.slice(0, rows * 7)
}

/* Javanese five-day market week; 17 Agustus 1945 was Jumat Legi. */
const PASARAN = ["Legi", "Pahing", "Pon", "Wage", "Kliwon"]
const LEGI = Date.UTC(1945, 7, 17)
export const pasaran = (d: Day) =>
  PASARAN[((Math.round((d.date.getTime() - LEGI) / DAY_MS) % 5) + 5) % 5]

/** A break: a maximal run of days off that holds at least one red date. */
export type Break = {
  days: Day[]
  holidays: Holiday[]
  start: string
  end: string
  /** the leave suggestion that grows this break the most per leave day */
  bridge?: Bridge
}

/**
 * Splits the year into breaks and leave suggestions.
 *
 * `cutiIsLeave` is for workplaces that deduct cuti bersama from annual
 * leave: those days stop being free days off and become leave the visitor
 * takes, offered like any other suggestion together with the break they make.
 */
export function planYear(view: YearView, cutiIsLeave = false): { breaks: Break[]; idx: BreakIndex } {
  const special = cutiIsLeave
    ? new Map([...view.special].filter(([, h]) => h.kind === "libur"))
    : view.special
  const free: YearView = { ...view, special }
  const isCuti = (iso: string) => cutiIsLeave && view.special.get(iso)?.kind === "cuti"
  const off = (d: Day) => special.has(d.iso) || isWeekend(d)

  // breaks: maximal runs of free days off holding at least one red date
  const breaks: Break[] = []
  let run: Day[] = []
  const flush = () => {
    const holidays = run.flatMap((d) => special.get(d.iso) ?? [])
    if (holidays.length)
      breaks.push({ days: run, holidays, start: run[0].iso, end: run[run.length - 1].iso })
    run = []
  }
  for (let d = parseIso(`${view.year}-01-01`); d.date.getUTCFullYear() === view.year; d = addDays(d, 1)) {
    if (off(d)) run.push(d)
    else if (run.length) flush()
  }
  if (run.length) flush()

  // cuti bersama taken as leave: each cluster of cuti and free days off
  // around it is the break those leave days buy
  const cutiBridges: Bridge[] = []
  let cluster: Day[] = []
  const close = () => {
    const leave = cluster.filter((d) => isCuti(d.iso))
    if (leave.length) cutiBridges.push({ leave, run: cluster })
    cluster = []
  }
  if (cutiIsLeave) {
    for (let d = parseIso(`${view.year}-01-01`); d.date.getUTCFullYear() === view.year; d = addDays(d, 1)) {
      if (off(d) || isCuti(d.iso)) cluster.push(d)
      else if (cluster.length) close()
    }
    if (cluster.length) close()
  }

  // other workdays squeezed between breaks; cuti bersama is already covered
  const gain = (b: Bridge) => b.run.length / b.leave.length
  const squeezed = bridges(free).filter((b) => !b.leave.some((d) => isCuti(d.iso)))
  const touches = (br: Bridge, b: Break) => br.run.some((d) => d.iso === b.start || d.iso === b.end)
  for (const b of breaks) {
    b.bridge =
      cutiBridges.find((br) => touches(br, b)) ??
      squeezed.filter((br) => touches(br, b)).sort((x, y) => gain(y) - gain(x))[0]
  }

  const idx = breakIndex(breaks, cutiBridges)
  idx.cutiIsLeave = cutiIsLeave
  return { breaks, idx }
}

export const breakNames = (b: Break) => [...new Set(b.holidays.map((h) => h.name))]

export type BreakIndex = {
  /** day → the break it belongs to */
  byIso: Map<string, Break>
  /** suggested leave day → its bridge */
  leave: Map<string, Bridge>
  /** cuti bersama is taken from annual leave rather than given free */
  cutiIsLeave: boolean
}

export function breakIndex(breaks: Break[], extra: Bridge[] = []): BreakIndex {
  const byIso = new Map<string, Break>()
  const leave = new Map<string, Bridge>()
  for (const b of breaks) {
    for (const d of b.days) byIso.set(d.iso, b)
    for (const d of b.bridge?.leave ?? []) leave.set(d.iso, b.bridge!)
  }
  for (const br of extra) for (const d of br.leave) leave.set(d.iso, br)
  return { byIso, leave, cutiIsLeave: false }
}
