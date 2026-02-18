"use client";

import { create } from "zustand";

type Mode = "create" | "edit";

export type PositionSheetFormValues = {
  name: string;
  department_id: string;
};

interface PositionEditPayload extends PositionSheetFormValues {
  id: string;
}

interface PositionSheetState {
  open: boolean;
  mode: Mode;
  editingId?: string;
  defaultValues: PositionSheetFormValues;
  openCreate: () => void;
  openEdit: (payload: PositionEditPayload) => void;
  close: () => void;
}

const EMPTY_VALUES: PositionSheetFormValues = {
  name: "",
  department_id: "",
};

export const usePositionSheet = create<PositionSheetState>((set) => ({
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
  openEdit: ({ id, name, department_id }) =>
    set({
      open: true,
      mode: "edit",
      editingId: id,
      defaultValues: { name, department_id },
    }),
  close: () => set({ open: false }),
}));
