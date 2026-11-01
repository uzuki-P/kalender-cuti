import type { HolidayKind } from "@/data/years"
import { KIND_LABEL } from "@/lib/calendar"
import { cn } from "@/lib/m3e/cn"

/**
 * The one colour code for dates, used by every calendar, strip, list and the
 * legend. Red (primary) is a day off: filled for libur nasional, pale with a
 * red edge for cuti bersama, a red number for the weekend. Blue marks the
 * selected date. Gold is pale and dashed for suggested leave.
 * Today is a red ring just outside the day. Nothing that is not a date uses gold
 * fills, so the two never get mixed up. A date already over turns grey but
 * keeps its form (PAST_TONE). The calendar's day modifiers repeat
 * these classes with `[&>button]:` prefixes (see planner.tsx).
 */
export const DATE_TONE = {
  libur: "bg-primary text-on-primary",
  cuti: "bg-primary-container text-on-primary-container ring-1 ring-inset ring-primary/45",
  weekend: "bg-surface-container-lowest text-primary ring-1 ring-inset ring-outline-variant dark:bg-surface-container-highest",
  leave: "bg-tertiary-container text-on-tertiary-container outline-2 outline-offset-2 outline-tertiary outline-dashed",
  selected: "bg-selection text-on-selection ring-0",
  today: "text-primary outline-2 outline-solid outline-offset-2 outline-primary",
  // past dates keep their kind's form in grey: solid for libur, pale with an
  // edge for cuti, so the two still read apart once the colour is gone
  pastLibur: "bg-outline text-surface ring-0",
  pastCuti: "bg-surface-container-highest text-on-surface-variant ring-1 ring-inset ring-outline",
} as const

export const PAST_TONE: Record<HolidayKind, string> = {
  libur: DATE_TONE.pastLibur,
  cuti: DATE_TONE.pastCuti,
}

export const KIND_TONE: Record<HolidayKind, string> = {
  libur: DATE_TONE.libur,
  cuti: DATE_TONE.cuti,
}

const LEGEND: { tone: keyof typeof DATE_TONE; label: string }[] = [
  { tone: "libur", label: "Libur nasional" },
  { tone: "cuti", label: "Cuti bersama" },
  { tone: "weekend", label: "Akhir pekan" },
  { tone: "leave", label: "Ambil cuti" },
  { tone: "selected", label: "Dipilih" },
  { tone: "today", label: "Hari ini" },
  { tone: "pastLibur", label: "Libur, sudah lewat" },
  { tone: "pastCuti", label: "Cuti, sudah lewat" },
]

/** the colour key: a sample date tile in each tone, with its meaning */
export function DateLegend({ className }: { className?: string }) {
  return (
    <ul className={cn("grid grid-cols-2 gap-x-4 gap-y-2.5", className)}>
      {LEGEND.map(({ tone, label }) => (
        <li key={tone} className="flex items-center gap-2.5 text-body-medium text-on-surface">
          <span
            aria-hidden
            className={cn("numeral grid h-7 w-8 shrink-0 place-items-center rounded-md text-label-large font-semibold", DATE_TONE[tone])}
          >
            17
          </span>
          {label}
        </li>
      ))}
    </ul>
  )
}

export function KindPill({ kind, className }: { kind: HolidayKind; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex h-7 shrink-0 items-center rounded-full px-3 text-label-large",
        KIND_TONE[kind],
        className
      )}
    >
      {KIND_LABEL[kind]}
    </span>
  )
}

/** a filled day number in the kind's tone, used in lists */
export function DayDot({
  day,
  kind,
  className,
}: {
  day: number
  kind?: HolidayKind
  className?: string
}) {
  return (
    <span
      className={cn(
        "numeral grid size-11 shrink-0 place-items-center rounded-full text-title-large transition-[scale] motion-spatial-fast group-hover/item:scale-110",
        kind ? KIND_TONE[kind] : "bg-surface-container-highest text-on-surface",
        className
      )}
    >
      {day}
    </span>
  )
}
