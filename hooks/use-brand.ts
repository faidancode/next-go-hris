// src/lib/hooks/useBrands.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getBrands,
  createBrand,
  updateBrand,
  deleteBrand,
  getBrandById,
} from "@/lib/api/brand";
import { toast } from "sonner";
import { getErrorMessage, getReadableErrorCode } from "@/lib/api/errors";
import { BrandFormValues } from "@/lib/validations/brand-schema";

// ✅ Hook untuk mendapatkan daftar kategori
export const useBrands = (
  page: number,
  pageSize: number,
  search: string,
  sort: string,
) => {
  return useQuery({
    queryKey: ["categories", page, pageSize, search, sort], // Pastikan queryKey berubah saat page/search berubah
    queryFn: () => getBrands(page, pageSize, search, sort),
    staleTime: 1000 * 60,
  });
};

export const useBrandById = (id: string) => {
  return useQuery({
    queryKey: ["brand", id], // Pastikan queryKey berubah saat id berubah
    queryFn: () => getBrandById(id), // Assuming getListingById is a function that fetches a listing by ID
  });
};

export const useCreateBrand = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: BrandFormValues) => {
      return createBrand(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Brand created successfully");
    },
    onError: (error) => {
      const code = getReadableErrorCode(error);
      const message = getErrorMessage(error, "Failed to create brand.");
      toast.error(code, { description: message });
    },
  });
};

export const useUpdateBrand = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: BrandFormValues;
    }) => {
      return updateBrand(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Brand updated successfully");
    },
    // onerror
    onError: (error) => {
      const code = getReadableErrorCode(error);
      const message = getErrorMessage(error, "Failed to create brand.");
      toast.error(code, { description: message });
    },
  });
};

// ✅ Hook untuk menghapus kategori
export const useDeleteBrand = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteBrand,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Brand deleted successfully");
    },
    onError: (error) => {
      const code = getReadableErrorCode(error);
      const message = getErrorMessage(error, "Failed to delete brand.");
      toast.error(code, { description: message });
    },
  });
};
