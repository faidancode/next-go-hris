"use client";

import { ForbiddenState } from "@/components/guard/ForbiddenState";
import AppHeader from "@/components/shared/app-header";
import { DataTable } from "@/components/shared/table/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useAttendances,
  useClockInAttendance,
  useClockOutAttendance,
} from "@/hooks/use-attendance";
import { can } from "@/lib/rbac/can";
import { useEffect, useMemo, useState } from "react";
import { useDebounce } from "use-debounce";
import { columns } from "./columns";

function getTodayDateKey() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export default function AttendancesPage() {
  const [permissionLoading, setPermissionLoading] = useState(true);
  const [canRead, setCanRead] = useState(false);
  const [canCreate, setCanCreate] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebounce(search, 300);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sort, setSort] = useState("attendance_date:desc");

  const attendancesQuery = useAttendances(
    page,
    pageSize,
    debouncedSearch,
    sort,
    canRead,
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
        setCanRead(readAllowed);
        setCanCreate(createAllowed);
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

  const canClockIn = canCreate && !todayRecord;
  const canClockOut = canCreate && Boolean(todayRecord && !todayRecord.clock_out);
  const isMutating = clockInMutation.isPending || clockOutMutation.isPending;

  const handleClockIn = async () => {
    try {
      await clockInMutation.mutateAsync({
        source: "WEB",
        notes: "Demo clock in from web",
      });
    } catch {
      // Error toast handled in hook.
    }
  };

  const handleClockOut = async () => {
    try {
      await clockOutMutation.mutateAsync({
        notes: "Demo clock out from web",
      });
    } catch {
      // Error toast handled in hook.
    }
  };

  if (permissionLoading || attendancesQuery.isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-8 w-52" />
        <Skeleton className="h-28 w-full" />
      </div>
    );
  }

  if (!canRead) {
    return <ForbiddenState description="You are not allowed to read attendance." />;
  }

  return (
    <>
      <AppHeader title="Attendance" />

      <div className="container pt-2 space-y-4">
        <div className="rounded-lg border bg-white p-4">
          <p className="text-sm text-muted-foreground">Today status</p>
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
              Clock In
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => void handleClockOut()}
              disabled={!canClockOut || isMutating}
            >
              Clock Out
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2">
          <Input
            type="text"
            placeholder="Search attendance..."
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            className="bg-white p-2 border rounded-lg w-64"
          />
        </div>

        {attendancesQuery.error ? (
          <ForbiddenState
            title="Request error"
            description={attendancesQuery.error.message}
          />
        ) : (
          <DataTable
            key={`${page}-${pageSize}`}
            columns={columns}
            data={attendancesQuery.data?.data ?? []}
            page={page}
            setPage={setPage}
            pageSize={pageSize}
            setPageSize={setPageSize}
            totalPages={attendancesQuery.data?.meta.totalPages ?? 1}
            sort={sort}
            setSort={setSort}
          />
        )}
      </div>
    </>
  );
}

