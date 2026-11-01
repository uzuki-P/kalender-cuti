import { holidayLabel } from "@/data/years"
import { DAY_NAMES, MONTH_NAMES, fmtDm, leaveDates, parseIso, type Bridge, type YearView } from "@/lib/calendar"
import { breakNames, pasaran, type Break, type BreakIndex } from "@/lib/breaks"
import { dayStatus, rangeText } from "@/lib/day-text"
import { cn } from "@/lib/cn"

const ring = "focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ink"

export function DayPanel({
  view,
  breaks,
  idx,
  selected,
  month,
  onSelect,
  onPreview,
}: {
  view: YearView
  breaks: Break[]
  idx: BreakIndex
  selected: string
  month: number
  onSelect: (iso: string) => void
  onPreview: (b: Bridge | null) => void
}) {
  const sel = parseIso(selected)
  const h = view.special.get(selected)
  const b = idx.byIso.get(selected)
  const bridge = idx.leave.get(selected) ?? b?.bridge
  const off = !!b || (!!h && !(h.kind === "cuti" && idx.cutiIsLeave))
  const inMonth = breaks.filter((x) => x.days.some((d) => d.month === month))
  const later = breaks.find((x) => x.days[0].month > month)

  return (
    <aside className="flex flex-col gap-8" aria-label="Detail">
      <section aria-live="polite" className="overflow-hidden rounded-3xl bg-panel p-5 sm:p-6">
        <div key={selected} className="animate-fade-up">
          <p className="text-[15px] font-semibold text-muted">
            {DAY_NAMES[sel.dow]} {pasaran(sel)}
          </p>
          <p className="display text-[40px] leading-none sm:text-[44px]">{fmtDm(sel)}</p>
          <p className={cn("mt-3 inline-block rounded-full px-3 py-1 text-[15px] font-bold", off ? "bg-merah text-on-merah" : idx.leave.has(selected) ? "stabilo" : "bg-paper")}>
            {dayStatus(selected, view, idx)}
          </p>
          {h && <p className="mt-3 text-[18px] leading-snug font-bold">{holidayLabel(h)}</p>}
          {b && (
            <p className="mt-2 text-[16px] leading-snug">
              Libur <b>{b.days.length} hari</b> berturut-turut, {rangeText(b.days)}.
            </p>
          )}
          {bridge && (
            <p className="stabilo mt-4 px-4 py-3 text-[16px] leading-snug">
              Ambil cuti <b>{leaveDates(bridge)}</b>, liburmu jadi <b>{bridge.run.length} hari</b>: {rangeText(bridge.run)}.
            </p>
          )}
        </div>
      </section>

      <section aria-labelledby="month-breaks">
        <h2 id="month-breaks" className="mb-1 text-[20px] font-extrabold">Libur di {MONTH_NAMES[month]}</h2>
        {inMonth.length === 0 ? (
          <div className="mt-2 rounded-2xl border-2 border-dashed border-line p-5 text-[16px] leading-snug">
            Tidak ada tanggal merah bulan ini.
            {later && (
              <button type="button" onClick={() => onSelect(later.holidays[0].date)} className={cn("mt-2 block rounded-sm text-left font-bold text-merah-ink underline decoration-2 underline-offset-4", ring)}>
                Berikutnya: {breakNames(later)[0]}, {fmtDm(later.days[0])}
              </button>
            )}
          </div>
        ) : (
          <ul className="flex flex-col divide-y divide-line">
            {inMonth.map((x) => (
              <li key={x.start} className="flex flex-col gap-2 py-4">
                <button type="button" onClick={() => onSelect(x.holidays[0].date)} className={cn("group rounded-md text-left", ring)}>
                  <span className="block text-[17px] leading-snug font-bold group-hover:underline">{breakNames(x).join(" & ")}</span>
                  <span className="mt-1 flex flex-wrap items-center gap-x-2 text-[15px] text-muted">
                    <span aria-hidden className="flex gap-0.5">
                      {x.days.map((d) => <i key={d.iso} className="h-3 w-2 rounded-[2px] bg-merah" />)}
                    </span>
                    {x.days.length} hari · {rangeText(x.days)}
                  </span>
                </button>
                {x.bridge && (
                  <button
                    type="button"
                    onMouseEnter={() => onPreview(x.bridge!)}
                    onMouseLeave={() => onPreview(null)}
                    onFocus={() => onPreview(x.bridge!)}
                    onBlur={() => onPreview(null)}
                    onClick={() => onSelect(x.bridge!.leave[0].iso)}
                    className={cn("stabilo self-start px-3 py-2 text-left text-[15px] font-bold transition-transform hover:-rotate-1 active:scale-95", ring)}
                  >
                    + cuti {x.bridge.leave.map((d) => DAY_NAMES[d.dow]).join(" & ")} = {x.bridge.run.length} hari libur
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </aside>
  )
}
