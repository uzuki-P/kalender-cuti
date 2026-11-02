import { DAY_NAMES, fmtDm, parseIso, type Day, type YearView } from "@/lib/calendar"
import type { BreakIndex } from "@/lib/breaks"

export const rangeText = (days: Day[]) => {
  const a = days[0]
  const z = days[days.length - 1]
  return a.iso === z.iso
    ? `${DAY_NAMES[a.dow]}, ${fmtDm(a)}`
    : `${DAY_NAMES[a.dow].slice(0, 3)} ${fmtDm(a)} – ${DAY_NAMES[z.dow].slice(0, 3)} ${fmtDm(z)}`
}

/** what kind of day this is, in words */
export function dayStatus(iso: string, view: YearView, idx: BreakIndex) {
  const d = parseIso(iso)
  const h = view.special.get(iso)
  if (h?.kind === "cuti" && idx.cutiIsLeave) return "Cuti bersama, memotong cuti tahunan"
  if (h) return h.kind === "libur" ? "Libur nasional" : "Cuti bersama"
  if (idx.byIso.has(iso)) return "Akhir pekan, menyambung libur"
  if (idx.leave.has(iso)) return idx.blockLeave ? "Hari kerja, saran cuti wajib" : "Hari kerja di antara libur"
  return d.dow === 0 || d.dow === 6 ? "Akhir pekan" : "Hari kerja"
}
