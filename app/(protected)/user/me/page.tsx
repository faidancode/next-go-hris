"use client";

import { useAuthStore } from "@/app/stores/auth";
import { ForbiddenState } from "@/components/guard/ForbiddenState";
import AppHeader from "@/components/shared/app-header";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useEmployeeById } from "@/hooks/use-employee";
import { can } from "@/lib/rbac/can";
import { formatDateID } from "@/lib/utils";
import { useEffect, useState } from "react";

export default function EmployeeMePage() {
  const user = useAuthStore((state) => state.user);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const [permissionLoading, setPermissionLoading] = useState(true);
  const [canRead, setCanRead] = useState(false);
  const employeeId = user?.employee_id ?? "";

  const employeeQuery = useEmployeeById(employeeId, hasHydrated && canRead);

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

  if (!hasHydrated || permissionLoading || employeeQuery.isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-8 w-52" />
        <Skeleton className="h-44 w-full" />
      </div>
    );
  }

  if (!canRead) {
    return (
      <ForbiddenState description="You are not allowed to read employee profile." />
    );
  }

  if (!employeeId) {
    return (
      <ForbiddenState
        title="Employee not found"
        description="Your account is not linked to an employee profile."
      />
    );
  }

  if (employeeQuery.error) {
    return (
      <ForbiddenState
        title="Request error"
        description={employeeQuery.error.message}
      />
    );
  }

  if (!employeeQuery.data) {
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
            <p className="font-medium">{employeeQuery.data.full_name || "-"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Email</p>
            <p className="font-medium">{employeeQuery.data.email || "-"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Employee Number</p>
            <p className="font-medium">
              {employeeQuery.data.employee_number || "-"}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Phone</p>
            <p className="font-medium">{employeeQuery.data.phone || "-"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Hire Date</p>
            <p className="font-medium">
              {formatDateID(employeeQuery.data.hire_date)}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Employment Status</p>
            <Badge
              className={
                employeeQuery.data.employment_status === "active"
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-100 text-gray-700"
              }
            >
              <p className="capitalize font-medium">
                {employeeQuery.data.employment_status || "-"}
              </p>
            </Badge>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Position</p>
            <p className="font-medium">
              {employeeQuery.data.position?.name || "-"}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Department</p>
            <p className="font-medium">
              {employeeQuery.data.department?.name || "-"}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
