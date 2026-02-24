"use client";

import { create } from "zustand";

type Mode = "create" | "edit";

export type UserSheetFormValues = {
  employee_id: string;
  email: string;
  password?: string; // Diperlukan saat create
  is_active: boolean; // Digunakan saat edit status
};

interface UserEditPayload extends UserSheetFormValues {
  id: string;
}

interface UserSheetState {
  open: boolean;
  mode: Mode;
  editingId?: string;
  defaultValues: UserSheetFormValues;
  openCreate: () => void;
  openEdit: (payload: UserEditPayload) => void;
  close: () => void;
}

const EMPTY_VALUES: UserSheetFormValues = {
  employee_id: "",
  email: "",
  password: "",
  is_active: true,
};

export const useUserSheet = create<UserSheetState>((set) => ({
  open: false,
  mode: "create",
  editingId: undefined,
  defaultValues: EMPTY_VALUES,
  openCreate: () =>
    set({
      open: true,
      mode: "create",
      editingId: undefined,
      defaultValues: EMPTY_VALUES,
    }),
  openEdit: ({ id, employee_id, email, is_active }) =>
    set({
      open: true,
      mode: "edit",
      editingId: id,
      defaultValues: {
        employee_id,
        email,
        is_active,
        password: "", // Password biasanya tidak diisi saat edit status
      },
    }),
  close: () => set({ open: false }),
}));
