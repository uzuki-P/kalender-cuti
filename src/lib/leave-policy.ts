import { useCallback, useSyncExternalStore } from "react"

/**
 * Whether the visitor's workplace deducts cuti bersama from annual leave.
 * Stored per browser; the prerendered page assumes cuti bersama is free.
 */
const KEY = "cuti-bersama"
const EVENT = "leave-policy-change"

function read() {
  try {
    return localStorage.getItem(KEY) === "potong-cuti"
  } catch {
    return false
  }
}

function subscribe(cb: () => void) {
  window.addEventListener(EVENT, cb)
  window.addEventListener("storage", cb)
  return () => {
    window.removeEventListener(EVENT, cb)
    window.removeEventListener("storage", cb)
  }
}

export function useCutiIsLeave() {
  const cutiIsLeave = useSyncExternalStore(subscribe, read, () => false)
  const setCutiIsLeave = useCallback((on: boolean) => {
    try {
      if (on) localStorage.setItem(KEY, "potong-cuti")
      else localStorage.removeItem(KEY)
    } catch {
      /* private mode: the choice lasts for this page only */
    }
    window.dispatchEvent(new Event(EVENT))
  }, [])
  return [cutiIsLeave, setCutiIsLeave] as const
}
