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
import { useCreateEmployee, useUpdateEmployee } from "@/hooks/use-employee";
import { useEmployeeSheet } from "@/hooks/use-employee-sheet";
import { cn } from "@/lib/utils";
import {
  employeeSchema,
  type EmployeeFormValues,
} from "@/lib/validations/employee-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";

type DepartmentOption = {
  id: string;
  name: string;
};

type PositionOption = {
  id: string;
  name: string;
  department_id?: string;
};

type EmployeeSheetProps = {
  departmentOptions: DepartmentOption[];
  positionOptions: PositionOption[];
  departmentsLoading: boolean;
  positionsLoading: boolean;
};

type EmployeeSheetFormProps = {
  mode: "create" | "edit";
  editingId?: string;
  defaultFullName?: string;
  defaultEmail?: string;
  defaultEmployeeNumber?: string;
  defaultPhone?: string;
  defaultHireDate?: string;
  defaultEmploymentStatus?: string;
  defaultPositionId?: string;
  departmentOptions: DepartmentOption[];
  positionOptions: PositionOption[];
  departmentsLoading: boolean;
  positionsLoading: boolean;
  onClose: () => void;
};

function EmployeeSheetForm({
  mode,
  editingId,
  defaultFullName,
  defaultEmail,
  defaultEmployeeNumber,
  defaultPhone,
  defaultHireDate,
  defaultEmploymentStatus,
  defaultPositionId,
  departmentOptions,
  positionOptions,
  departmentsLoading,
  positionsLoading,
  onClose,
}: EmployeeSheetFormProps) {
  const createMutation = useCreateEmployee();
  const updateMutation = useUpdateEmployee();
  const isSubmitting = createMutation.isPending || updateMutation.isPending;
  const [submitError, setSubmitError] = useState<string | null>(null);

  const initialDepartmentFilter = useMemo(() => {
    const selected = positionOptions.find((p) => p.id === defaultPositionId);
    return selected?.department_id ?? "__all__";
  }, [defaultPositionId, positionOptions]);

  const [departmentFilter, setDepartmentFilter] = useState(initialDepartmentFilter);

  const form = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      full_name: defaultFullName ?? "",
      email: defaultEmail ?? "",
      employee_number: defaultEmployeeNumber ?? "",
      phone: defaultPhone ?? "",
      hire_date: defaultHireDate ?? "",
      employment_status: defaultEmploymentStatus ?? "",
      position_id: defaultPositionId ?? "",
    },
  });

  const {
    formState: { errors },
    control,
  } = form;

  const filteredPositions = useMemo(() => {
    if (departmentFilter === "__all__") return positionOptions;
    return positionOptions.filter(
      (position) => position.department_id === departmentFilter,
    );
  }, [departmentFilter, positionOptions]);

  const onSubmit = async (values: EmployeeFormValues) => {
    setSubmitError(null);

    try {
      if (mode === "create") {
        await createMutation.mutateAsync(values);
      } else if (mode === "edit" && editingId) {
        await updateMutation.mutateAsync({
          id: editingId,
          payload: values,
        });
      }

      onClose();
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Failed to save employee.",
      );
    }
  };

  return (
    <form
      className="mt-6 space-y-4"
      onSubmit={(event) => {
        void form.handleSubmit(onSubmit)(event);
      }}
    >
      {submitError && <Alert variant="error">{submitError}</Alert>}

      <div className="space-y-2">
        <Label htmlFor="employee-full-name">Full Name</Label>
        <Input
          id="employee-full-name"
          placeholder="Employee full name"
          {...form.register("full_name")}
          className={cn(errors.full_name && "border-red-600")}
        />
        {errors.full_name && <p className="text-sm text-red-600">{errors.full_name.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="employee-email">Email</Label>
        <Input
          id="employee-email"
          placeholder="Employee email"
          {...form.register("email")}
          className={cn(errors.email && "border-red-600")}
        />
        {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="employee-number">Employee Number</Label>
        <Input
          id="employee-number"
          placeholder="Employee number"
          {...form.register("employee_number")}
          className={cn(errors.employee_number && "border-red-600")}
        />
        {errors.employee_number && (
          <p className="text-sm text-red-600">{errors.employee_number.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="employee-phone">Phone</Label>
        <Input
          id="employee-phone"
          placeholder="Phone number"
          {...form.register("phone")}
          className={cn(errors.phone && "border-red-600")}
        />
        {errors.phone && <p className="text-sm text-red-600">{errors.phone.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="employee-hire-date">Hire Date</Label>
        <Input
          id="employee-hire-date"
          type="date"
          {...form.register("hire_date")}
          className={cn(errors.hire_date && "border-red-600")}
        />
        {errors.hire_date && <p className="text-sm text-red-600">{errors.hire_date.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="employee-employment-status">Employment Status</Label>
        <Controller
          control={control}
          name="employment_status"
          render={({ field }) => (
            <Select
              value={field.value || "__none__"}
              onValueChange={(value) => {
                field.onChange(value === "__none__" ? "" : value);
              }}
            >
              <SelectTrigger
                id="employee-employment-status"
                className={cn("w-full", errors.employment_status && "border-red-600")}
              >
                <SelectValue placeholder="Select employment status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">Select status</SelectItem>
                <SelectItem value="PERMANENT">PERMANENT</SelectItem>
                <SelectItem value="CONTRACT">CONTRACT</SelectItem>
                <SelectItem value="PROBATION">PROBATION</SelectItem>
              </SelectContent>
            </Select>
          )}
        />
        {errors.employment_status && (
          <p className="text-sm text-red-600">{errors.employment_status.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="department-filter">Department Filter</Label>
        <Select
          value={departmentFilter}
          onValueChange={(value) => {
            setDepartmentFilter(value);
            form.setValue("position_id", "", { shouldDirty: true });
          }}
          disabled={departmentsLoading || positionsLoading}
        >
          <SelectTrigger id="department-filter" className="w-full">
            <SelectValue placeholder="Filter by department" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">All Departments</SelectItem>
            {departmentOptions.map((department) => (
              <SelectItem key={department.id} value={department.id}>
                {department.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="employee-position">Position</Label>
        <Controller
          control={control}
          name="position_id"
          render={({ field }) => (
            <Select
              value={field.value || "__none__"}
              onValueChange={(value) => {
                field.onChange(value === "__none__" ? "" : value);
              }}
              disabled={positionsLoading}
            >
              <SelectTrigger
                id="employee-position"
                className={cn("w-full", errors.position_id && "border-red-600")}
              >
                <SelectValue
                  placeholder={positionsLoading ? "Loading positions..." : "Select position"}
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">Select position</SelectItem>
                {filteredPositions.map((position) => (
                  <SelectItem key={position.id} value={position.id}>
                    {position.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.position_id && (
          <p className="text-sm text-red-600">{errors.position_id.message}</p>
        )}
      </div>

      <div className="flex gap-2 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={isSubmitting}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting} className="flex-1">
          {isSubmitting
            ? "Saving..."
            : mode === "edit"
              ? "Update Employee"
              : "Create Employee"}
        </Button>
      </div>
    </form>
  );
}

export default function EmployeeSheet({
  departmentOptions,
  positionOptions,
  departmentsLoading,
  positionsLoading,
}: EmployeeSheetProps) {
  const { open, mode, editingId, defaultValues, close } = useEmployeeSheet();
  const formKey = `${mode}:${editingId ?? "new"}:${open ? "open" : "closed"}:${defaultValues.position_id ?? ""}`;

  return (
    <Sheet open={open} onOpenChange={(state) => !state && close()}>
      <SheetContent className="w-full sm:max-w-md p-4">
        <SheetHeader>
          <SheetTitle>
            {mode === "edit" ? "Edit Employee" : "Create Employee"}
          </SheetTitle>
        </SheetHeader>

        <EmployeeSheetForm
          key={formKey}
          mode={mode}
          editingId={editingId}
          defaultFullName={defaultValues.full_name}
          defaultEmail={defaultValues.email}
          defaultEmployeeNumber={defaultValues.employee_number}
          defaultPhone={defaultValues.phone}
          defaultHireDate={defaultValues.hire_date}
          defaultEmploymentStatus={defaultValues.employment_status}
          defaultPositionId={defaultValues.position_id}
          departmentOptions={departmentOptions}
          positionOptions={positionOptions}
          departmentsLoading={departmentsLoading}
          positionsLoading={positionsLoading}
          onClose={close}
        />
      </SheetContent>
    </Sheet>
  );
}
