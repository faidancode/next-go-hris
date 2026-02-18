"use client";

import { useDepartmentSheet } from "@/hooks/use-department-sheet";
import { useCreateDepartment, useUpdateDepartment } from "@/hooks/use-department";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { FormEvent } from "react";
import { toast } from "sonner";

export default function DepartmentSheet() {
  const { open, mode, editingId, defaultValues, close } = useDepartmentSheet();
  const createMutation = useCreateDepartment();
  const updateMutation = useUpdateDepartment();
  const submitting = createMutation.isPending || updateMutation.isPending;
  const formKey = `${mode}:${editingId ?? "new"}:${open ? "open" : "closed"}`;

  const handleClose = () => {
    close();
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const name = String(formData.get("name") ?? "").trim();
    const parentDepartmentId = String(
      formData.get("parent_department_id") ?? "",
    ).trim();

    if (!name) {
      toast.error("Department name is required.");
      return;
    }

    try {
      if (mode === "create") {
        await createMutation.mutateAsync({
          name,
          parent_department_id: parentDepartmentId || undefined,
        });
      } else if (mode === "edit" && editingId) {
        await updateMutation.mutateAsync({
          id: editingId,
          payload: {
            name,
            parent_department_id: parentDepartmentId || undefined,
          },
        });
      }

      handleClose();
    } catch {
      // Error toast is handled in hooks.
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
          key={formKey}
          className="mt-6 space-y-4"
          onSubmit={(event) => {
            void handleSubmit(event);
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="department-name">Name</Label>
            <Input
              id="department-name"
              name="name"
              placeholder="Department name"
              defaultValue={defaultValues.name ?? ""}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="department-parent-id">Parent Department ID</Label>
            <Input
              id="department-parent-id"
              name="parent_department_id"
              placeholder="Parent department id (optional)"
              defaultValue={defaultValues.parent_department_id ?? ""}
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
              {submitting
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
