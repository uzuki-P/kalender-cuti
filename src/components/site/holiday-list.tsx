import { useState, type CSSProperties } from "react"

import { Button } from "@/components/m3e/button"
import { FilterChip } from "@/components/m3e/chip"
import { Icon } from "@/components/m3e/icon"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@/components/m3e/item"
import { SearchView } from "@/components/m3e/search"
import { FloatingShapes } from "./confetti"
import { PlayfulShape as Shape } from "./playful-shape"
import type { HolidayKind } from "@/data/years"
import { DAY_NAMES, KIND_LABEL, MONTH_NAMES, parseIso, type YearView } from "@/lib/calendar"
import { cn } from "@/lib/m3e/cn"
import { useToday } from "@/lib/today"
import { useReveal } from "@/lib/use-reveal"

import { DayDot, KindPill, PAST_TONE } from "./kind"

type Filter = "all" | HolidayKind

export function HolidayList({
  view,
  onOpenDate,
}: {
  view: YearView
  onOpenDate: (date: string) => void
}) {
  const [filter, setFilter] = useState<Filter>("all")
  const [query, setQuery] = useState("")
  const reveal = useReveal<HTMLElement>()
  const today = useToday()
  const q = query.trim().toLocaleLowerCase("id")
  const holidays = view.holidays.filter(
    (h) =>
      (filter === "all" || h.kind === filter) &&
      `${h.name} ${MONTH_NAMES[Number(h.date.slice(5, 7)) - 1]}`.toLocaleLowerCase("id").includes(q)
  )
  const filters: { kind: Filter; label: string; count: number }[] = [
    { kind: "all", label: "Semua", count: view.holidays.length },
    { kind: "libur", label: "Libur nasional", count: view.nLibur },
    { kind: "cuti", label: "Cuti bersama", count: view.nCuti },
  ]

  return (
    <section {...reveal} id="hari-libur" className="relative isolate mx-auto flex max-w-6xl scroll-mt-24 flex-col gap-6 px-4 py-12 md:px-8">
      <FloatingShapes seed={4} count={5} />
      <div className="flex flex-col gap-2">
        <p className="text-label-large tracking-[0.2em] text-primary uppercase">Tak ada yang terlewat</p>
        <h2 className="text-headline-large">Semua tanggal merah {view.year}</h2>
      </div>

      <div className="grid items-center gap-4 md:grid-cols-[auto_minmax(0,1fr)]">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Jenis hari libur">
          {filters.map(({ kind, label, count }) => (
            <FilterChip
              key={kind}
              size="md"
              pressed={filter === kind}
              onPressedChange={() => setFilter(kind)}
            >
              {label}
              <span className="numeral text-on-surface-variant group-data-pressed:text-on-secondary-container">
                {count}
              </span>
            </FilterChip>
          ))}
        </div>
        {/* the bar filters the list below in place, so it never opens a results view */}
        <SearchView
          outlined
          open={false}
          value={query}
          onValueChange={setQuery}
          placeholder="Cari nama atau bulan"
          aria-label="Cari hari libur"
          className="md:max-w-md md:justify-self-end"
        />
      </div>

      <p className="text-body-medium text-on-surface-variant" aria-live="polite">
        {holidays.length} tanggal{query && ` untuk “${query}”`}
      </p>

      {holidays.length ? (
        <ItemGroup className="gap-0.5 rounded-[calc(var(--radius-lg)+0.5rem)] bg-surface-container p-2 ring-1 ring-outline-variant">
          {holidays.map((h, i) => {
            const d = parseIso(h.date)
            const past = today !== null && h.date < today && view.year === Number(today.slice(0, 4))
            return (
              <Item
                key={h.date}
                variant="segmented"
                style={{ "--i": Math.min(i, 10) } as CSSProperties}
                className={cn(
                  "animate-rise text-left",
                  past
                    ? "bg-surface-container-high text-on-surface-variant"
                    : "bg-surface-container-lowest dark:bg-surface-container-highest"
                )}
                aria-label={`Lihat ${h.name}, ${KIND_LABEL[h.kind]}, ${d.day} ${MONTH_NAMES[d.month]}${past ? ", sudah lewat" : ""}`}
                render={<button type="button" onClick={() => onOpenDate(h.date)} />}
              >
                <ItemMedia>
                  <DayDot day={d.day} kind={h.kind} className={cn(past && PAST_TONE[h.kind])} />
                </ItemMedia>
                <ItemContent>
                  <ItemTitle className={cn("line-clamp-2 text-title-medium", past && "text-on-surface-variant")}>
                    {h.name}
                  </ItemTitle>
                  <ItemDescription className="text-body-medium">
                    {DAY_NAMES[d.dow]}, {d.day} {MONTH_NAMES[d.month]} {view.year}
                    <span className="sm:hidden"> · {KIND_LABEL[h.kind]}</span>
                    {past && " · sudah lewat"}
                  </ItemDescription>
                </ItemContent>
                <ItemActions className="max-sm:hidden">
                  <KindPill kind={h.kind} className={cn(past && PAST_TONE[h.kind])} />
                  <Icon
                    name="north_east"
                    className="fun-wiggle-child text-on-surface-variant transition-[translate] motion-spatial-fast group-hover/item:translate-x-0.5 group-hover/item:-translate-y-0.5"
                  />
                </ItemActions>
              </Item>
            )
          })}
        </ItemGroup>
      ) : (
        <div className="flex flex-col items-center gap-4 rounded-4xl bg-surface-container px-6 py-12 text-center ring-1 ring-outline-variant">
          <Shape name="puffy" className="animate-spin-in grid size-20 place-items-center bg-tertiary-container text-on-tertiary-container">
            <Icon name="search_off" size={36} />
          </Shape>
          <h3 className="text-title-large">Tanggalnya belum ketemu</h3>
          <p className="text-body-medium text-on-surface-variant">Coba nama hari libur atau bulan lain.</p>
          <Button
            variant="tonal"
            size="sm"
            onClick={() => {
              setQuery("")
              setFilter("all")
            }}
          >
            Tampilkan semua
          </Button>
        </div>
      )}

      <p className="flex gap-2 text-body-medium text-on-surface-variant">
        <Icon name="info" size={20} className="shrink-0" />
        Tanggal hari raya keagamaan dapat mengikuti keputusan pemerintah. Cek kembali sebelum
        membuat rencana perjalanan.
      </p>
    </section>
  )
}
