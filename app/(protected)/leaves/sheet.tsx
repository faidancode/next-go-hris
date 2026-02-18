"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useLeaveSheet } from "@/hooks/use-leave-sheet";
import { useCreateLeave } from "@/hooks/use-leave";
import type { LeaveType } from "./types";
import { useMemo, useState } from "react";
import { toast } from "sonner";

function toDateInputValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

type LeaveSheetProps = {
  employeeId?: string;
};

export default function LeaveSheet({ employeeId }: LeaveSheetProps) {
  const { open, mode, defaultValues, close } = useLeaveSheet();
  const today = useMemo(() => toDateInputValue(new Date()), []);
  const initialLeaveType = defaultValues.leaveType ?? "ANNUAL";
  const initialStartDate = defaultValues.startDate || today;
  const initialEndDate = defaultValues.endDate || initialStartDate;
  const initialReason = defaultValues.reason ?? "";
  const createMutation = useCreateLeave();
  const submitting = createMutation.isPending;
  const [form, setForm] = useState({
    leaveType: initialLeaveType as LeaveType,
    startDate: initialStartDate,
    endDate: initialEndDate,
    reason: initialReason,
  });

  const resetFormToToday = () => {
    setForm({
      leaveType: "ANNUAL",
      startDate: today,
      endDate: today,
      reason: "",
    });
  };

  const handleClose = () => {
    resetFormToToday();
    close();
  };

  const handleSubmit = async () => {
    if (mode === "edit") {
      toast.error("Edit leave form is not enabled in current flow.");
      return;
    }

    if (!employeeId) {
      toast.error("Employee ID not found in current session.");
      return;
    }

    if (!form.startDate || !form.endDate) {
      toast.error("Start date and end date are required.");
      return;
    }

    if (form.endDate < form.startDate) {
      toast.error("End date cannot be earlier than start date.");
      return;
    }

    try {
      await createMutation.mutateAsync({
        employee_id: employeeId,
        leave_type: form.leaveType,
        start_date: form.startDate,
        end_date: form.endDate,
        reason: form.reason.trim(),
      });

      handleClose();
    } catch {
      // Error toast is handled in useCreateLeave hook.
    }
  };

  return (
    <Sheet
      open={open}
      onOpenChange={(state) => {
        if (!state) handleClose();
      }}
    >
      <SheetContent className="w-full sm:max-w-md p-4">
        <SheetHeader>
          <SheetTitle>
            {mode === "edit" ? "Edit Leave Request" : "Create Leave Request"}
          </SheetTitle>
        </SheetHeader>

        <form
          className="mt-6 space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            void handleSubmit();
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="leave-type">Leave Type</Label>
            <Select
              value={form.leaveType}
              onValueChange={(value) =>
                setForm((prev) => ({ ...prev, leaveType: value as LeaveType }))
              }
            >
              <SelectTrigger id="leave-type" className="w-full">
                <SelectValue placeholder="Select leave type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ANNUAL">ANNUAL</SelectItem>
                <SelectItem value="SICK">SICK</SelectItem>
                <SelectItem value="UNPAID">UNPAID</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="start-date">Start Date</Label>
            <Input
              id="start-date"
              type="date"
              min={today}
              value={form.startDate}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  startDate: event.target.value,
                  endDate:
                    prev.endDate < event.target.value
                      ? event.target.value
                      : prev.endDate,
                }))
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="end-date">End Date</Label>
            <Input
              id="end-date"
              type="date"
              min={form.startDate || today}
              value={form.endDate}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, endDate: event.target.value }))
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Reason</Label>
            <Input
              id="reason"
              placeholder="Reason for leave"
              value={form.reason}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, reason: event.target.value }))
              }
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              disabled={submitting}
              onClick={handleClose}
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={submitting}>
              {submitting ? "Submitting..." : "Submit Leave"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
