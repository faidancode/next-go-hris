"use client";

import { Can } from "@/components/guard/Can";
import { ForbiddenState } from "@/components/guard/ForbiddenState";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { apiClient } from "@/lib/api/client";
import { can } from "@/lib/rbac/can";
import { useEffect, useState } from "react";

type Leave = {
  id: string;
  employee_name?: string;
  status?: string;
};

function normalizeLeaves(payload: unknown): Leave[] {
  if (Array.isArray(payload)) return payload as Leave[];
  if (payload && typeof payload === "object") {
    const body = payload as Record<string, unknown>;
    if (Array.isArray(body.items)) return body.items as Leave[];
  }
  return [];
}

export default function LeavesPage() {
  const [loading, setLoading] = useState(true);
  const [canRead, setCanRead] = useState(false);
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const allowed = await can("leave", "read");
        if (!mounted) return;

        setCanRead(allowed);
        if (!allowed) return;

        const response = await apiClient.get<unknown>("/leaves");
        if (!mounted) return;
        setLeaves(normalizeLeaves(response));
      } catch (err) {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : "Failed to load leaves.");
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
    return <ForbiddenState description="You are not allowed to read leaves." />;
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Leaves</h1>
        <Can resource="leave" action="create" fallback={null}>
          <Button type="button">Create Leave</Button>
        </Can>
      </div>

      {error && <ForbiddenState title="Request error" description={error} />}

      <div className="overflow-hidden rounded-lg border bg-white">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-left">
            <tr>
              <th className="p-3">Employee</th>
              <th className="p-3">Status</th>
              <th className="p-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {leaves.length === 0 && (
              <tr>
                <td colSpan={3} className="p-4 text-muted-foreground">
                  No leave records.
                </td>
              </tr>
            )}
            {leaves.map((item) => (
              <tr key={item.id} className="border-t">
                <td className="p-3">{item.employee_name || "-"}</td>
                <td className="p-3">{item.status || "-"}</td>
                <td className="p-3">
                  <div className="flex gap-2">
                    <Can resource="leave" action="approve" fallback={null}>
                      <Button size="sm" variant="outline">
                        Approve
                      </Button>
                    </Can>
                    <Can resource="leave" action="approve" fallback={null}>
                      <Button size="sm" variant="ghost">
                        Reject
                      </Button>
                    </Can>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
