# Kalender Cuti

An Indonesian holiday planner built with React and Tailwind CSS.
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

Each page has month and year views, the next day off, details for the selected
date, each month's breaks, and leave suggestions that join breaks together.
A switch marks cuti bersama as annual leave for workplaces that deduct it:
those days then show as leave to take instead of free days off.
A second switch is for workplaces with a block leave (cuti wajib) of 5
consecutive workdays: each break is then offered the 5-workday block next to
it that makes the longest break, with red dates and weekends in between
costing no leave.
Below the calendar, "Cuti paling panjang" ranks the leave suggestions that
make the longest breaks, following both switches; past ones are drawn as an
outline rather than faded, so every card keeps WCAG AA contrast.
System, light, and dark appearance choices persist in the browser. Motion
respects the reduced-motion preference.

## Design system

Two meanings carry the whole interface:

- **Merah, a day off.** Every break (libur nasional, cuti bersama and the
  weekend joined to them) is drawn as one solid red block across the grid.
- **Stabilo, leave worth taking.** Workdays squeezed between breaks get a
  yellow highlighter mark. Pointing at one, or selecting it, sweeps the
  highlighter across the whole long weekend it would make.

- **Tokens.** `src/index.css` defines `paper`, `panel`, `line`, `ink`,
  `muted`, `merah`, `merah-ink`, `merah-soft` and `stabilo` for light and dark
  (`.dark` on `<html>`). Every text pair meets WCAG AA; the contrast ratios
  are listed next to the tokens.
- **Theme.** System, light or dark, cycled from the header and stored under
  `color-mode`. `index.html` applies it before first paint.
- **Type.** Plus Jakarta Sans for text and numerals (tabular), Bricolage
  Grotesque only for month names. Nothing is smaller than 13px.
- **Motion.** Red blocks wipe in left to right, the month grid slides toward
  the direction you moved, the day panel fades up, and choosing a month in
  the year view zooms it open with the View Transitions API. All of it is off
  under `prefers-reduced-motion`.
- **Input.** Arrow keys, Home/End and PageUp/PageDown move through the month
  grid; swiping left or right on a phone changes the month. Year-view days
  show a tooltip on hover or keyboard focus.

## Layout

- `src/data/years.ts` holds holiday data and year metadata.
- `src/lib/calendar.ts` derives month grids, statistics, and long weekends.
- `src/lib/breaks.ts` groups days off into breaks and finds leave suggestions.
- `src/components/` holds the header, month view, day panel and year view.
- `scripts/prerender.mjs` writes static HTML for each year after the Vite builds.

## Build

```sh
pnpm install
just build       # compile React and prerender dist/
just dev         # Vite development server with hot reload
just check       # typecheck and lint
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
Reloading and browser Back/Forward restore the selection; `?view=year` opens
the year view. The "Hari ini" button returns to the current date and year.

## License

[MIT](LICENSE)
