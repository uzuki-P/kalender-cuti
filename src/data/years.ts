/*
 * Indonesian holiday dates for Kalenderku.
 *
 * 2026 is preserved from the archived kalenderku.id/2026 page
 * (SKB 3 Menteri Tahun 2025). 2027 comes from the official SKB 3 Menteri
 * Tahun 2026 (No. 1205/3/2 Tahun 2026, signed 15 September 2026):
 * https://setneg.go.id/baca/index/inilah_skb_3_menteri_libur_nasional_dan_cuti_bersama_2027
 *
 * 2023-2025 follow each year's SKB 3 Menteri with its amendments, as
 * published by Setkab: 2023 adds the Iduladha cuti bersama of 28 and 30 June
 * (SKB of 16 June 2023), 2025 adds the 18 August cuti bersama for the 80th
 * Independence Day. Names follow this site's wording (Yesus Kristus rather
 * than the older SKBs' Isa Almasih) so the lists read the same every year.
 */

export type HolidayKind = "libur" | "cuti"

export type Holiday = {
  /** ISO date, YYYY-MM-DD */
  date: string
  /** name without the "Cuti " prefix */
  name: string
  kind: HolidayKind
}

export type YearData = {
  holidays: Holiday[]
  meta: {
    hijriah: string
    shio: { emoji: string; name: string }
    jawa: string
  }
  /** [name, "d Bulan"] pairs quoted in the hero paragraph */
  heroMoments: [string, string][]
  skbNote: string
}

const L = (date: string, name: string): Holiday => ({ date, name, kind: "libur" })
const C = (date: string, name: string): Holiday => ({ date, name, kind: "cuti" })

export const holidayLabel = (h: Holiday) =>
  h.kind === "cuti" ? `Cuti ${h.name}` : h.name

export const YEARS: Record<number, YearData> = {
  2023: {
    holidays: [
      L("2023-01-01", "Tahun Baru Masehi 2023"),
      L("2023-01-22", "Tahun Baru Imlek 2574 Kongzili"),
      C("2023-01-23", "Tahun Baru Imlek 2574 Kongzili"),
      L("2023-02-18", "Isra Mikraj Nabi Muhammad SAW"),
      L("2023-03-22", "Hari Suci Nyepi Tahun Baru Saka 1945"),
      C("2023-03-23", "Hari Suci Nyepi Tahun Baru Saka 1945"),
      L("2023-04-07", "Wafat Yesus Kristus"),
      C("2023-04-19", "Hari Raya Idulfitri 1444 Hijriah"),
      C("2023-04-20", "Hari Raya Idulfitri 1444 Hijriah"),
      C("2023-04-21", "Hari Raya Idulfitri 1444 Hijriah"),
      L("2023-04-22", "Hari Raya Idulfitri 1444 Hijriah"),
      L("2023-04-23", "Hari Raya Idulfitri 1444 Hijriah"),
      C("2023-04-24", "Hari Raya Idulfitri 1444 Hijriah"),
      C("2023-04-25", "Hari Raya Idulfitri 1444 Hijriah"),
      L("2023-05-01", "Hari Buruh Internasional"),
      L("2023-05-18", "Kenaikan Yesus Kristus"),
      L("2023-06-01", "Hari Lahir Pancasila"),
      C("2023-06-02", "Hari Raya Waisak 2567"),
      L("2023-06-04", "Hari Raya Waisak 2567"),
      C("2023-06-28", "Hari Raya Iduladha 1444 Hijriah"),
      L("2023-06-29", "Hari Raya Iduladha 1444 Hijriah"),
      C("2023-06-30", "Hari Raya Iduladha 1444 Hijriah"),
      L("2023-07-19", "Tahun Baru Islam 1445 Hijriah"),
      L("2023-08-17", "Hari Kemerdekaan Republik Indonesia"),
      L("2023-09-28", "Maulid Nabi Muhammad SAW"),
      L("2023-12-25", "Hari Raya Natal"),
      C("2023-12-26", "Hari Raya Natal"),
    ],
    meta: {
      hijriah: "1444-1445 H",
      shio: { emoji: "🐰", name: "Shio Kelinci" },
      jawa: "1956 Ehe",
    },
    heroMoments: [
      ["Tahun Baru Masehi 2023", "1 Januari"],
      ["Hari Raya Idulfitri 1444 Hijriah", "22 April"],
      ["Kenaikan Yesus Kristus", "18 Mei"],
      ["Tahun Baru Islam 1445 Hijriah", "19 Juli"],
      ["Hari Raya Natal", "25 Desember"],
    ],
    skbNote: "Data SKB 3 Menteri Tahun 2022 beserta perubahannya",
  },
  2024: {
    holidays: [
      L("2024-01-01", "Tahun Baru Masehi 2024"),
      L("2024-02-08", "Isra Mikraj Nabi Muhammad SAW"),
      C("2024-02-09", "Tahun Baru Imlek 2575 Kongzili"),
      L("2024-02-10", "Tahun Baru Imlek 2575 Kongzili"),
      L("2024-03-11", "Hari Suci Nyepi Tahun Baru Saka 1946"),
      C("2024-03-12", "Hari Suci Nyepi Tahun Baru Saka 1946"),
      L("2024-03-29", "Wafat Yesus Kristus"),
      L("2024-03-31", "Hari Paskah"),
      C("2024-04-08", "Hari Raya Idulfitri 1445 Hijriah"),
      C("2024-04-09", "Hari Raya Idulfitri 1445 Hijriah"),
      L("2024-04-10", "Hari Raya Idulfitri 1445 Hijriah"),
      L("2024-04-11", "Hari Raya Idulfitri 1445 Hijriah"),
      C("2024-04-12", "Hari Raya Idulfitri 1445 Hijriah"),
      C("2024-04-15", "Hari Raya Idulfitri 1445 Hijriah"),
      L("2024-05-01", "Hari Buruh Internasional"),
      L("2024-05-09", "Kenaikan Yesus Kristus"),
      C("2024-05-10", "Kenaikan Yesus Kristus"),
      L("2024-05-23", "Hari Raya Waisak 2568"),
      C("2024-05-24", "Hari Raya Waisak 2568"),
      L("2024-06-01", "Hari Lahir Pancasila"),
      L("2024-06-17", "Hari Raya Iduladha 1445 Hijriah"),
      C("2024-06-18", "Hari Raya Iduladha 1445 Hijriah"),
      L("2024-07-07", "Tahun Baru Islam 1446 Hijriah"),
      L("2024-08-17", "Hari Kemerdekaan Republik Indonesia"),
      L("2024-09-16", "Maulid Nabi Muhammad SAW"),
      L("2024-12-25", "Hari Raya Natal"),
      C("2024-12-26", "Hari Raya Natal"),
    ],
    meta: {
      hijriah: "1445-1446 H",
      shio: { emoji: "🐲", name: "Shio Naga" },
      jawa: "1957 Jimawal",
    },
    heroMoments: [
      ["Tahun Baru Masehi 2024", "1 Januari"],
      ["Hari Raya Idulfitri 1445 Hijriah", "10 April"],
      ["Kenaikan Yesus Kristus", "9 Mei"],
      ["Tahun Baru Islam 1446 Hijriah", "7 Juli"],
      ["Hari Raya Natal", "25 Desember"],
    ],
    skbNote: "Data SKB 3 Menteri Tahun 2023",
  },
  2025: {
    holidays: [
      L("2025-01-01", "Tahun Baru Masehi 2025"),
      L("2025-01-27", "Isra Mikraj Nabi Muhammad SAW"),
      C("2025-01-28", "Tahun Baru Imlek 2576 Kongzili"),
      L("2025-01-29", "Tahun Baru Imlek 2576 Kongzili"),
      C("2025-03-28", "Hari Suci Nyepi Tahun Baru Saka 1947"),
      L("2025-03-29", "Hari Suci Nyepi Tahun Baru Saka 1947"),
      L("2025-03-31", "Hari Raya Idulfitri 1446 Hijriah"),
      L("2025-04-01", "Hari Raya Idulfitri 1446 Hijriah"),
      C("2025-04-02", "Hari Raya Idulfitri 1446 Hijriah"),
      C("2025-04-03", "Hari Raya Idulfitri 1446 Hijriah"),
      C("2025-04-04", "Hari Raya Idulfitri 1446 Hijriah"),
      C("2025-04-07", "Hari Raya Idulfitri 1446 Hijriah"),
      L("2025-04-18", "Wafat Yesus Kristus"),
      L("2025-04-20", "Hari Paskah"),
      L("2025-05-01", "Hari Buruh Internasional"),
      L("2025-05-12", "Hari Raya Waisak 2569"),
      C("2025-05-13", "Hari Raya Waisak 2569"),
      L("2025-05-29", "Kenaikan Yesus Kristus"),
      C("2025-05-30", "Kenaikan Yesus Kristus"),
      L("2025-06-01", "Hari Lahir Pancasila"),
      L("2025-06-06", "Hari Raya Iduladha 1446 Hijriah"),
      C("2025-06-09", "Hari Raya Iduladha 1446 Hijriah"),
      L("2025-06-27", "Tahun Baru Islam 1447 Hijriah"),
      L("2025-08-17", "Hari Kemerdekaan Republik Indonesia"),
      C("2025-08-18", "Hari Kemerdekaan Republik Indonesia"),
      L("2025-09-05", "Maulid Nabi Muhammad SAW"),
      L("2025-12-25", "Hari Raya Natal"),
      C("2025-12-26", "Hari Raya Natal"),
    ],
    meta: {
      hijriah: "1446-1447 H",
      shio: { emoji: "🐍", name: "Shio Ular" },
      jawa: "1958 Je",
    },
    heroMoments: [
      ["Tahun Baru Masehi 2025", "1 Januari"],
      ["Hari Raya Idulfitri 1446 Hijriah", "31 Maret"],
      ["Kenaikan Yesus Kristus", "29 Mei"],
      ["Tahun Baru Islam 1447 Hijriah", "27 Juni"],
      ["Hari Raya Natal", "25 Desember"],
    ],
    skbNote: "Data SKB 3 Menteri Tahun 2024 beserta perubahannya",
  },
  2026: {
    holidays: [
      L("2026-01-01", "Tahun Baru Masehi 2026"),
      L("2026-01-16", "Isra Mikraj Nabi Muhammad SAW"),
      C("2026-02-16", "Tahun Baru Imlek 2577 Kongzili"),
      L("2026-02-17", "Tahun Baru Imlek 2577 Kongzili"),
      C("2026-03-18", "Hari Suci Nyepi Tahun Baru Saka 1948"),
      L("2026-03-19", "Hari Suci Nyepi Tahun Baru Saka 1948"),
      C("2026-03-20", "Hari Raya Idulfitri 1447 Hijriah"),
      L("2026-03-21", "Hari Raya Idulfitri 1447 Hijriah"),
      L("2026-03-22", "Hari Raya Idulfitri 1447 Hijriah"),
      C("2026-03-23", "Hari Raya Idulfitri 1447 Hijriah"),
      C("2026-03-24", "Hari Raya Idulfitri 1447 Hijriah"),
      L("2026-04-03", "Wafat Yesus Kristus"),
      L("2026-04-05", "Hari Paskah"),
      L("2026-05-01", "Hari Buruh Internasional"),
      L("2026-05-14", "Kenaikan Yesus Kristus"),
      C("2026-05-15", "Kenaikan Yesus Kristus"),
      L("2026-05-27", "Hari Raya Iduladha 1447 Hijriah"),
      C("2026-05-28", "Hari Raya Iduladha 1447 Hijriah"),
      L("2026-05-31", "Hari Raya Waisak 2570"),
      L("2026-06-01", "Hari Lahir Pancasila"),
      L("2026-06-16", "Tahun Baru Islam 1448 Hijriah"),
      L("2026-08-17", "Hari Kemerdekaan Republik Indonesia"),
      L("2026-08-25", "Maulid Nabi Muhammad SAW"),
      C("2026-12-24", "Hari Raya Natal"),
      L("2026-12-25", "Hari Raya Natal"),
    ],
    meta: {
      hijriah: "1447-1448 H",
      shio: { emoji: "🐴", name: "Shio Kuda" },
      jawa: "1959 Dal",
    },
    heroMoments: [
      ["Tahun Baru Masehi 2026", "1 Januari"],
      ["Hari Raya Idulfitri 1447 Hijriah", "21 Maret"],
      ["Kenaikan Yesus Kristus", "14 Mei"],
      ["Tahun Baru Islam 1448 Hijriah", "16 Juni"],
      ["Hari Raya Natal", "25 Desember"],
    ],
    skbNote: "Data SKB 3 Menteri Tahun 2025",
  },
  2027: {
    holidays: [
      L("2027-01-01", "Tahun Baru Masehi 2027"),
      L("2027-01-05", "Isra Mikraj Nabi Muhammad SAW"),
      C("2027-02-05", "Tahun Baru Imlek 2578 Kongzili"),
      L("2027-02-06", "Tahun Baru Imlek 2578 Kongzili"),
      L("2027-03-08", "Hari Suci Nyepi Tahun Baru Saka 1949"),
      C("2027-03-09", "Hari Raya Idulfitri 1448 Hijriah"),
      L("2027-03-10", "Hari Raya Idulfitri 1448 Hijriah"),
      L("2027-03-11", "Hari Raya Idulfitri 1448 Hijriah"),
      C("2027-03-12", "Hari Raya Idulfitri 1448 Hijriah"),
      C("2027-03-15", "Hari Raya Idulfitri 1448 Hijriah"),
      C("2027-03-25", "Wafat Yesus Kristus"),
      L("2027-03-26", "Wafat Yesus Kristus"),
      L("2027-03-28", "Hari Paskah"),
      L("2027-05-01", "Hari Buruh Internasional"),
      L("2027-05-06", "Kenaikan Yesus Kristus"),
      L("2027-05-17", "Hari Raya Iduladha 1448 Hijriah"),
      C("2027-05-18", "Hari Raya Iduladha 1448 Hijriah"),
      C("2027-05-19", "Hari Raya Waisak 2571"),
      L("2027-05-20", "Hari Raya Waisak 2571"),
      L("2027-06-01", "Hari Lahir Pancasila"),
      L("2027-06-06", "Tahun Baru Islam 1449 Hijriah"),
      L("2027-08-15", "Maulid Nabi Muhammad SAW"),
      L("2027-08-17", "Hari Kemerdekaan Republik Indonesia"),
      C("2027-12-24", "Hari Raya Natal"),
      L("2027-12-25", "Hari Raya Natal"),
      L("2027-12-26", "Isra Mikraj Nabi Muhammad SAW"),
    ],
    meta: {
      hijriah: "1448-1449 H",
      shio: { emoji: "🐐", name: "Shio Kambing" },
      jawa: "1960 Be",
    },
    heroMoments: [
      ["Tahun Baru Masehi 2027", "1 Januari"],
      ["Hari Raya Idulfitri 1448 Hijriah", "10 Maret"],
      ["Kenaikan Yesus Kristus", "6 Mei"],
      ["Tahun Baru Islam 1449 Hijriah", "6 Juni"],
      ["Hari Raya Natal", "25 Desember"],
    ],
    skbNote: "Data SKB 3 Menteri Tahun 2026 (No. 1205/3/2 Tahun 2026)",
  },
}

/** the year served at `/` */
export const DEFAULT_YEAR = Math.max(...Object.keys(YEARS).map(Number))

export const yearPath = (year: number) =>
  year === DEFAULT_YEAR ? "/" : `/${year}/`

export const SKB_URL =
  "https://setneg.go.id/baca/index/inilah_skb_3_menteri_libur_nasional_dan_cuti_bersama_2027"
