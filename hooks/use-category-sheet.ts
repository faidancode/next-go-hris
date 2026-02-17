"use client";

import { CategoryFormValues } from "@/lib/validations/category-schema";
import { create } from "zustand";

type Mode = "create" | "edit";

interface CategoryEditPayload {
  id: string;
  name: string;
  slug: string;
  imageUrl: string;
}

interface CategorySheetState {
  open: boolean;
  mode: Mode;
  editingId?: string;
  defaultValues: Partial<CategoryFormValues>;
  openCreate: () => void;
  openEdit: (payload: CategoryEditPayload) => void;
  close: () => void;
}

export const useCategorySheet = create<CategorySheetState>((set) => ({
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
