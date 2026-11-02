import { cn } from "@/lib/cn"
import { withTransition } from "@/lib/transition"

import { ThemeMenu } from "./theme-menu"

export function Header({
  today,
  mode,
  onModeChange,
}: {
  today: string | null
  mode: "month" | "year"
  onModeChange: (mode: "month" | "year") => void
}) {

  return (
    <header className="mx-auto flex max-w-[1320px] items-center gap-2 px-3 pt-4 sm:gap-x-4 sm:px-8 sm:pt-6">
      <a href="/" className="flex items-center gap-2 rounded-lg text-[16px] font-extrabold tracking-tight whitespace-nowrap focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-ink sm:text-[18px]">
        <span aria-hidden className="grid size-9 place-items-center rounded-lg bg-merah text-[15px] text-on-merah">
          {today ? Number(today.slice(8)) : ""}
        </span>
        kalender cuti
      </a>

      <div role="group" aria-label="Tampilan" className="ml-auto flex rounded-full bg-panel p-1 text-[15px] font-bold">
        {(["month", "year"] as const).map((m) => (
          <button
            key={m}
            type="button"
            aria-pressed={mode === m}
            onClick={() => mode !== m && withTransition(() => onModeChange(m))}
            className={cn(
              "h-9 rounded-full px-3 transition-[background-color,color,box-shadow] focus-visible:outline-3 focus-visible:outline-offset-1 focus-visible:outline-ink sm:px-4",
              mode === m ? "bg-ink text-paper" : "text-muted hover:text-ink"
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
