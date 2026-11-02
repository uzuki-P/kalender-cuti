import { YEARS, type Holiday } from "@/data/years"

export const MONTH_NAMES = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
]
/** indexed by Date#getUTCDay(), so Minggu is 0; the calendars start the week on Senin */
export const DAY_NAMES = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"]
export const DAY_ABBR = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"]

export type Day = {
  iso: string
  date: Date
  day: number
  month: number
  /** 0 = Sunday */
  dow: number
}

const DAY_MS = 86_400_000

/** All dates are UTC midnights so the visitor's time zone never shifts them. */
export function dayOf(date: Date): Day {
  return {
    iso: date.toISOString().slice(0, 10),
    date,
    day: date.getUTCDate(),
    month: date.getUTCMonth(),
    dow: date.getUTCDay(),
  }
}

export const parseIso = (iso: string) => dayOf(new Date(`${iso}T00:00:00Z`))
const addDays = (d: Day, n: number) => dayOf(new Date(d.date.getTime() + n * DAY_MS))

export const isLeap = (y: number) => (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0
export const daysInYear = (y: number) => (isLeap(y) ? 366 : 365)

/** 42 days (6 full weeks) starting on the Sunday on or before the 1st */
export function monthMatrix(year: number, month: number): Day[] {
  const first = dayOf(new Date(Date.UTC(year, month, 1)))
  const start = addDays(first, -first.dow)
  return Array.from({ length: 42 }, (_, i) => addDays(start, i))
}

export const fmtDm = (d: Day) => `${d.day} ${MONTH_NAMES[d.month]}`

export function joinNames(names: string[]) {
  if (names.length <= 1) return names[0] ?? ""
  return `${names.slice(0, -1).join(", ")} dan ${names[names.length - 1]}`
}

export type YearView = {
  year: number
  holidays: Holiday[]
  special: Map<string, Holiday>
  nLibur: number
  nCuti: number
}

export function yearView(year: number): YearView {
  const holidays = [...YEARS[year].holidays].sort((a, b) =>
    a.date.localeCompare(b.date)
  )
  return {
    year,
    holidays,
    special: new Map(holidays.map((h) => [h.date, h])),
    nLibur: holidays.filter((h) => h.kind === "libur").length,
    nCuti: holidays.filter((h) => h.kind === "cuti").length,
  }
}

/**
 * Runs of consecutive non-working days (weekend, libur or cuti) that span at
 * least 3 days or contain two holiday/cuti days. This reproduces the 10
 * periods listed on the archived 2026 page exactly.
 */
export function longWeekends({ year, special }: YearView): Day[][] {
  const runs: Day[][] = []
  let cur: Day[] = []
  for (let d = parseIso(`${year}-01-01`); d.date.getUTCFullYear() === year; d = addDays(d, 1)) {
    if (special.has(d.iso) || d.dow === 0 || d.dow === 6) {
      cur.push(d)
    } else if (cur.length) {
      runs.push(cur)
      cur = []
    }
  }
  if (cur.length) runs.push(cur)
  return runs.filter(
    (run) => run.length >= 3 || run.filter((d) => special.has(d.iso)).length >= 2
  )
}

export function periodTitle(run: Day[], year: number) {
  const a = run[0]
  const b = run[run.length - 1]
  return a.month === b.month
    ? `${a.day} - ${b.day} ${MONTH_NAMES[a.month]} ${year}`
    : `${fmtDm(a)} - ${fmtDm(b)} ${year}`
}

/** distinct holiday names in a run, in date order; a cuti shares its holiday's name */
export const runNames = (run: Day[], special: Map<string, Holiday>) => [
  ...new Set(
    run.flatMap((d) => {
      const h = special.get(d.iso)
      return h ? [h.name] : []
    })
  ),
]

export type Bridge = {
  /** the workdays to take as leave */
  leave: Day[]
  /** the whole break once they are taken */
  run: Day[]
}

/**
 * Hari kejepit: one or two workdays squeezed between two breaks, where at
 * least one break holds a holiday. Taking them as leave joins the breaks.
 */
export function bridges({ year, special }: YearView): Bridge[] {
  const segments: { off: boolean; days: Day[] }[] = []
  for (let d = parseIso(`${year}-01-01`); d.date.getUTCFullYear() === year; d = addDays(d, 1)) {
    const off = special.has(d.iso) || d.dow === 0 || d.dow === 6
    const last = segments[segments.length - 1]
    if (last?.off === off) last.days.push(d)
    else segments.push({ off, days: [d] })
  }
  const out: Bridge[] = []
  for (let i = 1; i < segments.length - 1; i++) {
    const [before, gap, after] = segments.slice(i - 1, i + 2)
    if (gap.off || gap.days.length > 2) continue
    if (![...before.days, ...after.days].some((d) => special.has(d.iso))) continue
    out.push({ leave: gap.days, run: [...before.days, ...gap.days, ...after.days] })
  }
  return out
}

/** ISO date → local midnight, for react-day-picker (it works in local time) */
export const toLocalDate = (iso: string) =>
  new Date(Number(iso.slice(0, 4)), Number(iso.slice(5, 7)) - 1, Number(iso.slice(8, 10)))

/** local Date → ISO date */
export const toIso = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`

export const KIND_LABEL = { libur: "Libur nasional", cuti: "Cuti bersama" } as const

/** "Jumat, 15 Mei", "Senin, 4 Mei & Selasa, 5 Mei" or "5 hari kerja, Senin, 4 Mei – Jumat, 8 Mei" */
export const leaveDates = (b: Bridge) => {
  const fmt = (d: Day) => `${DAY_NAMES[d.dow]}, ${fmtDm(d)}`
  return b.leave.length > 2
    ? `${b.leave.length} hari kerja, ${fmt(b.leave[0])} – ${fmt(b.leave[b.leave.length - 1])}`
    : b.leave.map(fmt).join(" & ")
}
