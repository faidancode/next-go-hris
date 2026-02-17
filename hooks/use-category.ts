// src/lib/hooks/useCategories.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryById,
} from "@/lib/api/category";
import { toast } from "sonner";
import { getErrorMessage, getReadableErrorCode } from "@/lib/api/errors";
import { CategoryFormValues } from "@/lib/validations/category-schema";

// ✅ Hook untuk mendapatkan daftar kategori
export const useCategories = (
  page: number,
  pageSize: number,
  search: string,
  sort: string,
) => {
  return useQuery({
    queryKey: ["categories", page, pageSize, search, sort], // Pastikan queryKey berubah saat page/search berubah
    queryFn: () => getCategories(page, pageSize, search, sort),
    staleTime: 1000 * 60,
  });
};

export const useCategoryById = (id: string) => {
  return useQuery({
    queryKey: ["category", id], // Pastikan queryKey berubah saat id berubah
    queryFn: () => getCategoryById(id), // Assuming getListingById is a function that fetches a listing by ID
  });
};

export const useCreateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CategoryFormValues) => {
      return createCategory(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Category created successfully");
    },
    onError: (error) => {
      const code = getReadableErrorCode(error);
      const message = getErrorMessage(error, "Failed to create category.");
      toast.error(code, { description: message });
    },
  });
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: CategoryFormValues;
    }) => {
      return updateCategory(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Category updated successfully");
    },
    // onerror
    onError: (error) => {
      const code = getReadableErrorCode(error);
      const message = getErrorMessage(error, "Failed to create category.");
      toast.error(code, { description: message });
    },
  });
};

// ✅ Hook untuk menghapus kategori
export const useDeleteCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Category deleted successfully");
    },
    onError: (error) => {
      const code = getReadableErrorCode(error);
      const message = getErrorMessage(error, "Failed to delete category.");
      toast.error(code, { description: message });
    },
  });
};
