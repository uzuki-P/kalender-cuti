import { StrictMode } from "react"
import { renderToString } from "react-dom/server"

import { App } from "./App"
import { YEARS, yearPath } from "./data/years"
import { yearView } from "./lib/calendar"

export const years = Object.keys(YEARS).map(Number)
export { yearPath }

export function render(year: number) {
  const { nLibur, nCuti } = yearView(year)
  const title = `Kalender Tahun ${year} Lengkap dengan Tanggal Merah dan Hari Libur Nasional`
  const description = `Kalender Indonesia tahun ${year} lengkap dengan tanggal merah: ${nLibur} hari libur nasional, ${nCuti} cuti bersama, dan daftar libur panjang menurut SKB 3 Menteri.`
  return {
    title: `${title} · Kalender Cuti`,
    description,
    html: renderToString(
      <StrictMode>
        <App year={year} />
      </StrictMode>
    ),
  }
}
