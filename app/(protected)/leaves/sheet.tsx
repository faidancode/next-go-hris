"use client";

import { Alert } from "@/components/shared/alert";
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
import { cn } from "@/lib/utils";
import {
  leaveSchema,
  type LeaveFormValues,
} from "@/lib/validations/leave-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
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
  const createMutation = useCreateLeave();
  const isSubmitting = createMutation.isPending;
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useForm<LeaveFormValues>({
    resolver: zodResolver(leaveSchema),
    defaultValues: {
      leaveType: "ANNUAL",
      startDate: today,
      endDate: today,
      reason: "",
    },
  });

  const {
    formState: { errors },
    reset,
    control,
  } = form;

  const startDate = useWatch({
    control,
    name: "startDate",
  }) || today;

  useEffect(() => {
    if (!open) return;

    reset({
      leaveType: defaultValues.leaveType ?? "ANNUAL",
      startDate: defaultValues.startDate || today,
      endDate: defaultValues.endDate || defaultValues.startDate || today,
      reason: defaultValues.reason ?? "",
    });
  }, [defaultValues, open, reset, today]);

  const handleClose = () => {
    setSubmitError(null);
    reset({
      leaveType: "ANNUAL",
      startDate: today,
      endDate: today,
      reason: "",
    });
    close();
  };

  const onSubmit = async (values: LeaveFormValues) => {
    setSubmitError(null);

    if (mode === "edit") {
      toast.error("Edit leave form is not enabled in current flow.");
      return;
    }

    if (!employeeId) {
      toast.error("Employee ID not found in current session.");
      return;
    }

    try {
      await createMutation.mutateAsync({
        employee_id: employeeId,
        leave_type: values.leaveType,
        start_date: values.startDate,
        end_date: values.endDate,
        reason: values.reason?.trim() ?? "",
      });

      handleClose();
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Failed to create leave.",
      );
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
            void form.handleSubmit(onSubmit)(event);
          }}
        >
          {submitError && <Alert variant="error">{submitError}</Alert>}

          <div className="space-y-2">
            <Label htmlFor="leave-type">Leave Type</Label>
            <Controller
              control={control}
              name="leaveType"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger
                    id="leave-type"
                    className={cn("w-full", errors.leaveType && "border-red-600")}
                  >
                    <SelectValue placeholder="Select leave type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ANNUAL">ANNUAL</SelectItem>
                    <SelectItem value="SICK">SICK</SelectItem>
                    <SelectItem value="UNPAID">UNPAID</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.leaveType && (
              <p className="text-sm text-red-600">{errors.leaveType.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="start-date">Start Date</Label>
            <Input
              id="start-date"
              type="date"
              min={today}
              {...form.register("startDate")}
              className={cn(errors.startDate && "border-red-600")}
            />
            {errors.startDate && (
              <p className="text-sm text-red-600">{errors.startDate.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="end-date">End Date</Label>
            <Input
              id="end-date"
              type="date"
              min={startDate || today}
              {...form.register("endDate")}
              className={cn(errors.endDate && "border-red-600")}
            />
            {errors.endDate && (
              <p className="text-sm text-red-600">{errors.endDate.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Reason</Label>
            <Input
              id="reason"
              placeholder="Reason for leave"
              {...form.register("reason")}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              disabled={isSubmitting}
              onClick={handleClose}
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit Leave"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
