import { useSyncExternalStore } from "react"

export function localDate() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

function subscribe(callback: () => void) {
  const timer = window.setInterval(callback, 60_000)
  window.addEventListener("focus", callback)
  return () => {
    window.clearInterval(timer)
    window.removeEventListener("focus", callback)
  }
}

// The server snapshot keeps the first client render identical to static HTML.
export const useToday = () =>
  useSyncExternalStore(subscribe, localDate, () => null)

/**
 * Splits items into those still ahead and those already over. Before
 * hydration there is no today, so the prerendered page lists everything; a
 * past year is browsed as a whole, so it is not split either.
 */
export function splitByToday<T>(items: T[], end: (item: T) => string, today: string | null) {
  if (!today || items.every((item) => end(item) < today.slice(0, 4))) return { upcoming: items, past: [] as T[] }
  return {
    upcoming: items.filter((item) => end(item) >= today),
    past: items.filter((item) => end(item) < today),
  }
}
