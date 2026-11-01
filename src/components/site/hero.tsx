import type { CSSProperties } from "react"

import { Button } from "@/components/m3e/button"
import { Icon } from "@/components/m3e/icon"
import { PlayfulShape as Shape } from "./playful-shape"
import { holidayLabel, type Holiday } from "@/data/years"
import {
  DAY_NAMES,
  KIND_LABEL,
  MONTH_NAMES,
  longWeekends,
  parseIso,
  type YearView,
} from "@/lib/calendar"
import { cn } from "@/lib/m3e/cn"
import { useToday } from "@/lib/today"

import { FloatingShapes } from "./confetti"
import { KIND_TONE } from "./kind"

const stagger = (i: number) => ({ "--i": i }) as CSSProperties

export function Hero({
  view,
  onOpenDate,
}: {
  view: YearView
  onOpenDate: (date: string) => void
}) {
  const today = useToday()
  const next = view.holidays.find((h) => !today || h.date >= today)
  const holiday = next ?? view.holidays[view.holidays.length - 1]
  const date = parseIso(holiday.date)
  const days =
    today && next
      ? Math.round((date.date.getTime() - parseIso(today).date.getTime()) / 86_400_000)
      : null

  const stats = [
    { value: view.nLibur, label: "libur nasional", tone: KIND_TONE.libur },
    { value: view.nCuti, label: "cuti bersama", tone: KIND_TONE.cuti },
    {
      value: longWeekends(view).length,
      label: "libur panjang",
      tone: "bg-surface-container-highest text-on-surface ring-1 ring-inset ring-outline-variant",
    },
  ]

  return (
    <section className="relative isolate mx-auto grid max-w-6xl items-center gap-12 px-4 pt-10 pb-16 md:px-8 lg:grid-cols-[1.1fr_1fr] lg:pt-20">
      <FloatingShapes seed={1} count={8} />
      <div className="flex flex-col gap-6">
        <p className="animate-rise text-label-large tracking-[0.2em] text-primary uppercase" style={stagger(0)}>
          Kalender Indonesia {view.year}
        </p>
        <h1 className="animate-rise text-display-medium text-balance md:text-display-large" style={stagger(1)}>
          Tanggal merah,{" "}
          <span className="text-display-medium-emphasized text-primary md:text-display-large-emphasized">
            <span className="sr-only">rencana cerah.</span>
            <span aria-hidden>
              {["rencana", "cerah."].map((word, w) => (
                <span key={word} className="whitespace-nowrap">
                  {w > 0 && " "}
                  {[...word].map((ch, i) => (
                    <span key={i} className="wave-letter" style={stagger(w * 8 + i)}>
                      {ch}
                    </span>
                  ))}
                </span>
              ))}
            </span>
          </span>
        </h1>
        <p className="animate-rise max-w-xl text-body-large text-on-surface-variant" style={stagger(2)}>
          Cari hari libur, temukan akhir pekan panjang, dan sisihkan waktu untuk hal yang kamu
          suka.
        </p>
        <div className="animate-rise flex flex-wrap gap-3" style={stagger(3)}>
          <Button size="md" className="fun-press" onClick={() => onOpenDate(holiday.date)}>
            Lihat kalender
            <Icon name="arrow_forward" />
          </Button>
          <Button size="md" variant="tonal" className="fun-press" nativeButton={false} render={<a href="#libur-panjang" />}>
            <Icon name="beach_access" />
            Cari libur panjang
          </Button>
        </div>
        <ul className="flex flex-wrap gap-2" aria-label={`Ringkasan tahun ${view.year}`}>
          {stats.map((s, i) => (
            <li
              key={s.label}
              style={stagger(4 + i)}
              className="fun-chip animate-rise flex items-center gap-2.5 rounded-full bg-surface-container-high py-1 pr-4 pl-1 text-body-medium ring-1 ring-outline-variant"
            >
              <span className={cn("numeral grid size-8 place-items-center rounded-full text-title-medium", s.tone)}>
                {s.value}
              </span>
              {s.label}
            </li>
          ))}
        </ul>
      </div>

      <TearOffSheet
        holiday={holiday}
        isNext={Boolean(next)}
        days={days}
        year={view.year}
        onOpen={() => onOpenDate(holiday.date)}
      />
    </section>
  )
}

/**
 * The signature element: a kalender sobek, the tear-off desk calendar every
 * Indonesian office has, showing the next red date. Two spent sheets sit
 * behind it; the top sheet drops in on load and lifts its corner on hover.
 */
function TearOffSheet({
  holiday,
  isNext,
  days,
  year,
  onOpen,
}: {
  holiday: Holiday
  isNext: boolean
  days: number | null
  year: number
  onOpen: () => void
}) {
  const date = parseIso(holiday.date)
  return (
    <div className="calendar-sway relative mx-auto w-full max-w-md pt-4 lg:max-w-none">
      <span
        aria-hidden
        className="animate-rise absolute inset-x-6 top-0 bottom-6 rotate-[4deg] rounded-3xl bg-surface-container-highest ring-1 ring-outline-variant"
        style={stagger(2)}
      />
      <span
        aria-hidden
        className="animate-rise absolute inset-x-3 top-2 bottom-3 -rotate-[2.5deg] rounded-3xl bg-surface-container-high ring-1 ring-outline-variant"
        style={stagger(3)}
      />
      <button
        type="button"
        onClick={onOpen}
        aria-label={`Buka ${holidayLabel(holiday)}, ${date.day} ${MONTH_NAMES[date.month]}`}
        className="group animate-sheet-drop relative flex w-full origin-top-left flex-col overflow-hidden rounded-3xl bg-surface-container-lowest text-left shadow-elevation-2 ring-1 ring-outline-variant transition-[rotate,translate,box-shadow] motion-spatial-default focus-ring hover:-translate-y-1 hover:-rotate-[1.5deg] hover:shadow-elevation-4 dark:bg-surface-container-high"
      >
        {/* binding strip with the two ring holes, and the perforation under it */}
        <span className="flex h-14 items-center justify-between bg-primary px-5 text-on-primary">
          <span className="text-label-large tracking-[0.18em] uppercase">
            {isNext ? "Libur berikutnya" : "Libur terakhir"}
          </span>
          <span aria-hidden className="flex gap-10">
            <i className="size-3.5 rounded-full bg-surface-container-lowest dark:bg-surface-container-high" />
            <i className="size-3.5 rounded-full bg-surface-container-lowest dark:bg-surface-container-high" />
          </span>
        </span>
        <span aria-hidden className="mx-4 border-b-2 border-dashed border-outline-variant" />

        <span className="relative flex items-end justify-between gap-4 px-6 pt-4">
          <span className="flex flex-col">
            <span className="text-title-medium tracking-[0.25em] text-primary uppercase">
              {MONTH_NAMES[date.month]}
            </span>
            <span
              key={holiday.date}
              className="numeral animate-pop text-[8.5rem] leading-[0.95] font-bold text-primary sm:text-[10rem]"
            >
              {date.day}
            </span>
          </span>
          <Shape
            name="12-sided-cookie"
            className="animate-spin-in mb-6 grid size-20 shrink-0 place-items-center bg-tertiary-container text-on-tertiary-container sm:size-24"
          >
            <Icon name="celebration" size={36} className="transition-[rotate] motion-spatial-slow group-hover:-rotate-12" />
          </Shape>
        </span>

        <span className="flex flex-col gap-3 px-6 pt-1 pb-6">
          <span className="text-title-medium text-on-surface-variant">
            {DAY_NAMES[date.dow]}, {date.day} {MONTH_NAMES[date.month]} {year}
          </span>
          <span className="text-headline-small text-on-surface">{holidayLabel(holiday)}</span>
          <span className="flex flex-wrap items-center gap-2">
            <span className={cn("rounded-full px-3 py-1 text-label-large", KIND_TONE[holiday.kind])}>
              {KIND_LABEL[holiday.kind]}
            </span>
            {days !== null && (
              <span className="rounded-full bg-surface-container-highest px-3 py-1 text-label-large text-on-surface">
                {days === 0 ? "Hari ini!" : `${days} hari lagi`}
              </span>
            )}
          </span>
        </span>
      </button>
    </div>
  )
}
