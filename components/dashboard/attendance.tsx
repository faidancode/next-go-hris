"use client";

import { useAuthStore } from "@/app/stores/auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useAttendances,
  useClockInAttendance,
  useClockOutAttendance,
} from "@/hooks/use-attendance";
import { getAttendanceStatusBadgeClass } from "@/lib/constants/attendance";
import { can } from "@/lib/rbac/can";
import { formatDateID, formatTimeID } from "@/lib/utils";
import { useEffect, useMemo, useState } from "react";

function getTodayDateKey() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export default function DashboardAttendance() {
  const user = useAuthStore((state) => state.user);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const employeeId = user?.employee_id;
  const [permissionLoading, setPermissionLoading] = useState(true);
  const [canReadAttendance, setCanReadAttendance] = useState(false);
  const [canCreateAttendance, setCanCreateAttendance] = useState(false);

  const attendancesQuery = useAttendances(
    1,
    50,
    "",
    "attendance_date:desc",
    employeeId,
    hasHydrated && canReadAttendance && Boolean(employeeId),
  );
  const clockInMutation = useClockInAttendance();
  const clockOutMutation = useClockOutAttendance();

  useEffect(() => {
    let mounted = true;

    async function bootstrap() {
      try {
        const [readAllowed, createAllowed] = await Promise.all([
          can("attendance", "read"),
          can("attendance", "create"),
        ]);

        if (!mounted) return;
        setCanReadAttendance(readAllowed);
        setCanCreateAttendance(createAllowed);
      } catch {
        if (!mounted) return;
      } finally {
        if (mounted) setPermissionLoading(false);
      }
    }

    void bootstrap();
    return () => {
      mounted = false;
    };
  }, []);

  const todayRecord = useMemo(() => {
    const todayKey = getTodayDateKey();
    return (attendancesQuery.data?.data ?? []).find(
      (item) => item.attendance_date === todayKey,
    );
  }, [attendancesQuery.data?.data]);

  const last5Days = useMemo(
    () => (attendancesQuery.data?.data ?? []).slice(0, 5),
    [attendancesQuery.data?.data],
  );

  const canClockIn = canCreateAttendance && !todayRecord;
  const canClockOut =
    canCreateAttendance && Boolean(todayRecord && !todayRecord.clock_out);
  const isMutating = clockInMutation.isPending || clockOutMutation.isPending;

  const handleClockIn = async () => {
    try {
      await clockInMutation.mutateAsync({
        source: "WEB",
        notes: "Demo clock in from dashboard",
      });
    } catch {
      // Error toast handled in hook.
    }
  };

  const handleClockOut = async () => {
    try {
      await clockOutMutation.mutateAsync({
        notes: "Demo clock out from dashboard",
      });
    } catch {
      // Error toast handled in hook.
    }
  };

  if (!canReadAttendance || !employeeId) return null;

  if (permissionLoading || attendancesQuery.isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-44 w-full" />
      </div>
    );
  }

  return (
    <>
      <div className="rounded-lg border bg-white p-4">
        <p className="text-sm text-muted-foreground">Today attendance</p>
        <p className="text-lg font-semibold">
          {!todayRecord
            ? "Not clocked in yet"
            : todayRecord.clock_out
              ? "Completed (Clock In & Out)"
              : "Clocked in, waiting clock out"}
        </p>

        <div className="mt-3 flex gap-2">
          <Button
            type="button"
            onClick={() => void handleClockIn()}
            disabled={!canClockIn || isMutating}
          >
            IN
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => void handleClockOut()}
            disabled={!canClockOut || isMutating}
          >
            OUT
          </Button>
        </div>
      </div>

      <div className="rounded-lg border bg-white overflow-hidden">
        <div className="px-4 py-3 border-b">
          <p className="font-semibold">Last 5 Days Attendance</p>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-muted/30 text-left">
            <tr>
              <th className="p-3">Date</th>
              <th className="p-3">IN</th>
              <th className="p-3">OUT</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {last5Days.length === 0 && (
              <tr>
                <td colSpan={4} className="p-4 text-muted-foreground">
                  No attendance data.
                </td>
              </tr>
            )}
            {last5Days.map((item) => (
              <tr key={item.id} className="border-t">
                <td className="p-3">{formatDateID(item.attendance_date)}</td>
                <td className="p-3">{formatTimeID(item.clock_in)}</td>
                <td className="p-3">{formatTimeID(item.clock_out)}</td>
                <td className="p-3">
                  <Badge
                    variant="outline"
                    className={getAttendanceStatusBadgeClass(item.status)}
                  >
                    {item.status || "-"}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
