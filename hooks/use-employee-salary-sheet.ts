"use client";

import { create } from "zustand";

interface EmployeeSalarySheetState {
  open: boolean;
  openCreate: () => void;
  close: () => void;
}

export const useEmployeeSalarySheet = create<EmployeeSalarySheetState>((set) => ({
  open: false,
  openCreate: () => set({ open: true }),
  close: () => set({ open: false }),
}));

