"use client";

import { useAuthStore } from "@/app/stores/auth";
import { ForbiddenState } from "@/components/guard/ForbiddenState";
import AppHeader from "@/components/shared/app-header";
import { Skeleton } from "@/components/ui/skeleton";
import { useEmployees } from "@/hooks/use-employee";
import { can } from "@/lib/rbac/can";
import { formatDateID } from "@/lib/utils";
import { useEffect, useMemo, useState } from "react";

export default function EmployeeMePage() {
  const user = useAuthStore((state) => state.user);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const [permissionLoading, setPermissionLoading] = useState(true);
  const [canRead, setCanRead] = useState(false);

  const employeesQuery = useEmployees(
    1,
    100,
    user?.email ?? "",
    "full_name:asc",
    hasHydrated && canRead,
  );

  useEffect(() => {
    let mounted = true;

    async function bootstrap() {
      try {
        const readAllowed = await can("employee", "read");
        if (!mounted) return;
        setCanRead(readAllowed);
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

  const selfEmployee = useMemo(() => {
    const records = employeesQuery.data?.data ?? [];
    if (!records.length) return undefined;

    return (
      records.find((item) => item.id === user?.employee_id) ||
      records.find((item) => item.email === user?.email)
    );
  }, [employeesQuery.data?.data, user?.email, user?.employee_id]);

  if (!hasHydrated || permissionLoading || employeesQuery.isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-8 w-52" />
        <Skeleton className="h-44 w-full" />
      </div>
    );
  }

  if (!canRead) {
    return <ForbiddenState description="You are not allowed to read employee profile." />;
  }

  if (employeesQuery.error) {
    return (
      <ForbiddenState
        title="Request error"
        description={employeesQuery.error.message}
      />
    );
  }

  if (!selfEmployee) {
    return (
      <ForbiddenState
        title="Employee not found"
        description="Your employee profile could not be resolved."
      />
    );
  }

  return (
    <>
      <AppHeader title="My Profile" />
      <div className="container pt-6">
        <div className="rounded-lg border bg-white p-5 space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Full Name</p>
            <p className="font-medium">{selfEmployee.full_name || "-"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Email</p>
            <p className="font-medium">{selfEmployee.email || "-"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Employee Number</p>
            <p className="font-medium">{selfEmployee.employee_number || "-"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Phone</p>
            <p className="font-medium">{selfEmployee.phone || "-"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Hire Date</p>
            <p className="font-medium">{formatDateID(selfEmployee.hire_date)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Employment Status</p>
            <p className="font-medium">{selfEmployee.employment_status || "-"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Position</p>
            <p className="font-medium">{selfEmployee.position_name || "-"}</p>
          </div>
        </div>
      </div>
    </>
  );
}
