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
import { Switch } from "@/components/ui/switch"; // Import Switch
import { useEmployeeOptions } from "@/hooks/use-employee";
import { useUserSheet } from "@/hooks/use-user-sheet";
import {
  useCreateUser,
  useForceResetPassword,
  useUpdateUserStatus,
} from "@/hooks/use-users";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
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
  const updateStatusMutation = useUpdateUserStatus(); // Tambahkan mutation status
  const forceResetPasswordMutation = useForceResetPassword();
  const employeeOptionsQuery = useEmployeeOptions(mode === "create");

  const isSubmitting =
    createMutation.isPending ||
    forceResetPasswordMutation.isPending ||
    updateStatusMutation.isPending;

  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      employee_id: defaultValues.employee_id || "",
      email: defaultValues.email || "",
      password: "",
      is_active: defaultValues.is_active ?? true, // Default true
    },
  });

  const {
    formState: { errors },
    control,
  } = form;

  const selectedEmployeeId = useWatch({
    control,
    name: "employee_id",
  });

  // Sync email saat employee terpilih (hanya mode create)
  useEffect(() => {
    if (mode !== "create") return;

    const selectedEmployee = (employeeOptionsQuery.data ?? []).find(
      (employee) => employee.id === selectedEmployeeId,
    );

    form.setValue("email", selectedEmployee?.email ?? "", {
      shouldValidate: true,
    });
  }, [mode, selectedEmployeeId, employeeOptionsQuery.data, form]);

  const onSubmit = async (values: UserFormValues) => {
    setSubmitError(null);

    try {
      if (mode === "create") {
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
        // 1. Update Status jika berubah
        if (values.is_active !== defaultValues.is_active) {
          await updateStatusMutation.mutateAsync({
            id: editingId,
            payload: { is_active: values.is_active },
          });
        }

        // 2. Force Reset Password jika password diisi
        if (values.password && values.password.length >= 6) {
          await forceResetPasswordMutation.mutateAsync({
            id: editingId,
            payload: { new_password: values.password },
          });
        }
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

      {/* Field: Employee Selection */}
      <div className="space-y-2">
        <Label htmlFor="user-employee-id">Employee</Label>
        <Controller
          control={control}
          name="employee_id"
          render={({ field }) => (
            <Select
              value={field.value || ""}
              onValueChange={field.onChange}
              disabled={mode === "edit" || employeeOptionsQuery.isLoading} // Disabled jika edit
            >
              <SelectTrigger
                id="user-employee-id"
                className={cn(errors.employee_id && "border-red-600")}
              >
                <SelectValue
                  placeholder={
                    employeeOptionsQuery.isLoading
                      ? "Loading employees..."
                      : "Select employee"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {/* Jika mode edit, kita mungkin butuh menampilkan label employee yang sedang diedit 
                  meskipun tidak ada di list options 'available'
                */}
                {(employeeOptionsQuery.data ?? []).map((employee) => (
                  <SelectItem key={employee.id} value={employee.id}>
                    {employee.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.employee_id && (
          <p className="text-sm text-red-600">{errors.employee_id.message}</p>
        )}
      </div>

      {/* Field: Email (Read Only) */}
      <div className="space-y-2">
        <Label htmlFor="user-email">Email Address</Label>
        <Input
          id="user-email"
          type="email"
          {...form.register("email")}
          disabled
          className="bg-slate-50"
        />
      </div>

      {/* Field: Password */}
      <div className="space-y-2">
        <Label htmlFor="user-password">
          {mode === "edit" ? "New Password (Optional)" : "Password"}
        </Label>
        <Input
          id="user-password"
          type="password"
          placeholder={
            mode === "edit"
              ? "Leave blank to keep current"
              : "Min. 8 characters"
          }
          {...form.register("password")}
          className={cn(errors.password && "border-red-600")}
        />
        {errors.password && (
          <p className="text-sm text-red-600">{errors.password.message}</p>
        )}
      </div>

      {/* Field: Is Active (Switch) */}
      <div className="flex items-center justify-between rounded-lg border p-4">
        <div className="space-y-0.5">
          <Label htmlFor="user-active">Active Status</Label>
          <p className="text-xs text-muted-foreground">
            Whether this user can login to the system.
          </p>
        </div>
        <Controller
          control={control}
          name="is_active"
          render={({ field }) => (
            <Switch
              id="user-active"
              checked={field.value}
              onCheckedChange={field.onChange}
            />
          )}
        />
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
              ? "Update User"
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
