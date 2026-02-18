export const ATTENDANCE_STATUSES = ["PRESENT", "LATE"] as const;

export type AttendanceStatus = (typeof ATTENDANCE_STATUSES)[number];

export const ATTENDANCE_STATUS_BADGE_CLASS: Record<AttendanceStatus, string> = {
  PRESENT: "bg-emerald-100 text-emerald-700 border-emerald-200",
  LATE: "bg-red-100 text-red-700 border-red-200",
};

export const ATTENDANCE_STATUS_BADGE_FALLBACK_CLASS =
  "bg-slate-100 text-slate-700 border-slate-200";

export function getAttendanceStatusBadgeClass(status: string): string {
  return (
    ATTENDANCE_STATUS_BADGE_CLASS[status as AttendanceStatus] ??
    ATTENDANCE_STATUS_BADGE_FALLBACK_CLASS
  );
}
