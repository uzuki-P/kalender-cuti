import { useState } from "react"

import { Button } from "@/components/m3e/button"
import { Icon } from "@/components/m3e/icon"

import { DateLegend } from "./kind"

/**
 * The page-wide colour key for desktop: a floating card in the bottom-right
 * corner that starts folded and opens when the reader clicks Keterangan.
 * Phones get the same key from the floating toolbar (see header.tsx).
 */
export function LegendDock() {
  const [open, setOpen] = useState(false)
  return (
    <aside aria-label="Keterangan warna tanggal" className="fixed right-6 bottom-6 z-30 max-lg:hidden">
      {open ? (
        <div className="animate-pop flex w-80 origin-bottom-right flex-col gap-3 rounded-3xl bg-surface-container-high p-4 pt-3 shadow-elevation-3 ring-1 ring-outline-variant">
          <div className="flex items-center justify-between gap-2">
            <h2 className="flex items-center gap-2 text-title-small text-on-surface">
              <Icon name="palette" size={20} className="text-primary" />
              Keterangan warna
            </h2>
            <Button variant="ghost" size="icon-sm" aria-label="Tutup keterangan" onClick={() => setOpen(false)}>
              <Icon name="close" size={20} />
            </Button>
          </div>
          <DateLegend />
        </div>
      ) : (
        <Button
          variant="tonal"
          size="md"
          className="animate-pop origin-bottom-right shadow-elevation-3"
          aria-expanded={false}
          onClick={() => setOpen(true)}
        >
          <Icon name="palette" />
          Keterangan
        </Button>
      )}
    </aside>
  )
}
