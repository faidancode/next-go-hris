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
import { useCreatePosition, useUpdatePosition } from "@/hooks/use-position";
import { usePositionSheet } from "@/hooks/use-position-sheet";
import { FormEvent, useState } from "react";
import { toast } from "sonner";

type DepartmentOption = {
  id: string;
  name: string;
};

type PositionSheetProps = {
  departmentOptions: DepartmentOption[];
  departmentsLoading: boolean;
};

type PositionSheetFormProps = {
  formKey: string;
  mode: "create" | "edit";
  defaultName?: string;
  defaultDepartmentId?: string;
  submitting: boolean;
  departmentsLoading: boolean;
  departmentOptions: DepartmentOption[];
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onClose: () => void;
};

function PositionSheetForm({
  formKey,
  mode,
  defaultName,
  defaultDepartmentId,
  submitting,
  departmentsLoading,
  departmentOptions,
  onSubmit,
  onClose,
}: PositionSheetFormProps) {
  const [departmentId, setDepartmentId] = useState(
    defaultDepartmentId || "__none__",
  );

  return (
    <form
      key={formKey}
      className="mt-6 space-y-4"
      onSubmit={(event) => {
        void onSubmit(event);
      }}
    >
      <div className="space-y-2">
        <Label htmlFor="department-id">Department</Label>
        <Select
          value={departmentId}
          onValueChange={setDepartmentId}
          disabled={departmentsLoading}
        >
          <SelectTrigger id="department-id" className="w-full">
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
        <input
          type="hidden"
          name="department_id"
          value={departmentId}
          readOnly
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="position-name">Name</Label>
        <Input
          id="position-name"
          name="name"
          placeholder="Position name"
          defaultValue={defaultName ?? ""}
        />
      </div>

      <div className="flex gap-2 pt-4">
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          disabled={submitting}
          onClick={onClose}
        >
          Cancel
        </Button>
        <Button type="submit" className="flex-1" disabled={submitting}>
          {submitting
            ? "Saving..."
            : mode === "edit"
              ? "Update Position"
              : "Create Position"}
        </Button>
      </div>
    </form>
  );
}

export default function PositionSheet({
  departmentOptions,
  departmentsLoading,
}: PositionSheetProps) {
  const { open, mode, editingId, defaultValues, close } = usePositionSheet();
  const createMutation = useCreatePosition();
  const updateMutation = useUpdatePosition();
  const submitting = createMutation.isPending || updateMutation.isPending;
  const formKey = `${mode}:${editingId ?? "new"}:${open ? "open" : "closed"}`;

  const handleClose = () => {
    close();
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const name = String(formData.get("name") ?? "").trim();
    const rawDepartmentId = String(formData.get("department_id") ?? "").trim();
    const selectedDepartmentId =
      rawDepartmentId === "__none__" ? "" : rawDepartmentId;

    if (!name) {
      toast.error("Position name is required.");
      return;
    }

    try {
      if (mode === "create") {
        await createMutation.mutateAsync({
          name,
          department_id: selectedDepartmentId || undefined,
        });
      } else if (mode === "edit" && editingId) {
        await updateMutation.mutateAsync({
          id: editingId,
          payload: {
            name,
            department_id: selectedDepartmentId || undefined,
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
            {mode === "edit" ? "Edit Position" : "Create Position"}
          </SheetTitle>
        </SheetHeader>

        <PositionSheetForm
          key={formKey}
          formKey={formKey}
          mode={mode}
          defaultName={defaultValues.name}
          defaultDepartmentId={defaultValues.department_id}
          submitting={submitting}
          departmentsLoading={departmentsLoading}
          departmentOptions={departmentOptions}
          onSubmit={handleSubmit}
          onClose={handleClose}
        />
      </SheetContent>
    </Sheet>
  );
}
