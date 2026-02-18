"use client";

import { Can } from "@/components/guard/Can";
import { ForbiddenState } from "@/components/guard/ForbiddenState";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { apiClient } from "@/lib/api/client";
import { can } from "@/lib/rbac/can";
import { useEffect, useState } from "react";

type Payroll = {
  id: string;
  period?: string;
  status?: string;
};

function normalizePayrolls(payload: unknown): Payroll[] {
  if (Array.isArray(payload)) return payload as Payroll[];
  if (payload && typeof payload === "object") {
    const body = payload as Record<string, unknown>;
    if (Array.isArray(body.items)) return body.items as Payroll[];
  }
  return [];
}

export default function PayrollsPage() {
  const [loading, setLoading] = useState(true);
  const [canRead, setCanRead] = useState(false);
  const [payrolls, setPayrolls] = useState<Payroll[]>([]);
  const [error, setError] = useState<string | null>(null);
  console.log({ payrolls });

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const allowed = await can("payroll", "read");
        if (!mounted) return;

        setCanRead(allowed);
        if (!allowed) return;

        const response = await apiClient.get<unknown>("/payrolls");
        if (!mounted) return;
        setPayrolls(normalizePayrolls(response));
      } catch (err) {
        if (!mounted) return;
        setError(
          err instanceof Error ? err.message : "Failed to load payrolls.",
        );
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
    return (
      <ForbiddenState description="You are not allowed to read payrolls." />
    );
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Payrolls</h1>
        <Can resource="payroll" action="create" fallback={null}>
          <Button type="button">Create Payroll</Button>
        </Can>
      </div>

      {error && <ForbiddenState title="Request error" description={error} />}

      <div className="overflow-hidden rounded-lg border bg-white">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-left">
            <tr>
              <th className="p-3">Period</th>
              <th className="p-3">Status</th>
              <th className="p-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {payrolls.length === 0 && (
              <tr>
                <td colSpan={3} className="p-4 text-muted-foreground">
                  No payroll records.
                </td>
              </tr>
            )}
            {payrolls.map((item) => (
              <tr key={item.id} className="border-t">
                <td className="p-3">{item.period || "-"}</td>
                <td className="p-3">{item.status || "-"}</td>
                <td className="p-3">
                  <Can
                    resource="payroll"
                    action="approve"
                    fallback={
                      <span className="text-muted-foreground">No access</span>
                    }
                  >
                    <Button size="sm" variant="outline">
                      Approve
                    </Button>
                  </Can>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
