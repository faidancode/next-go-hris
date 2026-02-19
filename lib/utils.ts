import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type DateFormat = "full" | "short" | "compact";

/**
 * Memformat tanggal ke berbagai gaya Indonesia
 * @param date - Input tanggal (string/Date)
 * @param style - "full" (18 Februari 2026), "short" (18-Feb-2026), "compact" (18-02-2026)
 */
export const formatDateID = (
  date: string | Date | undefined | null,
  style: DateFormat = "full",
): string => {
  if (!date) return "-";

  const d = new Date(date);
  if (isNaN(d.getTime())) return "-";

  switch (style) {
    case "compact":
      // Hasil: 18-02-2026
      return new Intl.DateTimeFormat("id-ID", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
        .format(d)
        .replace(/\//g, "-");

    case "short":
      // Hasil: 18-Feb-2026
      const parts = new Intl.DateTimeFormat("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }).formatToParts(d);

      const day = parts.find((p) => p.type === "day")?.value;
      const month = parts.find((p) => p.type === "month")?.value;
      const year = parts.find((p) => p.type === "year")?.value;

      return `${day}-${month}-${year}`;

    case "full":
    default:
      // Hasil: 18 Februari 2026
      return new Intl.DateTimeFormat("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(d);
  }
};

export const formatDateRangeID = (
  start: string | Date | undefined | null,
  end: string | Date | undefined | null,
  style: DateFormat = "short",
): string => {
  if (!start && !end) return "-";
  if (!end) return formatDateID(start, style);
  if (!start) return formatDateID(end, style);

  const startDate = new Date(start);
  const endDate = new Date(end);

  // Jika tanggal sama persis, tampilkan satu saja
  if (startDate.getTime() === endDate.getTime()) {
    return formatDateID(start, style);
  }

  // Jika hari berbeda tapi bulan & tahun sama (Contoh: 18 - 20 Feb 2026)
  if (
    startDate.getMonth() === endDate.getMonth() &&
    startDate.getFullYear() === endDate.getFullYear()
  ) {
    const startDay = startDate.getDate().toString().padStart(2, "0");
    return `${startDay} - ${formatDateID(endDate, style)}`;
  }

  // Default: 18-Feb-2026 - 20-Mar-2026
  return `${formatDateID(start, style)} - ${formatDateID(end, style)}`;
};

/**
 * Memformat string waktu atau objek Date ke format jam Indonesia
 * Contoh: 2026-02-18T08:00:00 -> 08:00
 */
export const formatTimeID = (
  date: string | Date | undefined | null,
): string => {
  if (!date) return "-";

  const d = new Date(date);
  if (isNaN(d.getTime())) {
    // Jika input hanya string waktu "08:00:00", kita akali dengan menambah prefix tanggal dummy
    const timeOnly = new Date(`1970-01-01T${date}`);
    if (isNaN(timeOnly.getTime())) return "-";
    return formatTimeRaw(timeOnly);
  }

  return formatTimeRaw(d);
};

// Helper internal untuk konsistensi format 00:00
const formatTimeRaw = (date: Date): string => {
  return new Intl.DateTimeFormat("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })
    .format(date)
    .replace(/\./g, ":"); // Intl ID terkadang menggunakan titik (08.00)
};

export function getTodayDateKey() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function formatSalaryInput(value: number) {
  return new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: 0,
  }).format(value);
}
