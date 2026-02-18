"use client";

import { create } from "zustand";

type Mode = "create" | "edit";

export type EmployeeSheetFormValues = {
  full_name: string;
  email: string;
  employee_number: string;
  phone: string;
  hire_date: string;
  employment_status: string;
  position_id: string;
};

interface EmployeeEditPayload extends EmployeeSheetFormValues {
  id: string;
}

interface EmployeeSheetState {
  open: boolean;
  mode: Mode;
  editingId?: string;
  defaultValues: EmployeeSheetFormValues;
  openCreate: () => void;
  openEdit: (payload: EmployeeEditPayload) => void;
  close: () => void;
}

const EMPTY_VALUES: EmployeeSheetFormValues = {
  full_name: "",
  email: "",
  employee_number: "",
  phone: "",
  hire_date: "",
  employment_status: "",
  position_id: "",
};

export const useEmployeeSheet = create<EmployeeSheetState>((set) => ({
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
  openEdit: ({
    id,
    full_name,
    email,
    employee_number,
    phone,
    hire_date,
    employment_status,
    position_id,
  }) =>
    set({
      open: true,
      mode: "edit",
      editingId: id,
      defaultValues: {
        full_name,
        email,
        employee_number,
        phone,
        hire_date,
        employment_status,
        position_id,
      },
    }),
  close: () => set({ open: false }),
}));
