import { YEARS } from "@/data/years"
import { cn } from "@/lib/cn"
import { withTransition } from "@/lib/transition"

import { ThemeMenu } from "./theme-menu"

const YEAR_LIST = Object.keys(YEARS).map(Number)


export function Header({
  year,
  today,
  mode,
  onYearChange,
  onModeChange,
}: {
  year: number
  today: string | null
  mode: "month" | "year"
  onYearChange: (year: number) => void
  onModeChange: (mode: "month" | "year") => void
}) {

  return (
    <header className="mx-auto grid max-w-[1320px] grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-x-2 gap-y-3 px-3 pt-4 sm:flex sm:gap-x-4 sm:px-8 sm:pt-6">
      <a href="/" className="flex items-center gap-2 rounded-lg text-[16px] font-extrabold tracking-tight whitespace-nowrap focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-ink sm:mr-2 sm:text-[18px]">
        <span aria-hidden className="grid size-9 place-items-center rounded-lg bg-merah text-[15px] text-on-merah">
          {today ? Number(today.slice(8)) : ""}
        </span>
        kalender cuti
      </a>

      <nav aria-label="Tahun" className="col-span-full row-start-2 grid grid-cols-5 rounded-full bg-panel p-1 text-[15px] font-bold sm:flex">
        {YEAR_LIST.map((y) => (
          <button
            key={y}
            type="button"
            aria-current={y === year ? "page" : undefined}
            onClick={() => y !== year && withTransition(() => onYearChange(y))}
            className={cn(
              "h-9 rounded-full px-3.5 transition-colors focus-visible:outline-3 focus-visible:outline-offset-1 focus-visible:outline-ink",
              y === year ? "bg-ink text-paper" : "text-muted hover:text-ink"
            )}
          >
            {y}
          </button>
        ))}
      </nav>

      <div role="group" aria-label="Tampilan" className="flex rounded-full bg-panel p-1 text-[15px] font-bold sm:ml-auto">
        {(["month", "year"] as const).map((m) => (
          <button
            key={m}
            type="button"
            aria-pressed={mode === m}
            onClick={() => mode !== m && withTransition(() => onModeChange(m))}
            className={cn(
              "h-9 rounded-full px-3 transition-[background-color,color,box-shadow] focus-visible:outline-3 focus-visible:outline-offset-1 focus-visible:outline-ink sm:px-4",
              mode === m ? "bg-paper text-ink shadow-[0_1px_3px_rgb(0_0_0/0.18)]" : "text-muted hover:text-ink"
            )}
          >
            {m === "month" ? "Bulan" : <><span className="sm:hidden">Tahun</span><span className="max-sm:hidden">Setahun</span></>}
          </button>
        ))}
      </div>

      <ThemeMenu />
    </header>
  )
}
