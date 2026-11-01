import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react"

import { cn } from "@/lib/cn"
import { useColorMode, type ColorMode } from "@/lib/color-mode"

import { Auto, Check, ChevronDown, Moon, Sun } from "./icons"

const OPTIONS: { value: ColorMode; label: string; Icon: typeof Sun }[] = [
  { value: "system", label: "Ikuti perangkat", Icon: Auto },
  { value: "light", label: "Terang", Icon: Sun },
  { value: "dark", label: "Gelap", Icon: Moon },
]

/**
 * Theme dropdown: a button that opens a menu of radio items. Arrow keys,
 * Home/End move between items; Enter or Space picks; Escape, Tab or a click
 * outside closes and returns focus to the button.
 */
export function ThemeMenu() {
  const { mode, setMode } = useColorMode()
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const itemsRef = useRef<(HTMLButtonElement | null)[]>([])
  const menuId = useId()
  const current = OPTIONS.find((o) => o.value === mode) ?? OPTIONS[0]

  useEffect(() => {
    if (!open) return
    const onDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("pointerdown", onDown)
    return () => document.removeEventListener("pointerdown", onDown)
  }, [open])

  const focusItem = (i: number) => itemsRef.current[(i + OPTIONS.length) % OPTIONS.length]?.focus()

  const openAt = (i: number) => {
    setOpen(true)
    requestAnimationFrame(() => focusItem(i))
  }

  const close = (refocus = true) => {
    setOpen(false)
    if (refocus) buttonRef.current?.focus()
  }

  const pick = (value: ColorMode) => {
    close()
    if (value !== mode) setMode(value)
  }

  const onButtonKey = (e: KeyboardEvent) => {
    if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      openAt(OPTIONS.indexOf(current))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      openAt(OPTIONS.length - 1)
    }
  }

  const onMenuKey = (e: KeyboardEvent) => {
    const i = itemsRef.current.indexOf(document.activeElement as HTMLButtonElement)
    const moves: Record<string, number> = { ArrowDown: i + 1, ArrowUp: i - 1, Home: 0, End: OPTIONS.length - 1 }
    if (e.key in moves) {
      e.preventDefault()
      focusItem(moves[e.key])
    } else if (e.key === "Escape") {
      e.preventDefault()
      close()
    } else if (e.key === "Tab") {
      close(false)
    }
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        aria-label={`Tema: ${current.label}`}
        onClick={() => (open ? close() : openAt(OPTIONS.indexOf(current)))}
        onKeyDown={onButtonKey}
        className={cn(
          "flex h-11 items-center gap-1.5 rounded-full bg-panel pr-2.5 pl-3 text-[15px] font-bold text-ink transition-colors hover:bg-line focus-visible:outline-3 focus-visible:outline-offset-1 focus-visible:outline-ink",
          open && "bg-line"
        )}
      >
        <current.Icon />
        <span className="max-md:hidden">{current.label}</span>
        <ChevronDown width={16} height={16} className={cn("transition-transform duration-200", open && "rotate-180")} />
      </button>

      {open && (
        <div
          id={menuId}
          role="menu"
          aria-label="Tema"
          onKeyDown={onMenuKey}
          className="absolute top-full right-0 z-50 mt-2 w-56 origin-top-right animate-pop rounded-2xl border border-line bg-paper p-1.5 shadow-[0_12px_32px_rgb(0_0_0/0.18)]"
        >
          {OPTIONS.map((o, i) => {
            const checked = o.value === mode
            return (
              <button
                key={o.value}
                ref={(el) => {
                  itemsRef.current[i] = el
                }}
                type="button"
                role="menuitemradio"
                aria-checked={checked}
                tabIndex={-1}
                onClick={() => pick(o.value)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[15px] font-semibold outline-none hover:bg-panel focus-visible:bg-panel focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ink",
                  checked && "font-extrabold"
                )}
              >
                <o.Icon />
                <span className="flex-1">{o.label}</span>
                {checked && <Check className="text-merah-ink" />}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
