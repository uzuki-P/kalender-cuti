import { holidayLabel, type Holiday } from "@/data/years"
import { DAY_ABBR, MONTH_NAMES, type Day } from "@/lib/calendar"
import { cn } from "@/lib/m3e/cn"
import { DATE_TONE, KIND_TONE } from "./kind"

/** A date-circle timeline for a long weekend, including suggested leave days. */
export function DayStrip({
  run,
  special,
  leave = [],
  label = "Rangkaian hari libur",
  onOpenDate,
}: {
  run: Day[]
  special: Map<string, Holiday>
  leave?: Day[]
  label?: string
  onOpenDate: (date: string) => void
}) {
  const leaveDays = new Set(leave.map((d) => d.iso))
  return (
    <ol className="flex flex-col px-3 py-2" aria-label={label}>
      {run.map((d, index) => {
        const h = special.get(d.iso)
        const isLeave = leaveDays.has(d.iso)
        const name = isLeave ? "Ambil cuti" : h ? holidayLabel(h) : "Akhir pekan"
        const tone = isLeave ? DATE_TONE.leave : h ? KIND_TONE[h.kind] : DATE_TONE.weekend
        return (
          <li key={d.iso} className="relative">
            <span
              aria-hidden
              className={cn(
                "pointer-events-none absolute inset-y-0 left-16 w-0.5 -translate-x-1/2 bg-outline/60",
                index === 0 && "top-1/2",
                index === run.length - 1 && "bottom-1/2"
              )}
            />
            <button
              type="button"
              onClick={() => onOpenDate(d.iso)}
              aria-label={`${DAY_ABBR[d.dow]} ${d.day} ${MONTH_NAMES[d.month]}, ${name}`}
              className="grid min-h-12 w-full grid-cols-[1.75rem_2rem_minmax(0,1fr)] items-center gap-3 rounded-md px-2 py-2 text-left state-layer focus-ring"
            >
              <span className="text-label-medium text-on-surface-variant">{DAY_ABBR[d.dow]}</span>
              <span className={cn("numeral relative z-10 grid size-8 place-items-center rounded-full text-title-medium font-semibold", tone)}>{d.day}</span>
              <span className="text-body-medium text-on-surface">{name}</span>
            </button>
          </li>
        )
      })}
    </ol>
  )
}
