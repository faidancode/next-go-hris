"use client";

import { create } from "zustand";
import type { LeaveType } from "@/app/(protected)/leaves/types";

type Mode = "create" | "edit";

export type LeaveSheetFormValues = {
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  reason: string;
};

interface LeaveEditPayload extends LeaveSheetFormValues {
  id: string;
}

interface LeaveSheetState {
  open: boolean;
  mode: Mode;
  editingId?: string;
  defaultValues: LeaveSheetFormValues;
  openCreate: () => void;
  openEdit: (payload: LeaveEditPayload) => void;
  close: () => void;
}

const EMPTY_VALUES: LeaveSheetFormValues = {
  leaveType: "ANNUAL",
  startDate: "",
  endDate: "",
  reason: "",
};

export const useLeaveSheet = create<LeaveSheetState>((set) => ({
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
  openEdit: ({ id, leaveType, startDate, endDate, reason }) =>
    set({
      open: true,
      mode: "edit",
      editingId: id,
      defaultValues: {
        leaveType,
        startDate,
        endDate,
        reason,
      },
    }),
  close: () => set({ open: false }),
}));

