import { StrictMode } from "react"
import { createRoot, hydrateRoot } from "react-dom/client"

import "./index.css"
import { App } from "./App"
import { DEFAULT_YEAR } from "./data/years"

const root = document.getElementById("root")!
// prerendered pages carry their year; the dev server serves the bare template
const year =
  Number(root.dataset.year) ||
  Number(location.pathname.match(/^\/(\d{4})/)?.[1]) ||
  DEFAULT_YEAR
const app = (
  <StrictMode>
    <App year={year} />
  </StrictMode>
)

document.title = `Kalender Indonesia ${year} · Kalender Cuti`

if (root.children.length > 0) hydrateRoot(root, app)
else createRoot(root).render(app)
