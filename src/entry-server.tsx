import { StrictMode } from "react"
import { renderToString } from "react-dom/server"

import { App } from "./App"
import { YEARS, yearPath } from "./data/years"
import { themeCss } from "./lib/m3e/color"
import { yearView } from "./lib/calendar"
import { THEME } from "./theme"

export const years = Object.keys(YEARS).map(Number)
export { yearPath }

/** the generated color scheme, inlined as <style id="m3-theme"> so the first paint is themed */
export const themeStyle = themeCss(THEME)

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
