# Kalender Cuti

An Indonesian holiday planner built with React and Material 3 Expressive.
Browse monthly or yearly calendars, inspect individual dates, search national
holidays and collective leave, and find consecutive days off.

The 2026 holiday data retains its original provenance in the
[calendar source snapshot](https://web.archive.org/web/20260618044321/https://kalenderku.id/2026).
The 2027 data comes from the
[SKB 3 Menteri announcement](https://setneg.go.id/baca/index/inilah_skb_3_menteri_libur_nasional_dan_cuti_bersama_2027).

## Pages

| URL | Year | Notes |
| --- | ---- | ----- |
| `/` | Current year | opens today when that year is available |
| `/2027/` | 2027 | selects the current month and day within 2027 |
| `/2026/` | 2026 | 2026 holiday dates |

Each page has interactive month and year views, date details, a holiday search,
and long-weekend cards.
System, light, and dark appearance choices persist in the browser. Motion
respects the reduced-motion preference. The UI uses the Material 3 Expressive components from
[shadcn-m3e](https://shadcn-m3e.crystaworld.dev/components).

## Design system

The UI is Material 3 Expressive built from the
[shadcn-m3e](https://shadcn-m3e.crystaworld.dev/components) registry
(reviewed at upstream commit `333c70e`, shadcn CLI 4.21.3). Page sections in
`src/components/site/` compose registry components (`AppBar`, `Card`,
`Calendar`, `ToggleGroup`, `FilterChip`, `SearchView`, `Item`, `Shape`) with
Tailwind utilities on M3 color roles. There is no hand-written component CSS.

- **Theme.** `src/theme.ts` seeds one color, the original kalenderku.id red
  `#f73b3b`, with the calm `tonalSpot` variant and 2021 color spec: warm,
  low-chroma surfaces (charcoal in dark mode) with wider container steps.
- **Holiday roles.** Libur nasional uses filled `primary`, cuti bersama
  `primary-container` with a primary edge, the selected day `tertiary`, and
  today a `primary` outline. The calendar applies them as react-day-picker
  modifiers.
- **Surfaces.** Page `surface`, cards `surface-container` with an
  `outline-variant` edge, rows and chips inside cards
  `surface-container-lowest` (light) or `-highest` (dark).
- **Type.** The M3 scale as shipped (smallest role 11px, floor 10px). Date
  numerals use the `numeral` utility, Roboto Flex at a condensed width.
- **Motion.** `src/index.css` defines entrance keyframes timed by the M3
  spring tokens and a scroll reveal (`useReveal`); shapes morph on hover and
  with the kind of day. All of it is off under `prefers-reduced-motion`.
  The hero is a *kalender sobek* (tear-off calendar) sheet for the next red date.

The registry rejects the shadcn CLI's user agent with HTTP 403. To add a
component, mirror its JSON (and its `@m3e/*` dependencies) with
`curl -A "Mozilla/5.0 Chrome/130"`, serve the mirror locally, and point the
`@m3e` registry in `components.json` at it for the install. Review overwrite
prompts: `app-bar.tsx` (`titleAs`), `color-mode-provider.tsx` (SSR guard) and
`lib/m3e/color.ts` (root selectors) carry local changes.

## Layout

- `src/data/years.ts` holds holiday data and year metadata.
- `src/lib/calendar.ts` derives month grids, statistics, and long weekends.
- `src/components/site/` holds the calendar page sections.
- `src/components/m3e/` and `src/lib/m3e/` hold the Material components and theme.
- `scripts/prerender.mjs` writes static HTML for each year after the Vite builds.

## Build

```sh
pnpm install
just build       # compile React and prerender dist/
just dev         # Vite development server with hot reload
just check       # lint and verify generated icons
pnpm gen:icons   # regenerate icons after changing icon names
```

## Deploy

`vercel.json` points the deployment at `dist/`. The build produces static HTML
and browser assets without serverless functions.

```sh
vercel link      # initial setup
just deploy      # build and deploy to production
```

## Adding a year

Add the holiday data and metadata to `YEARS` in `src/data/years.ts`, then run
`just build`. The year routes, calendar grids, long weekends, tables, and
date details derive from that data.

Opening the root page without calendar parameters selects today. Date and month
navigation updates `?date=YYYY-MM-DD&month=YYYY-MM` or `?month=YYYY-MM`.
Reloading and browser Back/Forward restore the selection. The "Ke hari ini"
button returns to the current date and year. Planner text is at least 16px.

## License

[MIT](LICENSE)
