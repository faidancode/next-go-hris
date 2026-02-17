"use client";

import { Can } from "@/components/guard/Can";
import { ForbiddenState } from "@/components/guard/ForbiddenState";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { apiClient } from "@/lib/api/client";
import { can } from "@/lib/rbac/can";
import { useEffect, useState } from "react";

type Department = {
  id: string;
  name: string;
};

function normalizeDepartments(payload: unknown): Department[] {
  if (Array.isArray(payload)) return payload as Department[];
  if (payload && typeof payload === "object") {
    const body = payload as Record<string, unknown>;
    if (Array.isArray(body.items)) return body.items as Department[];
  }
  return [];
}

export default function DepartmentsPage() {
  const [loading, setLoading] = useState(true);
  const [canRead, setCanRead] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const allowed = await can("department", "read");
        if (!mounted) return;

        setCanRead(allowed);
        if (!allowed) return;

        const response = await apiClient.get<unknown>("/departments");
        if (!mounted) return;
        setDepartments(normalizeDepartments(response));
      } catch (err) {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : "Failed to load departments.");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();

    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-8 w-52" />
        <Skeleton className="h-28 w-full" />
      </div>
    );
  }

  if (!canRead) {
    return <ForbiddenState description="You are not allowed to read departments." />;
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Departments</h1>
        <Can
          resource="department"
          action="create"
          fallback={null}
          loadingFallback={<Skeleton className="h-9 w-28" />}
        >
          <Button type="button">Create Department</Button>
        </Can>
      </div>

      {error && <ForbiddenState title="Request error" description={error} />}

      <div className="rounded-lg border bg-white">
        <ul className="divide-y">
          {departments.length === 0 && (
            <li className="p-4 text-sm text-muted-foreground">No departments available.</li>
          )}
          {departments.map((item) => (
            <li key={item.id} className="p-4 text-sm">
              {item.name}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
