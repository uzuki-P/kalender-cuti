# Calendar conventions

All calendar views must start the week on Monday, Senin, and end on Sunday, Minggu. Build month grids with `monthGrid()` in `src/lib/breaks.ts`, which starts on Senin, in both monthly and yearly views.

Keep JavaScript weekday indexes unchanged, with Sunday at index 0. Calendar column order must follow the Monday-first convention, and Sunday header styling must target the last column.
