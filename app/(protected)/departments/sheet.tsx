"use client";

import { Alert } from "@/components/shared/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useDepartmentSheet } from "@/hooks/use-department-sheet";
import { useCreateDepartment, useUpdateDepartment } from "@/hooks/use-department";
import { cn } from "@/lib/utils";
import {
  departmentSchema,
  type DepartmentFormValues,
} from "@/lib/validations/department-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

export default function DepartmentSheet() {
  const { open, mode, editingId, defaultValues, close } = useDepartmentSheet();
  const createMutation = useCreateDepartment();
  const updateMutation = useUpdateDepartment();
  const isSubmitting = createMutation.isPending || updateMutation.isPending;
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useForm<DepartmentFormValues>({
    resolver: zodResolver(departmentSchema),
    defaultValues: {
      name: "",
      parent_department_id: "",
    },
  });

  const {
    formState: { errors },
    reset,
  } = form;

  useEffect(() => {
    if (!open) return;

    reset({
      name: defaultValues.name ?? "",
      parent_department_id: defaultValues.parent_department_id ?? "",
    });
  }, [defaultValues, open, reset]);

  const handleClose = () => {
    setSubmitError(null);
    reset({
      name: "",
      parent_department_id: "",
    });
    close();
  };

  const onSubmit = async (values: DepartmentFormValues) => {
    setSubmitError(null);

    const payload = {
      name: values.name.trim(),
      parent_department_id: values.parent_department_id?.trim() || undefined,
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
        error instanceof Error ? error.message : "Failed to save department.",
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
            {mode === "edit" ? "Edit Department" : "Create Department"}
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
            <Label htmlFor="department-name">Name</Label>
            <Input
              id="department-name"
              placeholder="Department name"
              {...form.register("name")}
              className={cn(errors.name && "border-red-600")}
            />
            {errors.name && (
              <p className="text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="department-parent-id">Parent Department ID</Label>
            <Input
              id="department-parent-id"
              placeholder="Parent department id (optional)"
              {...form.register("parent_department_id")}
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
              {isSubmitting
                ? "Saving..."
                : mode === "edit"
                  ? "Update Department"
                  : "Create Department"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
