"use client";

import { BrandFormValues } from "@/lib/validations/brand-schema";
import { create } from "zustand";

type Mode = "create" | "edit";

interface BrandEditPayload {
  id: string;
  name: string;
  slug: string;
  imageUrl: string;
}

interface BrandSheetState {
  open: boolean;
  mode: Mode;
  editingId?: string;
  defaultValues: Partial<BrandFormValues>;
  openCreate: () => void;
  openEdit: (payload: BrandEditPayload) => void;
  close: () => void;
}

export const useBrandSheet = create<BrandSheetState>((set) => ({
  open: false,
  mode: "create",
  editingId: undefined,
  defaultValues: { name: "", slug: "", imageUrl: "" },
  openCreate: () =>
    set({
      open: true,
      mode: "create",
      editingId: undefined,
      defaultValues: { name: "", slug: "", imageUrl: "" },
    }),
  openEdit: ({ id, name, slug, imageUrl }) =>
    set({
      open: true,
      mode: "edit",
      editingId: id,
      defaultValues: { name, slug, imageUrl },
    }),
  close: () => set({ open: false }),
}));
