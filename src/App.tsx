import { useEffect, useMemo, useState } from "react"

import { DayPanel } from "@/components/day-panel"
import { Header } from "@/components/header"
import { MonthView } from "@/components/month-view"
import { LongestLeave } from "@/components/longest-leave"
import { NextBreak } from "@/components/next-break"
import { PolicySwitch } from "@/components/policy-switch"
import { YearView } from "@/components/year-view"
import { SKB_URL, YEARS } from "@/data/years"
import { BLOCK_DAYS, planYear } from "@/lib/breaks"
import { useBlockLeave, useCutiIsLeave } from "@/lib/leave-policy"
import { yearView, type Bridge } from "@/lib/calendar"
import { useCalendarSelection } from "@/lib/calendar-selection"
import { ArrowUpRight, GitHub } from "@/components/icons"

const REPO_URL = "https://github.com/uzuki-P/kalender-cuti"
const PORTFOLIO_URL = "https://uzuki-p.github.io/"

/*
 * Kalender Cuti. Two meanings carry the page: red is a day off (each break
 * drawn as one block), yellow highlighter is leave worth taking. The month
 * view is the default; the year view shows the same marks for all twelve.
 */
export function App({ year }: { year: number }) {
  const calendar = useCalendarSelection(year)
  const view = useMemo(() => yearView(calendar.year), [calendar.year])
  const [cutiIsLeave, setCutiIsLeave] = useCutiIsLeave()
  const [blockLeave, setBlockLeave] = useBlockLeave()
  const { breaks, idx } = useMemo(
    () => planYear(view, { cutiIsLeave, blockLeave }),
    [view, cutiIsLeave, blockLeave]
  )

  // the highlighter follows the pointer over a suggestion, else the selection
  const [hovered, setHovered] = useState<Bridge | null>(null)
  const preview = hovered ?? idx.leave.get(calendar.date) ?? null

  useEffect(() => {
    document.title = `Kalender Indonesia ${calendar.year} · Kalender Cuti`
  }, [calendar.year])

  return (
    <div className="min-h-svh overflow-x-clip">
      <a href="#kalender" className="sr-only z-50 rounded-full bg-ink px-5 py-3 font-bold text-paper focus:not-sr-only focus:fixed focus:top-2 focus:left-3">
        Langsung ke kalender
      </a>
      <Header
        today={calendar.today}
        mode={calendar.mode}
        onModeChange={calendar.selectMode}
      />
      <main id="kalender" className="scroll-mt-4">
        <h1 className="sr-only">Kalender {calendar.year}: tanggal merah, cuti bersama, dan saran cuti</h1>
        <NextBreak view={view} breaks={breaks} today={calendar.today} onSelect={calendar.selectDate} onYearChange={calendar.selectYear} />
        <div className="mx-auto flex max-w-[1320px] flex-col gap-3 px-3 pt-4 sm:px-8">
          <PolicySwitch
            label="Cuti bersama memotong cuti tahunan"
            hint={
              cutiIsLeave
                ? `${view.nCuti} hari cuti bersama ${view.year} ditandai stabilo, karena memakai jatah cutimu.`
                : "nyalakan jika kantormu menghitungnya sebagai cuti."
            }
            on={cutiIsLeave}
            onChange={setCutiIsLeave}
          />
          <PolicySwitch
            label={`Cuti wajib (block leave) ${BLOCK_DAYS} hari kerja`}
            hint={
              blockLeave
                ? `saran cuti menjadi ${BLOCK_DAYS} hari kerja berturut-turut yang menyambung tanggal merah, agar liburmu paling panjang.`
                : `nyalakan jika kantormu mewajibkan cuti ${BLOCK_DAYS} hari kerja berturut-turut.`
            }
            on={blockLeave}
            onChange={setBlockLeave}
          />
        </div>
        <div className="mx-auto max-w-[1320px] px-3 pt-6 pb-16 sm:px-8 sm:pt-8">
          {calendar.mode === "month" ? (
            <div className="grid grid-cols-[minmax(0,1fr)] gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-10">
              <MonthView
                view={view}
                idx={idx}
                today={calendar.today}
                selected={calendar.date}
                month={calendar.month}
                preview={preview}
                onPreview={setHovered}
                onSelect={calendar.selectDate}
                onMonthChange={calendar.selectMonth}
                onYearChange={calendar.selectYear}
              />
              <div className="lg:pt-[118px]">
                <DayPanel
                  view={view}
                  breaks={breaks}
                  idx={idx}
                  selected={calendar.date}
                  month={calendar.month}
                  onSelect={calendar.selectDate}
                  onPreview={setHovered}
                />
              </div>
            </div>
          ) : (
            <YearView
              view={view}
              idx={idx}
              today={calendar.today}
              month={calendar.month}
              onSelect={calendar.selectDate}
              onMonthChange={calendar.selectMonth}
              onYearChange={calendar.selectYear}
            />
          )}
          <LongestLeave view={view} idx={idx} today={calendar.today} onSelect={calendar.selectDate} onPreview={setHovered} />
        </div>
      </main>
      <footer className="mx-auto max-w-[1320px] border-t border-line px-3 py-8 text-[14px] leading-relaxed text-muted sm:px-8">
        <p>
          {YEARS[calendar.year].meta.hijriah} · {YEARS[calendar.year].meta.jawa} ·{" "}
          <a href={SKB_URL} className="font-semibold text-ink underline underline-offset-4 focus-visible:outline-3 focus-visible:outline-ink">
            {YEARS[calendar.year].skbNote}
          </a>
          . Cuti bersama dan saran cuti mengikuti kebijakan tempat kerjamu.
        </p>
        <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3 text-[15px]">
          <p>
            Dibuat oleh{" "}
            <a href={PORTFOLIO_URL} className="inline-flex items-center gap-0.5 rounded-sm font-bold text-ink underline decoration-merah decoration-2 underline-offset-4 hover:decoration-4 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ink">
              uzuki-P
              <ArrowUpRight />
            </a>
          </p>
          <a href={REPO_URL} className="inline-flex h-10 items-center gap-2 rounded-full border-2 border-line px-4 font-bold text-ink transition-colors hover:border-ink focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ink">
            <GitHub />
            Kode sumber di GitHub
          </a>
        </div>
      </footer>
    </div>
  )
}
