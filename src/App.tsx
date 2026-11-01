import { memo, useCallback, useDeferredValue, useEffect, useMemo } from "react"

import { M3eProvider } from "@/components/m3e/m3e-provider"
import { Header } from "@/components/site/header"
import { Hero } from "@/components/site/hero"
import { HolidayList } from "@/components/site/holiday-list"
import { LegendDock } from "@/components/site/legend-dock"
import { LongWeekends } from "@/components/site/long-weekends"
import { Planner } from "@/components/site/planner"
import { yearView } from "@/lib/calendar"
import { useCalendarSelection } from "@/lib/calendar-selection"
import { THEME } from "@/theme"

const YearHero = memo(Hero)
const YearLongWeekends = memo(LongWeekends)
const YearHolidayList = memo(HolidayList)

export function App({ year }: { year: number }) {
  const calendar = useCalendarSelection(year)
  const view = useMemo(() => yearView(calendar.year), [calendar.year])
  // Update the year control and calendar first, then render the longer lists.
  const detailsView = useDeferredValue(view)

  useEffect(() => {
    document.title = `Kalender Indonesia ${calendar.year} · Kalender Cuti`
  }, [calendar.year])

  const selectDate = calendar.selectDate
  const openDate = useCallback((date: string) => {
    selectDate(date)
    document.getElementById("kalender")?.scrollIntoView({
      behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
    })
  }, [selectDate])

  return (
    <M3eProvider colorMode={{ toggleKey: false }} theme={{ defaultTheme: THEME, storageKey: "kalender-color-theme" }}>
      <div className="min-h-svh overflow-x-clip bg-surface text-on-surface">
        <a
          href="#kalender"
          className="sr-only z-50 rounded-full bg-primary px-5 py-3 text-label-large text-on-primary focus:not-sr-only focus:fixed focus:top-2 focus:left-4"
        >
          Langsung ke kalender
        </a>
        <Header year={calendar.year} onYearChange={calendar.selectYear} />
        <main className="pb-28 lg:pb-16">
          <YearHero view={detailsView} onOpenDate={openDate} />
          <Planner
            view={view}
            mode={calendar.mode}
            onModeChange={calendar.selectMode}
            month={calendar.month}
            selected={calendar.date}
            today={calendar.today}
            onDateChange={calendar.selectDate}
            onMonthChange={calendar.selectMonth}
            onGoToday={calendar.goToday}
          />
          <YearLongWeekends view={detailsView} onOpenDate={openDate} />
          <YearHolidayList view={detailsView} onOpenDate={openDate} />
        </main>
        <LegendDock />
      </div>
    </M3eProvider>
  )
}
