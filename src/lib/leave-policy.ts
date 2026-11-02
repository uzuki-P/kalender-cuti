import { useCallback, useSyncExternalStore } from "react"

/*
 * The visitor's workplace leave rules, stored per browser. The prerendered
 * page assumes neither rule applies.
 */
const EVENT = "leave-policy-change"

function subscribe(cb: () => void) {
  window.addEventListener(EVENT, cb)
  window.addEventListener("storage", cb)
  return () => {
    window.removeEventListener(EVENT, cb)
    window.removeEventListener("storage", cb)
  }
}

function usePolicyFlag(key: string, value: string) {
  const read = useCallback(() => {
    try {
      return localStorage.getItem(key) === value
    } catch {
      return false
    }
  }, [key, value])
  const on = useSyncExternalStore(subscribe, read, () => false)
  const set = useCallback(
    (next: boolean) => {
      try {
        if (next) localStorage.setItem(key, value)
        else localStorage.removeItem(key)
      } catch {
        /* private mode: the choice lasts for this page only */
      }
      window.dispatchEvent(new Event(EVENT))
    },
    [key, value]
  )
  return [on, set] as const
}

/** Whether the workplace deducts cuti bersama from annual leave. */
export const useCutiIsLeave = () => usePolicyFlag("cuti-bersama", "potong-cuti")

/** Whether the workplace requires a block leave (cuti wajib) of 5 consecutive workdays. */
export const useBlockLeave = () => usePolicyFlag("cuti-wajib", "blok-5")
