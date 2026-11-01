import { YEARS } from "@/data/years"
import { DAY_NAMES, fmtDm, parseIso, type YearView } from "@/lib/calendar"
import { cn } from "@/lib/cn"
import { breakNames, daysBetween, type Break } from "@/lib/breaks"

const link = "font-extrabold text-merah-ink underline decoration-2 underline-offset-4 hover:decoration-4 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ink rounded-sm"

/** One sentence that answers "when is my next day off?" */
export function NextBreak({
  view,
  breaks,
  today,
  onSelect,
  onYearChange,
}: {
  view: YearView
  breaks: Break[]
  today: string | null
  onSelect: (iso: string) => void
  onYearChange: (year: number) => void
}) {
  const inYear = today?.startsWith(String(view.year))
  const next = today ? breaks.find((b) => b.end >= today) : undefined
  let body

  if (!today || !inYear) {
    body = <>{view.year}: {view.nLibur} libur nasional dan {view.nCuti} cuti bersama.</>
  } else if (next && next.start <= today) {
    const end = parseIso(next.end)
    body = <>Kamu sedang libur: <b>{breakNames(next).join(" & ")}</b>, sampai {DAY_NAMES[end.dow]} {fmtDm(end)}.</>
  } else if (next) {
    const n = daysBetween(today, next.start)
    body = (
      <>
        Libur berikutnya{" "}
        <span className="whitespace-nowrap">
          <button type="button" onClick={() => onSelect(next.holidays[0].date)} className={cn(link, "whitespace-normal")}>
            {breakNames(next)[0]}
          </button>
          ,
        </span>{" "}
        {DAY_NAMES[next.days[0].dow]} {fmtDm(next.days[0])}. <b>{n === 1 ? "Besok." : `${n} hari lagi.`}</b>
      </>
    )
  } else if (view.year + 1 in YEARS) {
    body = (
      <>
        Tanggal merah {view.year} sudah habis.{" "}
        <button type="button" onClick={() => onYearChange(view.year + 1)} className={link}>
          Lihat {view.year + 1}
        </button>
      </>
    )
  } else {
    body = <>Tanggal merah {view.year} sudah habis.</>
  }

  return (
    <p key={today ?? "ssr"} className="mx-auto min-h-[3.75rem] max-w-[1320px] animate-fade-up px-3 pt-6 text-[19px] leading-snug text-balance sm:min-h-0 sm:px-8 sm:pt-8 sm:text-[24px]">
      {body}
    </p>
  )
}
