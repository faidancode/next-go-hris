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
import { useCreatePosition, useUpdatePosition } from "@/hooks/use-position";
import { usePositionSheet } from "@/hooks/use-position-sheet";
import { cn } from "@/lib/utils";
import {
  positionSchema,
  type PositionFormValues,
} from "@/lib/validations/position-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";

type DepartmentOption = {
  id: string;
  name: string;
};

type PositionSheetProps = {
  departmentOptions: DepartmentOption[];
  departmentsLoading: boolean;
};

export default function PositionSheet({
  departmentOptions,
  departmentsLoading,
}: PositionSheetProps) {
  const { open, mode, editingId, defaultValues, close } = usePositionSheet();
  const createMutation = useCreatePosition();
  const updateMutation = useUpdatePosition();
  const isSubmitting = createMutation.isPending || updateMutation.isPending;
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useForm<PositionFormValues>({
    resolver: zodResolver(positionSchema),
    defaultValues: {
      name: "",
      department_id: "",
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
      name: defaultValues.name ?? "",
      department_id: defaultValues.department_id ?? "",
    });
  }, [defaultValues, open, reset]);

  const handleClose = () => {
    setSubmitError(null);
    reset({
      name: "",
      department_id: "",
    });
    close();
  };

  const onSubmit = async (values: PositionFormValues) => {
    setSubmitError(null);

    const payload = {
      name: values.name.trim(),
      department_id: values.department_id?.trim() || undefined,
    };

    try {
      if (mode === "create") {
        await createMutation.mutateAsync(payload);
      } else if (mode === "edit" && editingId) {
        await updateMutation.mutateAsync({
          id: editingId,
          payload,
        });
      }

      handleClose();
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Failed to save position.",
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
            {mode === "edit" ? "Edit Position" : "Create Position"}
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
            <Label htmlFor="department-id">Department</Label>
            <Controller
              control={control}
              name="department_id"
              render={({ field }) => (
                <Select
                  value={field.value || "__none__"}
                  onValueChange={(value) => {
                    field.onChange(value === "__none__" ? "" : value);
                  }}
                  disabled={departmentsLoading}
                >
                  <SelectTrigger
                    id="department-id"
                    className={cn("w-full", errors.department_id && "border-red-600")}
                  >
                    <SelectValue
                      placeholder={
                        departmentsLoading
                          ? "Loading departments..."
                          : "Select department"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">No department</SelectItem>
                    {departmentOptions.map((department) => (
                      <SelectItem key={department.id} value={department.id}>
                        {department.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.department_id && (
              <p className="text-sm text-red-600">{errors.department_id.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="position-name">Name</Label>
            <Input
              id="position-name"
              placeholder="Position name"
              {...form.register("name")}
              className={cn(errors.name && "border-red-600")}
            />
            {errors.name && (
              <p className="text-sm text-red-600">{errors.name.message}</p>
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
              {isSubmitting
                ? "Saving..."
                : mode === "edit"
                  ? "Update Position"
                  : "Create Position"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
