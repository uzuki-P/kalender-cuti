import { DAY_NAMES, fmtDm, runNames, type Bridge, type YearView } from "@/lib/calendar"
import { BLOCK_DAYS, longestLeaves, type BreakIndex } from "@/lib/breaks"
import { cn } from "@/lib/cn"
import { rangeText } from "@/lib/day-text"

const SHOWN = 6

/** The leave suggestions that make the longest breaks, under the current leave rules. */
export function LongestLeave({
  view,
  idx,
  today,
  onSelect,
  onPreview,
}: {
  view: YearView
  idx: BreakIndex
  today: string | null
  onSelect: (iso: string) => void
  onPreview: (b: Bridge | null) => void
}) {
  const top = longestLeaves(idx).slice(0, SHOWN)
  if (!top.length) return null
  const rules = [
    idx.blockLeave ? `cuti wajib ${BLOCK_DAYS} hari kerja berturut-turut` : "cuti di hari kejepit",
    idx.cutiIsLeave && "cuti bersama memotong cuti tahunan",
  ].filter(Boolean)

  const pick = (b: Bridge) => {
    onPreview(null)
    onSelect(b.leave[0].iso)
    document.getElementById("kalender")?.scrollIntoView({ block: "start" })
  }

  return (
    <section aria-labelledby="longest-leave" className="mt-12 sm:mt-16">
      <h2 id="longest-leave" className="text-[22px] font-extrabold sm:text-[26px]">
        Cuti paling panjang {view.year}
      </h2>
      <p className="mt-1 text-[15px] leading-snug text-muted">
        Mengikuti pengaturanmu: {rules.join(", ")}.
      </p>
      <ol className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {top.map((b, i) => {
          const past = !!today && b.run[b.run.length - 1].iso < today
          const names = runNames(b.run, view.special)
          const leaveIso = new Set(b.leave.map((d) => d.iso))
          return (
            <li key={b.leave[0].iso}>
              <button
                type="button"
                onClick={() => pick(b)}
                onMouseEnter={() => onPreview(b)}
                onMouseLeave={() => onPreview(null)}
                onFocus={() => onPreview(b)}
                onBlur={() => onPreview(null)}
                className={cn(
                  "group flex h-full w-full flex-col gap-2 rounded-3xl p-5 text-left transition-transform hover:-translate-y-0.5 active:scale-[0.98] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ink",
                  // past breaks stay at full contrast: drawn as an outline instead of faded
                  past ? "border-2 border-dashed border-line" : "bg-panel"
                )}
              >
                <span className="flex items-baseline justify-between gap-3">
                  <span className="text-[34px] leading-none font-extrabold tabular-nums">
                    {b.run.length} <span className="text-[17px] font-bold">hari libur</span>
                  </span>
                  <span className="text-[14px] font-bold text-muted">{past ? "Sudah lewat" : `#${i + 1}`}</span>
                </span>
                <span aria-hidden className="flex flex-wrap gap-0.5">
                  {b.run.map((d) => (
                    <i key={d.iso} className={cn("h-3 w-2 rounded-[2px]", leaveIso.has(d.iso) ? "stabilo" : "bg-merah")} />
                  ))}
                </span>
                <span className="text-[17px] leading-snug font-bold group-hover:underline">
                  {names.length ? names.join(" & ") : "Akhir pekan"}
                </span>
                <span className="text-[15px] text-muted">{rangeText(b.run)}</span>
                <span className="stabilo mt-auto self-start px-3 py-1.5 text-[15px] font-bold">
                  Cuti{" "}
                  {b.leave.length > 2
                    ? `${b.leave.length} hari kerja, ${rangeText([b.leave[0], b.leave[b.leave.length - 1]])}`
                    : b.leave.map((d) => `${DAY_NAMES[d.dow]} ${fmtDm(d)}`).join(" & ")}
                </span>
              </button>
            </li>
          )
        })}
      </ol>
    </section>
  )
}
