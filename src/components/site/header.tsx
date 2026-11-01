import { useEffect, useState, useSyncExternalStore } from "react"

import { useScrolled } from "@/components/m3e/app-bar"
import { Button } from "@/components/m3e/button"
import { useColorMode, type ColorMode } from "@/components/m3e/color-mode-provider"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/m3e/dropdown-menu"
import { useM3Theme } from "@/components/m3e/m3-theme-provider"
import { COLOR_THEMES } from "@/theme"
import { Icon } from "@/components/m3e/icon"
import { Shape } from "@/components/m3e/shape"
import { ToggleGroup, ToggleGroupItem } from "@/components/m3e/toggle-group"
import { YEARS } from "@/data/years"
import { cn } from "@/lib/m3e/cn"

import { DateLegend } from "./kind"

const SECTIONS = [
  { id: "kalender", label: "Kalender", icon: "calendar_month" },
  { id: "libur-panjang", label: "Libur panjang", icon: "beach_access" },
  { id: "hari-libur", label: "Semua libur", icon: "event_note" },
] as const

const MODES: { value: ColorMode; label: string; icon: string }[] = [
  { value: "system", label: "Ikuti perangkat", icon: "brightness_auto" },
  { value: "light", label: "Terang", icon: "light_mode" },
  { value: "dark", label: "Gelap", icon: "dark_mode" },
]

const noop = () => () => {}

/**
 * The section crossing the middle band of the viewport, or null above them.
 * Crossing a boundary can report "left" before "entered"; the last section
 * holds until another takes over, so the pill never blinks off in between.
 */
function useActiveSection() {
  const [active, setActive] = useState<string | null>(null)
  useEffect(() => {
    const seen = new Map<string, boolean>()
    const first = document.getElementById(SECTIONS[0].id)
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) seen.set(e.target.id, e.isIntersecting)
        const hit = SECTIONS.find((s) => seen.get(s.id))?.id
        const aboveAll = first ? first.getBoundingClientRect().top > window.innerHeight * 0.4 : true
        setActive((prev) => hit ?? (aboveAll ? null : prev))
      },
      { rootMargin: "-40% 0px -55% 0px" }
    )
    for (const s of SECTIONS) {
      const el = document.getElementById(s.id)
      if (el) observer.observe(el)
    }
    return () => observer.disconnect()
  }, [])
  return active
}

/**
 * A floating pill instead of a full-width bar: brand, section links with the
 * current one filled, and a connected year switch. On phones the section
 * links move to a floating toolbar at the bottom, within thumb reach.
 */
export function Header({
  year,
  onYearChange,
}: {
  year: number
  onYearChange: (year: number) => void
}) {
  const scrolled = useScrolled(undefined, 8)
  const active = useActiveSection()
  const { mode, setMode } = useColorMode()
  const { theme, setSeedColor } = useM3Theme()
  // the server cannot know the stored mode: show the neutral icon until hydrated
  const hydrated = useSyncExternalStore(noop, () => true, () => false)
  const years = Object.keys(YEARS).map(Number).sort()
  const [brandHover, setBrandHover] = useState(false)
  const [legendOpen, setLegendOpen] = useState(false)

  return (
    <>
      <header className="relative z-40 px-3 pt-3 md:px-6 lg:sticky lg:top-0">
        <div
          className={cn(
            // the edge is an outline, so only the shadow animates: a ring is a
            // box-shadow too, and blending a ring into an elevation flashes
            "mx-auto flex h-16 max-w-6xl items-center gap-2 pr-2 pl-2 transition-[background-color,box-shadow,outline-color] motion-effects-default lg:rounded-full lg:outline-1 lg:-outline-offset-1",
            scrolled
              ? "lg:bg-surface-container-high lg:shadow-elevation-2 lg:outline-transparent"
              : "lg:bg-surface-container lg:shadow-none lg:outline-outline-variant"
          )}
        >
          <a
            href="/"
            aria-label="Kalender Cuti, beranda"
            onPointerEnter={() => setBrandHover(true)}
            onPointerLeave={() => setBrandHover(false)}
            className="group/brand flex shrink-0 items-center gap-2 rounded-full py-1 pr-1 pl-1 state-layer sm:gap-3 sm:pr-4 focus-ring"
          >
            {/* the badge morphs from cookie to sun when the brand is pointed at */}
            <Shape
              name={brandHover ? "sunny" : "9-sided-cookie"}
              className="grid size-10 place-items-center sm:size-12 bg-primary text-on-primary transition-[clip-path,rotate] motion-spatial-default group-hover/brand:rotate-45"
            >
              <Icon name="calendar_month" fill className="transition-[rotate] motion-spatial-default group-hover/brand:-rotate-45" />
            </Shape>
            <span className="text-title-large-emphasized leading-none max-sm:text-[20px]">
              kalender <span className="text-primary">cuti</span>
            </span>
          </a>

          <nav aria-label="Bagian halaman" className="mx-auto hidden items-center gap-1 lg:flex">
            {SECTIONS.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                aria-current={active === s.id ? "location" : undefined}
                className={cn(
                  "inline-flex h-10 items-center gap-2 rounded-full px-4 text-label-large state-layer transition-[background-color,color,padding] motion-spatial-fast focus-ring",
                  active === s.id
                    ? "bg-secondary-container px-5 text-on-secondary-container"
                    : "text-on-surface-variant"
                )}
              >
                <Icon name={s.icon} size={20} fill={active === s.id} />
                {s.label}
              </a>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-1 lg:ml-0">
            {/* the connected switch needs room for every year; phones get a menu */}
            <ToggleGroup
              spacing={0}
              size="sm"
              value={[String(year)]}
              onValueChange={(v) => v[0] && onYearChange(Number(v[0]))}
              aria-label="Tahun kalender"
              className="max-sm:hidden"
            >
              {years.map((y) => (
                <ToggleGroupItem key={y} value={String(y)} aria-label={`Kalender ${y}`} className="numeral px-3 text-label-large">
                  {y}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={<Button variant="tonal" size="sm" className="numeral sm:hidden" />}
                aria-label={`Tahun ${year}, ganti tahun`}
              >
                {year}
                <Icon name="keyboard_arrow_down" size={20} />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuRadioGroup value={String(year)} onValueChange={(value) => onYearChange(Number(value))}>
                  {years.map((y) => (
                    <DropdownMenuRadioItem key={y} value={String(y)} closeOnClick>
                      Kalender {y}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger render={<Button variant="ghost" size="icon" />} aria-label="Pilih warna dan tampilan">
                <Icon name={(hydrated && MODES.find((m) => m.value === mode)?.icon) || "brightness_auto"} />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuGroup>
                  <DropdownMenuLabel>Warna tema</DropdownMenuLabel>
                  <DropdownMenuRadioGroup
                    value={hydrated ? theme.source.primary : COLOR_THEMES[0].seed}
                    onValueChange={(value) => setSeedColor(value)}
                  >
                    {COLOR_THEMES.map(({ label, seed }) => (
                      <DropdownMenuRadioItem key={seed} value={seed}>
                        <span aria-hidden className="size-5 shrink-0 rounded-full ring-1 ring-inset ring-black/15" style={{ backgroundColor: seed }} />
                        {label}
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuLabel>Tampilan</DropdownMenuLabel>
                  <DropdownMenuRadioGroup value={hydrated ? mode : "system"} onValueChange={(value) => setMode(value as ColorMode)}>
                    {MODES.map(({ value, label, icon }) => (
                      <DropdownMenuRadioItem key={value} value={value} closeOnClick>
                        <Icon name={icon} size={20} />
                        {label}
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/*
        M3 Expressive floating toolbar: the current section shows its label,
        and the last button opens the colour key just above the toolbar.
      */}
      <nav
        aria-label="Bagian halaman"
        className="fixed inset-x-0 bottom-4 z-40 flex flex-col items-center gap-3 px-4 lg:hidden"
        onKeyDown={(e) => e.key === "Escape" && setLegendOpen(false)}
      >
        {legendOpen && (
          <div
            id="legend-panel"
            className="animate-pop w-full max-w-sm origin-bottom rounded-3xl bg-surface-container-high p-4 shadow-elevation-3 ring-1 ring-outline-variant"
          >
            <p className="mb-3 text-title-small text-on-surface">Keterangan warna</p>
            <DateLegend />
          </div>
        )}
        <div className="flex items-center gap-1 rounded-full bg-surface-container-high p-2 shadow-elevation-3 ring-1 ring-outline-variant">
          {SECTIONS.map((s) => {
            const current = active === s.id
            return (
              <a
                key={s.id}
                href={`#${s.id}`}
                aria-label={s.label}
                aria-current={current ? "location" : undefined}
                className={cn(
                  "inline-flex h-12 min-w-12 items-center justify-center gap-2 rounded-full state-layer transition-[background-color,color,padding] motion-spatial-fast focus-ring",
                  current ? "bg-primary px-5 text-on-primary" : "px-3 text-on-surface-variant"
                )}
              >
                <Icon name={s.icon} fill={current} />
                {current && <span className="text-label-large whitespace-nowrap">{s.label}</span>}
              </a>
            )
          })}
          <span aria-hidden className="mx-1 h-6 w-px bg-outline-variant" />
          <button
            type="button"
            aria-label="Keterangan warna"
            aria-expanded={legendOpen}
            aria-controls="legend-panel"
            onClick={() => setLegendOpen((v) => !v)}
            className={cn(
              "inline-flex size-12 items-center justify-center rounded-full state-layer transition-[background-color,color] motion-effects-fast focus-ring",
              legendOpen ? "bg-secondary-container text-on-secondary-container" : "text-on-surface-variant"
            )}
          >
            <Icon name={legendOpen ? "close" : "palette"} fill={legendOpen} />
          </button>
        </div>
      </nav>
    </>
  )
}
