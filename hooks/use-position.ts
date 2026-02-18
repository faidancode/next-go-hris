import {
  createPosition,
  deletePosition,
  getPositions,
  updatePosition,
  type CreatePositionPayload,
  type UpdatePositionPayload,
} from "@/lib/api/position";
import { getErrorMessage, getReadableErrorCode } from "@/lib/api/errors";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const usePositions = (
  page: number,
  pageSize: number,
  search: string,
  sort: string,
  enabled = true,
) => {
  return useQuery({
    queryKey: ["positions", page, pageSize, search, sort],
    queryFn: () => getPositions(page, pageSize, search, sort),
    staleTime: 60_000,
    enabled,
  });
};

export const useCreatePosition = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreatePositionPayload) =>
      createPosition(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["positions"] });
      toast.success("Position created successfully.");
    },
    onError: (error) => {
      const code = getReadableErrorCode(error);
      const message = getErrorMessage(error, "Failed to create position.");
      toast.error(code, { description: message });
    },
  });
};

export const useUpdatePosition = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdatePositionPayload;
    }) => updatePosition(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["positions"] });
      toast.success("Position updated successfully.");
    },
    onError: (error) => {
      const code = getReadableErrorCode(error);
      const message = getErrorMessage(error, "Failed to update position.");
      toast.error(code, { description: message });
    },
  });
};

export const useDeletePosition = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => deletePosition(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["positions"] });
      toast.success("Position deleted successfully.");
    },
    onError: (error) => {
      const code = getReadableErrorCode(error);
      const message = getErrorMessage(error, "Failed to delete position.");
      toast.error(code, { description: message });
    },
  });
};
