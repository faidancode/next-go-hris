"use client";

import { create } from "zustand";

type Mode = "create" | "edit";

export type DepartmentSheetFormValues = {
  name: string;
  parent_department_id: string;
};

interface DepartmentEditPayload extends DepartmentSheetFormValues {
  id: string;
}

interface DepartmentSheetState {
  open: boolean;
  mode: Mode;
  editingId?: string;
  defaultValues: DepartmentSheetFormValues;
  openCreate: () => void;
  openEdit: (payload: DepartmentEditPayload) => void;
  close: () => void;
}

const EMPTY_VALUES: DepartmentSheetFormValues = {
  name: "",
  parent_department_id: "",
};

export const useDepartmentSheet = create<DepartmentSheetState>((set) => ({
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
  openEdit: ({ id, name, parent_department_id }) =>
    set({
      open: true,
      mode: "edit",
      editingId: id,
      defaultValues: { name, parent_department_id },
    }),
  close: () => set({ open: false }),
}));
