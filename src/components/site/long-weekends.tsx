import { useState, type CSSProperties, type ReactNode } from "react"

import { Button } from "@/components/m3e/button"
import { Card } from "@/components/m3e/card"
import { Icon } from "@/components/m3e/icon"
import { ToggleGroup, ToggleGroupItem } from "@/components/m3e/toggle-group"
import { bridges, longWeekends, periodTitle, type Day, type YearView } from "@/lib/calendar"
import { cn } from "@/lib/m3e/cn"
import { splitByToday, useToday } from "@/lib/today"
import { useReveal } from "@/lib/use-reveal"

import { FloatingShapes } from "./confetti"
import { DayStrip } from "./day-strip"
import { DATE_TONE } from "./kind"

/** a break in the year: free when `leave` is empty, otherwise it needs those days as cuti */
type Break = { run: Day[]; leave: Day[] }
type Filter = "all" | "free" | "leave"

const FILTERS: { value: Filter; label: string; icon: string }[] = [
  { value: "all", label: "Semua", icon: "beach_access" },
  { value: "free", label: "Tanpa cuti", icon: "weekend" },
  { value: "leave", label: "Pakai cuti", icon: "event_available" },
]

/**
 * One list for every long break: weekends joined by a red date, and hari
 * kejepit (one or two workdays between breaks) you could take as cuti.
 * The longest free break and the best days-per-cuti trade get the accent.
 */
export function LongWeekends({
  view,
  onOpenDate,
}: {
  view: YearView
  onOpenDate: (date: string) => void
}) {
  const free: Break[] = longWeekends(view).map((run) => ({ run, leave: [] }))
  const withLeave: Break[] = bridges(view)
  const [filter, setFilter] = useState<Filter>("all")
  const today = useToday()
  const [showPast, setShowPast] = useState(false)
  const reveal = useReveal<HTMLElement>()

  const shown = (filter === "free" ? free : filter === "leave" ? withLeave : [...free, ...withLeave]).sort(
    (a, b) => a.run[0].iso.localeCompare(b.run[0].iso) || a.leave.length - b.leave.length
  )
  const { upcoming, past } = splitByToday(shown, (b) => b.run[b.run.length - 1].iso, today)
  const longestFree = Math.max(0, ...free.map((b) => b.run.length))
  const bestTrade = Math.max(
    0,
    ...splitByToday(withLeave, (b) => b.leave[0].iso, today).upcoming.map((b) => b.run.length / b.leave.length)
  )
  const accent = (b: Break) =>
    b.leave.length
      ? b.run.length / b.leave.length === bestTrade && "Paling hemat cuti"
      : b.run.length === longestFree && "Libur terpanjang"

  return (
    <section {...reveal} id="libur-panjang" className="relative isolate mx-auto flex max-w-6xl scroll-mt-24 flex-col gap-6 px-4 py-12 md:px-8">
      <FloatingShapes seed={3} count={6} />
      <div className="flex flex-col gap-2">
        <p className="text-label-large tracking-[0.2em] text-primary uppercase">Waktu buat dirimu</p>
        <h2 className="text-headline-large">Libur panjang {view.year}</h2>
        <p className="max-w-2xl text-body-large text-on-surface-variant">
          Akhir pekan yang tersambung tanggal merah, plus hari kejepit: hari kerja yang terjepit di
          antara libur. Ambil cuti tahunan di hari itu dan liburmu langsung menyambung.
        </p>
      </div>

      <ToggleGroup
        spacing={1}
        size="sm"
        variant="filled"
        value={[filter]}
        onValueChange={(v) => v[0] && setFilter(v[0] as Filter)}
        aria-label="Jenis libur panjang"
        className="flex-wrap"
      >
        {FILTERS.map((f) => (
          <ToggleGroupItem
            key={f.value}
            value={f.value}
            className="px-4 ring-1 ring-outline-variant ring-inset data-pressed:ring-0"
          >
            <Icon name={f.icon} size={20} />
            {f.label}
            <span className="numeral">
              {f.value === "free" ? free.length : f.value === "leave" ? withLeave.length : free.length + withLeave.length}
            </span>
          </ToggleGroupItem>
        ))}
      </ToggleGroup>

      {upcoming.length ? (
        <div className="grid items-start gap-4 md:grid-cols-2 lg:grid-cols-3">
          {upcoming.map((b, i) => (
            <BreakCard
              key={`${b.run[0].iso}-${b.leave.length}`}
              item={b}
              index={i}
              accent={accent(b) || undefined}
              view={view}
              onOpenDate={onOpenDate}
            />
          ))}
        </div>
      ) : (
        <p className="rounded-3xl bg-surface-container px-5 py-6 text-body-large text-on-surface-variant ring-1 ring-outline-variant">
          Tidak ada lagi yang tersisa di {view.year}. Ganti tahun di atas untuk merencanakan tahun berikutnya.
        </p>
      )}

      {past.length > 0 && (
        <PastToggle count={past.length} open={showPast} onToggle={() => setShowPast((v) => !v)}>
          {past.map((b, i) => (
            <BreakCard key={`${b.run[0].iso}-${b.leave.length}`} item={b} index={i} past view={view} onOpenDate={onOpenDate} />
          ))}
        </PastToggle>
      )}

      <p className="flex gap-2 text-body-medium text-on-surface-variant">
        <Icon name="info" size={20} className="shrink-0" />
        Hari kejepit dihitung dengan lima hari kerja, Senin sampai Jumat, dan cuti bersama dianggap libur.
      </p>
    </section>
  )
}

/** a text button that reveals the breaks that are already over */
function PastToggle({
  count,
  open,
  onToggle,
  children,
}: {
  count: number
  open: boolean
  onToggle: () => void
  children: ReactNode
}) {
  return (
    <div className="flex flex-col gap-4">
      <Button variant="text" size="sm" className="self-start" aria-expanded={open} onClick={onToggle}>
        <Icon name={open ? "keyboard_arrow_up" : "keyboard_arrow_down"} size={20} />
        {open ? "Sembunyikan yang sudah lewat" : `Lihat ${count} yang sudah lewat`}
      </Button>
      {open && <div className="grid items-start gap-4 md:grid-cols-2 lg:grid-cols-3">{children}</div>}
    </div>
  )
}

function BreakCard({
  item: { run, leave },
  index,
  accent,
  past = false,
  view,
  onOpenDate,
}: {
  item: Break
  index: number
  accent?: string
  past?: boolean
  view: YearView
  onOpenDate: (date: string) => void
}) {
  const reveal = useReveal<HTMLDivElement>()
  const needsLeave = leave.length > 0
  return (
    <Card
      {...reveal}
      variant="filled"
      size="sm"
      style={{ "--i": index % 3 } as CSSProperties}
      className={cn(
        "gap-0 rounded-xl p-0 ring-1 ring-outline-variant",
        // the highlight is a red edge, not a fill: fills are date colours
        accent
          ? "bg-surface-container-lowest ring-2 ring-primary"
          : past
            ? "bg-surface-container-low"
            : "bg-surface-container-lowest"
      )}
    >
      <div className="flex items-start justify-between gap-3 border-b border-outline-variant px-4 py-3">
        <h3 className="text-title-medium font-semibold">{periodTitle(run, view.year)}</h3>
        <span className="numeral shrink-0 rounded-full bg-inverse-surface px-3 py-1 text-label-large text-inverse-on-surface">{run.length} hari</span>
      </div>
      <div className="flex flex-wrap items-center gap-2 px-4 pt-3">
        <span className={cn("rounded-full px-2.5 py-1 text-label-medium", needsLeave ? DATE_TONE.leave : "bg-surface-container-highest text-on-surface-variant")}>
          {needsLeave ? `${leave.length} hari cuti` : "Tanpa cuti"}
        </span>
        {(accent || past) && (
          <span className={cn("rounded-full px-2.5 py-1 text-label-medium", accent ? "bg-primary text-on-primary" : "bg-surface-container-highest text-on-surface-variant")}>
            {accent ?? "Sudah lewat"}
          </span>
        )}
      </div>
      <DayStrip run={run} special={view.special} leave={leave} onOpenDate={onOpenDate} />

    </Card>
  )
}
