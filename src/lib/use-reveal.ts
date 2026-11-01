import { useEffect, useRef } from "react"

/**
 * Marks an element `data-shown` once it scrolls into view, which plays the
 * `[data-reveal]` transition in index.css. Spread the result onto the element.
 */
export function useReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        el.dataset.shown = ""
        io.disconnect()
      },
      { rootMargin: "0px 0px -10% 0px" }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return { ref, "data-reveal": "" }
}
