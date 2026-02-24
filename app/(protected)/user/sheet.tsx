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
import { Switch } from "@/components/ui/switch";
import { useCreateUser, useUpdateUserStatus } from "@/hooks/use-users";
import { useUserSheet } from "@/hooks/use-user-sheet";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { userSchema, type UserFormValues } from "@/lib/validations/user-schema";

type UserSheetFormProps = {
  mode: "create" | "edit";
  editingId?: string;
  defaultValues: UserFormValues;
  onClose: () => void;
};

function UserSheetForm({
  mode,
  editingId,
  defaultValues,
  onClose,
}: UserSheetFormProps) {
  const createMutation = useCreateUser();
  const updateStatusMutation = useUpdateUserStatus();
  const isSubmitting =
    createMutation.isPending || updateStatusMutation.isPending;
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      employee_id: defaultValues.employee_id || "",
      email: defaultValues.email || "",
      password: "",
      is_active: defaultValues.is_active ?? true,
    },
  });

  const {
    formState: { errors },
    control,
  } = form;

  const onSubmit = async (values: UserFormValues) => {
    setSubmitError(null);

    try {
      if (mode === "create") {
        // Password wajib saat create
        if (!values.password) {
          form.setError("password", {
            message: "Password is required for new users",
          });
          return;
        }
        await createMutation.mutateAsync({
          employee_id: values.employee_id,
          email: values.email,
          password: values.password,
        });
      } else if (mode === "edit" && editingId) {
        // API User Edit hanya mengupdate status berdasarkan referensi Anda
        await updateStatusMutation.mutateAsync({
          id: editingId,
          payload: { is_active: values.is_active },
        });
      }

      onClose();
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Failed to save user.",
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
        <Label htmlFor="user-employee-id">Employee ID (UUID)</Label>
        <Input
          id="user-employee-id"
          placeholder="e.g. 550e8400-e29b-41d4-a716-446655440000"
          {...form.register("employee_id")}
          disabled={mode === "edit"} // Biasanya ID tidak diubah saat edit
          className={cn(errors.employee_id && "border-red-600")}
        />
        {errors.employee_id && (
          <p className="text-sm text-red-600">{errors.employee_id.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="user-email">Email Address</Label>
        <Input
          id="user-email"
          type="email"
          placeholder="user@company.com"
          {...form.register("email")}
          disabled={mode === "edit"}
          className={cn(errors.email && "border-red-600")}
        />
        {errors.email && (
          <p className="text-sm text-red-600">{errors.email.message}</p>
        )}
      </div>

      {mode === "create" && (
        <div className="space-y-2">
          <Label htmlFor="user-password">Password</Label>
          <Input
            id="user-password"
            type="password"
            placeholder="Minimum 8 characters"
            {...form.register("password")}
            className={cn(errors.password && "border-red-600")}
          />
          {errors.password && (
            <p className="text-sm text-red-600">{errors.password.message}</p>
          )}
        </div>
      )}

      {mode === "edit" && (
        <div className="flex items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <Label htmlFor="user-status">Account Status</Label>
            <p className="text-sm text-muted-foreground">
              Toggle to activate or deactivate user
            </p>
          </div>
          <Controller
            control={control}
            name="is_active"
            render={({ field }) => (
              <Switch
                id="user-status"
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            )}
          />
        </div>
      )}

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
              ? "Update Status"
              : "Create User"}
        </Button>
      </div>
    </form>
  );
}

export default function UserSheet() {
  const { open, mode, editingId, defaultValues, close } = useUserSheet();
  const formKey = `user:${mode}:${editingId ?? "new"}:${open ? "open" : "closed"}`;

  return (
    <Sheet open={open} onOpenChange={(state) => !state && close()}>
      <SheetContent className="w-full sm:max-w-md p-4">
        <SheetHeader>
          <SheetTitle>
            {mode === "edit" ? "Edit User Account" : "Create New User"}
          </SheetTitle>
        </SheetHeader>

        <UserSheetForm
          key={formKey}
          mode={mode}
          editingId={editingId}
          defaultValues={defaultValues}
          onClose={close}
        />
      </SheetContent>
    </Sheet>
  );
}
