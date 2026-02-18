"use client";

import { ForbiddenState } from "@/components/guard/ForbiddenState";
import AppHeader from "@/components/shared/app-header";
import { DataTable } from "@/components/shared/table/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useLeaveSheet } from "@/hooks/use-leave-sheet";
import {
  useApproveLeave,
  useDeleteLeave,
  useLeaves,
  useRejectLeave,
  useSubmitLeave,
} from "@/hooks/use-leave";
import { getSession } from "@/lib/auth/session";
import { can } from "@/lib/rbac/can";
import { PlusCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { useDebounce } from "use-debounce";
import { columns } from "./columns";
import LeaveSheet from "./sheet";

export default function LeavesPage() {
  const [permissionLoading, setPermissionLoading] = useState(true);
  const [canRead, setCanRead] = useState(false);
  const [canCreate, setCanCreate] = useState(false);
  const [canApprove, setCanApprove] = useState(false);

  const { openCreate } = useLeaveSheet();
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebounce(search, 300);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sort, setSort] = useState("start_date:desc");

  const leavesQuery = useLeaves(page, pageSize, debouncedSearch, sort, canRead);
  const submitLeaveMutation = useSubmitLeave();
  const approveLeaveMutation = useApproveLeave();
  const rejectLeaveMutation = useRejectLeave();
  const deleteLeaveMutation = useDeleteLeave();

  useEffect(() => {
    let mounted = true;

    async function bootstrap() {
      try {
        const [readAllowed, createAllowed, approveAllowed] = await Promise.all([
          can("leave", "read"),
          can("leave", "create"),
          can("leave", "approve"),
        ]);

        if (!mounted) return;

        setCanRead(readAllowed);
        setCanCreate(createAllowed);
        setCanApprove(approveAllowed);

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

  const handleApprove = async (id: string) => {
    try {
      await approveLeaveMutation.mutateAsync(id);
    } catch {
      // Error toast is handled in useApproveLeave hook.
    }
  };

  const handleSubmit = async (id: string) => {
    try {
      await submitLeaveMutation.mutateAsync(id);
    } catch {
      // Error toast is handled in useSubmitLeave hook.
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteLeaveMutation.mutateAsync(id);
    } catch {
      // Error toast is handled in useDeleteLeave hook.
    }
  };

  const handleReject = async (id: string, reason: string) => {
    try {
      await rejectLeaveMutation.mutateAsync({
        id,
        payload: { rejection_reason: reason },
      });
    } catch {
      // Error toast is handled in useRejectLeave hook.
    }
  };

  if (permissionLoading || leavesQuery.isLoading) {
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
    <>
      <AppHeader title="Leaves" />

      <div className="container pt-2">
        <div className="flex items-center justify-between mb-4 mt-6 gap-2">
          <Input
            type="text"
            placeholder="Search leave..."
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            className="bg-white p-2 border rounded-lg w-64"
          />

          {canCreate && (
            <Button onClick={openCreate}>
              <PlusCircle className="size-4" /> Create Leave
            </Button>
          )}
        </div>

        {leavesQuery.error ? (
          <ForbiddenState
            title="Request error"
            description={leavesQuery.error.message}
          />
        ) : (
          <DataTable
            key={`${page}-${pageSize}`}
            columns={columns({
              canCreate,
              canApprove,
              onSubmit: (id) => {
                void handleSubmit(id);
              },
              onApprove: (id) => {
                void handleApprove(id);
              },
              onReject: (id, reason) => {
                void handleReject(id, reason);
              },
              onDelete: (id) => {
                void handleDelete(id);
              },
            })}
            data={leavesQuery.data?.data ?? []}
            page={page}
            setPage={setPage}
            pageSize={pageSize}
            setPageSize={setPageSize}
            totalPages={leavesQuery.data?.meta.totalPages ?? 1}
            sort={sort}
            setSort={setSort}
          />
        )}
      </div>

      <LeaveSheet employeeId={getSession()?.user?.employee_id} />
    </>
  );
}
