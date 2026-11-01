import { useCallback, useSyncExternalStore } from "react"
import { flushSync } from "react-dom"

export type ColorMode = "system" | "light" | "dark"

/** index.html reads the same key before first paint */
const KEY = "color-mode"
const EVENT = "color-mode-change"
const darkQuery = () => matchMedia("(prefers-color-scheme: dark)")

function read(): ColorMode {
  try {
    const v = localStorage.getItem(KEY)
    return v === "light" || v === "dark" ? v : "system"
  } catch {
    return "system"
  }
}

function apply(mode: ColorMode) {
  const dark = mode === "dark" || (mode === "system" && darkQuery().matches)
  document.documentElement.classList.toggle("dark", dark)
  document.documentElement.classList.toggle("light", !dark)
}

function subscribe(cb: () => void) {
  const onSystem = () => {
    if (read() === "system") apply("system")
    cb()
  }
  const q = darkQuery()
  q.addEventListener("change", onSystem)
  window.addEventListener(EVENT, cb)
  window.addEventListener("storage", cb)
  return () => {
    q.removeEventListener("change", onSystem)
    window.removeEventListener(EVENT, cb)
    window.removeEventListener("storage", cb)
  }
}

export function useColorMode() {
  const mode = useSyncExternalStore(subscribe, read, () => "system" as ColorMode)
  const setMode = useCallback((next: ColorMode) => {
    const commit = () => {
      try {
        if (next === "system") localStorage.removeItem(KEY)
        else localStorage.setItem(KEY, next)
      } catch {
        /* private mode: the choice lasts for this page only */
      }
      apply(next)
      flushSync(() => window.dispatchEvent(new Event(EVENT)))
    }
    // cross-fade the whole page where the browser supports it
    if (document.startViewTransition && !matchMedia("(prefers-reduced-motion: reduce)").matches)
      document.startViewTransition(commit)
    else commit()
  }, [])
  return { mode, setMode }
}
