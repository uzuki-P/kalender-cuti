import { flushSync } from "react-dom"

const reduced = () => matchMedia("(prefers-reduced-motion: reduce)").matches

/**
 * Runs a navigation inside a View Transition when the browser has one and
 * motion is welcome; otherwise runs it directly. Elements that share a
 * `view-transition-name` morph between the two states.
 */
export function withTransition(update: () => void) {
  if (!document.startViewTransition || reduced()) return update()
  document.startViewTransition(() => flushSync(update))
}

/** the name the month grid and its year-view thumbnail share */
export const SHEET = "month-sheet"
