"use client";

import { create } from "zustand";
import { Payroll } from "@/app/(protected)/payrolls/types";

type Mode = "create" | "view";

interface PayrollSheetState {
  open: boolean;
  mode: Mode;
  selectedId?: string;
  selectedPayroll?: Payroll;
  openCreate: () => void;
  openView: (payroll: Payroll) => void;
  close: () => void;
}

export const usePayrollSheet = create<PayrollSheetState>((set) => ({
  open: false,
  mode: "create",
  selectedId: undefined,
  selectedPayroll: undefined,
  openCreate: () =>
    set({
      open: true,
      mode: "create",
      selectedId: undefined,
      selectedPayroll: undefined,
    }),
  openView: (payroll) =>
    set({
      open: true,
      mode: "view",
      selectedId: payroll.id,
      selectedPayroll: payroll,
    }),
  close: () => set({ open: false }),
}));
