// Writes one static HTML page per year from the client build (dist/) and the
// server bundle (dist-ssr/): / and /<latest>/ are the newest year, /<year>/ the rest.
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath, pathToFileURL } from "node:url"

const root = join(dirname(fileURLToPath(import.meta.url)), "..")
const dist = join(root, "dist")
const ssr = join(root, "dist-ssr")

const { render, years, yearPath, themeStyle } = await import(
  pathToFileURL(join(ssr, "entry-server.js")).href
)
const template = readFileSync(join(dist, "index.html"), "utf8")
const esc = (s) => s.replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;")

for (const year of years) {
  const { title, description, html } = render(year)
  const page = template
    .replaceAll("<!--title-->", esc(title))
    .replaceAll("<!--description-->", esc(description))
    .replace("<!--theme-style-->", `<style id="m3-theme">${themeStyle}</style>`)
    .replace("<!--year-->", String(year))
    .replace("<!--app-->", html)
  const paths = new Set([`/${year}/`, yearPath(year)])
  for (const p of paths) {
    const file = join(dist, p, "index.html")
    mkdirSync(dirname(file), { recursive: true })
    writeFileSync(file, page)
    console.log("prerendered", p)
  }
}
rmSync(ssr, { recursive: true, force: true })
