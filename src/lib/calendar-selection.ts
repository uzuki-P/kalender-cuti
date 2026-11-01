import { useCallback, useSyncExternalStore } from "react"
import { YEARS, yearPath } from "@/data/years"
import { localDate, useToday } from "@/lib/today"

export type CalendarSelection = { year: number; month: number; date: string }
const CHANGE_EVENT = "calendar-navigation"

function subscribe(callback: () => void) {
  window.addEventListener("popstate", callback)
  window.addEventListener(CHANGE_EVENT, callback)
  return () => {
    window.removeEventListener("popstate", callback)
    window.removeEventListener(CHANGE_EVENT, callback)
  }
}

function dateInMonth(year: number, month: number, day: number) {
  const last = new Date(Date.UTC(year, month + 1, 0)).getUTCDate()
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(Math.min(day, last)).padStart(2, "0")}`
}

function validDate(value: string | null): value is string {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const d = new Date(`${value}T00:00:00Z`)
  return (
    !Number.isNaN(d.getTime()) &&
    d.toISOString().slice(0, 10) === value &&
    Number(value.slice(0, 4)) in YEARS
  )
}

export function resolveSelection(
  location: string | null,
  today: string | null,
  serverYear: number
): CalendarSelection {
  if (!location || !today)
    return { year: serverYear, month: 0, date: `${serverYear}-01-01` }
  const url = new URL(location, "https://calendar.local")
  const date = url.searchParams.get("date")
  if (validDate(date))
    return {
      year: Number(date.slice(0, 4)),
      month: Number(date.slice(5, 7)) - 1,
      date
    }
  const requestedMonth = url.searchParams.get("month")
  if (
    requestedMonth &&
    /^\d{4}-(0[1-9]|1[0-2])$/.test(requestedMonth) &&
    Number(requestedMonth.slice(0, 4)) in YEARS
  ) {
    const year = Number(requestedMonth.slice(0, 4))
    const month = Number(requestedMonth.slice(5, 7)) - 1
    return {
      year,
      month,
      date: today.startsWith(requestedMonth) ? today : `${requestedMonth}-01`
    }
  }
  const pathYear = Number(url.pathname.match(/^\/(\d{4})(?:\/|$)/)?.[1])
  const currentYear = Number(today.slice(0, 4))
  const year =
    pathYear in YEARS
      ? pathYear
      : currentYear in YEARS
        ? currentYear
        : serverYear
  const month = Number(today.slice(5, 7)) - 1
  return { year, month, date: dateInMonth(year, month, Number(today.slice(8))) }
}

function commitNavigation(url: URL) {
  const next = `${url.pathname}${url.search}${url.hash}`
  if (next === `${window.location.pathname}${window.location.search}${window.location.hash}`) return
  window.history.pushState(null, "", next)
  window.dispatchEvent(new Event(CHANGE_EVENT))
}

function navigate(year: number, values: { month?: string; date?: string; view?: "month" | "year" }) {
  const url = new URL(window.location.href)
  url.pathname = yearPath(year)
  url.hash = "kalender"
  url.searchParams.delete("date")
  url.searchParams.delete("month")
  if (values.month) url.searchParams.set("month", values.month)
  if (values.date) url.searchParams.set("date", values.date)
  if (values.view === "year") url.searchParams.set("view", "year")
  if (values.view === "month") url.searchParams.delete("view")
  commitNavigation(url)
}

export function useCalendarSelection(serverYear: number) {
  const today = useToday()
  const location = useSyncExternalStore(
    subscribe,
    () => `${window.location.pathname}${window.location.search}`,
    () => null
  )
  const selection = resolveSelection(location, today, serverYear)
  const mode: "month" | "year" = location && new URL(location, "https://calendar.local").searchParams.get("view") === "year" ? "year" : "month"
  const selectMode = useCallback((mode: "month" | "year") => {
    const url = new URL(window.location.href)
    if (mode === "year") url.searchParams.set("view", "year")
    else url.searchParams.delete("view")
    commitNavigation(url)
  }, [])
  const selectDate = useCallback((date: string) => {
    if (!validDate(date)) return
    navigate(Number(date.slice(0, 4)), { date, month: date.slice(0, 7), view: "month" })
  }, [])
  const selectMonth = (month: number) =>
    navigate(selection.year, {
      month: `${selection.year}-${String(month + 1).padStart(2, "0")}`,
      view: "month"
    })
  const selectYear = (year: number) => {
    if (!(year in YEARS)) return
    // the current year opens on today; any other year on 1 January
    const date = today?.startsWith(`${year}-`) ? today : `${year}-01-01`
    navigate(year, { date, month: date.slice(0, 7) })
  }
  return {
    ...selection,
    today,
    mode,
    selectMode,
    selectDate,
    selectMonth,
    selectYear,
    goToday: () => selectDate(localDate())
  }
}
