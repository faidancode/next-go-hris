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
import { useCreateEmployeeSalary } from "@/hooks/use-employee-salary";
import { useEmployeeSalarySheet } from "@/hooks/use-employee-salary-sheet";
import { cn, formatSalaryInput, getTodayDateKey } from "@/lib/utils";
import {
  employeeSalarySchema,
  type EmployeeSalaryFormValues,
} from "@/lib/validations/employee-salary-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";

type EmployeeOption = {
  id: string;
  name: string;
};

type EmployeeSalarySheetProps = {
  employeeOptions: EmployeeOption[];
  isEmployeeRole: boolean;
  selfEmployeeId?: string;
  employeesLoading: boolean;
};

export default function EmployeeSalarySheet({
  employeeOptions,
  isEmployeeRole,
  selfEmployeeId,
  employeesLoading,
}: EmployeeSalarySheetProps) {
  const { open, close } = useEmployeeSalarySheet();
  const createMutation = useCreateEmployeeSalary();
  const isSubmitting = createMutation.isPending;
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useForm<EmployeeSalaryFormValues>({
    resolver: zodResolver(employeeSalarySchema),
    defaultValues: {
      employee_id: "",
      base_salary: 0,
      effective_date: "",
    },
  });

  const {
    formState: { errors },
    reset,
    control,
  } = form;

  useEffect(() => {
    if (!open) return;

    reset({
      employee_id: isEmployeeRole ? (selfEmployeeId ?? "") : "",
      base_salary: 0,
      effective_date: getTodayDateKey(),
    });
  }, [isEmployeeRole, open, reset, selfEmployeeId]);

  const handleClose = () => {
    setSubmitError(null);
    reset({
      employee_id: "",
      base_salary: 0,
      effective_date: "",
    });
    close();
  };

  const onSubmit = async (values: EmployeeSalaryFormValues) => {
    setSubmitError(null);

    const payload = {
      employee_id: values.employee_id.trim(),
      base_salary: values.base_salary,
      effective_date: values.effective_date.trim(),
    };

    try {
      await createMutation.mutateAsync(payload);
      handleClose();
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Failed to save employee salary.",
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
          <SheetTitle>Add Employee Salary</SheetTitle>
        </SheetHeader>

        <form
          className="mt-6 space-y-4"
          onSubmit={(event) => {
            void form.handleSubmit(onSubmit)(event);
          }}
        >
          {submitError && <Alert variant="error">{submitError}</Alert>}

          {!isEmployeeRole && (
            <div className="space-y-2">
              <Label htmlFor="employee-id">Employee</Label>
              <Controller
                control={control}
                name="employee_id"
                render={({ field }) => (
                  <Select
                    value={field.value || ""}
                    onValueChange={field.onChange}
                    disabled={employeesLoading}
                  >
                    <SelectTrigger
                      id="employee-id"
                      className={cn(
                        "w-full",
                        errors.employee_id && "border-red-600",
                      )}
                    >
                      <SelectValue
                        placeholder={
                          employeesLoading
                            ? "Loading employees..."
                            : "Select employee"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {employeeOptions.map((employee) => (
                        <SelectItem key={employee.id} value={employee.id}>
                          {employee.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.employee_id && (
                <p className="text-sm text-red-600">
                  {errors.employee_id.message}
                </p>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="base-salary">Base Salary</Label>
            <Controller
              control={control}
              name="base_salary"
              render={({ field }) => (
                <Input
                  id="base-salary"
                  type="text"
                  inputMode="numeric"
                  placeholder="Contoh: 5.000.000"
                  value={
                    typeof field.value === "number" &&
                    Number.isFinite(field.value)
                      ? formatSalaryInput(field.value)
                      : ""
                  }
                  onChange={(event) => {
                    const digitsOnly = event.target.value.replace(/\D/g, "");
                    const parsed = digitsOnly ? Number(digitsOnly) : 0;
                    field.onChange(parsed);
                  }}
                  className={cn(errors.base_salary && "border-red-600")}
                />
              )}
            />
            {errors.base_salary && (
              <p className="text-sm text-red-600">
                {errors.base_salary.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="effective-date">Effective Date</Label>
            <Input
              id="effective-date"
              type="date"
              {...form.register("effective_date")}
              className={cn(errors.effective_date && "border-red-600")}
            />
            {errors.effective_date && (
              <p className="text-sm text-red-600">
                {errors.effective_date.message}
              </p>
            )}
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
              {isSubmitting ? "Saving..." : "Add Salary"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
