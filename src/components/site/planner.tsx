import { useCallback, useState, type ButtonHTMLAttributes, type ComponentProps, type CSSProperties } from "react"
import { id as idLocale } from "react-day-picker/locale"

import { Button } from "@/components/m3e/button"
import { Calendar, CalendarDayButton } from "@/components/m3e/calendar"
import { Card } from "@/components/m3e/card"
import { Icon } from "@/components/m3e/icon"
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@/components/m3e/item"
import { Burst, FloatingShapes } from "./confetti"
import { PlayfulShape as Shape } from "./playful-shape"
import { ToggleGroup, ToggleGroupItem } from "@/components/m3e/toggle-group"
import { TooltipProvider } from "@/components/m3e/tooltip"
import { holidayLabel, type Holiday } from "@/data/years"
import {
  DAY_ABBR,
  DAY_NAMES,
  KIND_LABEL,
  MONTH_NAMES,
  bridges,
  parseIso,
  toIso,
  toLocalDate,
  type YearView,
} from "@/lib/calendar"
import { cn } from "@/lib/m3e/cn"
import { useReveal } from "@/lib/use-reveal"

import { DATE_TONE, DayDot, KIND_TONE } from "./kind"

export type PlannerMode = "month" | "year"

/** before hydration nothing is "today", so the prerendered HTML stays stable */
const NO_TODAY = new Date(1970, 0, 1)

/*
 * Day styling goes through react-day-picker modifiers on the M3E Calendar.
 * The classes land on the cell, so they target its day button. The selected
 * selector is one attribute more specific than the Calendar's own
 * `data-[selected-single=true]:bg-primary`, which turns selection blue.
 * Tailwind only sees literal class names, so they are written out in full.
 */
const MODIFIER_CLASSES = {
  libur:
    "[&>button]:rounded-[calc(var(--cell-size)/2)] [&>button]:bg-primary [&>button]:font-semibold [&>button]:text-on-primary",
  cuti: "[&>button]:rounded-[calc(var(--cell-size)/2)] [&>button]:bg-primary-container [&>button]:font-semibold [&>button]:text-on-primary-container [&>button]:ring-1 [&>button]:ring-inset [&>button]:ring-primary/45",
  weekend: "[&>button]:text-primary",
  // replaces the Calendar's own today style; a ring outside the day, so it
  // still shows when today is itself a red date
  today: "[&>button]:text-primary [&>button]:outline-2 [&>button]:outline-solid [&>button]:outline-offset-2 [&>button]:outline-primary",
  selected:
    "[&>button[data-selected-single=true]]:rounded-lg [&>button[data-selected-single=true]]:bg-selection [&>button[data-selected-single=true]]:text-on-selection [&>button[data-selected-single=true]]:ring-0",
}

function useDayModifiers(view: YearView) {
  const dates = (kind: "libur" | "cuti") =>
    view.holidays.filter((h) => h.kind === kind).map((h) => toLocalDate(h.date))
  return {
    libur: dates("libur"),
    cuti: dates("cuti"),
    weekend: (d: Date) => (d.getDay() === 0 || d.getDay() === 6) && !view.special.has(toIso(d)),
  }
}

type CalendarProps = ComponentProps<typeof Calendar>

/** today's ring (DATE_TONE.today) around the current month's chip and card */
const THIS_MONTH_RING = "outline-2 outline-solid outline-offset-2 outline-primary"

export function Planner({
  view,
  mode,
  onModeChange,
  month,
  selected,
  today,
  onDateChange,
  onMonthChange,
  onGoToday,
}: {
  view: YearView
  mode: PlannerMode
  onModeChange: (mode: PlannerMode) => void
  month: number
  selected: string
  today: string | null
  onDateChange: (date: string) => void
  onMonthChange: (month: number) => void
  onGoToday: () => void
}) {
  const modifiers = useDayModifiers(view)
  const previousMonthButton = useCallback((props: ButtonHTMLAttributes<HTMLButtonElement>) => (
    <Button {...props} variant="ghost" size="icon" disabled={month === 0} aria-disabled={month === 0 || undefined} />
  ), [month])
  const nextMonthButton = useCallback((props: ButtonHTMLAttributes<HTMLButtonElement>) => (
    <Button {...props} variant="ghost" size="icon" disabled={month === 11} aria-disabled={month === 11 || undefined} />
  ), [month])
  const [holidayDisplay, setHolidayDisplay] = useState<"list" | "hover">("list")
  const yearlyDayButton = useCallback((props: ComponentProps<typeof CalendarDayButton>) => {
    const holiday = !props.modifiers.outside && view.special.get(toIso(props.day.date))
    const showTooltip = holidayDisplay === "hover" && holiday
    return (
      <CalendarDayButton
        {...props}
        locale={idLocale}
        aria-label={showTooltip ? `${props["aria-label"]}, ${holidayLabel(holiday)}, ${KIND_LABEL[holiday.kind]}` : props["aria-label"]}
        tooltip={showTooltip ? (
          <>
            <span className="font-semibold">{holidayLabel(holiday)}</span>
            <span className="flex items-center gap-2">
              <span aria-hidden className={cn("size-3 shrink-0 rounded-full", KIND_TONE[holiday.kind])} />
              {KIND_LABEL[holiday.kind]}
            </span>
          </>
        ) : undefined}
      />
    )
  }, [holidayDisplay, view])
  // the current month carries today's red ring, only in today's year
  const thisMonth = today?.startsWith(`${view.year}-`) ? Number(today.slice(5, 7)) - 1 : -1
  const shared: Partial<CalendarProps> = {
    locale: idLocale,
    weekStartsOn: 1,
    showOutsideDays: true,
    fixedWeeks: true,
    formatters: { formatWeekdayName: (d) => DAY_ABBR[d.getDay()] },
    today: today ? toLocalDate(today) : NO_TODAY,
    modifiers,
    modifiersClassNames: MODIFIER_CLASSES,
  }
  const openMonth = (m: number) => {
    onMonthChange(m)
    onModeChange("month")
  }
  // the month grid slides in from the side it came from
  const [shownMonth, setShownMonth] = useState(month)
  const [direction, setDirection] = useState("animate-from-right")
  if (month !== shownMonth) {
    setShownMonth(month)
    setDirection(month > shownMonth ? "animate-from-right" : "animate-from-left")
  }
  const reveal = useReveal<HTMLElement>()

  return (
    <section {...reveal} id="kalender" className="relative isolate mx-auto flex max-w-6xl scroll-mt-24 flex-col gap-6 px-4 py-12 md:px-8">
      <FloatingShapes seed={2} count={5} />
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-2">
          <p className="text-label-large tracking-[0.2em] text-primary uppercase">Pilih tanggalmu</p>
          <h2 className="text-headline-large">Kalender {view.year}</h2>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="tonal"
            size="sm"
            onClick={() => {
              onGoToday()
              onModeChange("month")
            }}
          >
            <Icon name="today" />
            Ke hari ini
          </Button>
          <ToggleGroup
            spacing={0}
            size="sm"
            value={[mode]}
            onValueChange={(v) => v[0] && onModeChange(v[0] as PlannerMode)}
            aria-label="Tampilan kalender"
          >
            <ToggleGroupItem value="month" className="px-4">
              <Icon name="calendar_view_month" size={20} />
              Bulanan
            </ToggleGroupItem>
            <ToggleGroupItem value="year" className="px-4">
              <Icon name="grid_view" size={20} />
              Tahunan
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>

      {mode === "year" && (
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-label-large text-on-surface-variant">Info hari libur</span>
          <ToggleGroup
            spacing={0}
            size="sm"
            value={[holidayDisplay]}
            onValueChange={(values) => {
              if (values[0] === "list" || values[0] === "hover") setHolidayDisplay(values[0])
            }}
            aria-label="Tampilan info hari libur"
          >
            <ToggleGroupItem value="list" className="px-4">Daftar</ToggleGroupItem>
            <ToggleGroupItem value="hover" className="px-4">Saat hover</ToggleGroupItem>
          </ToggleGroup>
        </div>
      )}

      {mode === "month" && (
        <div className="-mx-4 -my-1 overflow-x-auto px-4 py-1 [scrollbar-width:none] md:-mx-8 md:px-8">
          <ToggleGroup
            spacing={1}
            size="sm"
            variant="filled"
            value={[String(month)]}
            onValueChange={(v) => v[0] !== undefined && openMonth(Number(v[0]))}
            aria-label="Pilih bulan"
          >
            {MONTH_NAMES.map((name, m) => (
              <ToggleGroupItem
                key={name}
                value={String(m)}
                aria-label={m === thisMonth ? `${name}, bulan ini` : name}
                className={cn(
                  "px-4 ring-1 ring-outline-variant ring-inset data-pressed:ring-0",
                  m === thisMonth && THIS_MONTH_RING
                )}
              >
                {name.slice(0, 3)}
                {view.holidays.some((h) => Number(h.date.slice(5, 7)) === m + 1) && (
                  <span aria-hidden className="size-1.5 rounded-full bg-primary group-data-pressed/toggle:bg-on-primary" />
                )}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>
      )}

      {mode === "month" ? (
        <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,380px)]">
          <Card
            variant="filled"
            size="lg"
            className="overflow-hidden rounded-xl bg-surface-container-lowest p-3 ring-1 ring-outline-variant"
          >
            <div key={month} className={direction}>
            <Calendar
              {...shared}
              mode="single"
              required
              selected={toLocalDate(selected)}
              onSelect={(d: Date) => onDateChange(toIso(d))}
              month={new Date(view.year, month, 1)}
              onMonthChange={(d) => d.getFullYear() === view.year && onMonthChange(d.getMonth())}
              // Day Picker also hides dates outside navigation bounds. Include
              // the adjacent months so January and December keep their dates.
              startMonth={new Date(view.year - 1, 11, 1)}
              endMonth={new Date(view.year + 1, 0, 1)}
              disabled={(date) => date.getFullYear() !== view.year}
              components={{ PreviousMonthButton: previousMonthButton, NextMonthButton: nextMonthButton }}
              className="planner-calendar w-full p-0 [--cell-size:--spacing(11)] sm:[--cell-size:--spacing(12)]"
              classNames={{
                root: "w-full",
                months: "relative flex w-full flex-col",
                month: "flex w-full flex-col gap-2",
                caption_label: "text-title-large text-on-surface select-none",
                weekday: "flex-1 text-title-medium text-on-surface-variant select-none",
                week: "flex w-full",
              }}
            />
            </div>
          </Card>
          <DayPanel view={view} month={month} selected={selected} onDateChange={onDateChange} />
        </div>
      ) : (
        <TooltipProvider delay={100}>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {MONTH_NAMES.map((name, m) => (
            <Card
              key={name}
              variant="filled"
              style={{ "--i": m } as CSSProperties}
              className={cn(
                "animate-rise gap-3 rounded-xl bg-surface-container-lowest p-3 ring-1 ring-outline-variant",
                m === thisMonth && THIS_MONTH_RING
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-title-medium font-semibold">{name}</h3>
                <span className="numeral text-label-large text-on-surface-variant">{String(m + 1).padStart(2, "0")}</span>
                {m === thisMonth && (
                  <span className="rounded-full bg-primary px-2 py-0.5 text-label-small text-on-primary">Bulan ini</span>
                )}
              </div>
              <Calendar
                {...shared}
                mode="single"
                selected={selected.startsWith(`${view.year}-${String(m + 1).padStart(2, "0")}`) ? toLocalDate(selected) : undefined}
                onSelect={(d?: Date) => {
                  if (!d) return
                  onDateChange(toIso(d))
                  onModeChange("month")
                }}
                month={new Date(view.year, m, 1)}
                disableNavigation
                hideNavigation
                components={{ DayButton: yearlyDayButton }}
                formatters={{ formatWeekdayName: (d) => DAY_ABBR[d.getDay()] }}
                className="planner-calendar w-full p-0 [--cell-size:--spacing(10)] sm:[--cell-size:--spacing(8)]"
                classNames={{
                  month_caption: "sr-only",
                  weekday: "flex-1 text-label-medium text-on-surface-variant select-none",
                  week: "flex w-full",
                  day: "group/day relative h-(--cell-size) min-w-0 flex-1 p-0 text-center select-none [&>button]:text-body-medium",
                }}
              />
              {holidayDisplay === "list" && <MonthHolidays
                holidays={view.holidays.filter((h) => Number(h.date.slice(5, 7)) === m + 1)}
                onOpen={(date) => {
                  onDateChange(date)
                  onModeChange("month")
                }}
              />}
            </Card>
          ))}
        </div>
        </TooltipProvider>
      )}

    </section>
  )
}

/** Each holiday has its own date row below the yearly month grid. */
function MonthHolidays({ holidays, onOpen }: {
  holidays: Holiday[]
  onOpen: (date: string) => void
}) {
  if (!holidays.length)
    return <p className="text-body-small text-on-surface-variant">Tanpa tanggal merah</p>
  return (
    <ul className="flex w-full flex-col divide-y divide-outline-variant/50">
      {holidays.map((h) => (
        <li key={h.date}>
          <button
            type="button"
            onClick={() => onOpen(h.date)}
            aria-label={`${parseIso(h.date).day}, ${holidayLabel(h)}, ${KIND_LABEL[h.kind]}`}
            className="flex min-h-10 w-full items-center gap-2 rounded-sm py-1.5 text-left state-layer focus-ring"
          >
            <DayDot day={parseIso(h.date).day} kind={h.kind} className="size-7 text-label-large font-semibold" />
            <span className="text-body-small text-on-surface-variant">{holidayLabel(h)}</span>
          </button>
        </li>
      ))}
    </ul>
  )
}

function DayPanel({
  view,
  month,
  selected,
  onDateChange,
}: {
  view: YearView
  month: number
  selected: string
  onDateChange: (date: string) => void
}) {
  const date = parseIso(selected)
  const holiday = view.special.get(selected)
  const weekend = date.dow === 0 || date.dow === 6
  const inMonth = view.holidays.filter((h) => Number(h.date.slice(5, 7)) === month + 1)
  const bridge = bridges(view).find((b) => b.leave.some((d) => d.iso === selected))

  return (
    <div className="flex flex-col gap-4">
      <Card
        variant="filled"
        aria-live="polite"
        className={cn(
          "flex-row items-center gap-4 rounded-3xl px-5 ring-1 ring-outline-variant transition-colors motion-effects-slow",
          holiday ? "bg-primary-container text-on-primary-container" : "bg-surface-container"
        )}
      >
        {/* the shape morphs with the kind of day: sun, flower, pill, circle */}
        <Shape
          name={holiday?.kind === "libur" ? "sunny" : holiday ? "flower" : weekend ? "pill" : "circle"}
          className="grid size-20 shrink-0 place-items-center [--shape-color:var(--app-color-selection)] text-on-selection"
        >
          <Burst key={`burst-${selected}`} pieces={holiday ? 14 : 8} />
          <span key={selected} className="numeral animate-pop text-display-small font-bold">
            {date.day}
          </span>
        </Shape>
        <div key={selected} className="animate-from-right flex min-w-0 flex-col gap-1">
          <span className="text-title-medium">
            {DAY_NAMES[date.dow]}, {date.day} {MONTH_NAMES[date.month]}
          </span>
          <strong className="text-title-large-emphasized">
            {holiday ? holidayLabel(holiday) : weekend ? "Akhir pekan" : "Hari kerja biasa"}
          </strong>
          {holiday && <span className="text-body-large">{KIND_LABEL[holiday.kind]}</span>}
          {bridge && (
            <a
              href="#libur-panjang"
              className={cn(
                "mt-2 inline-flex min-h-10 items-center gap-1.5 self-start rounded-full px-3 py-1 text-label-large state-layer focus-ring",
                DATE_TONE.leave
              )}
            >
              <Icon name="lightbulb" size={18} />
              Hari kejepit: cuti {bridge.leave.length} hari, libur {bridge.run.length} hari
            </a>
          )}
        </div>
      </Card>

      <Card variant="filled" className="gap-3 rounded-3xl bg-surface-container px-3 ring-1 ring-outline-variant">
        <div className="flex items-baseline justify-between px-2">
          <h3 className="text-title-large">Libur di {MONTH_NAMES[month]}</h3>
          <span className="text-body-large text-on-surface-variant">{inMonth.length} tanggal</span>
        </div>
        {inMonth.length ? (
          <ItemGroup className="gap-0.5">
            {inMonth.map((h) => {
              const d = parseIso(h.date)
              return (
                <Item
                  key={h.date}
                  variant="segmented"
                  size="sm"
                  data-selected={selected === h.date || undefined}
                  aria-pressed={selected === h.date}
                  render={<button type="button" onClick={() => onDateChange(h.date)} />}
                  className="bg-surface-container-lowest text-left data-selected:bg-selection-container data-selected:text-on-selection-container data-selected:ring-1 data-selected:ring-inset data-selected:ring-selection/40 dark:bg-surface-container-highest dark:data-selected:bg-selection-container"
                >
                  <ItemMedia>
                    <DayDot day={d.day} kind={h.kind} className={selected === h.date ? DATE_TONE.selected : undefined} />
                  </ItemMedia>
                  <ItemContent>
                    <ItemTitle className="line-clamp-2 group-data-selected/item:text-on-selection-container">
                      {h.name}
                    </ItemTitle>
                    <ItemDescription className="text-body-medium group-data-selected/item:text-on-selection-container">
                      {DAY_NAMES[d.dow]} · {KIND_LABEL[h.kind]}
                    </ItemDescription>
                  </ItemContent>
                </Item>
              )
            })}
          </ItemGroup>
        ) : (
          <div className="flex flex-col items-center gap-3 px-4 py-8 text-center">
            <Shape name="flower" className="animate-spin-in grid size-16 place-items-center bg-tertiary-container text-on-tertiary-container">
              <Icon name="wb_sunny" size={32} />
            </Shape>
            <p className="text-title-medium">Belum ada tanggal merah</p>
            <p className="text-body-large text-on-surface-variant">
              Coba bulan lain untuk menemukan hari libur berikutnya.
            </p>
          </div>
        )}
        <p className="flex gap-2 px-2 pt-1 text-body-medium text-on-surface-variant">
          <Icon name="info" size={20} className="shrink-0" />
          Cuti bersama mengikuti kebijakan tempat kerja masing-masing.
        </p>
      </Card>
    </div>
  )
}
